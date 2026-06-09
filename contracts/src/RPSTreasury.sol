// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice The subset of RPSCore the treasury needs to pull its accrued fees.
interface IRPSCoreFees {
    function withdraw() external;
    function pendingWithdrawals(address account) external view returns (uint256);
}

/// @title RPSTreasury
/// @notice Collects Foreseen's protocol fees and splits them into purpose-built pools:
///         streak-multiplier funding, the weekly leaderboard prize, tournament top-ups,
///         and the dev/treasury share.
/// @dev    RPSCore credits this contract via its pull-payment system. Anyone can call
///         {collectFromCore} to move accrued fees here, where every incoming wei is
///         split by {STREAK_BPS}/{WEEKLY_BPS}/{TOURNAMENT_BPS}/{DEV_BPS} (the dev pool
///         absorbs rounding dust). The 5% match fee splits 2/1/1/1, i.e. 40/20/20/20
///         of the fee. Automatic weekly payouts and at-settlement streak bonuses are
///         deferred: a distributor address pays out the streak/weekly/tournament pools.
contract RPSTreasury {
    enum Pool {
        Streak,
        Weekly,
        Tournament,
        Dev
    }

    // Split of each incoming fee (sums to BPS_DENOMINATOR).
    uint256 public constant STREAK_BPS = 4_000;
    uint256 public constant WEEKLY_BPS = 2_000;
    uint256 public constant TOURNAMENT_BPS = 2_000;
    uint256 public constant DEV_BPS = 2_000;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    address public immutable owner;

    /// @notice RPSCore, the source of fees. Settable once then lockable.
    address public core;
    bool public coreLocked;

    /// @notice Authorized to pay out the streak / weekly / tournament pools.
    address public distributor;
    bool public distributorLocked;

    uint256 public streakPool;
    uint256 public weeklyPool;
    uint256 public tournamentPool;
    uint256 public devPool;

    event FeesAllocated(
        uint256 amount, uint256 streak, uint256 weekly, uint256 tournament, uint256 dev
    );
    event BonusPaid(Pool indexed pool, address indexed to, uint256 amount);
    event DevWithdrawn(address indexed to, uint256 amount);
    event CoreUpdated(address indexed core);
    event CoreFrozen(address indexed core);
    event DistributorUpdated(address indexed distributor);
    event DistributorFrozen(address indexed distributor);

    error NotOwner();
    error NotDistributor();
    error ZeroAddress();
    error CoreLocked();
    error DistributorLocked();
    error InsufficientPool();
    error InvalidPool();
    error TransferFailed();
    error Reentrancy();

    uint256 private _lock = 1;

    modifier nonReentrant() {
        if (_lock == 2) revert Reentrancy();
        _lock = 2;
        _;
        _lock = 1;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyDistributor() {
        if (msg.sender != distributor) revert NotDistributor();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- admin wiring ---

    function setCore(address core_) external onlyOwner {
        if (coreLocked) revert CoreLocked();
        if (core_ == address(0)) revert ZeroAddress();
        core = core_;
        emit CoreUpdated(core_);
    }

    function lockCore() external onlyOwner {
        if (core == address(0)) revert ZeroAddress();
        coreLocked = true;
        emit CoreFrozen(core);
    }

    function setDistributor(address distributor_) external onlyOwner {
        if (distributorLocked) revert DistributorLocked();
        if (distributor_ == address(0)) revert ZeroAddress();
        distributor = distributor_;
        emit DistributorUpdated(distributor_);
    }

    function lockDistributor() external onlyOwner {
        if (distributor == address(0)) revert ZeroAddress();
        distributorLocked = true;
        emit DistributorFrozen(distributor);
    }

    // --- fee intake ---

    /// @notice Pull this contract's accrued fees out of RPSCore. The withdrawal lands
    ///         in {receive}, which splits it into the pools. Permissionless (keeper-safe).
    function collectFromCore() external {
        IRPSCoreFees(core).withdraw();
    }

    /// @notice Fees collectable from RPSCore right now.
    function collectableFromCore() external view returns (uint256) {
        if (core == address(0)) return 0;
        return IRPSCoreFees(core).pendingWithdrawals(address(this));
    }

    /// @dev Every wei that arrives (from RPSCore, or a direct donation) is split into pools.
    receive() external payable {
        _allocate(msg.value);
    }

    function _allocate(uint256 amount) internal {
        if (amount == 0) return;
        uint256 s = amount * STREAK_BPS / BPS_DENOMINATOR;
        uint256 w = amount * WEEKLY_BPS / BPS_DENOMINATOR;
        uint256 t = amount * TOURNAMENT_BPS / BPS_DENOMINATOR;
        uint256 d = amount - s - w - t; // dev absorbs the rounding remainder
        streakPool += s;
        weeklyPool += w;
        tournamentPool += t;
        devPool += d;
        emit FeesAllocated(amount, s, w, t, d);
    }

    // --- payouts ---

    /// @notice Pay a streak / weekly / tournament bonus from its pool. Dev pool excluded.
    function payBonus(Pool pool, address to, uint256 amount) external onlyDistributor nonReentrant {
        if (to == address(0)) revert ZeroAddress();

        if (pool == Pool.Streak) {
            if (amount > streakPool) revert InsufficientPool();
            streakPool -= amount;
        } else if (pool == Pool.Weekly) {
            if (amount > weeklyPool) revert InsufficientPool();
            weeklyPool -= amount;
        } else if (pool == Pool.Tournament) {
            if (amount > tournamentPool) revert InsufficientPool();
            tournamentPool -= amount;
        } else {
            revert InvalidPool();
        }

        (bool ok,) = to.call{ value: amount }("");
        if (!ok) revert TransferFailed();
        emit BonusPaid(pool, to, amount);
    }

    /// @notice Withdraw from the dev/treasury pool.
    function withdrawDev(address to, uint256 amount) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        if (amount > devPool) revert InsufficientPool();
        devPool -= amount;

        (bool ok,) = to.call{ value: amount }("");
        if (!ok) revert TransferFailed();
        emit DevWithdrawn(to, amount);
    }

    /// @notice Sum of all pool balances (should equal this contract's balance).
    function totalPooled() external view returns (uint256) {
        return streakPool + weeklyPool + tournamentPool + devPool;
    }
}
