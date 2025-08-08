import { ethers } from 'ethers';

// Contract ABIs (simplified - in production, import from artifacts)
export const FACTORY_ABI = [
    "function createGroup(tuple(string name, string description, uint256 contributionAmount, uint256 contributionFrequency, uint256 maxMembers, uint256 lateFeePercentage, uint256 gracePeriod, uint256 platformFeePercentage, bool isActive, bool requiresKYC) groupConfig, string name, string description) payable returns (address)",
    "function getActiveGroups(uint256 offset, uint256 limit) view returns (tuple(address groupAddress, string name, address creator, uint256 creationDate, uint256 memberCount, bool isActive, bool isApproved)[])",
    "function getUserGroups(address user) view returns (uint256[])",
    "function getGroupInfo(uint256 groupId) view returns (tuple(address groupAddress, string name, address creator, uint256 creationDate, uint256 memberCount, bool isActive, bool isApproved))",
    "function totalGroups() view returns (uint256)",
    "function activeGroups() view returns (uint256)",
    "function platformConfig() view returns (tuple(uint256 groupCreationFee, uint256 minGroupSize, uint256 maxGroupSize, uint256 platformFeePercentage, address platformTreasury, bool requiresApproval))",
    "event GroupCreated(uint256 indexed groupId, address indexed groupAddress, address indexed creator, string name, uint256 timestamp)"
];

export const GROUP_ABI = [
    "function addMember(address member, string name, bool kycVerified)",
    "function removeMember(address member)",
    "function assignRole(address member, bytes32 role)",
    "function startNewCycle()",
    "function makeContribution() payable",
    "function processPayout(uint256 cycleNumber)",
    "function getMemberInfo(address member) view returns (tuple(address memberAddress, string name, uint256 joinDate, uint256 rotationOrder, bool isActive, bool kycVerified, uint256 contributionsMade, uint256 missedPayments, uint256 totalContributed, uint256 performanceScore))",
    "function getCycleInfo(uint256 cycleNumber) view returns (uint256 cycleNumber, address recipient, uint256 startDate, uint256 endDate, uint256 totalAmount, uint256 payoutAmount, uint256 platformFee, bool isCompleted, bool isPaidOut)",
    "function getGroupStats() view returns (uint256 memberCount, uint256 currentCycle, uint256 totalContributions, uint256 totalPayouts, uint256 contractBalance)",
    "function getAllMembers() view returns (address[])",
    "function hasContributedToCycle(address member, uint256 cycleNumber) view returns (bool)",
    "function groupConfig() view returns (tuple(string name, string description, uint256 contributionAmount, uint256 contributionFrequency, uint256 maxMembers, uint256 lateFeePercentage, uint256 gracePeriod, uint256 platformFeePercentage, bool isActive, bool requiresKYC))",
    "function currentCycle() view returns (uint256)",
    "function isMember(address) view returns (bool)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function GROUP_ADMIN_ROLE() view returns (bytes32)",
    "function TREASURER_ROLE() view returns (bytes32)",
    "function SECRETARY_ROLE() view returns (bytes32)",
    "function MEMBER_ROLE() view returns (bytes32)",
    "event MemberAdded(address member, string name, uint256 rotationOrder)",
    "event ContributionMade(address contributor, uint256 amount, uint256 cycle, uint256 timestamp)",
    "event CycleCompleted(uint256 cycle, address recipient, uint256 amount, uint256 timestamp)",
    "event PayoutMade(uint256 cycle, address recipient, uint256 amount, uint256 timestamp)"
];

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
    FACTORY: process.env.REACT_APP_FACTORY_ADDRESS || '',
    // Group addresses are dynamic
};

/**
 * Enhanced Chama Contract Interface
 */
export class ChamaContractInterface {
    constructor(provider, signer = null) {
        this.provider = provider;
        this.signer = signer;
        this.factoryContract = null;
        this.groupContracts = new Map();
        
        if (CONTRACT_ADDRESSES.FACTORY) {
            this.initializeFactory();
        }
    }

    /**
     * Initialize factory contract
     */
    initializeFactory() {
        const contractInstance = this.signer 
            ? new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, this.signer)
            : new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, this.provider);
        
        this.factoryContract = contractInstance;
        return this.factoryContract;
    }

    /**
     * Initialize group contract
     */
    initializeGroup(groupAddress) {
        if (this.groupContracts.has(groupAddress)) {
            return this.groupContracts.get(groupAddress);
        }

        const contractInstance = this.signer 
            ? new ethers.Contract(groupAddress, GROUP_ABI, this.signer)
            : new ethers.Contract(groupAddress, GROUP_ABI, this.provider);
        
        this.groupContracts.set(groupAddress, contractInstance);
        return contractInstance;
    }

    /**
     * Factory Methods
     */
    async createGroup(groupConfig) {
        if (!this.factoryContract) throw new Error('Factory not initialized');
        
        const tx = await this.factoryContract.createGroup(
            groupConfig,
            groupConfig.name,
            groupConfig.description,
            { value: groupConfig.creationFee }
        );
        
        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === 'GroupCreated');
        
        if (event) {
            return {
                groupId: event.args.groupId.toString(),
                groupAddress: event.args.groupAddress,
                transactionHash: receipt.transactionHash
            };
        }
        
        throw new Error('Group creation failed');
    }

    async getActiveGroups(offset = 0, limit = 10) {
        if (!this.factoryContract) throw new Error('Factory not initialized');
        
        const groups = await this.factoryContract.getActiveGroups(offset, limit);
        return groups.map(group => ({
            groupAddress: group.groupAddress,
            name: group.name,
            creator: group.creator,
            creationDate: new Date(group.creationDate.toNumber() * 1000),
            memberCount: group.memberCount.toNumber(),
            isActive: group.isActive,
            isApproved: group.isApproved
        }));
    }

    async getUserGroups(userAddress) {
        if (!this.factoryContract) throw new Error('Factory not initialized');
        
        const groupIds = await this.factoryContract.getUserGroups(userAddress);
        const groups = [];
        
        for (const groupId of groupIds) {
            const groupInfo = await this.factoryContract.getGroupInfo(groupId);
            groups.push({
                groupId: groupId.toString(),
                ...groupInfo
            });
        }
        
        return groups;
    }

    async getPlatformStats() {
        if (!this.factoryContract) throw new Error('Factory not initialized');
        
        const config = await this.factoryContract.platformConfig();
        const totalGroups = await this.factoryContract.totalGroups();
        const activeGroups = await this.factoryContract.activeGroups();
        
        return {
            totalGroups: totalGroups.toNumber(),
            activeGroups: activeGroups.toNumber(),
            groupCreationFee: ethers.utils.formatEther(config.groupCreationFee),
            platformFeePercentage: config.platformFeePercentage.toNumber() / 100,
            minGroupSize: config.minGroupSize.toNumber(),
            maxGroupSize: config.maxGroupSize.toNumber()
        };
    }

    /**
     * Group Methods
     */
    async getGroupContract(groupAddress) {
        return this.initializeGroup(groupAddress);
    }

    async addMember(groupAddress, memberAddress, memberName, kycVerified = false) {
        const group = this.initializeGroup(groupAddress);
        const tx = await group.addMember(memberAddress, memberName, kycVerified);
        return await tx.wait();
    }

    async assignRole(groupAddress, memberAddress, roleName) {
        const group = this.initializeGroup(groupAddress);
        
        // Get role bytes32 value
        const roleMap = {
            'admin': await group.GROUP_ADMIN_ROLE(),
            'treasurer': await group.TREASURER_ROLE(),
            'secretary': await group.SECRETARY_ROLE()
        };
        
        const roleBytes = roleMap[roleName.toLowerCase()];
        if (!roleBytes) throw new Error('Invalid role name');
        
        const tx = await group.assignRole(memberAddress, roleBytes);
        return await tx.wait();
    }

    async startNewCycle(groupAddress) {
        const group = this.initializeGroup(groupAddress);
        const tx = await group.startNewCycle();
        return await tx.wait();
    }

    async makeContribution(groupAddress, amount) {
        const group = this.initializeGroup(groupAddress);
        const tx = await group.makeContribution({ value: amount });
        return await tx.wait();
    }

    async processPayout(groupAddress, cycleNumber) {
        const group = this.initializeGroup(groupAddress);
        const tx = await group.processPayout(cycleNumber);
        return await tx.wait();
    }

    async getGroupStats(groupAddress) {
        const group = this.initializeGroup(groupAddress);
        const stats = await group.getGroupStats();
        
        return {
            memberCount: stats.memberCount.toNumber(),
            currentCycle: stats.currentCycle.toNumber(),
            totalContributions: ethers.utils.formatEther(stats.totalContributions),
            totalPayouts: ethers.utils.formatEther(stats.totalPayouts),
            contractBalance: ethers.utils.formatEther(stats.contractBalance)
        };
    }

    async getMemberInfo(groupAddress, memberAddress) {
        const group = this.initializeGroup(groupAddress);
        const memberInfo = await group.getMemberInfo(memberAddress);
        
        return {
            memberAddress: memberInfo.memberAddress,
            name: memberInfo.name,
            joinDate: new Date(memberInfo.joinDate.toNumber() * 1000),
            rotationOrder: memberInfo.rotationOrder.toNumber(),
            isActive: memberInfo.isActive,
            kycVerified: memberInfo.kycVerified,
            contributionsMade: memberInfo.contributionsMade.toNumber(),
            missedPayments: memberInfo.missedPayments.toNumber(),
            totalContributed: ethers.utils.formatEther(memberInfo.totalContributed),
            performanceScore: memberInfo.performanceScore.toNumber() / 100
        };
    }

    async getCycleInfo(groupAddress, cycleNumber) {
        const group = this.initializeGroup(groupAddress);
        const cycleInfo = await group.getCycleInfo(cycleNumber);
        
        return {
            cycleNumber: cycleInfo.cycleNumber.toNumber(),
            recipient: cycleInfo.recipient,
            startDate: new Date(cycleInfo.startDate.toNumber() * 1000),
            endDate: new Date(cycleInfo.endDate.toNumber() * 1000),
            totalAmount: ethers.utils.formatEther(cycleInfo.totalAmount),
            payoutAmount: ethers.utils.formatEther(cycleInfo.payoutAmount),
            platformFee: ethers.utils.formatEther(cycleInfo.platformFee),
            isCompleted: cycleInfo.isCompleted,
            isPaidOut: cycleInfo.isPaidOut
        };
    }

    async getGroupConfig(groupAddress) {
        const group = this.initializeGroup(groupAddress);
        const config = await group.groupConfig();
        
        return {
            name: config.name,
            description: config.description,
            contributionAmount: ethers.utils.formatEther(config.contributionAmount),
            contributionFrequency: config.contributionFrequency.toNumber(),
            maxMembers: config.maxMembers.toNumber(),
            lateFeePercentage: config.lateFeePercentage.toNumber() / 100,
            gracePeriod: config.gracePeriod.toNumber(),
            platformFeePercentage: config.platformFeePercentage.toNumber() / 100,
            isActive: config.isActive,
            requiresKYC: config.requiresKYC
        };
    }

    async getAllMembers(groupAddress) {
        const group = this.initializeGroup(groupAddress);
        const memberAddresses = await group.getAllMembers();
        
        const members = [];
        for (const address of memberAddresses) {
            const memberInfo = await this.getMemberInfo(groupAddress, address);
            members.push(memberInfo);
        }
        
        return members;
    }

    async hasContributedToCycle(groupAddress, memberAddress, cycleNumber) {
        const group = this.initializeGroup(groupAddress);
        return await group.hasContributedToCycle(memberAddress, cycleNumber);
    }

    async checkMemberRole(groupAddress, memberAddress, roleName) {
        const group = this.initializeGroup(groupAddress);
        
        const roleMap = {
            'admin': await group.GROUP_ADMIN_ROLE(),
            'treasurer': await group.TREASURER_ROLE(),
            'secretary': await group.SECRETARY_ROLE(),
            'member': await group.MEMBER_ROLE()
        };
        
        const roleBytes = roleMap[roleName.toLowerCase()];
        if (!roleBytes) return false;
        
        return await group.hasRole(roleBytes, memberAddress);
    }

    /**
     * Event Listeners
     */
    subscribeToGroupEvents(groupAddress, eventHandlers) {
        const group = this.initializeGroup(groupAddress);
        
        if (eventHandlers.onMemberAdded) {
            group.on('MemberAdded', eventHandlers.onMemberAdded);
        }
        
        if (eventHandlers.onContributionMade) {
            group.on('ContributionMade', eventHandlers.onContributionMade);
        }
        
        if (eventHandlers.onCycleCompleted) {
            group.on('CycleCompleted', eventHandlers.onCycleCompleted);
        }
        
        if (eventHandlers.onPayoutMade) {
            group.on('PayoutMade', eventHandlers.onPayoutMade);
        }
        
        return () => {
            group.removeAllListeners();
        };
    }

    subscribeToFactoryEvents(eventHandlers) {
        if (!this.factoryContract) throw new Error('Factory not initialized');
        
        if (eventHandlers.onGroupCreated) {
            this.factoryContract.on('GroupCreated', eventHandlers.onGroupCreated);
        }
        
        return () => {
            this.factoryContract.removeAllListeners();
        };
    }
}

// Utility functions
export const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const formatEther = (value) => {
    return parseFloat(ethers.utils.formatEther(value)).toFixed(4);
};

export default ChamaContractInterface;
