import React, { useState, useEffect } from 'react';
import { Users, Wallet, TrendingUp, PiggyBank, ArrowRight } from 'lucide-react';
import { Grid, Card, Title, Tab, TabList } from '@tremor/react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/dashboard/StatsCard';
import ContributionChart from '../components/dashboard/ContributionChart';
import NextPayoutCard from '../components/dashboard/NextPayoutCard';
import GroupsTable from '../components/dashboard/GroupsTable';
import PayoutDistributionChart from '../components/dashboard/PayoutDistributionChart';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [stats, setStats] = useState({
    totalContributions: 0,
    activeGroups: 0,
    totalMembers: 0,
    nextPayout: null
  });
  const [contributionData, setContributionData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [payoutDistribution, setPayoutDistribution] = useState([]);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setStats({
      totalContributions: 150000,
      activeGroups: 3,
      totalMembers: 15,
      profitRate: 12
    });

    setContributionData([
      { date: '2025-01', amount: 10000 },
      { date: '2025-02', amount: 25000 },
      { date: '2025-03', amount: 45000 },
      { date: '2025-04', amount: 70000 },
      { date: '2025-05', amount: 100000 },
      { date: '2025-06', amount: 150000 },
    ]);

    setGroups([
      {
        id: 1,
        name: 'Tech Innovators Chama',
        memberCount: 5,
        contribution: 10000,
        nextPayout: '2025-08-01',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Women Entrepreneurs',
        memberCount: 8,
        contribution: 15000,
        nextPayout: '2025-07-15',
        status: 'Active'
      },
      {
        id: 3,
        name: 'Community Growth Fund',
        memberCount: 12,
        contribution: 5000,
        nextPayout: '2025-07-30',
        status: 'Pending'
      },
    ]);

    setPayoutDistribution([
      { status: 'Received', amount: 90000 },
      { status: 'Pending', amount: 30000 },
      { status: 'Future', amount: 180000 },
    ]);
  }, []);

  const nextPayout = {
    member: 'Jane Doe',
    date: '2025-07-15',
    amount: 135000,
    daysRemaining: 7
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your savings groups.</p>
        </div>
        <Link
          to="/groups/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Group
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>

      <div className="mb-6">
        <TabList
          defaultValue={activeView}
          onValueChange={setActiveView}
          className="mt-2"
        >
          <Tab value="overview" text="Overview" />
          <Tab value="analytics" text="Analytics" />
        </TabList>
      </div>

      {activeView === 'overview' ? (
        <>
          <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
            <StatsCard
              title="Total Contributions"
              value={`KES ${stats.totalContributions.toLocaleString()}`}
              icon={PiggyBank}
            />
            <StatsCard
              title="Active Groups"
              value={stats.activeGroups}
              icon={Users}
            />
            <StatsCard
              title="Total Members"
              value={stats.totalMembers}
              icon={Users}
            />
            <StatsCard
              title="Average Profit Rate"
              value={`${stats.profitRate}%`}
              icon={TrendingUp}
              trend={2.5}
            />
          </Grid>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <GroupsTable groups={groups} />
            </div>
            <div>
              <NextPayoutCard nextPayout={nextPayout} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Card className="p-4">
                <Title>Contribution Trends</Title>
                <ContributionChart data={contributionData} />
              </Card>
            </div>
            <div>
              <Card className="p-4">
                <Title>Payout Distribution</Title>
                <PayoutDistributionChart data={payoutDistribution} />
              </Card>
            </div>
          </div>

          <Card className="p-4">
            <Title>Group Performance Analysis</Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-800">Most Active Group</h4>
                <p className="text-lg font-semibold text-green-900 mt-1">Tech Innovators Chama</p>
                <p className="text-sm text-green-700 mt-1">100% contribution rate</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800">Highest Return Rate</h4>
                <p className="text-lg font-semibold text-blue-900 mt-1">Women Entrepreneurs</p>
                <p className="text-sm text-blue-700 mt-1">15% average returns</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-800">Largest Pool</h4>
                <p className="text-lg font-semibold text-purple-900 mt-1">Community Growth Fund</p>
                <p className="text-sm text-purple-700 mt-1">KES 450,000 total</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
