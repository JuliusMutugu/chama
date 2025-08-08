import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge, Grid, Button, Flex } from '@tremor/react';
import { UserCog, Eye, Edit, Trash2, Shield, Plus } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Mock data - replace with actual API call
    setUsers([
      {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        full_name: 'John Doe',
        role: 'member',
        status: 'active',
        kyc_verified: true,
        last_login: '2024-01-07',
        groups: 3
      },
      {
        id: 2,
        username: 'jane_manager',
        email: 'jane@example.com',
        full_name: 'Jane Smith',
        role: 'group_manager',
        status: 'active',
        kyc_verified: true,
        last_login: '2024-01-08',
        groups: 5
      },
      {
        id: 3,
        username: 'bob_treasurer',
        email: 'bob@example.com',
        full_name: 'Bob Johnson',
        role: 'treasurer',
        status: 'active',
        kyc_verified: false,
        last_login: '2024-01-06',
        groups: 0
      },
    ]);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'group_manager': return 'blue';
      case 'treasurer': return 'green';
      case 'auditor': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'red';
      case 'pending_verification': return 'yellow';
      default: return 'gray';
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // API call to update user role
      console.log(`Updating user ${userId} role to ${newRole}`);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const RoleModal = () => {
    if (!showRoleModal || !selectedUser) return null;

    const roles = [
      { value: 'member', label: 'Member', description: 'Regular group member' },
      { value: 'group_manager', label: 'Group Manager', description: 'Can create and manage groups' },
      { value: 'treasurer', label: 'Treasurer', description: 'Financial management access' },
      { value: 'auditor', label: 'Auditor', description: 'Read-only access for auditing' },
      { value: 'admin', label: 'Admin', description: 'Full system access' },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-w-md">
          <Title className="text-lg font-semibold mb-4">
            Change Role for {selectedUser.full_name}
          </Title>
          
          <div className="space-y-3 mb-6">
            {roles.map((role) => (
              <div
                key={role.value}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedUser.role === role.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleRoleChange(selectedUser.id, role.value)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <Text className="font-medium">{role.label}</Text>
                    <Text className="text-sm text-gray-600">{role.description}</Text>
                  </div>
                  <Badge color={getRoleColor(role.value)} size="sm">
                    {role.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowRoleModal(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title className="text-3xl font-bold text-gray-900">User Management</Title>
            <Text className="text-gray-600 mt-1">
              Manage user roles and permissions
            </Text>
          </div>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        {/* User Statistics */}
        <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
          <Card className="p-6">
            <Flex alignItems="start">
              <div>
                <Text className="text-gray-600">Total Users</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {users.length}
                </Text>
              </div>
              <UserCog className="w-8 h-8 text-blue-500" />
            </Flex>
          </Card>

          <Card className="p-6">
            <Flex alignItems="start">
              <div>
                <Text className="text-gray-600">Active Users</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </Text>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </Flex>
          </Card>

          <Card className="p-6">
            <Flex alignItems="start">
              <div>
                <Text className="text-gray-600">Group Managers</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'group_manager').length}
                </Text>
              </div>
              <UserCog className="w-8 h-8 text-blue-500" />
            </Flex>
          </Card>

          <Card className="p-6">
            <Flex alignItems="start">
              <div>
                <Text className="text-gray-600">KYC Verified</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.kyc_verified).length}
                </Text>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </Flex>
          </Card>
        </Grid>

        {/* Users Table */}
        <Card className="p-6">
          <Title className="text-lg font-semibold mb-4">All Users</Title>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groups
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Text className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {user.email}
                        </Text>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge color={getRoleColor(user.role)} size="sm">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Badge color={getStatusColor(user.status)} size="sm">
                          {user.status}
                        </Badge>
                        {user.kyc_verified && (
                          <Shield className="w-4 h-4 text-green-500" title="KYC Verified" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Text className="text-sm text-gray-900">
                        {user.groups}
                      </Text>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Text className="text-sm text-gray-500">
                        {user.last_login}
                      </Text>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          variant="light" 
                          size="xs"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit Role
                        </Button>
                        <Button variant="light" size="xs">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <RoleModal />
    </div>
  );
};

export default UserManagement;
