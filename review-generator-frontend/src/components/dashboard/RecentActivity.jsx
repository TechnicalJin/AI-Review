import React from 'react';
import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';

const getTimeAgo = (dateString) => {
  try {
    const date = DateTime.fromISO(dateString, { zone: 'Asia/Kolkata' });
    const now = DateTime.now().setZone('Asia/Kolkata');
    const diffInSeconds = Math.floor(now.diff(date, 'seconds').seconds);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' min ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' hours ago';
    if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 86400) + ' days ago';
    return Math.floor(diffInSeconds / 2592000) + ' months ago';
  } catch {
    return 'Recently';
  }
};

const RecentActivity = ({ activities, emptyText = 'No recent activity' }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5 animate-slide-up">
        <h3 className="text-lg font-semibold mb-5 dark:text-white">Recent Activity</h3>
        <div className="space-y-4">
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">{emptyText}</p>
        </div>
        <div className="mt-6 text-center">
          <Link to="/client/history" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            <span>View All History</span>
            <i className="fas fa-arrow-right ml-2 text-sm"></i>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5 animate-slide-up">
      <h3 className="text-lg font-semibold mb-5 dark:text-white">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const isRegenerated = 
            (activity.regenerated && 
            (activity.regenerated.toLowerCase() === 'yes' || 
             activity.regenerated.toLowerCase() === 'true' || 
             activity.regenerated === true));
          
          const icon = isRegenerated ? 'fa-redo text-amber-500' : 'fa-plus text-green-500';
          const timeAgo = getTimeAgo(activity.timestamp);

          return (
            <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <i className={`fas ${icon} text-sm`}></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium dark:text-gray-200">
                  {isRegenerated ? 'Regenerated' : 'Generated'} {activity.reviewLength || 'medium'} review
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {activity.companyName 
                  ? activity.companyName.substring(0, 10) + (activity.companyName.length > 10 ? '...' : '') 
                  : ''}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-center">
        <Link to="/client/history" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
          <span>View All History</span>
          <i className="fas fa-arrow-right ml-2 text-sm"></i>
        </Link>
      </div>
    </div>
  );
};

export default RecentActivity;
