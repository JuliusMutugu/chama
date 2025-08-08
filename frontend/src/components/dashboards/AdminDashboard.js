import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge, Grid, Flex, Button, Metric, ProgressBar } from '@tremor/react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Settings, 
  UserCog,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isConnected, account } = useWeb3();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeGroups: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    systemHealth: 95
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch admin statistics
    fetchAdminStats();
    fetchRecentActivity();
  }, []);

  const fetchAdminStats = async () => {
    // Mock data - replace with actual API calls
    setStats({
      totalUsers: 1250,
      activeGroups: 85,
      totalRevenue: 125000,
      pendingVerifications: 23,
      systemHealth: 95
    });
  };

  const fetchRecentActivity = async () => {
    // Mock data - replace with actual API calls
    setRecentActivity([
      { id: 1, action: 'New user registration', user: 'John Doe', time: '2 minutes ago', type: 'user' },
      { id: 2, action: 'Group created', user: 'Jane Smith', time: '15 minutes ago', type: 'group' },
      { id: 3, action: 'Payment processed', user: 'Bob Johnson', time: '1 hour ago', type: 'payment' },
      { id: 4, action: 'KYC verification pending', user: 'Alice Brown', time: '2 hours ago', type: 'verification' },
    ]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'group': return <Users className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'verification': return <Shield className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return 'blue';
      case 'group': return 'green';
      case 'payment': return 'yellow';
      case 'verification': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title className="text-3xl font-bold text-gray-900">Admin Dashboard</Title>
          <Text className="text-gray-600 mt-1">
            Welcome back, {user?.full_name || user?.username}
          </Text>
        </div>
        <div className="flex items-center space-x-4">
          <Badge color={isConnected ? 'green' : 'red'} size="lg">
            {isConnected ? 'Blockchain Connected' : 'Blockchain Disconnected'}
          </Badge>
          <Button variant="secondary" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Total Users</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </Metric>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-green-600">+12% from last month</Text>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Active Groups</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {stats.activeGroups}
              </Metric>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-green-600">+8% from last month</Text>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Platform Revenue</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                ${stats.totalRevenue.toLocaleString()}
              </Metric>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-green-600">+15% from last month</Text>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Pending Verifications</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                {stats.pendingVerifications}
              </Metric>
            </div>
            <Shield className="w-8 h-8 text-orange-500" />
          </Flex>
          <Flex className="mt-4">
            <Button variant="light" size="xs">
              Review Now
            </Button>
          </Flex>
        </Card>
      </Grid>

      {/* System Health & Recent Activity */}
      <Grid numItemsMd={1} numItemsLg={2} className="gap-6">
        {/* System Health */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">System Health</Title>
          <div className="space-y-4">
            <div>
              <Flex>
                <Text>Overall Health</Text>
                <Text className="font-medium">{stats.systemHealth}%</Text>
              </Flex>
              <ProgressBar value={stats.systemHealth} color="green" className="mt-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <Text className="text-sm font-medium">API Status</Text>
                  <Text className="text-xs text-gray-500">Operational</Text>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <Text className="text-sm font-medium">Database</Text>
                  <Text className="text-xs text-gray-500">Operational</Text>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <Text className="text-sm font-medium">Blockchain</Text>
                  <Text className="text-xs text-gray-500">Connected</Text>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <Text className="text-sm font-medium">Backups</Text>
                  <Text className="text-xs text-gray-500">Scheduled</Text>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">Recent Activity</Title>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Badge color={getActivityColor(activity.type)} size="sm">
                  {getActivityIcon(activity.type)}
                </Badge>
                <div className="flex-1 min-w-0">
                  <Text className="text-sm font-medium text-gray-900 truncate">
                    {activity.action}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {activity.user} • {activity.time}
                  </Text>
                </div>
              </div>
            ))}
          </div>
          <Button variant="light" className="w-full mt-4">
            View All Activity
          </Button>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Card className="p-6">
        <Title className="text-lg font-semibold mb-4">Quick Actions</Title>
        <Grid numItemsMd={2} numItemsLg={4} className="gap-4">
          <Button variant="secondary" className="h-16">
            <UserCog className="w-5 h-5 mr-2" />
            Manage Users
          </Button>
          <Button variant="secondary" className="h-16">
            <BarChart3 className="w-5 h-5 mr-2" />
            View Analytics
          </Button>
          <Button variant="secondary" className="h-16">
            <Shield className="w-5 h-5 mr-2" />
            Review KYC
          </Button>
          <Button variant="secondary" className="h-16">
            <Settings className="w-5 h-5 mr-2" />
            System Config
          </Button>
        </Grid>
      </Card>
    </div>
  );
};

export default AdminDashboard;
