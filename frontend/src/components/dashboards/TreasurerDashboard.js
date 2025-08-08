import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge, Grid, Flex, Button, Metric, AreaChart, DonutChart } from '@tremor/react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle,
  Download,
  Eye,
  Calculator,
  PieChart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';

const TreasurerDashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useWeb3();
  const [financialData, setFinancialData] = useState({
    totalContributions: 0,
    totalPayouts: 0,
    pendingPayments: 0,
    platformFees: 0,
    monthlyGrowth: 0
  });

  const [chartData, setChartData] = useState([]);
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);

  useEffect(() => {
    fetchFinancialData();
    fetchChartData();
    fetchOutstandingPayments();
    fetchRevenueBreakdown();
  }, []);

  const fetchFinancialData = async () => {
    // Mock data - replace with actual API calls
    setFinancialData({
      totalContributions: 185000,
      totalPayouts: 166500,
      pendingPayments: 12500,
      platformFees: 18500,
      monthlyGrowth: 12.5
    });
  };

  const fetchChartData = async () => {
    // Mock chart data
    setChartData([
      { month: 'Jan', contributions: 12000, payouts: 10800 },
      { month: 'Feb', contributions: 15000, payouts: 13500 },
      { month: 'Mar', contributions: 18000, payouts: 16200 },
      { month: 'Apr', contributions: 22000, payouts: 19800 },
      { month: 'May', contributions: 25000, payouts: 22500 },
      { month: 'Jun', contributions: 28000, payouts: 25200 },
    ]);
  };

  const fetchOutstandingPayments = async () => {
    setOutstandingPayments([
      { id: 1, group: 'Tech Professionals Chama', amount: 5000, daysOverdue: 2, member: 'John Doe' },
      { id: 2, group: 'Women Entrepreneurs', amount: 3500, daysOverdue: 5, member: 'Jane Smith' },
      { id: 3, group: 'Young Professionals', amount: 2000, daysOverdue: 1, member: 'Bob Wilson' },
      { id: 4, group: 'Small Business Owners', amount: 2000, daysOverdue: 3, member: 'Alice Brown' },
    ]);
  };

  const fetchRevenueBreakdown = async () => {
    setRevenueBreakdown([
      { name: 'Platform Fees', value: 18500, color: 'blue' },
      { name: 'Late Fees', value: 2500, color: 'orange' },
      { name: 'Premium Features', value: 3500, color: 'green' },
      { name: 'Other', value: 1000, color: 'gray' },
    ]);
  };

  const getOverdueColor = (days) => {
    if (days <= 2) return 'yellow';
    if (days <= 5) return 'orange';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title className="text-3xl font-bold text-gray-900">Treasurer Dashboard</Title>
          <Text className="text-gray-600 mt-1">
            Financial overview and transaction management
          </Text>
        </div>
        <div className="flex items-center space-x-4">
          <Badge color={isConnected ? 'green' : 'red'} size="lg">
            {isConnected ? 'Blockchain Connected' : 'Blockchain Disconnected'}
          </Badge>
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Total Contributions</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                ${financialData.totalContributions.toLocaleString()}
              </Metric>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-green-600">+{financialData.monthlyGrowth}% this month</Text>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Total Payouts</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                ${financialData.totalPayouts.toLocaleString()}
              </Metric>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-blue-600">90% of contributions</Text>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Pending Payments</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                ${financialData.pendingPayments.toLocaleString()}
              </Metric>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </Flex>
          <Flex className="mt-4">
            <Button variant="light" size="xs">
              <Eye className="w-3 h-3 mr-1" />
              Review
            </Button>
          </Flex>
        </Card>

        <Card className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-600">Platform Fees</Text>
              <Metric className="text-2xl font-bold text-gray-900">
                ${financialData.platformFees.toLocaleString()}
              </Metric>
            </div>
            <Calculator className="w-8 h-8 text-purple-500" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-gray-600">10% fee structure</Text>
          </Flex>
        </Card>
      </Grid>

      {/* Charts */}
      <Grid numItemsMd={1} numItemsLg={2} className="gap-6">
        {/* Financial Trends */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">Financial Trends</Title>
          <AreaChart
            className="h-72"
            data={chartData}
            index="month"
            categories={["contributions", "payouts"]}
            colors={["green", "blue"]}
            valueFormatter={(number) => `$${number.toLocaleString()}`}
          />
        </Card>

        {/* Revenue Breakdown */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">Revenue Breakdown</Title>
          <DonutChart
            className="h-72"
            data={revenueBreakdown}
            category="value"
            index="name"
            valueFormatter={(number) => `$${number.toLocaleString()}`}
            colors={["blue", "orange", "green", "gray"]}
          />
        </Card>
      </Grid>

      {/* Outstanding Payments */}
      <Card className="p-6">
        <Flex className="mb-4">
          <Title className="text-lg font-semibold">Outstanding Payments</Title>
          <Badge color="orange">{outstandingPayments.length} pending</Badge>
        </Flex>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {outstandingPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Text className="text-sm font-medium text-gray-900">
                      {payment.group}
                    </Text>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Text className="text-sm text-gray-600">
                      {payment.member}
                    </Text>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Text className="text-sm font-medium text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </Text>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={getOverdueColor(payment.daysOverdue)}>
                      {payment.daysOverdue} days
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button variant="light" size="xs">
                        Send Reminder
                      </Button>
                      <Button variant="light" size="xs">
                        View Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Financial Actions */}
      <Card className="p-6">
        <Title className="text-lg font-semibold mb-4">Quick Actions</Title>
        <Grid numItemsMd={2} numItemsLg={4} className="gap-4">
          <Button variant="secondary" className="h-16">
            <CreditCard className="w-5 h-5 mr-2" />
            Process Payouts
          </Button>
          <Button variant="secondary" className="h-16">
            <Download className="w-5 h-5 mr-2" />
            Generate Report
          </Button>
          <Button variant="secondary" className="h-16">
            <PieChart className="w-5 h-5 mr-2" />
            View Analytics
          </Button>
          <Button variant="secondary" className="h-16">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Review Alerts
          </Button>
        </Grid>
      </Card>
    </div>
  );
};

export default TreasurerDashboard;
