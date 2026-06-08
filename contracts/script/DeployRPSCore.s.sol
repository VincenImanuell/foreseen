// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { RPSCore } from "../src/RPSCore.sol";

/// @notice Deploys RPSCore. Reads PRIVATE_KEY from the environment and uses the
///         deployer as the treasury unless TREASURY is set. Testnet (Celo Sepolia) only.
contract DeployRPSCore is Script {
    function run() external returns (RPSCore rps) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast(pk);
        rps = new RPSCore(treasury);
        vm.stopBroadcast();

        console.log("RPSCore deployed at:", address(rps));
        console.log("Treasury:", treasury);
        console.log("Deployer:", deployer);
    }
}
