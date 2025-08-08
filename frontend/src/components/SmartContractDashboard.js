import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Card, Title, Text, Button, TextInput, Badge, ProgressBar, Flex, Grid } from '@tremor/react';
import { PlusIcon, UserGroupIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import ChamaContractInterface from '../utils/contractInterface';
import { WalletContext } from '../contexts/WalletContext';

const SmartContractDashboard = () => {
    const { account, provider, signer } = useContext(WalletContext);
    const [contractInterface, setContractInterface] = useState(null);
    const [userGroups, setUserGroups] = useState([]);
    const [activeGroups, setActiveGroups] = useState([]);
    const [platformStats, setPlatformStats] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupDetails, setGroupDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupForm, setGroupForm] = useState({
        name: '',
        description: '',
        contributionAmount: '',
        contributionFrequency: '30', // days
        maxMembers: '10',
        lateFeePercentage: '10',
        requiresKYC: false
    });

    useEffect(() => {
        if (provider && signer) {
            const interface = new ChamaContractInterface(provider, signer);
            setContractInterface(interface);
            loadDashboardData(interface);
        }
    }, [provider, signer]);

    const loadDashboardData = async (interface) => {
        try {
            setLoading(true);
            
            // Load platform stats
            const stats = await interface.getPlatformStats();
            setPlatformStats(stats);

            // Load user groups if account is connected
            if (account) {
                const groups = await interface.getUserGroups(account);
                setUserGroups(groups);
            }

            // Load active groups
            const active = await interface.getActiveGroups(0, 10);
            setActiveGroups(active);

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError('');

            const config = {
                name: groupForm.name,
                description: groupForm.description,
                contributionAmount: ethers.utils.parseEther(groupForm.contributionAmount),
                contributionFrequency: parseInt(groupForm.contributionFrequency) * 24 * 60 * 60, // Convert days to seconds
                maxMembers: parseInt(groupForm.maxMembers),
                lateFeePercentage: parseInt(groupForm.lateFeePercentage) * 100, // Convert to basis points
                gracePeriod: 7 * 24 * 60 * 60, // 7 days
                platformFeePercentage: 500, // 5%
                isActive: true,
                requiresKYC: groupForm.requiresKYC,
                creationFee: ethers.utils.parseEther(platformStats?.groupCreationFee || '0.01')
            };

            const result = await contractInterface.createGroup(config);
            
            // Refresh dashboard data
            await loadDashboardData(contractInterface);
            
            // Reset form
            setGroupForm({
                name: '',
                description: '',
                contributionAmount: '',
                contributionFrequency: '30',
                maxMembers: '10',
                lateFeePercentage: '10',
                requiresKYC: false
            });
            setShowCreateGroup(false);

            alert(`Group created successfully! Address: ${result.groupAddress}`);

        } catch (err) {
            console.error('Error creating group:', err);
            setError('Failed to create group: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadGroupDetails = async (groupAddress) => {
        try {
            setLoading(true);
            
            const [config, stats, members] = await Promise.all([
                contractInterface.getGroupConfig(groupAddress),
                contractInterface.getGroupStats(groupAddress),
                contractInterface.getAllMembers(groupAddress)
            ]);

            setGroupDetails({
                address: groupAddress,
                config,
                stats,
                members
            });

        } catch (err) {
            console.error('Error loading group details:', err);
            setError('Failed to load group details');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async (groupAddress) => {
        try {
            setLoading(true);
            setError('');

            // In a real implementation, you would need the group admin to add you
            // This is just a placeholder for the UI flow
            alert('Contact the group admin to be added to this group');

        } catch (err) {
            console.error('Error joining group:', err);
            setError('Failed to join group');
        } finally {
            setLoading(false);
        }
    };

    const handleMakeContribution = async (groupAddress) => {
        try {
            setLoading(true);
            setError('');

            const config = await contractInterface.getGroupConfig(groupAddress);
            const amount = ethers.utils.parseEther(config.contributionAmount);

            await contractInterface.makeContribution(groupAddress, amount);
            
            // Refresh group details
            await loadGroupDetails(groupAddress);

            alert('Contribution made successfully!');

        } catch (err) {
            console.error('Error making contribution:', err);
            setError('Failed to make contribution: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return (
            <Card className="max-w-lg mx-auto mt-8">
                <Title>Connect Wallet</Title>
                <Text className="mt-2">
                    Please connect your wallet to interact with Chama smart contracts.
                </Text>
            </Card>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <Title>Smart Contract Dashboard</Title>
                <Text>Manage your Chama groups and contributions on the blockchain</Text>
            </div>

            {error && (
                <Card className="mb-4 bg-red-50 border-red-200">
                    <Text className="text-red-600">{error}</Text>
                </Card>
            )}

            {/* Platform Statistics */}
            {platformStats && (
                <Card className="mb-6">
                    <Title>Platform Statistics</Title>
                    <Grid numItems={4} className="gap-4 mt-4">
                        <Card>
                            <Flex alignItems="center" className="space-x-2">
                                <UserGroupIcon className="h-5 w-5 text-blue-500" />
                                <div>
                                    <Text>Total Groups</Text>
                                    <Title>{platformStats.totalGroups}</Title>
                                </div>
                            </Flex>
                        </Card>
                        <Card>
                            <Flex alignItems="center" className="space-x-2">
                                <UserGroupIcon className="h-5 w-5 text-green-500" />
                                <div>
                                    <Text>Active Groups</Text>
                                    <Title>{platformStats.activeGroups}</Title>
                                </div>
                            </Flex>
                        </Card>
                        <Card>
                            <Flex alignItems="center" className="space-x-2">
                                <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <Text>Creation Fee</Text>
                                    <Title>{platformStats.groupCreationFee} ETH</Title>
                                </div>
                            </Flex>
                        </Card>
                        <Card>
                            <Flex alignItems="center" className="space-x-2">
                                <ClockIcon className="h-5 w-5 text-purple-500" />
                                <div>
                                    <Text>Platform Fee</Text>
                                    <Title>{platformStats.platformFeePercentage}%</Title>
                                </div>
                            </Flex>
                        </Card>
                    </Grid>
                </Card>
            )}

            {/* Your Groups */}
            <Card className="mb-6">
                <Flex justifyContent="between" alignItems="center" className="mb-4">
                    <Title>Your Groups</Title>
                    <Button
                        size="sm"
                        icon={PlusIcon}
                        onClick={() => setShowCreateGroup(!showCreateGroup)}
                    >
                        Create Group
                    </Button>
                </Flex>

                {/* Create Group Form */}
                {showCreateGroup && (
                    <Card className="mb-4 bg-gray-50">
                        <Title>Create New Chama Group</Title>
                        <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text>Group Name</Text>
                                    <TextInput
                                        value={groupForm.name}
                                        onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                                        placeholder="Enter group name"
                                        required
                                    />
                                </div>
                                <div>
                                    <Text>Contribution Amount (ETH)</Text>
                                    <TextInput
                                        type="number"
                                        step="0.001"
                                        value={groupForm.contributionAmount}
                                        onChange={(e) => setGroupForm({...groupForm, contributionAmount: e.target.value})}
                                        placeholder="0.1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Text>Frequency (Days)</Text>
                                    <TextInput
                                        type="number"
                                        value={groupForm.contributionFrequency}
                                        onChange={(e) => setGroupForm({...groupForm, contributionFrequency: e.target.value})}
                                        placeholder="30"
                                        required
                                    />
                                </div>
                                <div>
                                    <Text>Max Members</Text>
                                    <TextInput
                                        type="number"
                                        value={groupForm.maxMembers}
                                        onChange={(e) => setGroupForm({...groupForm, maxMembers: e.target.value})}
                                        placeholder="10"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Text>Description</Text>
                                <TextInput
                                    value={groupForm.description}
                                    onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                                    placeholder="Describe your group..."
                                    required
                                />
                            </div>
                            <Flex justifyContent="end" className="space-x-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowCreateGroup(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={loading}
                                >
                                    Create Group
                                </Button>
                            </Flex>
                        </form>
                    </Card>
                )}

                {userGroups.length === 0 ? (
                    <Text>You haven't created or joined any groups yet.</Text>
                ) : (
                    <div className="space-y-4">
                        {userGroups.map((group, index) => (
                            <Card key={index} className="cursor-pointer hover:bg-gray-50">
                                <Flex justifyContent="between" alignItems="center">
                                    <div>
                                        <Title>{group.name}</Title>
                                        <Text className="mt-1">Members: {group.memberCount}</Text>
                                        <Text>Created: {new Date(group.creationDate).toLocaleDateString()}</Text>
                                    </div>
                                    <div className="space-x-2">
                                        <Badge color={group.isActive ? 'green' : 'red'}>
                                            {group.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedGroup(group.groupAddress);
                                                loadGroupDetails(group.groupAddress);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Flex>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>

            {/* Group Details Modal */}
            {selectedGroup && groupDetails && (
                <Card className="mb-6">
                    <Flex justifyContent="between" alignItems="center" className="mb-4">
                        <Title>Group Details</Title>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSelectedGroup(null);
                                setGroupDetails(null);
                            }}
                        >
                            Close
                        </Button>
                    </Flex>

                    <Grid numItems={2} className="gap-6">
                        <Card>
                            <Title>Configuration</Title>
                            <div className="mt-4 space-y-2">
                                <Text><strong>Name:</strong> {groupDetails.config.name}</Text>
                                <Text><strong>Description:</strong> {groupDetails.config.description}</Text>
                                <Text><strong>Contribution:</strong> {groupDetails.config.contributionAmount} ETH</Text>
                                <Text><strong>Frequency:</strong> {Math.round(groupDetails.config.contributionFrequency / (24 * 60 * 60))} days</Text>
                                <Text><strong>Max Members:</strong> {groupDetails.config.maxMembers}</Text>
                                <Text><strong>Late Fee:</strong> {groupDetails.config.lateFeePercentage}%</Text>
                            </div>
                        </Card>

                        <Card>
                            <Title>Statistics</Title>
                            <div className="mt-4 space-y-2">
                                <Text><strong>Current Members:</strong> {groupDetails.stats.memberCount}</Text>
                                <Text><strong>Current Cycle:</strong> {groupDetails.stats.currentCycle}</Text>
                                <Text><strong>Total Contributions:</strong> {groupDetails.stats.totalContributions} ETH</Text>
                                <Text><strong>Total Payouts:</strong> {groupDetails.stats.totalPayouts} ETH</Text>
                                <Text><strong>Contract Balance:</strong> {groupDetails.stats.contractBalance} ETH</Text>
                            </div>
                            
                            <div className="mt-4">
                                <Button
                                    onClick={() => handleMakeContribution(selectedGroup)}
                                    loading={loading}
                                    className="w-full"
                                >
                                    Make Contribution
                                </Button>
                            </div>
                        </Card>
                    </Grid>

                    {/* Members List */}
                    <Card className="mt-4">
                        <Title>Members</Title>
                        <div className="mt-4 space-y-2">
                            {groupDetails.members.map((member, index) => (
                                <Flex key={index} justifyContent="between" alignItems="center" className="p-2 bg-gray-50 rounded">
                                    <div>
                                        <Text><strong>{member.name}</strong></Text>
                                        <Text className="text-sm text-gray-600">
                                            {member.memberAddress.slice(0, 6)}...{member.memberAddress.slice(-4)}
                                        </Text>
                                    </div>
                                    <div className="text-right">
                                        <Text>Contributions: {member.contributionsMade}</Text>
                                        <Text>Score: {member.performanceScore}%</Text>
                                        <Badge color={member.isActive ? 'green' : 'red'}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </Flex>
                            ))}
                        </div>
                    </Card>
                </Card>
            )}

            {/* Active Groups (Public) */}
            <Card>
                <Title>Active Groups</Title>
                <Text className="mb-4">Discover and join existing Chama groups</Text>
                
                {activeGroups.length === 0 ? (
                    <Text>No active groups found.</Text>
                ) : (
                    <div className="space-y-4">
                        {activeGroups.map((group, index) => (
                            <Card key={index} className="bg-gray-50">
                                <Flex justifyContent="between" alignItems="center">
                                    <div>
                                        <Title>{group.name}</Title>
                                        <Text>Members: {group.memberCount}</Text>
                                        <Text>Created by: {group.creator.slice(0, 6)}...{group.creator.slice(-4)}</Text>
                                        <Text>Created: {group.creationDate.toLocaleDateString()}</Text>
                                    </div>
                                    <div className="space-x-2">
                                        <Badge color="blue">Public</Badge>
                                        <Button
                                            size="sm"
                                            onClick={() => handleJoinGroup(group.groupAddress)}
                                        >
                                            Request to Join
                                        </Button>
                                    </div>
                                </Flex>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SmartContractDashboard;
