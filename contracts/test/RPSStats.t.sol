// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { RPSStats } from "../src/RPSStats.sol";

contract RPSStatsTest is Test {
    RPSStats internal stats;
    address internal recorder = makeAddr("recorder");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        stats = new RPSStats(); // owner = this test contract
        stats.setRecorder(recorder);
    }

    function _record(address p, RPSStats.Move m, RPSStats.Result r) internal {
        vm.prank(recorder);
        stats.recordMatch(p, m, r);
    }

    // --- access control ---

    function test_Owner_IsDeployer() public view {
        assertEq(stats.owner(), address(this));
    }

    function test_SetRecorder_RevertNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(RPSStats.NotOwner.selector);
        stats.setRecorder(alice);
    }

    function test_SetRecorder_RevertZero() public {
        vm.expectRevert(RPSStats.ZeroAddress.selector);
        stats.setRecorder(address(0));
    }

    function test_RecordMatch_RevertNonRecorder() public {
        vm.prank(alice);
        vm.expectRevert(RPSStats.NotRecorder.selector);
        stats.recordMatch(alice, RPSStats.Move.Rock, RPSStats.Result.Win);
    }

    // --- recording ---

    function test_FirstMatch_NoContextBucket() public {
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Win);
        RPSStats.Stats memory s = stats.getStats(alice);
        assertEq(s.totalMatches, 1);
        assertEq(s.wins, 1);
        assertEq(s.moveCount[0], 1); // Rock
        // no "after" buckets on the very first match
        assertEq(s.afterWinMove[0], 0);
        assertEq(s.afterLossMove[0], 0);
        assertEq(s.afterDrawMove[0], 0);
        assertTrue(s.hasHistory);
    }

    function test_Sequence_BuildsAllBuckets() public {
        // 1) Rock / Win   (first, no context)
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Win);
        // 2) Paper / Loss (prev Win -> afterWin[Paper])
        _record(alice, RPSStats.Move.Paper, RPSStats.Result.Loss);
        // 3) Scissors / Win (prev Loss -> afterLoss[Scissors])
        _record(alice, RPSStats.Move.Scissors, RPSStats.Result.Win);
        // 4) Rock / Draw  (prev Win -> afterWin[Rock])
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Draw);
        // 5) Rock / Win   (prev Draw -> afterDraw[Rock])
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Win);

        RPSStats.Stats memory s = stats.getStats(alice);
        assertEq(s.totalMatches, 5);
        assertEq(s.wins, 3);
        assertEq(s.losses, 1);
        assertEq(s.draws, 1);

        // move distribution: Rock=3, Paper=1, Scissors=1
        assertEq(s.moveCount[0], 3);
        assertEq(s.moveCount[1], 1);
        assertEq(s.moveCount[2], 1);

        // afterWin: Paper(step2) + Rock(step4)
        assertEq(s.afterWinMove[0], 1); // Rock
        assertEq(s.afterWinMove[1], 1); // Paper
        assertEq(s.afterWinMove[2], 0);

        // afterLoss: Scissors(step3)
        assertEq(s.afterLossMove[2], 1);
        assertEq(s.afterLossMove[0], 0);

        // afterDraw: Rock(step5)
        assertEq(s.afterDrawMove[0], 1);

        assertEq(uint8(s.lastResult), uint8(RPSStats.Result.Win));
    }

    function test_WinRateBps() public {
        assertEq(stats.winRateBps(alice), 0); // no matches
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Win);
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Win);
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Loss);
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Draw);
        // 2 wins / 4 matches = 5000 bps
        assertEq(stats.winRateBps(alice), 5000);
    }

    function test_MoveDistributionView() public {
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Win);
        _record(alice, RPSStats.Move.Scissors, RPSStats.Result.Loss);
        uint64[3] memory dist = stats.moveDistribution(alice);
        assertEq(dist[0], 1);
        assertEq(dist[1], 0);
        assertEq(dist[2], 1);
    }

    function test_PlayersAreIndependent() public {
        _record(alice, RPSStats.Move.Rock, RPSStats.Result.Win);
        _record(bob, RPSStats.Move.Paper, RPSStats.Result.Loss);
        assertEq(stats.getStats(alice).wins, 1);
        assertEq(stats.getStats(bob).losses, 1);
        assertEq(stats.getStats(bob).wins, 0);
    }

    // --- recorder lock ---

    function test_LockRecorder_FreezesRecorder() public {
        stats.lockRecorder();
        assertTrue(stats.recorderLocked());
        vm.expectRevert(RPSStats.RecorderLocked.selector);
        stats.setRecorder(alice);
    }

    function test_LockRecorder_RevertNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(RPSStats.NotOwner.selector);
        stats.lockRecorder();
    }

    function test_LockRecorder_RevertWhenRecorderUnset() public {
        RPSStats fresh = new RPSStats();
        vm.expectRevert(RPSStats.ZeroAddress.selector);
        fresh.lockRecorder();
    }
}
