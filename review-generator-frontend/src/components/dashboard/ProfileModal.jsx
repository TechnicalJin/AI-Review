import React from 'react';

const ProfileModal = ({ isOpen, onClose, client }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-lg relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Client Profile</h2>
        
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <i className="fas fa-user text-gray-500 dark:text-gray-400 mr-3"></i>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Username:</span>
              <span className="ml-2 dark:text-white" id="clientUsername">{client?.name || '-'}</span>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <i className="fas fa-building text-gray-500 dark:text-gray-400 mr-3"></i>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Company:</span>
              <span className="ml-2 dark:text-white">{client?.name || '-'}</span>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <i className="fas fa-envelope text-gray-500 dark:text-gray-400 mr-3"></i>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
              <span className="ml-2 dark:text-white">{client?.email || '-'}</span>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <i className="fas fa-phone text-gray-500 dark:text-gray-400 mr-3"></i>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Mobile:</span>
              <span className="ml-2 dark:text-white">{client?.mobile || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
