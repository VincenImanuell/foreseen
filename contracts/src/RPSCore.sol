// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Minimal hook the match engine uses to feed tamper-proof, on-chain stats.
/// @dev    `move` is encoded 0=Rock, 1=Paper, 2=Scissors; `result` is 0=Win, 1=Loss, 2=Draw.
interface IRPSStats {
    function recordMatch(address player, uint8 move, uint8 result) external;
}

/// @title RPSCore
/// @notice Commit-reveal Rock Paper Scissors match engine with escrowed bets,
///         reveal timeouts and a protocol fee.
/// @dev    Both players commit blind (commit-on-create / commit-on-join) so
///         neither can react to the other's choice. Payouts use a pull-payment
///         pattern (`pendingWithdrawals` + `withdraw`) so settlement can never be
///         blocked by a recipient that rejects funds, and reentrancy is avoided.
///         On settlement the engine optionally feeds a stats contract, so player
///         stats are derived only from real, on-chain settled matches.
contract RPSCore {
    enum Move {
        None,
        Rock,
        Paper,
        Scissors
    }

    enum Mode {
        Casual,
        Ranked
    }

    enum MatchState {
        None,
        WaitingForOpponent,
        Revealing,
        Settled,
        Cancelled
    }

    struct Match {
        address playerA;
        address playerB;
        bytes32 commitA;
        bytes32 commitB;
        Move revealA;
        Move revealB;
        uint128 bet; // per-player stake in wei
        uint64 createdAt; // when A committed
        uint64 joinedAt; // when B committed
        uint64 revealDeadline; // both must reveal before this
        Mode mode;
        MatchState state;
    }

    /// @notice Protocol fee in basis points (5%).
    uint256 public constant FEE_BPS = 500;
    uint256 public constant BPS_DENOMINATOR = 10_000;
    /// @notice Window for both players to reveal once a match is full.
    uint256 public constant REVEAL_TIMEOUT = 5 minutes;

    /// @notice Destination for protocol fees.
    address public immutable treasury;

    /// @notice Optional stats engine fed atomically on settlement; the zero address
    ///         disables stats recording.
    IRPSStats public immutable stats;

    // Result encoding forwarded to the stats engine.
    uint8 private constant RESULT_WIN = 0;
    uint8 private constant RESULT_LOSS = 1;
    uint8 private constant RESULT_DRAW = 2;

    uint256 public nextMatchId;
    mapping(uint256 => Match) public matches;
    mapping(address => uint256) public pendingWithdrawals;

    event MatchCreated(
        uint256 indexed matchId, address indexed playerA, Mode mode, uint256 bet, uint256 createdAt
    );
    event MatchJoined(
        uint256 indexed matchId, address indexed playerB, uint256 joinedAt, uint256 revealDeadline
    );
    event Revealed(uint256 indexed matchId, address indexed player, Move move, uint256 timestamp);
    event Settled(
        uint256 indexed matchId,
        address indexed winner,
        uint256 payout,
        uint256 fee,
        Move moveA,
        Move moveB
    );
    event MatchCancelled(uint256 indexed matchId);
    event Withdrawn(address indexed account, uint256 amount);

    error ZeroAddress();
    error NotAContract();
    error InvalidBet();
    error WrongState();
    error CannotJoinOwnMatch();
    error BetMismatch();
    error InvalidMove();
    error AlreadyRevealed();
    error BadReveal();
    error NotPlayer();
    error TooEarly();
    error NothingToWithdraw();
    error TransferFailed();
    error Reentrancy();

    uint256 private _lock = 1;

    modifier nonReentrant() {
        if (_lock == 2) revert Reentrancy();
        _lock = 2;
        _;
        _lock = 1;
    }

    /// @param treasury_ Destination for protocol fees (required).
    /// @param stats_ Stats engine to feed on settlement, or the zero address to disable.
    /// @dev   A non-zero `stats_` must be a deployed contract, so the settlement-time
    ///        try/catch can never be bypassed by an `extcodesize` revert on a codeless
    ///        target (which would otherwise strand escrowed funds).
    constructor(address treasury_, address stats_) {
        if (treasury_ == address(0)) revert ZeroAddress();
        if (stats_ != address(0) && stats_.code.length == 0) revert NotAContract();
        treasury = treasury_;
        stats = IRPSStats(stats_);
    }

    /// @notice Open a new match, committing your move blind. The bet is `msg.value`.
    /// @param mode Casual or Ranked.
    /// @param commit `keccak256(abi.encodePacked(msg.sender, move, salt))`.
    /// @return matchId Identifier of the created match.
    function createMatch(Mode mode, bytes32 commit) external payable returns (uint256 matchId) {
        if (msg.value == 0 || msg.value > type(uint128).max) revert InvalidBet();

        matchId = nextMatchId++;
        Match storage m = matches[matchId];
        m.playerA = msg.sender;
        m.commitA = commit;
        m.bet = uint128(msg.value);
        m.createdAt = uint64(block.timestamp);
        m.mode = mode;
        m.state = MatchState.WaitingForOpponent;

        emit MatchCreated(matchId, msg.sender, mode, msg.value, block.timestamp);
    }

    /// @notice Join an open match, matching its bet and committing your move blind.
    /// @param matchId Match to join.
    /// @param commit `keccak256(abi.encodePacked(msg.sender, move, salt))`.
    function joinMatch(uint256 matchId, bytes32 commit) external payable {
        Match storage m = matches[matchId];
        if (m.state != MatchState.WaitingForOpponent) revert WrongState();
        if (msg.sender == m.playerA) revert CannotJoinOwnMatch();
        if (msg.value != m.bet) revert BetMismatch();

        m.playerB = msg.sender;
        m.commitB = commit;
        m.joinedAt = uint64(block.timestamp);
        m.revealDeadline = uint64(block.timestamp + REVEAL_TIMEOUT);
        m.state = MatchState.Revealing;

        emit MatchJoined(matchId, msg.sender, block.timestamp, m.revealDeadline);
    }

    /// @notice Reveal your move and salt. Settles automatically once both reveal.
    function reveal(uint256 matchId, Move move, bytes32 salt) external {
        Match storage m = matches[matchId];
        if (m.state != MatchState.Revealing) revert WrongState();
        if (move == Move.None) revert InvalidMove();

        bytes32 expected = keccak256(abi.encodePacked(msg.sender, move, salt));
        if (msg.sender == m.playerA) {
            if (m.revealA != Move.None) revert AlreadyRevealed();
            if (expected != m.commitA) revert BadReveal();
            m.revealA = move;
        } else if (msg.sender == m.playerB) {
            if (m.revealB != Move.None) revert AlreadyRevealed();
            if (expected != m.commitB) revert BadReveal();
            m.revealB = move;
        } else {
            revert NotPlayer();
        }

        emit Revealed(matchId, msg.sender, move, block.timestamp);

        if (m.revealA != Move.None && m.revealB != Move.None) {
            _settle(matchId, m);
        }
    }

    /// @notice After the reveal deadline, finalize a match where a player failed to
    ///         reveal. The revealed player wins; if neither revealed, both are refunded.
    /// @dev    Permissionless on purpose: anyone (the winner or a keeper) can finalize,
    ///         so a non-revealing loser can only delay payout by the timeout, never deny it.
    function claimTimeout(uint256 matchId) external {
        Match storage m = matches[matchId];
        if (m.state != MatchState.Revealing) revert WrongState();
        if (block.timestamp <= m.revealDeadline) revert TooEarly();

        bool aRevealed = m.revealA != Move.None;
        bool bRevealed = m.revealB != Move.None;
        uint256 pot = uint256(m.bet) * 2;

        if (aRevealed && !bRevealed) {
            m.state = MatchState.Settled;
            uint256 fee = pot * FEE_BPS / BPS_DENOMINATOR;
            uint256 payout = pot - fee;
            pendingWithdrawals[m.playerA] += payout;
            pendingWithdrawals[treasury] += fee;
            emit Settled(matchId, m.playerA, payout, fee, m.revealA, m.revealB);
            _recordStats(m.playerA, m.revealA, RESULT_WIN);
        } else if (bRevealed && !aRevealed) {
            m.state = MatchState.Settled;
            uint256 fee = pot * FEE_BPS / BPS_DENOMINATOR;
            uint256 payout = pot - fee;
            pendingWithdrawals[m.playerB] += payout;
            pendingWithdrawals[treasury] += fee;
            emit Settled(matchId, m.playerB, payout, fee, m.revealA, m.revealB);
            _recordStats(m.playerB, m.revealB, RESULT_WIN);
        } else {
            // Neither revealed: refund both, no fee.
            m.state = MatchState.Cancelled;
            pendingWithdrawals[m.playerA] += m.bet;
            pendingWithdrawals[m.playerB] += m.bet;
            emit MatchCancelled(matchId);
        }
    }

    /// @notice Cancel an open match that never found an opponent and reclaim the bet.
    function cancelMatch(uint256 matchId) external {
        Match storage m = matches[matchId];
        if (m.state != MatchState.WaitingForOpponent) revert WrongState();
        if (msg.sender != m.playerA) revert NotPlayer();

        m.state = MatchState.Cancelled;
        pendingWithdrawals[m.playerA] += m.bet;
        emit MatchCancelled(matchId);
    }

    /// @notice Withdraw winnings, refunds and (for the treasury) collected fees.
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingWithdrawals[msg.sender] = 0;
        (bool ok,) = msg.sender.call{ value: amount }("");
        if (!ok) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Convenience getter returning the full match struct.
    function getMatch(uint256 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    function _settle(uint256 matchId, Match storage m) internal {
        m.state = MatchState.Settled;
        uint256 pot = uint256(m.bet) * 2;
        uint8 r = _result(m.revealA, m.revealB);

        if (r == 0) {
            // Draw: refund both stakes, no fee.
            pendingWithdrawals[m.playerA] += m.bet;
            pendingWithdrawals[m.playerB] += m.bet;
            emit Settled(matchId, address(0), 0, 0, m.revealA, m.revealB);
            _recordStats(m.playerA, m.revealA, RESULT_DRAW);
            _recordStats(m.playerB, m.revealB, RESULT_DRAW);
        } else {
            address winner = r == 1 ? m.playerA : m.playerB;
            uint256 fee = pot * FEE_BPS / BPS_DENOMINATOR;
            uint256 payout = pot - fee;
            pendingWithdrawals[winner] += payout;
            pendingWithdrawals[treasury] += fee;
            emit Settled(matchId, winner, payout, fee, m.revealA, m.revealB);
            _recordStats(m.playerA, m.revealA, r == 1 ? RESULT_WIN : RESULT_LOSS);
            _recordStats(m.playerB, m.revealB, r == 2 ? RESULT_WIN : RESULT_LOSS);
        }
    }

    /// @dev Returns 0 on a draw, 1 if A wins, 2 if B wins.
    function _result(Move a, Move b) internal pure returns (uint8) {
        if (a == b) return 0;
        if (
            (a == Move.Rock && b == Move.Scissors) || (a == Move.Paper && b == Move.Rock)
                || (a == Move.Scissors && b == Move.Paper)
        ) {
            return 1;
        }
        return 2;
    }

    /// @dev Feeds the stats engine, mapping the core Move (1..3) to the stats encoding
    ///      (0..2). A stats failure can never block settlement: `stats` is verified to be
    ///      a contract at construction, so the call dispatches and any revert is caught.
    ///      `Move.None` is skipped defensively (callers only ever pass a revealed move).
    function _recordStats(address player, Move move, uint8 result) internal {
        IRPSStats s = stats;
        if (address(s) == address(0) || move == Move.None) return;
        try s.recordMatch(player, uint8(move) - 1, result) { } catch { }
    }
}
