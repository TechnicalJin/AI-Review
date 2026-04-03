import React from 'react';

const Header = ({ 
  client, 
  isDark, 
  toggleTheme, 
  onProfileClick, 
  onMenuClick 
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="md:hidden text-gray-500 dark:text-gray-300 mr-3"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div>
            <h2 className="text-xl font-bold dark:text-white">Analytics Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Welcome back, <span className="font-semibold">{client?.name || 'Client'}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? (
              <i className="fas fa-sun text-yellow-400"></i>
            ) : (
              <i className="fas fa-moon text-gray-500"></i>
            )}
          </button>
          
          {/* Profile Button */}
          <button 
            onClick={onProfileClick}
            className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
              <span className="text-white font-semibold">
                {client?.name ? client.name.substring(0, 1).toUpperCase() : 'C'}
              </span>
            </div>
            <span className="hidden md:inline font-medium dark:text-white">{client?.name || 'Client'}</span>
            <i className="fas fa-chevron-down text-sm dark:text-gray-400"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
