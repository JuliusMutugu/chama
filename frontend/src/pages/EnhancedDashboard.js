import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Title, Text, Badge, Grid, Flex, Button, Metric } from '@tremor/react';
import { AreaChart } from '@tremor/react';
import { Users, DollarSign, Calendar, Bell } from 'lucide-react';
import Web3Status from '../components/Web3Status';

// Import role-specific dashboards
import AdminDashboard from '../components/dashboards/AdminDashboard';
import TreasurerDashboard from '../components/dashboards/TreasurerDashboard';
import GroupManagerDashboard from '../components/dashboards/GroupManagerDashboard';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [memberStats, setMemberStats] = useState({
    totalGroups: 0,
    totalContributions: 0,
    nextPayout: null,
    upcomingPayments: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [contributionData, setContributionData] = useState([]);

  useEffect(() => {
    fetchMemberStats();
    fetchRecentActivity();
    fetchContributionData();
  }, []);

  const fetchMemberStats = async () => {
    // Mock data - replace with actual API calls
    setMemberStats({
      totalGroups: 3,
      totalContributions: 15000,
      nextPayout: '2024-02-15',
      upcomingPayments: 2
    });
  };

  const fetchRecentActivity = async () => {
    setRecentActivity([
      { id: 1, action: 'Contribution made', group: 'Tech Professionals', amount: 1000, date: '2 hours ago' },
      { id: 2, action: 'Cycle completed', group: 'Young Entrepreneurs', amount: 12000, date: '1 day ago' },
      { id: 3, action: 'Joined group', group: 'Women in Business', amount: null, date: '3 days ago' },
    ]);
  };

  const fetchContributionData = async () => {
    setContributionData([
      { month: 'Jan', contributions: 2000 },
      { month: 'Feb', contributions: 2500 },
      { month: 'Mar', contributions: 3000 },
      { month: 'Apr', contributions: 2800 },
      { month: 'May', contributions: 3200 },
      { month: 'Jun', contributions: 3500 },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <Title className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name || user?.username}!
          </Title>
          <Text className="text-gray-600 mt-1">
            Here's your chama activity overview
          </Text>
        </div>
        <Badge color="blue" size="lg">
          Member
        </Badge>
      </div>

      {/* Web3 Status */}
      <Web3Status />

      {/* Member Stats */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">My Groups</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {memberStats.totalGroups}
              </Metric>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Total Contributions</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                ${memberStats.totalContributions.toLocaleString()}
              </Metric>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Next Payout</Text>
              <Metric className="text-lg font-bold text-gray-900">
                {memberStats.nextPayout || 'Not scheduled'}
              </Metric>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Upcoming Payments</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {memberStats.upcomingPayments}
              </Metric>
            </div>
            <Bell className="w-8 h-8 text-orange-500" />
          </Flex>
        </Card>
      </Grid>

      <Grid numItemsMd={1} numItemsLg={2} className="gap-6">
        {/* Contribution Trends */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">My Contribution Trends</Title>
          <AreaChart
            className="h-72"
            data={contributionData}
            index="month"
            categories={["contributions"]}
            colors={["blue"]}
            valueFormatter={(number) => `$${number.toLocaleString()}`}
          />
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">Recent Activity</Title>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Text className="font-medium">{activity.action}</Text>
                  <Text className="text-sm text-gray-600">{activity.group}</Text>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <Text className="font-medium">${activity.amount.toLocaleString()}</Text>
                  )}
                  <Text className="text-xs text-gray-500">{activity.date}</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </div>
  );
};

const EnhancedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Text>Loading...</Text>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'treasurer':
        return <TreasurerDashboard />;
      case 'group_manager':
        return <GroupManagerDashboard />;
      case 'auditor':
        // For now, auditors see the same as members with read-only access
        return <MemberDashboard />;
      case 'member':
      default:
        return <MemberDashboard />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderDashboard()}
    </div>
  );
};

export default EnhancedDashboard;
