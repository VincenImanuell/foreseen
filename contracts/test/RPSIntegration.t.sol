// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { RPSCore } from "../src/RPSCore.sol";
import { RPSStats } from "../src/RPSStats.sol";

/// @dev End-to-end: RPSCore feeds RPSStats on settlement, so stats come only from
///      real on-chain matches (the audit-driven tamper-proofing).
contract RPSIntegrationTest is Test {
    RPSCore internal core;
    RPSStats internal stats;
    address internal treasury = makeAddr("treasury");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint128 internal constant BET = 1 ether;
    bytes32 internal constant SALT_A = keccak256("a");
    bytes32 internal constant SALT_B = keccak256("b");

    function setUp() public {
        stats = new RPSStats(); // owner = this test
        core = new RPSCore(treasury, address(stats), address(0));
        stats.setRecorder(address(core));
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function _commit(address p, RPSCore.Move m, bytes32 s) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(p, m, s));
    }

    function _play(RPSCore.Move a, RPSCore.Move b) internal returns (uint256 id) {
        vm.prank(alice);
        id = core.createMatch{ value: BET }(RPSCore.Mode.Ranked);
        vm.prank(bob);
        core.joinMatch{ value: BET }(id);
        vm.prank(alice);
        core.commitMove(id, _commit(alice, a, SALT_A));
        vm.prank(bob);
        core.commitMove(id, _commit(bob, b, SALT_B));
        vm.prank(alice);
        core.reveal(id, a, SALT_A);
        vm.prank(bob);
        core.reveal(id, b, SALT_B);
    }

    function test_StatsWired() public view {
        assertEq(address(core.stats()), address(stats));
        assertEq(stats.recorder(), address(core));
    }

    function test_WinRecordsBothPlayers() public {
        // Rock beats Scissors -> alice wins.
        _play(RPSCore.Move.Rock, RPSCore.Move.Scissors);
        RPSStats.Stats memory a = stats.getStats(alice);
        RPSStats.Stats memory b = stats.getStats(bob);
        assertEq(a.totalMatches, 1);
        assertEq(a.wins, 1);
        assertEq(a.moveCount[0], 1); // Rock
        assertEq(b.totalMatches, 1);
        assertEq(b.losses, 1);
        assertEq(b.moveCount[2], 1); // Scissors
    }

    function test_DrawRecordsBoth() public {
        _play(RPSCore.Move.Paper, RPSCore.Move.Paper);
        assertEq(stats.getStats(alice).draws, 1);
        assertEq(stats.getStats(bob).draws, 1);
        assertEq(stats.getStats(alice).moveCount[1], 1); // Paper
    }

    function test_ContextualBucketsAcrossMatches() public {
        // Match 1: alice Rock beats bob Scissors -> alice Win, bob Loss.
        _play(RPSCore.Move.Rock, RPSCore.Move.Scissors);
        // Match 2: alice Scissors vs bob Rock -> Rock beats Scissors -> bob Win, alice Loss.
        _play(RPSCore.Move.Scissors, RPSCore.Move.Rock);

        // alice was Win after match 1; her match-2 move (Scissors=2) lands in afterWinMove.
        assertEq(stats.getStats(alice).afterWinMove[2], 1);
        // bob was Loss after match 1; his match-2 move (Rock=0) lands in afterLossMove.
        assertEq(stats.getStats(bob).afterLossMove[0], 1);
    }

    function test_RevealTimeout_RecordsNothing() public {
        vm.prank(alice);
        uint256 id = core.createMatch{ value: BET }(RPSCore.Mode.Ranked);
        vm.prank(bob);
        core.joinMatch{ value: BET }(id);
        vm.prank(alice);
        core.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));
        vm.prank(bob);
        core.commitMove(id, _commit(bob, RPSCore.Move.Paper, SALT_B));
        vm.prank(alice);
        core.reveal(id, RPSCore.Move.Rock, SALT_A); // bob never reveals

        vm.warp(block.timestamp + core.REVEAL_WINDOW() + 1);
        core.claimRevealTimeout(id);

        // A forfeit pays out the pot but records no reputation: only fully-revealed,
        // head-to-head settlements feed stats (this blocks self-match forfeit farming).
        assertEq(stats.getStats(alice).totalMatches, 0);
        assertEq(stats.getStats(bob).totalMatches, 0);
    }

    function test_NeitherRevealed_RecordsNothing() public {
        vm.prank(alice);
        uint256 id = core.createMatch{ value: BET }(RPSCore.Mode.Ranked);
        vm.prank(bob);
        core.joinMatch{ value: BET }(id);
        vm.prank(alice);
        core.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));
        vm.prank(bob);
        core.commitMove(id, _commit(bob, RPSCore.Move.Paper, SALT_B));

        vm.warp(block.timestamp + core.REVEAL_WINDOW() + 1);
        core.claimRevealTimeout(id);

        assertEq(stats.getStats(alice).totalMatches, 0);
        assertEq(stats.getStats(bob).totalMatches, 0);
    }

    function test_NeitherCommitted_RecordsNothing() public {
        vm.prank(alice);
        uint256 id = core.createMatch{ value: BET }(RPSCore.Mode.Ranked);
        vm.prank(bob);
        core.joinMatch{ value: BET }(id);

        vm.warp(block.timestamp + core.COMMIT_WINDOW() + 1);
        core.claimCommitTimeout(id);

        assertEq(stats.getStats(alice).totalMatches, 0);
        assertEq(stats.getStats(bob).totalMatches, 0);
    }

    function test_SettlementNotBlockedWhenStatsReverts() public {
        // A stats contract whose recorder is NOT this core -> recordMatch reverts.
        RPSStats badStats = new RPSStats(); // recorder left unset
        RPSCore core2 = new RPSCore(treasury, address(badStats), address(0));
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);

        vm.prank(alice);
        uint256 id = core2.createMatch{ value: BET }(RPSCore.Mode.Ranked);
        vm.prank(bob);
        core2.joinMatch{ value: BET }(id);
        vm.prank(alice);
        core2.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));
        vm.prank(bob);
        core2.commitMove(id, _commit(bob, RPSCore.Move.Scissors, SALT_B));
        vm.prank(alice);
        core2.reveal(id, RPSCore.Move.Rock, SALT_A);
        vm.prank(bob);
        core2.reveal(id, RPSCore.Move.Scissors, SALT_B); // settles; stats call reverts but is caught

        uint256 pot = uint256(BET) * 2;
        uint256 fee = pot * core2.FEE_BPS() / core2.BPS_DENOMINATOR();
        assertEq(core2.pendingWithdrawals(alice), pot - fee); // settlement still succeeded
        assertEq(badStats.getStats(alice).totalMatches, 0); // nothing recorded
    }
}
