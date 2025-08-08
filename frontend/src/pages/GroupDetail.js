import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Tab, TabList, TabGroup, Grid } from '@tremor/react';
import { Users, Settings, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import ContributionChart from '../components/dashboard/ContributionChart';
import PayoutDistributionChart from '../components/dashboard/PayoutDistributionChart';
import StatsCard from '../components/dashboard/StatsCard';

const GroupDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributionData, setContributionData] = useState([]);
  const [payoutDistribution, setPayoutDistribution] = useState([]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        // TODO: Replace with actual API call
        // Simulated API response
        const mockGroup = {
          id,
          name: 'Tech Innovators Chama',
          description: 'A savings group for tech professionals',
          status: 'Active',
          memberCount: 8,
          frequency: 'Monthly',
          contribution: 15000,
          totalContributed: 450000,
          nextPayout: {
            date: '2024-07-15',
            amount: 135000,
            member: 'Jane Doe'
          },
          members: [
            { id: 1, name: 'John Doe', role: 'Admin', status: 'Active', contributionsMade: 6, totalContributed: 90000 },
            { id: 2, name: 'Jane Doe', role: 'Member', status: 'Active', contributionsMade: 6, totalContributed: 90000 },
            // Add more members...
          ]
        };

        setGroup(mockGroup);
        
        setContributionData([
          { date: '2024-01', amount: 120000 },
          { date: '2024-02', amount: 240000 },
          { date: '2024-03', amount: 360000 },
          { date: '2024-04', amount: 450000 }
        ]);

        setPayoutDistribution([
          { status: 'Received', amount: 270000 },
          { status: 'Pending', amount: 135000 },
          { status: 'Future', amount: 405000 }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching group details:', error);
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id]);

  const handleRemoveMember = async (memberId) => {
    // TODO: Implement remove member functionality
    console.log('Removing member:', memberId);
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    // TODO: Implement settings update functionality
    console.log('Updating settings...');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading group details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600 mt-1">{group.description}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          group.status === 'Active' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {group.status}
        </span>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <TabGroup>
          <TabList
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="mt-6"
          >
            <Tab value="overview" text="Overview" icon={BarChart3} />
            <Tab value="members" text="Members" icon={Users} />
            <Tab value="settings" text="Settings" icon={Settings} />
          </TabList>
        </TabGroup>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
            <StatsCard
              title="Total Contributed"
              value={`KES ${group.totalContributed.toLocaleString()}`}
              description="Across all members"
            />
            <StatsCard
              title="Member Count"
              value={group.memberCount}
              description="Active participants"
            />
            <StatsCard
              title="Monthly Contribution"
              value={`KES ${group.contribution.toLocaleString()}`}
              description={`Due every ${group.frequency.toLowerCase()}`}
            />
            <StatsCard
              title="Next Payout"
              value={`KES ${group.nextPayout.amount.toLocaleString()}`}
              description={`To ${group.nextPayout.member} on ${format(new Date(group.nextPayout.date), 'MMM d, yyyy')}`}
            />
          </Grid>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ContributionChart data={contributionData} />
            </div>
            <div>
              <PayoutDistributionChart data={payoutDistribution} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Members</h3>
            <button className="btn-primary text-sm">
              Invite Member
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {group.members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{member.role}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.contributionsMade} payments
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      KES {member.totalContributed.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Group Settings</h3>
          <form onSubmit={handleUpdateSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                defaultValue={group.name}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                defaultValue={group.description}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Contribution Amount (KES)</label>
              <input
                type="number"
                defaultValue={group.contribution}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Contribution Frequency</label>
              <select
                defaultValue={group.frequency}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default GroupDetail;
