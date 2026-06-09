// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { RPSCore } from "../src/RPSCore.sol";
import { RPSStats } from "../src/RPSStats.sol";
import { RPSRanked } from "../src/RPSRanked.sol";
import { RPSSoulbound } from "../src/RPSSoulbound.sol";
import { RPSTreasury } from "../src/RPSTreasury.sol";

/// @dev Full-system wiring: one ranked match drives stats, ranked progression, the
///      soulbound badge, and the treasury fee split — all from real settled matches.
contract RPSSystemTest is Test {
    RPSCore internal core;
    RPSStats internal stats;
    RPSRanked internal ranked;
    RPSSoulbound internal soulbound;
    RPSTreasury internal treasury;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint128 internal constant BET = 1 ether;
    bytes32 internal constant SALT_A = keccak256("a");
    bytes32 internal constant SALT_B = keccak256("b");

    function setUp() public {
        treasury = new RPSTreasury();
        stats = new RPSStats();
        soulbound = new RPSSoulbound();
        ranked = new RPSRanked(address(soulbound));
        core = new RPSCore(address(treasury), address(stats), address(ranked));

        stats.setRecorder(address(core));
        stats.lockRecorder();
        ranked.setRecorder(address(core));
        ranked.lockRecorder();
        soulbound.setMinter(address(ranked));
        soulbound.lockMinter();
        treasury.setCore(address(core));
        treasury.lockCore();
        treasury.setDistributor(address(this));

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function _commit(address p, RPSCore.Move m, bytes32 s) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(p, m, s));
    }

    function _play(RPSCore.Mode mode, RPSCore.Move a, RPSCore.Move b) internal {
        vm.prank(alice);
        uint256 id = core.createMatch{ value: BET }(mode);
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

    function _rankedAliceWin() internal {
        _play(RPSCore.Mode.Ranked, RPSCore.Move.Rock, RPSCore.Move.Scissors); // Rock beats Scissors
    }

    function test_RankedMatch_FeedsEveryModule() public {
        _rankedAliceWin();

        // stats
        assertEq(stats.getStats(alice).wins, 1);
        assertEq(stats.getStats(bob).losses, 1);

        // ranked
        assertEq(ranked.streakOf(alice), 1);
        assertEq(ranked.streakOf(bob), 0);
        assertTrue(ranked.getProgress(alice).active);

        // badge: both activated at Bronze
        assertTrue(soulbound.tokenOf(alice) != 0);
        assertTrue(soulbound.tokenOf(bob) != 0);
        assertEq(soulbound.tierOf(soulbound.tokenOf(alice)), 0); // Bronze

        // treasury: 5% of a 2-ETH pot = 0.1 ETH waiting in core
        uint256 fee = 0.1 ether;
        assertEq(treasury.collectableFromCore(), fee);
        treasury.collectFromCore();
        assertEq(treasury.streakPool(), fee * 4000 / 10_000);
        assertEq(treasury.totalPooled(), fee);
    }

    function test_CasualMatch_SkipsRankedAndBadge() public {
        _play(RPSCore.Mode.Casual, RPSCore.Move.Rock, RPSCore.Move.Scissors);

        // stats still update
        assertEq(stats.getStats(alice).wins, 1);

        // ranked + badge untouched (casual does not count)
        assertEq(ranked.streakOf(alice), 0);
        assertFalse(ranked.getProgress(alice).active);
        assertEq(soulbound.tokenOf(alice), 0);
    }

    function test_ClimbToSilver_UpgradesBadgeToPeak() public {
        for (uint256 i = 0; i < 5; i++) {
            _rankedAliceWin(); // 5 wins -> streak 5 -> Silver
        }
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Silver));
        assertEq(soulbound.tierOf(soulbound.tokenOf(alice)), 1); // Silver
    }

    function test_BadgeTracksPeak_NotDowngradedOnLoss() public {
        for (uint256 i = 0; i < 5; i++) {
            _rankedAliceWin(); // Silver
        }
        // alice now loses a ranked match (Scissors vs Rock -> bob wins)
        _play(RPSCore.Mode.Ranked, RPSCore.Move.Scissors, RPSCore.Move.Rock);

        // current rank dropped to Bronze, but the badge keeps the peak (Silver)
        assertEq(uint8(ranked.rankOf(alice)), uint8(RPSRanked.Rank.Bronze));
        assertEq(ranked.streakOf(alice), 0);
        assertEq(soulbound.tierOf(soulbound.tokenOf(alice)), 1); // still Silver
        assertEq(uint8(ranked.getProgress(alice).peakRank), uint8(RPSRanked.Rank.Silver));
    }

    function test_RankedTimeout_RecordsNoProgression() public {
        // alice builds a streak, then a ranked opponent times out the next match.
        _rankedAliceWin(); // alice streak 1, bob 1 loss (from the real settled match)
        // new ranked match: both commit, alice reveals, bob never does
        vm.prank(alice);
        uint256 id = core.createMatch{ value: BET }(RPSCore.Mode.Ranked);
        vm.prank(bob);
        core.joinMatch{ value: BET }(id);
        vm.prank(alice);
        core.commitMove(id, _commit(alice, RPSCore.Move.Rock, SALT_A));
        vm.prank(bob);
        core.commitMove(id, _commit(bob, RPSCore.Move.Paper, SALT_B));
        vm.prank(alice);
        core.reveal(id, RPSCore.Move.Rock, SALT_A);
        vm.warp(block.timestamp + core.REVEAL_WINDOW() + 1);
        core.claimRevealTimeout(id);

        // The forfeit pays alice the pot but does not move ranked progression: reputation
        // only changes on fully-revealed settlements, so a no-show can't be farmed for rank.
        assertEq(ranked.streakOf(alice), 1); // unchanged by the timeout win
        assertEq(ranked.getProgress(bob).losses, 1); // only the match-1 loss counts
    }
}
