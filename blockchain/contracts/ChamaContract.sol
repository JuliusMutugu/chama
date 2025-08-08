// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title ChamaContract
 * @dev Smart contract for managing rotating savings and credit association (Chama)
 */
contract ChamaContract is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    struct Member {
        address wallet;
        bool isActive;
        uint256 rotationOrder;
        uint256 totalContributions;
        bool hasReceived;
    }

    struct Cycle {
        uint256 cycleNumber;
        address recipient;
        uint256 totalAmount;
        uint256 payoutAmount;
        uint256 startTime;
        uint256 endTime;
        bool isCompleted;
        bool fundsDistributed;
    }

    // State variables
    uint256 public contributionAmount;
    uint256 public cycleDuration; // in seconds
    uint256 public currentCycle;
    uint256 public totalMembers;
    uint256 public platformFeePercentage; // 10% = 1000 (basis points)
    
    address[] public memberAddresses;
    mapping(address => Member) public members;
    mapping(uint256 => Cycle) public cycles;
    mapping(uint256 => mapping(address => bool)) public cycleContributions;
    
    uint256 public contractBalance;
    uint256 public totalDistributed;
    address public platformWallet;

    // Events
    event MemberAdded(address indexed member, uint256 rotationOrder);
    event ContributionMade(address indexed member, uint256 amount, uint256 cycle);
    event FundsDistributed(address indexed recipient, uint256 amount, uint256 cycle);
    event CycleStarted(uint256 indexed cycleNumber, address indexed recipient);
    event CycleCompleted(uint256 indexed cycleNumber);

    // Modifiers
    modifier onlyMember() {
        require(members[msg.sender].isActive, "Not an active member");
        _;
    }

    modifier cycleActive() {
        require(currentCycle > 0, "No active cycle");
        require(!cycles[currentCycle].isCompleted, "Current cycle is completed");
        _;
    }

    constructor(
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        address[] memory _memberAddresses,
        address _platformWallet
    ) {
        contributionAmount = _contributionAmount;
        cycleDuration = _cycleDuration;
        platformWallet = _platformWallet;
        platformFeePercentage = 1000; // 10%
        currentCycle = 0;
        totalMembers = _memberAddresses.length;

        // Add members
        for (uint256 i = 0; i < _memberAddresses.length; i++) {
            members[_memberAddresses[i]] = Member({
                wallet: _memberAddresses[i],
                isActive: true,
                rotationOrder: i + 1,
                totalContributions: 0,
                hasReceived: false
            });
            memberAddresses.push(_memberAddresses[i]);
            emit MemberAdded(_memberAddresses[i], i + 1);
        }
    }

    /**
     * @dev Start a new cycle
     */
    function startNewCycle() external onlyOwner {
        require(currentCycle < totalMembers, "All cycles completed");
        
        if (currentCycle > 0) {
            require(cycles[currentCycle].isCompleted, "Previous cycle not completed");
        }

        currentCycle++;
        address recipient = getNextRecipient();
        
        cycles[currentCycle] = Cycle({
            cycleNumber: currentCycle,
            recipient: recipient,
            totalAmount: 0,
            payoutAmount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + cycleDuration,
            isCompleted: false,
            fundsDistributed: false
        });

        emit CycleStarted(currentCycle, recipient);
    }

    /**
     * @dev Make a contribution to the current cycle
     */
    function contribute() external payable onlyMember cycleActive nonReentrant {
        require(msg.value == contributionAmount, "Incorrect contribution amount");
        require(!cycleContributions[currentCycle][msg.sender], "Already contributed this cycle");

        cycleContributions[currentCycle][msg.sender] = true;
        members[msg.sender].totalContributions = members[msg.sender].totalContributions.add(msg.value);
        cycles[currentCycle].totalAmount = cycles[currentCycle].totalAmount.add(msg.value);
        contractBalance = contractBalance.add(msg.value);

        emit ContributionMade(msg.sender, msg.value, currentCycle);

        // Check if all members have contributed
        if (getAllContributionsCount(currentCycle) == totalMembers) {
            completeCycle();
        }
    }

    /**
     * @dev Complete the current cycle and distribute funds
     */
    function completeCycle() internal {
        require(currentCycle > 0, "No active cycle");
        require(!cycles[currentCycle].isCompleted, "Cycle already completed");

        Cycle storage cycle = cycles[currentCycle];
        
        // Calculate payout (90% of total contributions)
        uint256 platformFee = cycle.totalAmount.mul(platformFeePercentage).div(10000);
        uint256 payoutAmount = cycle.totalAmount.sub(platformFee);
        
        cycle.payoutAmount = payoutAmount;
        cycle.isCompleted = true;

        // Mark recipient as having received
        members[cycle.recipient].hasReceived = true;

        emit CycleCompleted(currentCycle);
    }

    /**
     * @dev Distribute funds to the cycle recipient
     */
    function distributeFunds() external onlyOwner nonReentrant {
        require(currentCycle > 0, "No cycle to distribute");
        require(cycles[currentCycle].isCompleted, "Cycle not completed");
        require(!cycles[currentCycle].fundsDistributed, "Funds already distributed");

        Cycle storage cycle = cycles[currentCycle];
        
        // Calculate amounts
        uint256 platformFee = cycle.totalAmount.mul(platformFeePercentage).div(10000);
        uint256 payoutAmount = cycle.payoutAmount;

        // Update balances
        contractBalance = contractBalance.sub(cycle.totalAmount);
        totalDistributed = totalDistributed.add(payoutAmount);

        // Mark as distributed
        cycle.fundsDistributed = true;

        // Transfer platform fee
        if (platformFee > 0) {
            payable(platformWallet).transfer(platformFee);
        }

        // Transfer payout to recipient
        payable(cycle.recipient).transfer(payoutAmount);

        emit FundsDistributed(cycle.recipient, payoutAmount, currentCycle);
    }

    /**
     * @dev Get the next recipient based on rotation order
     */
    function getNextRecipient() internal view returns (address) {
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            address memberAddr = memberAddresses[i];
            if (members[memberAddr].isActive && !members[memberAddr].hasReceived) {
                return memberAddr;
            }
        }
        revert("No eligible recipient found");
    }

    /**
     * @dev Get count of contributions for a specific cycle
     */
    function getAllContributionsCount(uint256 cycleNum) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            if (cycleContributions[cycleNum][memberAddresses[i]]) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Check if a member has contributed to current cycle
     */
    function hasContributed(address member) external view returns (bool) {
        return cycleContributions[currentCycle][member];
    }

    /**
     * @dev Get current cycle information
     */
    function getCurrentCycleInfo() external view returns (
        uint256 cycleNumber,
        address recipient,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime,
        bool isCompleted,
        uint256 contributionsCount
    ) {
        if (currentCycle == 0) return (0, address(0), 0, 0, 0, false, 0);
        
        Cycle memory cycle = cycles[currentCycle];
        return (
            cycle.cycleNumber,
            cycle.recipient,
            cycle.totalAmount,
            cycle.startTime,
            cycle.endTime,
            cycle.isCompleted,
            getAllContributionsCount(currentCycle)
        );
    }

    /**
     * @dev Get member information
     */
    function getMemberInfo(address memberAddr) external view returns (
        bool isActive,
        uint256 rotationOrder,
        uint256 totalContributions,
        bool hasReceived
    ) {
        Member memory member = members[memberAddr];
        return (
            member.isActive,
            member.rotationOrder,
            member.totalContributions,
            member.hasReceived
        );
    }

    /**
     * @dev Get all member addresses
     */
    function getAllMembers() external view returns (address[] memory) {
        return memberAddresses;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        require(contractBalance > 0, "No funds to withdraw");
        payable(owner()).transfer(contractBalance);
        contractBalance = 0;
    }

    /**
     * @dev Update platform fee percentage (only owner)
     */
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 2000, "Fee too high"); // Max 20%
        platformFeePercentage = _newFeePercentage;
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Fallback function to receive Ether
     */
    receive() external payable {
        contractBalance = contractBalance.add(msg.value);
    }
}
