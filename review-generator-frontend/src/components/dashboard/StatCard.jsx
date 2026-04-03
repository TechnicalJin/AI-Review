import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  changePercent, 
  icon, 
  isPrimary = false,
  children,
  showProgressBar = false,
  progressPercent = 50
}) => {
  const isPositiveChange = changePercent >= 0;

  return (
    <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-5 animate-fade-in">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
          
          {showProgressBar ? (
            <div className="mt-2">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">{progressPercent}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center mt-2">
              <span className={`flex items-center text-sm ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                <i className={`fas fa-arrow-${isPositiveChange ? 'up' : 'down'} mr-1`}></i>
                <span>{Math.abs(changePercent)}%</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">vs {children}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isPrimary 
            ? 'bg-indigo-100 dark:bg-indigo-900/30' 
            : icon?.bg
        }`}>
          <i className={`${icon?.class} text-xl ${icon?.color}`}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
