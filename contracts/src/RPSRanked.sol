// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Minimal hook to mint/upgrade a player's soulbound rank badge.
/// @dev `tier` is 0=Bronze .. 4=Legend.
interface IRPSSoulbound {
    function setBadge(address player, uint8 tier) external;
}

/// @title RPSRanked
/// @notice On-chain ranked progression for Foreseen: win streaks, rank tiers
///         (Bronze -> Silver -> Gold -> Platinum -> Legend), a streak payout
///         multiplier, and permanent rank-reached history.
/// @dev    Fed by an authorized `recorder` (the match engine) for RANKED matches only,
///         using the same trust model as RPSStats: the recorder can be permanently
///         locked to RPSCore via {lockRecorder}, making the progression tamper-proof.
///         The streak multiplier is a *view*; the bonus is paid by the treasury, not
///         here. The confidence-bet raise phase and gradual rank decay are deferred to
///         a later iteration (a loss resets the streak, so rank recomputes downward).
contract RPSRanked {
    enum Result {
        Win,
        Loss,
        Draw
    }

    enum Rank {
        Bronze,
        Silver,
        Gold,
        Platinum,
        Legend
    }

    struct Progress {
        uint64 streak; // current win streak
        uint64 longestStreak; // best streak ever reached
        uint64 wins;
        uint64 losses;
        uint64 draws;
        uint32[5] rankReached; // times promoted into each Rank tier (Bronze seeded to 1)
        Rank currentRank;
        Rank peakRank; // highest rank ever reached; drives the soulbound badge
        bool active; // has any ranked history
    }

    // Streak thresholds for each tier.
    uint64 public constant SILVER_STREAK = 5;
    uint64 public constant GOLD_STREAK = 10;
    uint64 public constant PLATINUM_STREAK = 20;
    uint64 public constant LEGEND_STREAK = 50;

    uint256 public constant MULTIPLIER_DENOMINATOR = 10_000;

    address public immutable owner;
    /// @notice The only address allowed to record ranked results (the match engine).
    address public recorder;
    /// @notice Once true, the recorder is frozen permanently and cannot be changed.
    bool public recorderLocked;

    /// @notice Optional soulbound badge minted/upgraded as a player reaches a new peak
    ///         rank; the zero address disables badge minting.
    IRPSSoulbound public immutable badge;

    mapping(address => Progress) internal _progress;

    event RankedRecorded(address indexed player, Result result, uint64 streak);
    event RankChanged(address indexed player, Rank oldRank, Rank newRank, uint64 streak);
    event RecorderUpdated(address indexed recorder);
    event RecorderFrozen(address indexed recorder);

    error NotOwner();
    error NotRecorder();
    error ZeroAddress();
    error RecorderLocked();
    error NotAContract();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyRecorder() {
        if (msg.sender != recorder) revert NotRecorder();
        _;
    }

    /// @param badge_ Soulbound badge to mint/upgrade on new peaks, or zero to disable.
    /// @dev   A non-zero `badge_` must be a deployed contract so the badge call can never
    ///        block a ranked recording via an `extcodesize` revert.
    constructor(address badge_) {
        if (badge_ != address(0) && badge_.code.length == 0) revert NotAContract();
        owner = msg.sender;
        badge = IRPSSoulbound(badge_);
    }

    /// @notice Authorize the match engine that may record ranked results.
    function setRecorder(address recorder_) external onlyOwner {
        if (recorderLocked) revert RecorderLocked();
        if (recorder_ == address(0)) revert ZeroAddress();
        recorder = recorder_;
        emit RecorderUpdated(recorder_);
    }

    /// @notice Permanently freeze the current recorder. Irreversible.
    function lockRecorder() external onlyOwner {
        if (recorder == address(0)) revert ZeroAddress();
        recorderLocked = true;
        emit RecorderFrozen(recorder);
    }

    /// @notice Record the outcome of one player's ranked match.
    /// @dev    Win extends the streak, loss resets it to zero, draw leaves it unchanged.
    function recordRanked(address player, Result result) external onlyRecorder {
        Progress storage p = _progress[player];
        if (!p.active) {
            p.active = true;
            p.rankReached[uint8(Rank.Bronze)] = 1;
            _updateBadge(player, uint8(Rank.Bronze)); // mint the initial badge
        }

        Rank oldRank = p.currentRank;
        if (result == Result.Win) {
            p.wins++;
            p.streak++;
            if (p.streak > p.longestStreak) p.longestStreak = p.streak;
        } else if (result == Result.Loss) {
            p.losses++;
            p.streak = 0;
        } else {
            p.draws++;
        }

        Rank newRank = _rankFor(p.streak);
        if (newRank != oldRank) {
            p.currentRank = newRank;
            if (uint8(newRank) > uint8(oldRank)) {
                p.rankReached[uint8(newRank)]++;
            }
            emit RankChanged(player, oldRank, newRank, p.streak);
        }

        // The badge tracks the PEAK rank (monotonic) — it proves achievement and is
        // never downgraded when a streak is lost.
        if (uint8(newRank) > uint8(p.peakRank)) {
            p.peakRank = newRank;
            _updateBadge(player, uint8(newRank));
        }

        emit RankedRecorded(player, result, p.streak);
    }

    /// @notice Full ranked progress for a player.
    function getProgress(address player) external view returns (Progress memory) {
        return _progress[player];
    }

    /// @notice Current rank tier for a player (Bronze if no history).
    function rankOf(address player) external view returns (Rank) {
        return _progress[player].currentRank;
    }

    /// @notice Current win streak for a player.
    function streakOf(address player) external view returns (uint64) {
        return _progress[player].streak;
    }

    /// @notice Streak payout multiplier in basis points (10000 = 1.0x).
    /// @dev    1-4 -> 1.0x, 5-9 -> 1.1x, 10-19 -> 1.25x, 20+ -> 1.5x. Funded by the
    ///         treasury, not charged to the opponent.
    function multiplierBps(address player) external view returns (uint256) {
        uint64 s = _progress[player].streak;
        if (s >= PLATINUM_STREAK) return 15_000;
        if (s >= GOLD_STREAK) return 12_500;
        if (s >= SILVER_STREAK) return 11_000;
        return 10_000;
    }

    function _rankFor(uint64 streak) internal pure returns (Rank) {
        if (streak >= LEGEND_STREAK) return Rank.Legend;
        if (streak >= PLATINUM_STREAK) return Rank.Platinum;
        if (streak >= GOLD_STREAK) return Rank.Gold;
        if (streak >= SILVER_STREAK) return Rank.Silver;
        return Rank.Bronze;
    }

    /// @dev Mint/upgrade the soulbound badge without ever letting it block a recording.
    function _updateBadge(address player, uint8 tier) internal {
        IRPSSoulbound b = badge;
        if (address(b) == address(0)) return;
        try b.setBadge(player, tier) { } catch { }
    }
}
