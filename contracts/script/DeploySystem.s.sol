// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { RPSCore } from "../src/RPSCore.sol";
import { RPSStats } from "../src/RPSStats.sol";

/// @notice Deploys the Foreseen v1 system (RPSStats + RPSCore), wires RPSCore as the
///         stats recorder, and permanently locks it so stats can only ever come from
///         real on-chain settled matches. Testnet (Celo Sepolia) only.
contract DeploySystem is Script {
    function run() external returns (RPSCore core, RPSStats stats) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast(pk);
        stats = new RPSStats();
        core = new RPSCore(treasury, address(stats));
        stats.setRecorder(address(core));
        stats.lockRecorder();
        vm.stopBroadcast();

        console.log("RPSStats deployed at:", address(stats));
        console.log("RPSCore  deployed at:", address(core));
        console.log("Treasury:", treasury);
        console.log("Recorder locked to RPSCore (stats are tamper-proof)");
    }
}
