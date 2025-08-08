import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  User, 
  Settings, 
  UserCog, 
  BarChart, 
  FileText, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Eye 
} from 'lucide-react';

const RoleBasedNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'My Groups', path: '/groups', icon: Users },
      { name: 'Profile', path: '/profile', icon: User },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'User Management', path: '/admin/users', icon: UserCog },
          { name: 'System Analytics', path: '/admin/analytics', icon: BarChart },
          { name: 'Settings', path: '/admin/settings', icon: Settings },
          { name: 'Audit Logs', path: '/admin/audit', icon: FileText },
        ];

      case 'group_manager':
        return [
          ...baseItems,
          { name: 'Create Group', path: '/groups/create', icon: Plus },
          { name: 'Group Analytics', path: '/analytics', icon: TrendingUp },
        ];

      case 'treasurer':
        return [
          ...baseItems,
          { name: 'Financial Reports', path: '/reports', icon: DollarSign },
          { name: 'Transactions', path: '/transactions', icon: CreditCard },
        ];

      case 'auditor':
        return [
          ...baseItems,
          { name: 'All Groups', path: '/audit/groups', icon: Eye },
          { name: 'Reports', path: '/audit/reports', icon: FileText },
        ];

      default: // member
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 py-4 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive(item.path)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
