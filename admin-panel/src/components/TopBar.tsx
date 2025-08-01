import React from 'react';
import { Menu, Bell, RefreshCw } from 'lucide-react';

interface TopBarProps {
  onToggleSidebar: () => void;
  title: string;
  onRefresh?: () => void;
  loading?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ 
  onToggleSidebar, 
  title, 
  onRefresh, 
  loading 
}) => {
  return (
    <header className="bg-dark-800 border-b border-dark-700 px-4 py-4 flex items-center justify-between">
      {/* Left side - Menu button and title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-dark-300 hover:text-white p-2 rounded-lg hover:bg-dark-700 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="text-dark-400 text-sm">Admin Panel</p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-3">
        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent-500 rounded-full"></span>
        </button>

        {/* Status indicator */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-dark-700 rounded-lg">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-dark-200 text-sm">System Online</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;