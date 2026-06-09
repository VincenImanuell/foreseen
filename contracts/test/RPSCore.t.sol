// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { RPSCore } from "../src/RPSCore.sol";

/// @dev Rejects any plain ETH transfer — used to prove settlement is never blocked
///      by a recipient that refuses funds, and that `withdraw` surfaces the failure.
contract Reverter { }

contract RPSCoreTest is Test {
    RPSCore internal rps;
    address internal treasury = makeAddr("treasury");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");

    uint128 internal constant BET = 1 ether;
    bytes32 internal constant SALT_A = keccak256("salt-a");
    bytes32 internal constant SALT_B = keccak256("salt-b");

    function setUp() public {
        rps = new RPSCore(treasury, address(0), address(0));
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
    }

    // --- helpers ---

    function _commit(address player, RPSCore.Move move, bytes32 salt)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(player, move, salt));
    }

    /// @dev create (alice) + join (bob): leaves the match in the Scouting window.
    function _matchmake(RPSCore.Mode mode) internal returns (uint256 id) {
        vm.prank(alice);
        id = rps.createMatch{ value: BET }(mode);
        vm.prank(bob);
        rps.joinMatch{ value: BET }(id);
    }

    /// @dev Both players commit their sealed move: advances Scouting -> Revealing.
    function _commitBoth(uint256 id, RPSCore.Move a, RPSCore.Move b) internal {
        vm.prank(alice);
        rps.commitMove(id, _commit(alice, a, SALT_A));
        vm.prank(bob);
        rps.commitMove(id, _commit(bob, b, SALT_B));
    }

    /// @dev Full flow up to (but not including) reveal: match made + both committed.
    function _toReveal(RPSCore.Move a, RPSCore.Move b) internal returns (uint256 id) {
        id = _matchmake(RPSCore.Mode.Casual);
        _commitBoth(id, a, b);
    }

    /// @dev End-to-end: match made, both committed, both revealed (settles).
    function _play(RPSCore.Move a, RPSCore.Move b) internal returns (uint256 id) {
        id = _toReveal(a, b);
        vm.prank(alice);
        rps.reveal(id, a, SALT_A);
        vm.prank(bob);
        rps.reveal(id, b, SALT_B);
    }

    function _expected(uint8 a, uint8 b) internal pure returns (uint8) {
        if (a == b) return 0;
        if ((a == 1 && b == 3) || (a == 2 && b == 1) || (a == 3 && b == 2)) return 1;
        return 2;
    }

    // --- constructor ---

    function test_Constructor_RevertOnZeroTreasury() public {
        vm.expectRevert(RPSCore.ZeroAddress.selector);
        new RPSCore(address(0), address(0), address(0));
    }

    function test_Constructor_RevertOnCodelessStats() public {
        // A non-zero stats address with no code would brick settlements; reject it.
        vm.expectRevert(RPSCore.NotAContract.selector);
        new RPSCore(treasury, alice, address(0));
    }

    // --- createMatch ---

    function test_CreateMatch_StoresState() public {
        vm.prank(alice);
        uint256 id = rps.createMatch{ value: BET }(RPSCore.Mode.Ranked);

        RPSCore.Match memory m = rps.getMatch(id);
        assertEq(m.playerA, alice);
        assertEq(m.bet, BET);
        assertEq(uint8(m.mode), uint8(RPSCore.Mode.Ranked));
        assertEq(uint8(m.state), uint8(RPSCore.MatchState.WaitingForOpponent));
        assertEq(m.commitA, bytes32(0)); // no move committed yet
        assertEq(address(rps).balance, BET);
    }

    function test_CreateMatch_RevertOnZeroBet() public {
        vm.prank(alice);
        vm.expectRevert(RPSCore.InvalidBet.selector);
        rps.createMatch{ value: 0 }(RPSCore.Mode.Casual);
    }

    function test_CreateMatch_RevertOnHugeBet() public {
        // Bets are stored as uint96; anything larger is rejected.
        uint256 huge = uint256(type(uint96).max) + 1;
        vm.deal(alice, huge);
        vm.prank(alice);
        vm.expectRevert(RPSCore.InvalidBet.selector);
        rps.createMatch{ value: huge }(RPSCore.Mode.Casual);
    }

    function test_CreateMatch_IncrementsId() public {
        vm.startPrank(alice);
        uint256 id0 = rps.createMatch{ value: BET }(RPSCore.Mode.Casual);
        uint256 id1 = rps.createMatch{ value: BET }(RPSCore.Mode.Casual);
        vm.stopPrank();
        assertEq(id0, 0);
        assertEq(id1, 1);
    }

    // --- joinMatch ---

    function test_JoinMatch_RevertOnBetMismatch() public {
        vm.prank(alice);
        uint256 id = rps.createMatch{ value: BET }(RPSCore.Mode.Casual);
        vm.prank(bob);
        vm.expectRevert(RPSCore.BetMismatch.selector);
        rps.joinMatch{ value: BET + 1 }(id);
    }

    function test_JoinMatch_RevertOnOwnMatch() public {
        vm.startPrank(alice);
        uint256 id = rps.createMatch{ value: BET }(RPSCore.Mode.Casual);
        vm.expectRevert(RPSCore.CannotJoinOwnMatch.selector);
        rps.joinMatch{ value: BET }(id);
        vm.stopPrank();
    }

    function test_JoinMatch_RevertWhenAlreadyFull() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.prank(carol);
        vm.expectRevert(RPSCore.WrongState.selector);
        rps.joinMatch{ value: BET }(id);
    }

    function test_JoinMatch_OpensScoutingWindow() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        RPSCore.Match memory m = rps.getMatch(id);
        assertEq(m.playerB, bob);
        assertEq(uint8(m.state), uint8(RPSCore.MatchState.Scouting));
        assertEq(m.commitDeadline, block.timestamp + rps.COMMIT_WINDOW());
        assertEq(m.revealDeadline, 0); // not set until both commit
    }

    // --- commitMove ---

    function test_CommitBoth_OpensRevealPhase() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        _commitBoth(id, RPSCore.Move.Rock, RPSCore.Move.Paper);

        RPSCore.Match memory m = rps.getMatch(id);
        assertEq(uint8(m.state), uint8(RPSCore.MatchState.Revealing));
        assertEq(m.revealDeadline, block.timestamp + rps.REVEAL_WINDOW());
        assertTrue(m.commitA != bytes32(0));
        assertTrue(m.commitB != bytes32(0));
    }

    function test_Commit_FirstCommitStaysInScouting() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.prank(alice);
        rps.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));

        RPSCore.Match memory m = rps.getMatch(id);
        assertEq(uint8(m.state), uint8(RPSCore.MatchState.Scouting));
        assertEq(m.revealDeadline, 0);
    }

    function test_Commit_RevertBeforeMatched() public {
        vm.prank(alice);
        uint256 id = rps.createMatch{ value: BET }(RPSCore.Mode.Casual);
        vm.prank(alice);
        vm.expectRevert(RPSCore.WrongState.selector);
        rps.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));
    }

    function test_Commit_RevertAfterDeadline() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.warp(block.timestamp + rps.COMMIT_WINDOW() + 1);
        vm.prank(alice);
        vm.expectRevert(RPSCore.TooLate.selector);
        rps.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));
    }

    function test_Commit_RevertOnZeroCommit() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.prank(alice);
        vm.expectRevert(RPSCore.InvalidCommit.selector);
        rps.commitMove(id, bytes32(0));
    }

    function test_Commit_RevertOnDoubleCommit() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.startPrank(alice);
        rps.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));
        vm.expectRevert(RPSCore.AlreadyCommitted.selector);
        rps.commitMove(id, _commit(alice, RPSCore.Move.Paper, SALT_A));
        vm.stopPrank();
    }

    function test_Commit_RevertOnNonPlayer() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.prank(carol);
        vm.expectRevert(RPSCore.NotPlayer.selector);
        rps.commitMove(id, _commit(carol, RPSCore.Move.Rock, SALT_A));
    }

    // --- happy path / settlement ---

    function test_HappyPath_AWins() public {
        // Rock beats Scissors -> alice wins.
        uint256 id = _play(RPSCore.Move.Rock, RPSCore.Move.Scissors);

        uint256 pot = uint256(BET) * 2;
        uint256 fee = pot * rps.FEE_BPS() / rps.BPS_DENOMINATOR();
        uint256 payout = pot - fee;

        assertEq(rps.pendingWithdrawals(alice), payout);
        assertEq(rps.pendingWithdrawals(bob), 0);
        assertEq(rps.pendingWithdrawals(treasury), fee);
        assertEq(uint8(rps.getMatch(id).state), uint8(RPSCore.MatchState.Settled));
    }

    function test_HappyPath_BWins() public {
        // Paper beats Rock -> bob wins.
        _play(RPSCore.Move.Rock, RPSCore.Move.Paper);
        uint256 pot = uint256(BET) * 2;
        uint256 fee = pot * rps.FEE_BPS() / rps.BPS_DENOMINATOR();
        assertEq(rps.pendingWithdrawals(bob), pot - fee);
        assertEq(rps.pendingWithdrawals(treasury), fee);
    }

    function test_Draw_RefundsBothNoFee() public {
        _play(RPSCore.Move.Rock, RPSCore.Move.Rock);
        assertEq(rps.pendingWithdrawals(alice), BET);
        assertEq(rps.pendingWithdrawals(bob), BET);
        assertEq(rps.pendingWithdrawals(treasury), 0);
    }

    function test_Withdraw_PaysOutAndClears() public {
        _play(RPSCore.Move.Rock, RPSCore.Move.Scissors);
        uint256 pot = uint256(BET) * 2;
        uint256 fee = pot * rps.FEE_BPS() / rps.BPS_DENOMINATOR();
        uint256 payout = pot - fee;

        uint256 balBefore = alice.balance;
        vm.prank(alice);
        rps.withdraw();
        assertEq(alice.balance, balBefore + payout);
        assertEq(rps.pendingWithdrawals(alice), 0);

        // Treasury can collect its fee too.
        vm.prank(treasury);
        rps.withdraw();
        assertEq(treasury.balance, fee);
    }

    function test_Withdraw_RevertWhenNothing() public {
        vm.prank(carol);
        vm.expectRevert(RPSCore.NothingToWithdraw.selector);
        rps.withdraw();
    }

    function test_AllMoveCombinations() public {
        uint128 bet = 1 ether;
        for (uint8 ai = 1; ai <= 3; ai++) {
            for (uint8 bi = 1; bi <= 3; bi++) {
                RPSCore fresh = new RPSCore(treasury, address(0), address(0));
                vm.deal(alice, 10 ether);
                vm.deal(bob, 10 ether);

                RPSCore.Move a = RPSCore.Move(ai);
                RPSCore.Move b = RPSCore.Move(bi);

                vm.prank(alice);
                uint256 id = fresh.createMatch{ value: bet }(RPSCore.Mode.Casual);
                vm.prank(bob);
                fresh.joinMatch{ value: bet }(id);
                vm.prank(alice);
                fresh.commitMove(id, _commit(alice, a, SALT_A));
                vm.prank(bob);
                fresh.commitMove(id, _commit(bob, b, SALT_B));
                vm.prank(alice);
                fresh.reveal(id, a, SALT_A);
                vm.prank(bob);
                fresh.reveal(id, b, SALT_B);

                uint256 pot = uint256(bet) * 2;
                uint256 fee = pot * fresh.FEE_BPS() / fresh.BPS_DENOMINATOR();
                uint8 r = _expected(ai, bi);
                if (r == 0) {
                    assertEq(fresh.pendingWithdrawals(alice), bet, "draw a");
                    assertEq(fresh.pendingWithdrawals(bob), bet, "draw b");
                    assertEq(fresh.pendingWithdrawals(treasury), 0, "draw fee");
                } else {
                    address w = r == 1 ? alice : bob;
                    address l = r == 1 ? bob : alice;
                    assertEq(fresh.pendingWithdrawals(w), pot - fee, "winner");
                    assertEq(fresh.pendingWithdrawals(l), 0, "loser");
                    assertEq(fresh.pendingWithdrawals(treasury), fee, "fee");
                }
            }
        }
    }

    // --- reveal reverts ---

    function test_Reveal_RevertOnBadSalt() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.prank(alice);
        vm.expectRevert(RPSCore.BadReveal.selector);
        rps.reveal(id, RPSCore.Move.Rock, keccak256("wrong"));
    }

    function test_Reveal_RevertOnWrongMove() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.prank(alice);
        vm.expectRevert(RPSCore.BadReveal.selector);
        rps.reveal(id, RPSCore.Move.Paper, SALT_A); // committed Rock
    }

    function test_Reveal_RevertOnNoneMove() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.prank(alice);
        vm.expectRevert(RPSCore.InvalidMove.selector);
        rps.reveal(id, RPSCore.Move.None, SALT_A);
    }

    function test_Reveal_RevertOnNonPlayer() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.prank(carol);
        vm.expectRevert(RPSCore.NotPlayer.selector);
        rps.reveal(id, RPSCore.Move.Rock, SALT_A);
    }

    function test_Reveal_RevertOnDoubleReveal() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.startPrank(alice);
        rps.reveal(id, RPSCore.Move.Rock, SALT_A);
        vm.expectRevert(RPSCore.AlreadyRevealed.selector);
        rps.reveal(id, RPSCore.Move.Rock, SALT_A);
        vm.stopPrank();
    }

    function test_Reveal_RevertBeforeRevealPhase() public {
        // Still in the scouting window (only matched, not both committed).
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.prank(alice);
        vm.expectRevert(RPSCore.WrongState.selector);
        rps.reveal(id, RPSCore.Move.Rock, SALT_A);
    }

    function test_Reveal_RevertAfterDeadline() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.warp(block.timestamp + rps.REVEAL_WINDOW() + 1);
        vm.prank(alice);
        vm.expectRevert(RPSCore.TooLate.selector);
        rps.reveal(id, RPSCore.Move.Rock, SALT_A);
    }

    /// @dev Regression for the audit race: once the deadline passes, a late reveal is
    ///      rejected and only claimRevealTimeout can finalize, so the on-time revealer wins
    ///      deterministically — outcome is never decided by transaction ordering.
    function test_Reveal_LateRevealCannotRaceTimeout() public {
        // bob's Paper would beat alice's Rock, but bob is the one who is late.
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.prank(alice);
        rps.reveal(id, RPSCore.Move.Rock, SALT_A);

        vm.warp(block.timestamp + rps.REVEAL_WINDOW() + 1);
        vm.prank(bob);
        vm.expectRevert(RPSCore.TooLate.selector);
        rps.reveal(id, RPSCore.Move.Paper, SALT_B);

        rps.claimRevealTimeout(id);
        uint256 pot = uint256(BET) * 2;
        uint256 fee = pot * rps.FEE_BPS() / rps.BPS_DENOMINATOR();
        assertEq(rps.pendingWithdrawals(alice), pot - fee);
        assertEq(rps.pendingWithdrawals(bob), 0);
    }

    // --- commit timeout (scouting window) ---

    function test_CommitTimeout_CommitterWins() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        // Only alice commits; bob never does.
        vm.prank(alice);
        rps.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));

        vm.warp(block.timestamp + rps.COMMIT_WINDOW() + 1);
        rps.claimCommitTimeout(id);

        uint256 pot = uint256(BET) * 2;
        uint256 fee = pot * rps.FEE_BPS() / rps.BPS_DENOMINATOR();
        assertEq(rps.pendingWithdrawals(alice), pot - fee);
        assertEq(rps.pendingWithdrawals(bob), 0);
        assertEq(rps.pendingWithdrawals(treasury), fee);
        assertEq(uint8(rps.getMatch(id).state), uint8(RPSCore.MatchState.Settled));
    }

    function test_CommitTimeout_NeitherCommitted_RefundsBoth() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.warp(block.timestamp + rps.COMMIT_WINDOW() + 1);
        rps.claimCommitTimeout(id);

        assertEq(rps.pendingWithdrawals(alice), BET);
        assertEq(rps.pendingWithdrawals(bob), BET);
        assertEq(rps.pendingWithdrawals(treasury), 0);
        assertEq(uint8(rps.getMatch(id).state), uint8(RPSCore.MatchState.Cancelled));
    }

    function test_CommitTimeout_RevertTooEarly() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.prank(alice);
        rps.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));
        vm.expectRevert(RPSCore.TooEarly.selector);
        rps.claimCommitTimeout(id);
    }

    function test_CommitTimeout_RevertWhenRevealing() public {
        // Both committed -> Revealing, so the commit timeout no longer applies.
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.warp(block.timestamp + rps.COMMIT_WINDOW() + 1);
        vm.expectRevert(RPSCore.WrongState.selector);
        rps.claimCommitTimeout(id);
    }

    // --- reveal timeout ---

    function test_RevealTimeout_RevealedPlayerWins() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.prank(alice);
        rps.reveal(id, RPSCore.Move.Rock, SALT_A); // bob never reveals

        vm.warp(block.timestamp + rps.REVEAL_WINDOW() + 1);
        rps.claimRevealTimeout(id);

        uint256 pot = uint256(BET) * 2;
        uint256 fee = pot * rps.FEE_BPS() / rps.BPS_DENOMINATOR();
        assertEq(rps.pendingWithdrawals(alice), pot - fee);
        assertEq(rps.pendingWithdrawals(treasury), fee);
        assertEq(uint8(rps.getMatch(id).state), uint8(RPSCore.MatchState.Settled));
    }

    function test_RevealTimeout_RevertTooEarly() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.prank(alice);
        rps.reveal(id, RPSCore.Move.Rock, SALT_A);
        vm.expectRevert(RPSCore.TooEarly.selector);
        rps.claimRevealTimeout(id);
    }

    function test_RevealTimeout_NeitherRevealed_RefundsBoth() public {
        uint256 id = _toReveal(RPSCore.Move.Rock, RPSCore.Move.Paper);
        vm.warp(block.timestamp + rps.REVEAL_WINDOW() + 1);
        rps.claimRevealTimeout(id);

        assertEq(rps.pendingWithdrawals(alice), BET);
        assertEq(rps.pendingWithdrawals(bob), BET);
        assertEq(rps.pendingWithdrawals(treasury), 0);
        assertEq(uint8(rps.getMatch(id).state), uint8(RPSCore.MatchState.Cancelled));
    }

    function test_RevealTimeout_RevertWhenSettled() public {
        uint256 id = _play(RPSCore.Move.Rock, RPSCore.Move.Scissors);
        vm.warp(block.timestamp + rps.REVEAL_WINDOW() + 1);
        vm.expectRevert(RPSCore.WrongState.selector);
        rps.claimRevealTimeout(id);
    }

    // --- cancel ---

    function test_Cancel_ByCreatorRefunds() public {
        vm.prank(alice);
        uint256 id = rps.createMatch{ value: BET }(RPSCore.Mode.Casual);
        vm.prank(alice);
        rps.cancelMatch(id);
        assertEq(rps.pendingWithdrawals(alice), BET);
        assertEq(uint8(rps.getMatch(id).state), uint8(RPSCore.MatchState.Cancelled));
    }

    function test_Cancel_RevertNonCreator() public {
        vm.prank(alice);
        uint256 id = rps.createMatch{ value: BET }(RPSCore.Mode.Casual);
        vm.prank(bob);
        vm.expectRevert(RPSCore.NotPlayer.selector);
        rps.cancelMatch(id);
    }

    function test_Cancel_RevertAfterJoined() public {
        uint256 id = _matchmake(RPSCore.Mode.Casual);
        vm.prank(alice);
        vm.expectRevert(RPSCore.WrongState.selector);
        rps.cancelMatch(id);
    }

    // --- anti-griefing via pull payments ---

    function test_Settlement_NotBlockedByRejectingWinner() public {
        Reverter rejecter = new Reverter();
        vm.deal(address(rejecter), 10 ether);

        // rejecter (as A) plays Rock and beats bob's Scissors.
        vm.prank(address(rejecter));
        uint256 id = rps.createMatch{ value: BET }(RPSCore.Mode.Casual);
        vm.prank(bob);
        rps.joinMatch{ value: BET }(id);
        vm.prank(address(rejecter));
        rps.commitMove(id, _commit(address(rejecter), RPSCore.Move.Rock, SALT_A));
        vm.prank(bob);
        rps.commitMove(id, _commit(bob, RPSCore.Move.Scissors, SALT_B));
        vm.prank(address(rejecter));
        rps.reveal(id, RPSCore.Move.Rock, SALT_A);

        // bob's reveal settles the match even though the winner can't receive ETH.
        vm.prank(bob);
        rps.reveal(id, RPSCore.Move.Scissors, SALT_B);

        assertEq(uint8(rps.getMatch(id).state), uint8(RPSCore.MatchState.Settled));
        uint256 pot = uint256(BET) * 2;
        uint256 fee = pot * rps.FEE_BPS() / rps.BPS_DENOMINATOR();
        assertEq(rps.pendingWithdrawals(address(rejecter)), pot - fee);

        // The winner's own withdraw fails (its problem), surfaced explicitly.
        vm.prank(address(rejecter));
        vm.expectRevert(RPSCore.TransferFailed.selector);
        rps.withdraw();
    }
}
