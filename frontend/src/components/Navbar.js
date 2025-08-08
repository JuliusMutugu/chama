import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Wallet, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    if (isConnected) {
      disconnectWallet();
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-2 text-xl font-bold gradient-text">Chama</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/groups" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Groups
                </Link>
                <Link to="/groups/create" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Create Group
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </a>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Wallet Connection */}
                {isConnected ? (
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Wallet size={16} />
                    <span>{formatAddress(account)}</span>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="flex items-center space-x-2 bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    <Wallet size={16} />
                    <span>Connect Wallet</span>
                  </button>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <User size={20} />
                    <span className="text-sm">{user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 ml-4"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link to="/groups" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Groups
                  </Link>
                  <Link to="/groups/create" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Create Group
                  </Link>
                  <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Profile
                  </Link>
                  
                  {/* Mobile wallet connection */}
                  <div className="px-3 py-2">
                    {isConnected ? (
                      <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <Wallet size={16} />
                        <span>{formatAddress(account)}</span>
                      </div>
                    ) : (
                      <button
                        onClick={connectWallet}
                        className="flex items-center space-x-2 bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-full text-sm w-full justify-center"
                      >
                        <Wallet size={16} />
                        <span>Connect Wallet</span>
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Home
                  </Link>
                  <Link to="/login" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-blue-600 hover:text-blue-800">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
