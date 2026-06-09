// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { RPSSoulbound, IERC5192 } from "../src/RPSSoulbound.sol";

contract RPSSoulboundTest is Test {
    RPSSoulbound internal badge;
    address internal minter = makeAddr("minter");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function setUp() public {
        badge = new RPSSoulbound(); // owner = this test
        badge.setMinter(minter);
    }

    function _set(address p, uint8 tier) internal {
        vm.prank(minter);
        badge.setBadge(p, tier);
    }

    // --- access control ---

    function test_SetMinter_RevertNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(RPSSoulbound.NotOwner.selector);
        badge.setMinter(alice);
    }

    function test_SetBadge_RevertNonMinter() public {
        vm.prank(alice);
        vm.expectRevert(RPSSoulbound.NotMinter.selector);
        badge.setBadge(alice, 0);
    }

    function test_LockMinter_Freezes() public {
        badge.lockMinter();
        assertTrue(badge.minterLocked());
        vm.expectRevert(RPSSoulbound.MinterLocked.selector);
        badge.setMinter(alice);
    }

    // --- minting & upgrading ---

    function test_Mint_FirstBadge() public {
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(0), alice, 1);
        _set(alice, 1); // Silver

        assertEq(badge.tokenOf(alice), 1);
        assertEq(badge.ownerOf(1), alice);
        assertEq(badge.balanceOf(alice), 1);
        assertEq(badge.tierOf(1), 1);
        assertEq(badge.totalSupply(), 1);
    }

    function test_Upgrade_InPlace() public {
        _set(alice, 1); // Silver, token 1
        _set(alice, 3); // upgrade to Platinum
        assertEq(badge.tokenOf(alice), 1); // same token
        assertEq(badge.tierOf(1), 3);
        assertEq(badge.totalSupply(), 1); // no new mint
    }

    function test_TwoPlayers_SequentialIds() public {
        _set(alice, 0);
        _set(bob, 2);
        assertEq(badge.tokenOf(alice), 1);
        assertEq(badge.tokenOf(bob), 2);
        assertEq(badge.totalSupply(), 2);
    }

    function test_SetBadge_RevertInvalidTier() public {
        vm.prank(minter);
        vm.expectRevert(RPSSoulbound.InvalidTier.selector);
        badge.setBadge(alice, 5);
    }

    function test_SetBadge_RevertZeroPlayer() public {
        vm.prank(minter);
        vm.expectRevert(RPSSoulbound.ZeroAddress.selector);
        badge.setBadge(address(0), 0);
    }

    // --- soulbound enforcement ---

    function test_Transfers_Revert() public {
        _set(alice, 0);
        vm.startPrank(alice);
        vm.expectRevert(RPSSoulbound.Soulbound.selector);
        badge.transferFrom(alice, bob, 1);
        vm.expectRevert(RPSSoulbound.Soulbound.selector);
        badge.safeTransferFrom(alice, bob, 1);
        vm.expectRevert(RPSSoulbound.Soulbound.selector);
        badge.safeTransferFrom(alice, bob, 1, "");
        vm.expectRevert(RPSSoulbound.Soulbound.selector);
        badge.approve(bob, 1);
        vm.expectRevert(RPSSoulbound.Soulbound.selector);
        badge.setApprovalForAll(bob, true);
        vm.stopPrank();
    }

    function test_Locked_True() public {
        _set(alice, 0);
        assertTrue(badge.locked(1));
    }

    function test_Locked_RevertNonexistent() public {
        vm.expectRevert(RPSSoulbound.NonexistentToken.selector);
        badge.locked(99);
    }

    // --- ERC-721 metadata / 165 ---

    function test_OwnerOf_RevertNonexistent() public {
        vm.expectRevert(RPSSoulbound.NonexistentToken.selector);
        badge.ownerOf(99);
    }

    function test_BalanceOf_RevertZero() public {
        vm.expectRevert(RPSSoulbound.ZeroAddress.selector);
        badge.balanceOf(address(0));
    }

    function test_TokenURI_ContainsRank() public {
        _set(alice, 2); // Gold
        string memory uri = badge.tokenURI(1);
        assertTrue(_contains(uri, "Gold"));
        assertTrue(_contains(uri, "Foreseen Rank Badge"));
    }

    function test_SupportsInterface() public view {
        assertTrue(badge.supportsInterface(0x01ffc9a7)); // ERC165
        assertTrue(badge.supportsInterface(0x80ac58cd)); // ERC721
        assertTrue(badge.supportsInterface(0x5b5e139f)); // ERC721Metadata
        assertTrue(badge.supportsInterface(0xb45a3c0e)); // ERC5192
        assertFalse(badge.supportsInterface(0xdeadbeef));
    }

    function _contains(string memory haystack, string memory needle) internal pure returns (bool) {
        bytes memory h = bytes(haystack);
        bytes memory n = bytes(needle);
        if (n.length == 0 || n.length > h.length) return false;
        for (uint256 i = 0; i <= h.length - n.length; i++) {
            bool ok = true;
            for (uint256 j = 0; j < n.length; j++) {
                if (h[i + j] != n[j]) {
                    ok = false;
                    break;
                }
            }
            if (ok) return true;
        }
        return false;
    }
}
