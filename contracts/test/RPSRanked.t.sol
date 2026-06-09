// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { RPSRanked } from "../src/RPSRanked.sol";

contract RPSRankedTest is Test {
    RPSRanked internal ranked;
    address internal recorder = makeAddr("recorder");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        ranked = new RPSRanked(address(0)); // owner = this test
        ranked.setRecorder(recorder);
    }

    function _win(address p) internal {
        vm.prank(recorder);
        ranked.recordRanked(p, RPSRanked.Result.Win);
    }

    function _loss(address p) internal {
        vm.prank(recorder);
        ranked.recordRanked(p, RPSRanked.Result.Loss);
    }

    function _draw(address p) internal {
        vm.prank(recorder);
        ranked.recordRanked(p, RPSRanked.Result.Draw);
    }

    function _winN(address p, uint256 n) internal {
        for (uint256 i = 0; i < n; i++) {
            _win(p);
        }
    }

    // --- access control ---

    function test_RecordRanked_RevertNonRecorder() public {
        vm.prank(alice);
        vm.expectRevert(RPSRanked.NotRecorder.selector);
        ranked.recordRanked(alice, RPSRanked.Result.Win);
    }

    function test_SetRecorder_RevertNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(RPSRanked.NotOwner.selector);
        ranked.setRecorder(alice);
    }

    function test_LockRecorder_FreezesRecorder() public {
        ranked.lockRecorder();
        assertTrue(ranked.recorderLocked());
        vm.expectRevert(RPSRanked.RecorderLocked.selector);
        ranked.setRecorder(alice);
    }

    // --- streak mechanics ---

    function test_Win_IncrementsStreak() public {
        _win(alice);
        assertEq(ranked.streakOf(alice), 1);
        assertEq(ranked.getProgress(alice).wins, 1);
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Bronze));
    }

    function test_Loss_ResetsStreak() public {
        _winN(alice, 3);
        _loss(alice);
        assertEq(ranked.streakOf(alice), 0);
        assertEq(ranked.getProgress(alice).losses, 1);
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Bronze));
    }

    function test_Draw_LeavesStreakUnchanged() public {
        _winN(alice, 2);
        _draw(alice);
        assertEq(ranked.streakOf(alice), 2);
        assertEq(ranked.getProgress(alice).draws, 1);
    }

    function test_LongestStreakTracked() public {
        _winN(alice, 7);
        _loss(alice);
        _winN(alice, 3);
        RPSRanked.Progress memory p = ranked.getProgress(alice);
        assertEq(p.longestStreak, 7);
        assertEq(p.streak, 3);
    }

    // --- rank tiers & multiplier ---

    function test_RankTiersAndMultiplier() public {
        _winN(alice, 4); // streak 4
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Bronze));
        assertEq(ranked.multiplierBps(alice), 10_000);

        _win(alice); // streak 5 -> Silver
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Silver));
        assertEq(ranked.multiplierBps(alice), 11_000);

        _winN(alice, 5); // streak 10 -> Gold
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Gold));
        assertEq(ranked.multiplierBps(alice), 12_500);

        _winN(alice, 10); // streak 20 -> Platinum
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Platinum));
        assertEq(ranked.multiplierBps(alice), 15_000);

        _winN(alice, 30); // streak 50 -> Legend
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Legend));
        assertEq(ranked.multiplierBps(alice), 15_000);
        assertEq(ranked.getProgress(alice).longestStreak, 50);
    }

    function test_RankReachedHistory() public {
        _winN(alice, 10); // reach Bronze(seed), Silver, Gold
        RPSRanked.Progress memory p = ranked.getProgress(alice);
        assertEq(p.rankReached[uint8(RPSRanked.Rank.Bronze)], 1);
        assertEq(p.rankReached[uint8(RPSRanked.Rank.Silver)], 1);
        assertEq(p.rankReached[uint8(RPSRanked.Rank.Gold)], 1);
        assertEq(p.rankReached[uint8(RPSRanked.Rank.Platinum)], 0);

        _loss(alice); // drop to Bronze
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Bronze));

        _winN(alice, 5); // climb back to Silver -> reached Silver becomes 2
        p = ranked.getProgress(alice);
        assertEq(p.rankReached[uint8(RPSRanked.Rank.Silver)], 2);
        assertEq(p.rankReached[uint8(RPSRanked.Rank.Gold)], 1);
    }

    function test_RankChangedEventOnPromotion() public {
        _winN(alice, 4);
        vm.expectEmit(true, false, false, true);
        emit RPSRanked.RankChanged(alice, RPSRanked.Rank.Bronze, RPSRanked.Rank.Silver, 5);
        _win(alice);
    }

    function test_PlayersIndependent() public {
        _winN(alice, 5);
        _win(bob);
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Silver));
        assertEq(uint8(ranked.rankOf(bob)), uint8(RPSRanked.Rank.Bronze));
        assertEq(ranked.streakOf(bob), 1);
    }
}
