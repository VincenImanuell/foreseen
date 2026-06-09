// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { RPSCore } from "../src/RPSCore.sol";
import { RPSStats } from "../src/RPSStats.sol";
import { RPSRanked } from "../src/RPSRanked.sol";
import { RPSSoulbound } from "../src/RPSSoulbound.sol";
import { RPSTreasury } from "../src/RPSTreasury.sol";

/// @notice Deploys the full Foreseen v1 system and wires every module so that all
///         on-chain records (stats, rank, badge, fees) flow only from real settled
///         matches, then permanently locks each writer. Targets Celo Sepolia (dev) and
///         Celo mainnet (production) — note the writer locks are irreversible once mined.
/// @dev    Deploy order respects immutable dependencies: soulbound before ranked
///         (ranked holds the badge), and treasury/stats/ranked before core (core holds
///         their addresses). Fees are routed to the RPSTreasury contract.
contract DeploySystem is Script {
    function run()
        external
        returns (
            RPSCore core,
            RPSStats stats,
            RPSRanked ranked,
            RPSSoulbound soulbound,
            RPSTreasury treasury
        )
    {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        // 1. Modules (soulbound before ranked; all before core).
        treasury = new RPSTreasury();
        stats = new RPSStats();
        soulbound = new RPSSoulbound();
        ranked = new RPSRanked(address(soulbound));

        // 2. The engine, fed by stats + ranked, with fees routed to the treasury.
        core = new RPSCore(address(treasury), address(stats), address(ranked));

        // 3. Wire every writer to the engine and lock it permanently.
        stats.setRecorder(address(core));
        stats.lockRecorder();

        ranked.setRecorder(address(core));
        ranked.lockRecorder();

        soulbound.setMinter(address(ranked));
        soulbound.lockMinter();

        treasury.setCore(address(core));
        treasury.lockCore();
        treasury.setDistributor(deployer); // payouts handled by deployer/keeper (not locked)

        vm.stopBroadcast();

        console.log("RPSTreasury :", address(treasury));
        console.log("RPSStats    :", address(stats));
        console.log("RPSSoulbound:", address(soulbound));
        console.log("RPSRanked   :", address(ranked));
        console.log("RPSCore     :", address(core));
        console.log("All writers wired to RPSCore and locked.");
    }
}
