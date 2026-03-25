import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const getHomePath = () => {
    if (!isAuthenticated || !user) return '/login';
    return user.role === 'CLIENT' ? '/client/home' : '/user/home';
  };

  const getHomeLabel = () => {
    if (!isAuthenticated || !user) return 'Go to Login';
    return user.role === 'CLIENT' ? 'Go to Client Home' : 'Go to User Home';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse">
            404
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Suggested Links */}
        <div className="btn-group justify-center mb-8">
          <button
            onClick={() => navigate(getHomePath())}
            className="btn btn-lg btn-primary"
          >
            <i className="fas fa-home"></i>
            {getHomeLabel()}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-lg btn-secondary"
          >
            <i className="fas fa-arrow-left"></i>
            Go Back
          </button>
        </div>

        {/* Illustration */}
        <div className="mt-12">
          <i className="fas fa-search text-9xl text-gray-300 dark:text-gray-600 opacity-50"></i>
        </div>
      </div>
    </div>
  );
};

export default NotFound;