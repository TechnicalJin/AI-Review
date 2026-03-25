/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">User Profile</h1>
        </div>

        {/* Profile Card */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : user ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
              Profile Information
            </h2>

            <div className="space-y-4">
              {/* Username */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md motion-normal">
                <i className="fas fa-user text-indigo-600 dark:text-indigo-400 mr-4 text-xl w-6"></i>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block text-sm">
                    Username
                  </span>
                  <span className="text-gray-900 dark:text-white text-lg">{user.username}</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md motion-normal">
                <i className="fas fa-envelope text-indigo-600 dark:text-indigo-400 mr-4 text-xl w-6"></i>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block text-sm">
                    Email
                  </span>
                  <span className="text-gray-900 dark:text-white text-lg">{user.email}</span>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md motion-normal">
                <i className="fas fa-mobile-alt text-indigo-600 dark:text-indigo-400 mr-4 text-xl w-6"></i>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block text-sm">
                    Mobile
                  </span>
                  <span className="text-gray-900 dark:text-white text-lg">{user.mobile}</span>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md motion-normal">
                <i className="fas fa-user-tag text-indigo-600 dark:text-indigo-400 mr-4 text-xl w-6"></i>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block text-sm">
                    Role
                  </span>
                  <span className="text-gray-900 dark:text-white text-lg">
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-semibold">
                      {user.role}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 btn-group">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 btn btn-lg btn-primary"
              >
                <i className="fas fa-arrow-left"></i>
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <i className="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              User details not available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't load your profile information
            </p>
            <button
              onClick={() => navigate('/user/home')}
              className="btn btn-md btn-primary"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;