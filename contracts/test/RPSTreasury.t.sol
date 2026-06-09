// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { RPSTreasury } from "../src/RPSTreasury.sol";

/// @dev Minimal stand-in for RPSCore's pull-payment surface.
contract MockCore {
    mapping(address => uint256) public pendingWithdrawals;

    function credit(address account) external payable {
        pendingWithdrawals[account] += msg.value;
    }

    function withdraw() external {
        uint256 amt = pendingWithdrawals[msg.sender];
        pendingWithdrawals[msg.sender] = 0;
        (bool ok,) = msg.sender.call{ value: amt }("");
        require(ok, "transfer failed");
    }
}

contract RPSTreasuryTest is Test {
    RPSTreasury internal treasury;
    MockCore internal core;
    address internal distributor = makeAddr("distributor");
    address internal bob = makeAddr("bob");

    function setUp() public {
        treasury = new RPSTreasury(); // owner = this test
        core = new MockCore();
        treasury.setCore(address(core));
        treasury.setDistributor(distributor);
        vm.deal(address(this), 1000 ether);
    }

    function _fundAndCollect(uint256 amount) internal {
        core.credit{ value: amount }(address(treasury));
        treasury.collectFromCore();
    }

    // --- fee intake & allocation ---

    function test_CollectFromCore_Allocates() public {
        _fundAndCollect(100);
        assertEq(treasury.streakPool(), 40);
        assertEq(treasury.weeklyPool(), 20);
        assertEq(treasury.tournamentPool(), 20);
        assertEq(treasury.devPool(), 20);
        assertEq(treasury.totalPooled(), 100);
        assertEq(address(treasury).balance, 100);
        assertEq(core.pendingWithdrawals(address(treasury)), 0);
    }

    function test_DirectDonation_Allocates() public {
        (bool ok,) = address(treasury).call{ value: 100 }("");
        assertTrue(ok);
        assertEq(treasury.streakPool(), 40);
        assertEq(treasury.devPool(), 20);
    }

    function test_Allocation_RoundingGoesToDev() public {
        _fundAndCollect(10_001);
        assertEq(treasury.streakPool(), 4000);
        assertEq(treasury.weeklyPool(), 2000);
        assertEq(treasury.tournamentPool(), 2000);
        assertEq(treasury.devPool(), 2001); // remainder
        assertEq(treasury.totalPooled(), 10_001);
    }

    function test_CollectableFromCore_View() public {
        core.credit{ value: 500 }(address(treasury));
        assertEq(treasury.collectableFromCore(), 500);
        treasury.collectFromCore();
        assertEq(treasury.collectableFromCore(), 0);
    }

    // --- payouts ---

    function test_PayBonus_FromStreakPool() public {
        _fundAndCollect(1000); // streak 400
        uint256 before = bob.balance;
        vm.prank(distributor);
        treasury.payBonus(RPSTreasury.Pool.Streak, bob, 100);
        assertEq(treasury.streakPool(), 300);
        assertEq(bob.balance, before + 100);
    }

    function test_PayBonus_RevertNonDistributor() public {
        _fundAndCollect(1000);
        vm.expectRevert(RPSTreasury.NotDistributor.selector);
        treasury.payBonus(RPSTreasury.Pool.Streak, bob, 10);
    }

    function test_PayBonus_RevertInsufficient() public {
        _fundAndCollect(1000); // streak 400
        vm.prank(distributor);
        vm.expectRevert(RPSTreasury.InsufficientPool.selector);
        treasury.payBonus(RPSTreasury.Pool.Streak, bob, 401);
    }

    function test_PayBonus_RevertOnDevPool() public {
        _fundAndCollect(1000);
        vm.prank(distributor);
        vm.expectRevert(RPSTreasury.InvalidPool.selector);
        treasury.payBonus(RPSTreasury.Pool.Dev, bob, 10);
    }

    function test_WithdrawDev_Owner() public {
        _fundAndCollect(1000); // dev 200
        uint256 before = bob.balance;
        treasury.withdrawDev(bob, 150);
        assertEq(treasury.devPool(), 50);
        assertEq(bob.balance, before + 150);
    }

    function test_WithdrawDev_RevertNonOwner() public {
        _fundAndCollect(1000);
        vm.prank(bob);
        vm.expectRevert(RPSTreasury.NotOwner.selector);
        treasury.withdrawDev(bob, 10);
    }

    function test_WithdrawDev_RevertInsufficient() public {
        _fundAndCollect(1000); // dev 200
        vm.expectRevert(RPSTreasury.InsufficientPool.selector);
        treasury.withdrawDev(bob, 201);
    }

    // --- admin wiring ---

    function test_SetCore_RevertNonOwner() public {
        vm.prank(bob);
        vm.expectRevert(RPSTreasury.NotOwner.selector);
        treasury.setCore(bob);
    }

    function test_LockCore_Freezes() public {
        treasury.lockCore();
        assertTrue(treasury.coreLocked());
        vm.expectRevert(RPSTreasury.CoreLocked.selector);
        treasury.setCore(bob);
    }

    function test_LockDistributor_Freezes() public {
        treasury.lockDistributor();
        assertTrue(treasury.distributorLocked());
        vm.expectRevert(RPSTreasury.DistributorLocked.selector);
        treasury.setDistributor(bob);
    }
}
