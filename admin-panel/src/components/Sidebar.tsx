import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Smartphone, 
  LogOut,
  Shield
} from 'lucide-react';
import { authService } from '../services/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: '/users',
      label: 'Users',
      icon: Users
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: CreditCard
    },
    {
      path: '/device-requests',
      label: 'Device Requests',
      icon: Smartphone
    }
  ];

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-dark-800 border-r border-dark-700 
        transform transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center space-x-3 p-6 border-b border-dark-700">
          <div className="h-10 w-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-dark-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Shibau Admin</h1>
            <p className="text-dark-300 text-sm">Control Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-400 border border-primary-500/30' 
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="border-t border-dark-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-dark-900 font-semibold text-sm">A</span>
            </div>
            <div>
              <p className="text-white font-medium">Admin User</p>
              <p className="text-dark-400 text-xs">Administrator</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-dark-300 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;