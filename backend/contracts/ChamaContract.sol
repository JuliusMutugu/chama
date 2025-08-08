// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChamaContract {
    address public owner;
    uint256 public contributionAmount;
    uint256 public totalContributions;
    uint256 public cycleNumber;
    uint256 public lastDistributionTime;
    uint256 public distributionPeriod;
    
    mapping(address => bool) public members;
    mapping(address => uint256) public contributions;
    mapping(uint256 => address) public cycleRecipients;
    mapping(address => uint256) public lastContributionTime;
    
    address[] public memberList;
    uint256 public constant DISTRIBUTION_PERCENTAGE = 90; // 90% goes to recipient
    
    event ContributionMade(address member, uint256 amount, uint256 timestamp);
    event FundsDistributed(address recipient, uint256 amount, uint256 timestamp);
    event MemberAdded(address member, uint256 timestamp);
    event MemberRemoved(address member, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyMember() {
        require(members[msg.sender], "Only members can call this function");
        _;
    }
    
    constructor(uint256 _contributionAmount, address[] memory _initialMembers) {
        owner = msg.sender;
        contributionAmount = _contributionAmount;
        distributionPeriod = 30 days; // Set default period to 30 days
        
        for (uint i = 0; i < _initialMembers.length; i++) {
            _addMember(_initialMembers[i]);
        }
        
        lastDistributionTime = block.timestamp;
        cycleNumber = 0;
    }
    
    function contribute() public payable onlyMember {
        require(msg.value == contributionAmount, "Incorrect contribution amount");
        require(block.timestamp >= lastContributionTime[msg.sender] + 1 days, "Can only contribute once per day");
        
        contributions[msg.sender] += msg.value;
        totalContributions += msg.value;
        lastContributionTime[msg.sender] = block.timestamp;
        
        emit ContributionMade(msg.sender, msg.value, block.timestamp);
        
        // Check if it's time to distribute
        if (block.timestamp >= lastDistributionTime + distributionPeriod) {
            distributeFunds();
        }
    }
    
    function distributeFunds() public {
        require(block.timestamp >= lastDistributionTime + distributionPeriod, "Distribution period not reached");
        require(totalContributions > 0, "No funds to distribute");
        
        // Get current recipient
        address recipient = cycleRecipients[cycleNumber % memberList.length];
        require(recipient != address(0), "No recipient set for current cycle");
        
        uint256 distributionAmount = (totalContributions * DISTRIBUTION_PERCENTAGE) / 100;
        uint256 reserveAmount = totalContributions - distributionAmount;
        
        totalContributions = reserveAmount; // Keep reserves for next cycle
        lastDistributionTime = block.timestamp;
        cycleNumber++;
        
        // Transfer funds
        (bool success, ) = recipient.call{value: distributionAmount}("");
        require(success, "Transfer failed");
        
        emit FundsDistributed(recipient, distributionAmount, block.timestamp);
    }
    
    function addMember(address _member) public onlyOwner {
        _addMember(_member);
    }
    
    function _addMember(address _member) internal {
        require(!members[_member], "Member already exists");
        require(_member != address(0), "Invalid member address");
        
        members[_member] = true;
        memberList.push(_member);
        cycleRecipients[memberList.length - 1] = _member;
        
        emit MemberAdded(_member, block.timestamp);
    }
    
    function removeMember(address _member) public onlyOwner {
        require(members[_member], "Member does not exist");
        
        members[_member] = false;
        
        // Remove from memberList
        for (uint i = 0; i < memberList.length; i++) {
            if (memberList[i] == _member) {
                memberList[i] = memberList[memberList.length - 1];
                memberList.pop();
                break;
            }
        }
        
        emit MemberRemoved(_member, block.timestamp);
    }
    
    function getMembers() public view returns (address[] memory) {
        return memberList;
    }
    
    function getMemberCount() public view returns (uint256) {
        return memberList.length;
    }
    
    function getCurrentRecipient() public view returns (address) {
        return cycleRecipients[cycleNumber % memberList.length];
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function setDistributionPeriod(uint256 _period) public onlyOwner {
        require(_period > 0, "Period must be greater than 0");
        distributionPeriod = _period;
    }
}
