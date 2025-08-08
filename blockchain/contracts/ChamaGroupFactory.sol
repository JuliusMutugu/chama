// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EnhancedChamaGroup.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ChamaGroupFactory
 * @dev Factory contract for creating and managing Chama groups
 */
contract ChamaGroupFactory is Ownable, ReentrancyGuard {
    // Platform configuration
    struct PlatformConfig {
        uint256 groupCreationFee;
        uint256 minGroupSize;
        uint256 maxGroupSize;
        uint256 platformFeePercentage; // basis points
        address platformTreasury;
        bool requiresApproval;
    }

    // Group registration info
    struct GroupInfo {
        address groupAddress;
        string name;
        address creator;
        uint256 creationDate;
        uint256 memberCount;
        bool isActive;
        bool isApproved;
    }

    PlatformConfig public platformConfig;
    uint256 public totalGroups;
    uint256 public activeGroups;

    // Mappings
    mapping(uint256 => GroupInfo) public groups;
    mapping(address => uint256[]) public userGroups;
    mapping(address => bool) public registeredGroups;
    mapping(address => bool) public approvedCreators;

    // Events
    event GroupCreated(
        uint256 indexed groupId,
        address indexed groupAddress,
        address indexed creator,
        string name,
        uint256 timestamp
    );
    event GroupApproved(uint256 indexed groupId, address approver, uint256 timestamp);
    event GroupDeactivated(uint256 indexed groupId, address deactivator, uint256 timestamp);
    event PlatformConfigUpdated(address updater, uint256 timestamp);
    event CreatorApproved(address creator, address approver, uint256 timestamp);
    event CreatorRevoked(address creator, address revoker, uint256 timestamp);

    modifier onlyApprovedCreator() {
        require(
            approvedCreators[msg.sender] || owner() == msg.sender,
            "Must be approved creator or owner"
        );
        _;
    }

    modifier groupExists(uint256 _groupId) {
        require(_groupId > 0 && _groupId <= totalGroups, "Group does not exist");
        _;
    }

    constructor(PlatformConfig memory _config) {
        require(_config.platformTreasury != address(0), "Invalid treasury address");
        require(_config.minGroupSize >= 2, "Min group size must be at least 2");
        require(_config.maxGroupSize > _config.minGroupSize, "Max size must be greater than min");
        
        platformConfig = _config;
        
        // Owner is automatically approved creator
        approvedCreators[msg.sender] = true;
    }

    /**
     * @dev Create a new Chama group
     * @param _groupConfig Configuration for the new group
     * @param _name Name of the group
     * @param _description Description of the group
     */
    function createGroup(
        EnhancedChamaGroup.GroupConfig memory _groupConfig,
        string memory _name,
        string memory _description
    ) external payable onlyApprovedCreator nonReentrant returns (address) {
        require(msg.value >= platformConfig.groupCreationFee, "Insufficient creation fee");
        require(_groupConfig.maxMembers >= platformConfig.minGroupSize, "Group too small");
        require(_groupConfig.maxMembers <= platformConfig.maxGroupSize, "Group too large");
        require(bytes(_name).length > 0, "Name cannot be empty");

        // Set platform fee in group config
        _groupConfig.platformFeePercentage = platformConfig.platformFeePercentage;
        _groupConfig.name = _name;
        _groupConfig.description = _description;

        // Deploy new group contract with creator address
        EnhancedChamaGroup newGroup = new EnhancedChamaGroup(
            _groupConfig,
            platformConfig.platformTreasury,
            msg.sender  // Pass the actual creator address
        );

        totalGroups++;
        address groupAddress = address(newGroup);

        groups[totalGroups] = GroupInfo({
            groupAddress: groupAddress,
            name: _name,
            creator: msg.sender,
            creationDate: block.timestamp,
            memberCount: 0,
            isActive: true,
            isApproved: !platformConfig.requiresApproval
        });

        registeredGroups[groupAddress] = true;
        userGroups[msg.sender].push(totalGroups);

        if (!platformConfig.requiresApproval) {
            activeGroups++;
        }

        // Transfer creation fee to platform treasury
        if (msg.value > 0) {
            (bool success, ) = platformConfig.platformTreasury.call{value: msg.value}("");
            require(success, "Fee transfer failed");
        }

        emit GroupCreated(totalGroups, groupAddress, msg.sender, _name, block.timestamp);

        return groupAddress;
    }

    /**
     * @dev Approve a group (admin only)
     * @param _groupId ID of the group to approve
     */
    function approveGroup(uint256 _groupId) external onlyOwner groupExists(_groupId) {
        require(!groups[_groupId].isApproved, "Group already approved");
        require(groups[_groupId].isActive, "Group not active");

        groups[_groupId].isApproved = true;
        activeGroups++;

        emit GroupApproved(_groupId, msg.sender, block.timestamp);
    }

    /**
     * @dev Deactivate a group (admin only)
     * @param _groupId ID of the group to deactivate
     */
    function deactivateGroup(uint256 _groupId) external onlyOwner groupExists(_groupId) {
        require(groups[_groupId].isActive, "Group already inactive");

        groups[_groupId].isActive = false;
        
        if (groups[_groupId].isApproved) {
            activeGroups--;
        }

        emit GroupDeactivated(_groupId, msg.sender, block.timestamp);
    }

    /**
     * @dev Approve a creator to create groups
     * @param _creator Address of the creator to approve
     */
    function approveCreator(address _creator) external onlyOwner {
        require(_creator != address(0), "Invalid creator address");
        require(!approvedCreators[_creator], "Creator already approved");

        approvedCreators[_creator] = true;
        emit CreatorApproved(_creator, msg.sender, block.timestamp);
    }

    /**
     * @dev Revoke creator approval
     * @param _creator Address of the creator to revoke
     */
    function revokeCreator(address _creator) external onlyOwner {
        require(approvedCreators[_creator], "Creator not approved");
        require(_creator != owner(), "Cannot revoke owner");

        approvedCreators[_creator] = false;
        emit CreatorRevoked(_creator, msg.sender, block.timestamp);
    }

    /**
     * @dev Update platform configuration
     * @param _config New platform configuration
     */
    function updatePlatformConfig(PlatformConfig memory _config) external onlyOwner {
        require(_config.platformTreasury != address(0), "Invalid treasury address");
        require(_config.minGroupSize >= 2, "Min group size must be at least 2");
        require(_config.maxGroupSize > _config.minGroupSize, "Max size must be greater than min");

        platformConfig = _config;
        emit PlatformConfigUpdated(msg.sender, block.timestamp);
    }

    /**
     * @dev Get user's groups
     * @param _user Address of the user
     */
    function getUserGroups(address _user) external view returns (uint256[] memory) {
        return userGroups[_user];
    }

    /**
     * @dev Get group information
     * @param _groupId ID of the group
     */
    function getGroupInfo(uint256 _groupId) external view groupExists(_groupId) returns (GroupInfo memory) {
        return groups[_groupId];
    }

    /**
     * @dev Get all active groups (paginated)
     * @param _offset Starting index
     * @param _limit Number of groups to return
     */
    function getActiveGroups(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (GroupInfo[] memory) 
    {
        require(_limit > 0 && _limit <= 100, "Invalid limit");
        
        uint256 activeCount = 0;
        uint256 returnCount = 0;
        
        // First pass: count active groups and determine return size
        for (uint256 i = 1; i <= totalGroups && returnCount < _limit; i++) {
            if (groups[i].isActive && groups[i].isApproved) {
                if (activeCount >= _offset) {
                    returnCount++;
                }
                activeCount++;
            }
        }
        
        GroupInfo[] memory result = new GroupInfo[](returnCount);
        uint256 resultIndex = 0;
        activeCount = 0;
        
        // Second pass: populate result array
        for (uint256 i = 1; i <= totalGroups && resultIndex < returnCount; i++) {
            if (groups[i].isActive && groups[i].isApproved) {
                if (activeCount >= _offset) {
                    result[resultIndex] = groups[i];
                    resultIndex++;
                }
                activeCount++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalGroups,
        uint256 _activeGroups,
        uint256 _platformFee,
        uint256 _minGroupSize,
        uint256 _maxGroupSize
    ) {
        return (
            totalGroups,
            activeGroups,
            platformConfig.platformFeePercentage,
            platformConfig.minGroupSize,
            platformConfig.maxGroupSize
        );
    }

    /**
     * @dev Check if an address is a registered group
     * @param _groupAddress Address to check
     */
    function isRegisteredGroup(address _groupAddress) external view returns (bool) {
        return registeredGroups[_groupAddress];
    }

    /**
     * @dev Check if an address is an approved creator
     * @param _creator Address to check
     */
    function isApprovedCreator(address _creator) external view returns (bool) {
        return approvedCreators[_creator];
    }

    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // Receive function to handle accidental transfers
    receive() external payable {
        // Redirect to platform treasury
        (bool success, ) = platformConfig.platformTreasury.call{value: msg.value}("");
        require(success, "Transfer to treasury failed");
    }
}
