// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title EnhancedChamaGroup
 * @dev Enhanced smart contract for managing Chama (rotating savings) groups with role-based access
 */
contract EnhancedChamaGroup is ReentrancyGuard, AccessControl, Pausable {
    using SafeMath for uint256;

    // Role definitions
    bytes32 public constant GROUP_ADMIN_ROLE = keccak256("GROUP_ADMIN_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant SECRETARY_ROLE = keccak256("SECRETARY_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    // Group configuration
    struct GroupConfig {
        string name;
        string description;
        uint256 contributionAmount;
        uint256 contributionFrequency; // in seconds (e.g., 2592000 for monthly)
        uint256 maxMembers;
        uint256 lateFeePercentage; // basis points (e.g., 500 = 5%)
        uint256 gracePeriod; // in seconds
        uint256 platformFeePercentage; // basis points (e.g., 1000 = 10%)
        bool isActive;
        bool requiresKYC;
    }

    // Member information
    struct Member {
        address memberAddress;
        string name;
        uint256 joinDate;
        uint256 rotationOrder;
        bool isActive;
        bool kycVerified;
        uint256 contributionsMade;
        uint256 missedPayments;
        uint256 totalContributed;
        uint256 performanceScore; // 0-10000 (100.00%)
    }

    // Cycle information
    struct Cycle {
        uint256 cycleNumber;
        address recipient;
        uint256 startDate;
        uint256 endDate;
        uint256 totalAmount;
        uint256 payoutAmount;
        uint256 platformFee;
        bool isCompleted;
        bool isPaidOut;
        mapping(address => bool) hasContributed;
        mapping(address => uint256) contributionAmounts;
        mapping(address => uint256) contributionDates;
    }

    // State variables
    GroupConfig public groupConfig;
    address public platformTreasury;
    uint256 public currentCycle;
    uint256 public memberCount;
    uint256 public totalContributions;
    uint256 public totalPayouts;

    // Mappings
    mapping(address => Member) public members;
    mapping(uint256 => Cycle) public cycles;
    mapping(address => bool) public isMember;
    mapping(uint256 => address) public rotationOrder;
    address[] public memberAddresses;

    // Events
    event GroupCreated(string name, address creator, uint256 timestamp);
    event MemberAdded(address member, string name, uint256 rotationOrder);
    event MemberRemoved(address member, uint256 timestamp);
    event RoleGranted(address member, bytes32 role, address granter);
    event ContributionMade(address contributor, uint256 amount, uint256 cycle, uint256 timestamp);
    event CycleCompleted(uint256 cycle, address recipient, uint256 amount, uint256 timestamp);
    event PayoutMade(uint256 cycle, address recipient, uint256 amount, uint256 timestamp);
    event LateFeeApplied(address member, uint256 amount, uint256 cycle);
    event GroupConfigUpdated(address updater, uint256 timestamp);
    event EmergencyWithdrawal(address recipient, uint256 amount, uint256 timestamp);

    // Modifiers
    modifier onlyGroupAdmin() {
        require(hasRole(GROUP_ADMIN_ROLE, msg.sender), "Must have group admin role");
        _;
    }

    modifier onlyTreasurerOrAdmin() {
        require(
            hasRole(TREASURER_ROLE, msg.sender) || hasRole(GROUP_ADMIN_ROLE, msg.sender),
            "Must have treasurer or admin role"
        );
        _;
    }

    modifier onlyActiveMember() {
        require(isMember[msg.sender] && members[msg.sender].isActive, "Must be active member");
        _;
    }

    modifier cycleExists(uint256 _cycleNumber) {
        require(_cycleNumber <= currentCycle, "Cycle does not exist");
        _;
    }

    /**
     * @dev Constructor to initialize the group
     * @param _config Group configuration parameters
     * @param _platformTreasury Address for platform fees
     * @param _groupCreator Address of the group creator who will have admin role
     */
    constructor(
        GroupConfig memory _config,
        address _platformTreasury,
        address _groupCreator
    ) {
        require(_platformTreasury != address(0), "Invalid platform treasury address");
        require(_groupCreator != address(0), "Invalid group creator address");
        require(_config.maxMembers > 0, "Max members must be greater than 0");
        require(_config.contributionAmount > 0, "Contribution amount must be greater than 0");

        groupConfig = _config;
        platformTreasury = _platformTreasury;
        currentCycle = 0;

        // Grant admin role to group creator (not the factory contract)
        _grantRole(DEFAULT_ADMIN_ROLE, _groupCreator);
        _grantRole(GROUP_ADMIN_ROLE, _groupCreator);
        _grantRole(TREASURER_ROLE, _groupCreator); // Admin can also act as treasurer initially

        // Add the creator as the first member
        members[_groupCreator] = Member({
            memberAddress: _groupCreator,
            name: "Group Admin",
            joinDate: block.timestamp,
            rotationOrder: 1,
            isActive: true,
            kycVerified: true,
            contributionsMade: 0,
            missedPayments: 0,
            totalContributed: 0,
            performanceScore: 10000 // Start with 100%
        });

        isMember[_groupCreator] = true;
        rotationOrder[1] = _groupCreator;
        memberAddresses.push(_groupCreator);
        memberCount = 1;

        // Grant member role to creator
        _grantRole(MEMBER_ROLE, _groupCreator);

        emit GroupCreated(_config.name, _groupCreator, block.timestamp);
    }

    /**
     * @dev Add a new member to the group
     * @param _member Address of the new member
     * @param _name Name of the member
     * @param _kycVerified KYC verification status
     */
    function addMember(
        address _member,
        string memory _name,
        bool _kycVerified
    ) external onlyGroupAdmin whenNotPaused {
        require(_member != address(0), "Invalid member address");
        require(!isMember[_member], "Member already exists");
        require(memberCount < groupConfig.maxMembers, "Group is full");
        require(!groupConfig.requiresKYC || _kycVerified, "KYC verification required");

        uint256 rotationOrderNumber = memberCount + 1;

        members[_member] = Member({
            memberAddress: _member,
            name: _name,
            joinDate: block.timestamp,
            rotationOrder: rotationOrderNumber,
            isActive: true,
            kycVerified: _kycVerified,
            contributionsMade: 0,
            missedPayments: 0,
            totalContributed: 0,
            performanceScore: 10000 // Start with 100%
        });

        isMember[_member] = true;
        rotationOrder[rotationOrderNumber] = _member;
        memberAddresses.push(_member);
        memberCount++;

        // Grant member role
        _grantRole(MEMBER_ROLE, _member);

        emit MemberAdded(_member, _name, rotationOrderNumber);
    }

    /**
     * @dev Remove a member from the group
     * @param _member Address of the member to remove
     */
    function removeMember(address _member) external onlyGroupAdmin {
        require(isMember[_member], "Member does not exist");
        
        members[_member].isActive = false;
        _revokeRole(MEMBER_ROLE, _member);
        
        // Note: We don't remove from memberAddresses to maintain history
        // but we mark as inactive
        
        emit MemberRemoved(_member, block.timestamp);
    }

    /**
     * @dev Assign roles to members
     * @param _member Address of the member
     * @param _role Role to assign
     */
    function assignRole(address _member, bytes32 _role) external onlyGroupAdmin {
        require(isMember[_member], "Not a member");
        require(
            _role == TREASURER_ROLE || _role == SECRETARY_ROLE || _role == GROUP_ADMIN_ROLE,
            "Invalid role"
        );
        
        _grantRole(_role, _member);
        emit RoleGranted(_member, _role, msg.sender);
    }

    /**
     * @dev Start a new cycle
     */
    function startNewCycle() external onlyTreasurerOrAdmin whenNotPaused {
        require(memberCount >= 2, "Need at least 2 members to start cycle");
        
        if (currentCycle > 0) {
            require(cycles[currentCycle].isCompleted, "Current cycle not completed");
        }

        currentCycle++;
        address recipient = getNextRecipient();

        cycles[currentCycle].cycleNumber = currentCycle;
        cycles[currentCycle].recipient = recipient;
        cycles[currentCycle].startDate = block.timestamp;
        cycles[currentCycle].endDate = block.timestamp + groupConfig.contributionFrequency;
        cycles[currentCycle].isCompleted = false;
        cycles[currentCycle].isPaidOut = false;
    }

    /**
     * @dev Make a contribution to the current cycle
     */
    function makeContribution() external payable onlyActiveMember nonReentrant whenNotPaused {
        require(currentCycle > 0, "No active cycle");
        require(!cycles[currentCycle].isCompleted, "Cycle already completed");
        require(!cycles[currentCycle].hasContributed[msg.sender], "Already contributed this cycle");

        uint256 expectedAmount = groupConfig.contributionAmount;
        uint256 lateFee = 0;

        // Calculate late fee if past due date
        if (block.timestamp > cycles[currentCycle].endDate) {
            lateFee = expectedAmount.mul(groupConfig.lateFeePercentage).div(10000);
            expectedAmount = expectedAmount.add(lateFee);
        }

        require(msg.value >= expectedAmount, "Insufficient contribution amount");

        // Update cycle information
        cycles[currentCycle].hasContributed[msg.sender] = true;
        cycles[currentCycle].contributionAmounts[msg.sender] = msg.value;
        cycles[currentCycle].contributionDates[msg.sender] = block.timestamp;
        cycles[currentCycle].totalAmount = cycles[currentCycle].totalAmount.add(msg.value);

        // Update member information
        members[msg.sender].contributionsMade++;
        members[msg.sender].totalContributed = members[msg.sender].totalContributed.add(msg.value);
        
        // Update performance score
        if (block.timestamp <= cycles[currentCycle].endDate) {
            // On-time payment boosts score
            if (members[msg.sender].performanceScore < 10000) {
                members[msg.sender].performanceScore = members[msg.sender].performanceScore.add(100);
            }
        } else {
            // Late payment reduces score
            members[msg.sender].performanceScore = members[msg.sender].performanceScore.sub(200);
            members[msg.sender].missedPayments++;
            emit LateFeeApplied(msg.sender, lateFee, currentCycle);
        }

        totalContributions = totalContributions.add(msg.value);

        emit ContributionMade(msg.sender, msg.value, currentCycle, block.timestamp);

        // Check if cycle is complete
        checkCycleCompletion();
    }

    /**
     * @dev Check if current cycle is complete and process payout
     */
    function checkCycleCompletion() internal {
        uint256 contributionsReceived = 0;
        
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            address memberAddr = memberAddresses[i];
            if (members[memberAddr].isActive && cycles[currentCycle].hasContributed[memberAddr]) {
                contributionsReceived++;
            }
        }

        uint256 activeMemberCount = getActiveMemberCount();
        
        if (contributionsReceived >= activeMemberCount) {
            cycles[currentCycle].isCompleted = true;
            
            // Calculate payout
            uint256 totalAmount = cycles[currentCycle].totalAmount;
            uint256 platformFee = totalAmount.mul(groupConfig.platformFeePercentage).div(10000);
            uint256 payoutAmount = totalAmount.sub(platformFee);
            
            cycles[currentCycle].platformFee = platformFee;
            cycles[currentCycle].payoutAmount = payoutAmount;
            
            emit CycleCompleted(currentCycle, cycles[currentCycle].recipient, payoutAmount, block.timestamp);
        }
    }

    /**
     * @dev Process payout for completed cycle
     */
    function processPayout(uint256 _cycleNumber) external onlyTreasurerOrAdmin nonReentrant cycleExists(_cycleNumber) {
        require(cycles[_cycleNumber].isCompleted, "Cycle not completed");
        require(!cycles[_cycleNumber].isPaidOut, "Payout already processed");

        address recipient = cycles[_cycleNumber].recipient;
        uint256 payoutAmount = cycles[_cycleNumber].payoutAmount;
        uint256 platformFee = cycles[_cycleNumber].platformFee;

        cycles[_cycleNumber].isPaidOut = true;
        totalPayouts = totalPayouts.add(payoutAmount);

        // Transfer payout to recipient
        (bool success, ) = recipient.call{value: payoutAmount}("");
        require(success, "Payout transfer failed");

        // Transfer platform fee
        (bool feeSuccess, ) = platformTreasury.call{value: platformFee}("");
        require(feeSuccess, "Platform fee transfer failed");

        emit PayoutMade(_cycleNumber, recipient, payoutAmount, block.timestamp);
    }

    /**
     * @dev Get the next recipient based on rotation order
     */
    function getNextRecipient() internal view returns (address) {
        uint256 recipientOrder = ((currentCycle - 1) % memberCount) + 1;
        address recipient = rotationOrder[recipientOrder];
        
        // If recipient is not active, find next active member
        if (!members[recipient].isActive) {
            for (uint256 i = 1; i <= memberCount; i++) {
                address candidate = rotationOrder[i];
                if (members[candidate].isActive) {
                    return candidate;
                }
            }
        }
        
        return recipient;
    }

    /**
     * @dev Get count of active members
     */
    function getActiveMemberCount() internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            if (members[memberAddresses[i]].isActive) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Update group configuration (admin only)
     */
    function updateGroupConfig(GroupConfig memory _newConfig) external onlyGroupAdmin {
        groupConfig = _newConfig;
        emit GroupConfigUpdated(msg.sender, block.timestamp);
    }

    /**
     * @dev Emergency withdrawal (admin only) - for extreme circumstances
     */
    function emergencyWithdraw() external onlyGroupAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(msg.sender, balance, block.timestamp);
    }

    /**
     * @dev Pause the contract (admin only)
     */
    function pause() external onlyGroupAdmin {
        _pause();
    }

    /**
     * @dev Unpause the contract (admin only)
     */
    function unpause() external onlyGroupAdmin {
        _unpause();
    }

    // View functions
    function getMemberInfo(address _member) external view returns (Member memory) {
        return members[_member];
    }

    function getCycleInfo(uint256 _cycleNumber) external view returns (
        uint256 cycleNumber,
        address recipient,
        uint256 startDate,
        uint256 endDate,
        uint256 totalAmount,
        uint256 payoutAmount,
        uint256 platformFee,
        bool isCompleted,
        bool isPaidOut
    ) {
        Cycle storage cycle = cycles[_cycleNumber];
        return (
            cycle.cycleNumber,
            cycle.recipient,
            cycle.startDate,
            cycle.endDate,
            cycle.totalAmount,
            cycle.payoutAmount,
            cycle.platformFee,
            cycle.isCompleted,
            cycle.isPaidOut
        );
    }

    function getGroupStats() external view returns (
        uint256 _memberCount,
        uint256 _currentCycle,
        uint256 _totalContributions,
        uint256 _totalPayouts,
        uint256 _contractBalance
    ) {
        return (
            memberCount,
            currentCycle,
            totalContributions,
            totalPayouts,
            address(this).balance
        );
    }

    function getAllMembers() external view returns (address[] memory) {
        return memberAddresses;
    }

    function hasContributedToCycle(address _member, uint256 _cycleNumber) external view returns (bool) {
        return cycles[_cycleNumber].hasContributed[_member];
    }

    function getMemberContribution(address _member, uint256 _cycleNumber) external view returns (uint256) {
        return cycles[_cycleNumber].contributionAmounts[_member];
    }

    // Receive function to accept Ether
    receive() external payable {
        // Allow direct payments for contributions
        if (currentCycle > 0 && isMember[msg.sender]) {
            // This would need additional logic to handle direct payments
            revert("Use makeContribution() function");
        }
    }
}
