import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, TabList, Tab, TabGroup } from '@tremor/react';
import { Users, ArrowUpRight, Calendar, Search, Filter, Plus } from 'lucide-react';

const GroupCard = ({ group }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
      </div>
      <Badge
        color={group.status === 'Active' ? 'green' : 'yellow'}
        className="ml-2"
      >
        {group.status}
      </Badge>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">{group.memberCount} members</span>
      </div>
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">{group.frequency}</span>
      </div>
    </div>

    <div className="border-t pt-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Monthly Contribution</p>
          <p className="text-lg font-semibold text-gray-900">KES {group.contribution.toLocaleString()}</p>
        </div>
        <Link
          to={`/groups/${group.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          View Details
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  </Card>
);

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchGroups = async () => {
      try {
        // Simulated API response
        const mockGroups = [
          {
            id: 1,
            name: 'Tech Innovators Chama',
            description: 'A savings group for tech professionals',
            status: 'Active',
            memberCount: 8,
            frequency: 'Monthly',
            contribution: 15000,
            totalSaved: 450000,
            nextPayout: '2025-07-15'
          },
          {
            id: 2,
            name: 'Women Entrepreneurs',
            description: 'Supporting women in business',
            status: 'Active',
            memberCount: 12,
            frequency: 'Monthly',
            contribution: 10000,
            totalSaved: 360000,
            nextPayout: '2025-07-30'
          },
          {
            id: 3,
            name: 'Community Growth Fund',
            description: 'Local community development initiative',
            status: 'Pending',
            memberCount: 15,
            frequency: 'Monthly',
            contribution: 5000,
            totalSaved: 225000,
            nextPayout: '2025-08-15'
          },
        ];

        setGroups(mockGroups);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const filteredGroups = groups
    .filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(group => {
      if (filter === 'all') return true;
      if (filter === 'active') return group.status === 'Active';
      if (filter === 'pending') return group.status === 'Pending';
      return true;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-600 mt-1">Browse and manage your savings groups</p>
        </div>
        <Link
          to="/groups/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Group
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Groups</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <TabGroup>
              <TabList
                defaultValue={view}
                onValueChange={setView}
                className="border border-gray-300 rounded-lg"
              >
                <Tab value="grid" text="Grid" />
                <Tab value="list" text="List" />
              </TabList>
            </TabGroup>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading groups...</p>
        </div>
      ) : (
        <>
          {filteredGroups.length > 0 ? (
            view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <Card>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Saved</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGroups.map(group => (
                      <tr key={group.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{group.name}</div>
                            <div className="text-sm text-gray-500">{group.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {group.memberCount} members
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          KES {group.contribution.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          KES {group.totalSaved.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            color={group.status === 'Active' ? 'green' : 'yellow'}
                          >
                            {group.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            to={`/groups/${group.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-lg mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? "No groups match your search criteria. Try a different search term."
                    : "Create your first savings group to get started!"}
                </p>
                <Link
                  to="/groups/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Group
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Groups;
