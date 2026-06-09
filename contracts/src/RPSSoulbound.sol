// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Minimal soulbound NFT interface (EIP-5192).
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);

    function locked(uint256 tokenId) external view returns (bool);
}

/// @title RPSSoulbound
/// @notice Non-transferable (EIP-5192) rank badge for Foreseen. Each player holds at
///         most one badge, minted on their first rank and upgraded in place as their
///         tier changes. Minted and updated only by an authorized `minter` (RPSRanked).
/// @dev    Implements the ERC-721 + ERC-721 Metadata surface so wallets/explorers
///         recognise it, but every transfer and approval reverts: the badge proves
///         achievement and can never be bought or moved. Same trust model as the other
///         modules — the minter can be permanently locked to RPSRanked.
contract RPSSoulbound is IERC5192 {
    // ERC-721 events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    // module events
    event BadgeUpdated(address indexed player, uint256 indexed tokenId, uint8 tier);
    event MinterUpdated(address indexed minter);
    event MinterFrozen(address indexed minter);

    string public constant name = "Foreseen Rank Badge";
    string public constant symbol = "FORESEEN";

    address public immutable owner;
    /// @notice The only address allowed to mint/update badges (the ranked engine).
    address public minter;
    /// @notice Once true, the minter is frozen permanently and cannot be changed.
    bool public minterLocked;

    /// @notice Total badges minted; also the source of sequential token ids (start at 1).
    uint256 public totalSupply;

    mapping(address => uint256) public tokenOf; // player => tokenId (0 = none)
    mapping(uint256 => address) internal _ownerOf; // tokenId => player
    mapping(uint256 => uint8) public tierOf; // tokenId => rank tier (0=Bronze .. 4=Legend)

    error NotOwner();
    error NotMinter();
    error ZeroAddress();
    error MinterLocked();
    error Soulbound();
    error NonexistentToken();
    error InvalidTier();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotMinter();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- admin ---

    /// @notice Authorize the ranked engine that may mint/update badges.
    function setMinter(address minter_) external onlyOwner {
        if (minterLocked) revert MinterLocked();
        if (minter_ == address(0)) revert ZeroAddress();
        minter = minter_;
        emit MinterUpdated(minter_);
    }

    /// @notice Permanently freeze the current minter. Irreversible.
    function lockMinter() external onlyOwner {
        if (minter == address(0)) revert ZeroAddress();
        minterLocked = true;
        emit MinterFrozen(minter);
    }

    // --- minting / upgrading ---

    /// @notice Mint a player's badge (first call) or upgrade its tier in place.
    /// @param player Badge holder.
    /// @param tier Rank tier, 0=Bronze .. 4=Legend.
    function setBadge(address player, uint8 tier) external onlyMinter {
        if (player == address(0)) revert ZeroAddress();
        if (tier > 4) revert InvalidTier();

        uint256 id = tokenOf[player];
        if (id == 0) {
            id = ++totalSupply;
            tokenOf[player] = id;
            _ownerOf[id] = player;
            tierOf[id] = tier;
            emit Transfer(address(0), player, id);
            emit Locked(id);
        } else {
            tierOf[id] = tier;
        }
        emit BadgeUpdated(player, id, tier);
    }

    // --- ERC-721 views ---

    function ownerOf(uint256 tokenId) public view returns (address player) {
        player = _ownerOf[tokenId];
        if (player == address(0)) revert NonexistentToken();
    }

    function balanceOf(address account) external view returns (uint256) {
        if (account == address(0)) revert ZeroAddress();
        return tokenOf[account] == 0 ? 0 : 1;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        ownerOf(tokenId); // reverts if nonexistent
        string memory rank = _tierName(tierOf[tokenId]);
        return string.concat(
            'data:application/json;utf8,{"name":"Foreseen Rank Badge - ',
            rank,
            '","description":"Soulbound rank badge for Foreseen, a competitive on-chain mind sport.","attributes":[{"trait_type":"Rank","value":"',
            rank,
            '"}]}'
        );
    }

    /// @inheritdoc IERC5192
    function locked(uint256 tokenId) external view returns (bool) {
        ownerOf(tokenId); // reverts if nonexistent
        return true;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 // ERC-165
            || interfaceId == 0x80ac58cd // ERC-721
            || interfaceId == 0x5b5e139f // ERC-721 Metadata
            || interfaceId == 0xb45a3c0e; // ERC-5192
    }

    // --- soulbound: every transfer/approval reverts ---

    function approve(address, uint256) external pure {
        revert Soulbound();
    }

    function setApprovalForAll(address, bool) external pure {
        revert Soulbound();
    }

    function getApproved(uint256) external pure returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }

    function transferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert Soulbound();
    }

    function _tierName(uint8 tier) internal pure returns (string memory) {
        if (tier == 0) return "Bronze";
        if (tier == 1) return "Silver";
        if (tier == 2) return "Gold";
        if (tier == 3) return "Platinum";
        return "Legend";
    }
}
