// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title RPSStats
/// @notice Tamper-proof, on-chain psychology stats for Foreseen players: overall
///         move distribution, win/loss/draw totals, and contextual move patterns
///         (what a player tends to throw right after a win, a loss, or a draw).
/// @dev    Fed by an authorized `recorder` via {recordMatch}. Stats are tamper-proof
///         to the extent the recorder is the trustless match engine (RPSCore), which
///         calls {recordMatch} atomically on settlement; once wired, {lockRecorder}
///         can permanently freeze the recorder so it can never be repointed.
///         Contextual buckets implement the "win-stay / lose-shift" signal, the most
///         predictive read in Rock Paper Scissors. Time-range buckets and
///         commit-timestamp tells are planned for a later iteration.
contract RPSStats {
    enum Move {
        Rock,
        Paper,
        Scissors
    }

    enum Result {
        Win,
        Loss,
        Draw
    }

    struct Stats {
        uint64 totalMatches;
        uint64 wins;
        uint64 losses;
        uint64 draws;
        uint64[3] moveCount; // indexed by Move
        uint64[3] afterWinMove; // move played in the match after a win
        uint64[3] afterLossMove; // move played in the match after a loss
        uint64[3] afterDrawMove; // move played in the match after a draw
        Result lastResult; // meaningful only when hasHistory is true
        bool hasHistory;
    }

    address public immutable owner;
    /// @notice The only address allowed to record matches (the match engine).
    address public recorder;
    /// @notice Once true, the recorder is frozen permanently and cannot be changed.
    bool public recorderLocked;

    mapping(address => Stats) internal _stats;

    event MatchRecorded(address indexed player, Move move, Result result);
    event RecorderUpdated(address indexed recorder);
    event RecorderFrozen(address indexed recorder);

    error NotOwner();
    error NotRecorder();
    error ZeroAddress();
    error RecorderLocked();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyRecorder() {
        if (msg.sender != recorder) revert NotRecorder();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Authorize the match engine that may record results.
    function setRecorder(address recorder_) external onlyOwner {
        if (recorderLocked) revert RecorderLocked();
        if (recorder_ == address(0)) revert ZeroAddress();
        recorder = recorder_;
        emit RecorderUpdated(recorder_);
    }

    /// @notice Permanently freeze the current recorder so stats can only ever be fed
    ///         by the wired match engine. Irreversible.
    function lockRecorder() external onlyOwner {
        if (recorder == address(0)) revert ZeroAddress();
        recorderLocked = true;
        emit RecorderFrozen(recorder);
    }

    /// @notice Record one player's move and outcome for a settled match.
    /// @dev    The current move is also bucketed against the player's PREVIOUS
    ///         result to build the after-win / after-loss / after-draw patterns.
    function recordMatch(address player, Move move, Result result) external onlyRecorder {
        Stats storage s = _stats[player];
        uint256 m = uint256(uint8(move));

        if (s.hasHistory) {
            if (s.lastResult == Result.Win) {
                s.afterWinMove[m]++;
            } else if (s.lastResult == Result.Loss) {
                s.afterLossMove[m]++;
            } else {
                s.afterDrawMove[m]++;
            }
        }

        s.totalMatches++;
        if (result == Result.Win) {
            s.wins++;
        } else if (result == Result.Loss) {
            s.losses++;
        } else {
            s.draws++;
        }
        s.moveCount[m]++;
        s.lastResult = result;
        s.hasHistory = true;

        emit MatchRecorded(player, move, result);
    }

    /// @notice Full stats struct for a player.
    function getStats(address player) external view returns (Stats memory) {
        return _stats[player];
    }

    /// @notice Overall move distribution counts [Rock, Paper, Scissors].
    function moveDistribution(address player) external view returns (uint64[3] memory) {
        return _stats[player].moveCount;
    }

    /// @notice Win rate in basis points (10000 = 100%), over all matches. 0 if none played.
    function winRateBps(address player) external view returns (uint256) {
        Stats storage s = _stats[player];
        if (s.totalMatches == 0) return 0;
        return uint256(s.wins) * 10_000 / s.totalMatches;
    }
}
