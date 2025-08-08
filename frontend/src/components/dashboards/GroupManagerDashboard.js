import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge, Grid, Flex, Button, Metric, BarChart, LineChart } from '@tremor/react';
import { 
  Users, 
  TrendingUp, 
  Plus, 
  Target,
  Star,
  Activity,
  UserPlus,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';

const GroupManagerDashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useWeb3();
  const [managerStats, setManagerStats] = useState({
    totalGroups: 0,
    totalMembers: 0,
    activeGroups: 0,
    completedCycles: 0,
    avgGroupSize: 0,
    successRate: 0
  });

  const [groupPerformance, setGroupPerformance] = useState([]);
  const [memberEngagement, setMemberEngagement] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    fetchManagerStats();
    fetchGroupPerformance();
    fetchMemberEngagement();
    fetchMyGroups();
  }, []);

  const fetchManagerStats = async () => {
    // Mock data - replace with actual API calls
    setManagerStats({
      totalGroups: 12,
      totalMembers: 156,
      activeGroups: 10,
      completedCycles: 45,
      avgGroupSize: 13,
      successRate: 94.5
    });
  };

  const fetchGroupPerformance = async () => {
    setGroupPerformance([
      { group: 'Tech Professionals', members: 15, cycles: 8, success: 96 },
      { group: 'Women Entrepreneurs', members: 12, cycles: 6, success: 92 },
      { group: 'Young Professionals', members: 18, cycles: 10, success: 98 },
      { group: 'Small Business', members: 10, cycles: 4, success: 88 },
      { group: 'Creative Minds', members: 14, cycles: 7, success: 94 },
    ]);
  };

  const fetchMemberEngagement = async () => {
    setMemberEngagement([
      { month: 'Jan', engagement: 85, retention: 92 },
      { month: 'Feb', engagement: 88, retention: 94 },
      { month: 'Mar', engagement: 92, retention: 96 },
      { month: 'Apr', engagement: 89, retention: 93 },
      { month: 'May', engagement: 94, retention: 97 },
      { month: 'Jun', engagement: 96, retention: 98 },
    ]);
  };

  const fetchMyGroups = async () => {
    setMyGroups([
      {
        id: 1,
        name: 'Tech Professionals Chama',
        members: 15,
        nextPayout: '2024-01-15',
        status: 'active',
        performance: 96
      },
      {
        id: 2,
        name: 'Women Entrepreneurs',
        members: 12,
        nextPayout: '2024-01-18',
        status: 'active',
        performance: 92
      },
      {
        id: 3,
        name: 'Young Professionals',
        members: 18,
        nextPayout: '2024-01-20',
        status: 'active',
        performance: 98
      },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 95) return 'green';
    if (performance >= 85) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title className="text-3xl font-bold text-gray-900">Group Manager Dashboard</Title>
          <Text className="text-gray-600 mt-1">
            Manage and monitor your groups' performance
          </Text>
        </div>
        <div className="flex items-center space-x-4">
          <Badge color={isConnected ? 'green' : 'red'} size="lg">
            {isConnected ? 'Blockchain Connected' : 'Blockchain Disconnected'}
          </Badge>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create New Group
          </Button>
        </div>
      </div>

      {/* Manager Statistics */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Total Groups</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {managerStats.totalGroups}
              </Metric>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-green-600">{managerStats.activeGroups} active</Text>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Total Members</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {managerStats.totalMembers}
              </Metric>
            </div>
            <UserPlus className="w-8 h-8 text-green-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-blue-600">Avg {managerStats.avgGroupSize} per group</Text>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Completed Cycles</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {managerStats.completedCycles}
              </Metric>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-green-600">+8 this month</Text>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Success Rate</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {managerStats.successRate}%
              </Metric>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-green-600">Above average</Text>
          </Flex>
        </Card>
      </Grid>

      {/* Charts */}
      <Grid numItemsMd={1} numItemsLg={2} className="gap-6">
        {/* Group Performance */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">Group Performance</Title>
          <BarChart
            className="h-72"
            data={groupPerformance}
            index="group"
            categories={["success"]}
            colors={["green"]}
            valueFormatter={(number) => `${number}%`}
          />
        </Card>

        {/* Member Engagement Trends */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">Member Engagement Trends</Title>
          <LineChart
            className="h-72"
            data={memberEngagement}
            index="month"
            categories={["engagement", "retention"]}
            colors={["blue", "green"]}
            valueFormatter={(number) => `${number}%`}
          />
        </Card>
      </Grid>

      {/* My Groups */}
      <Card className="p-6">
        <Flex className="mb-4">
          <Title className="text-lg font-semibold">My Groups</Title>
          <Badge color="blue">{myGroups.length} groups</Badge>
        </Flex>
        
        <div className="grid gap-4">
          {myGroups.map((group) => (
            <div key={group.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <Flex>
                <div className="flex-1">
                  <Flex>
                    <Title className="text-base">{group.name}</Title>
                    <Badge color={getStatusColor(group.status)} size="sm">
                      {group.status}
                    </Badge>
                  </Flex>
                  <Text className="text-sm text-gray-600 mt-1">
                    {group.members} members • Next payout: {group.nextPayout}
                  </Text>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Text className="text-sm text-gray-600">Performance</Text>
                    <Badge color={getPerformanceColor(group.performance)} size="sm">
                      {group.performance}%
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="light" size="xs">
                      <Activity className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button variant="light" size="xs">
                      <Settings className="w-3 h-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </Flex>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <Title className="text-lg font-semibold mb-4">Quick Actions</Title>
        <Grid numItemsMd={2} numItemsLg={4} className="gap-4">
          <Button variant="secondary" className="h-16">
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </Button>
          <Button variant="secondary" className="h-16">
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Members
          </Button>
          <Button variant="secondary" className="h-16">
            <TrendingUp className="w-5 h-5 mr-2" />
            View Analytics
          </Button>
          <Button variant="secondary" className="h-16">
            <Settings className="w-5 h-5 mr-2" />
            Group Settings
          </Button>
        </Grid>
      </Card>
    </div>
  );
};

export default GroupManagerDashboard;
