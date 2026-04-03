import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, client, onLogout }) => {
  const navItems = [
    { icon: 'fas fa-chart-pie', label: 'Dashboard', href: '/client/home', active: true },
    { icon: 'fas fa-user', label: 'Profile', onClick: 'profile' },
    { icon: 'fas fa-history', label: 'Log History', href: '/client/history' },
    { icon: 'fas fa-comment-alt', label: 'Chat Tag', href: '/client/chatText' },
    { icon: 'fas fa-eye', label: 'View Page', href: client?.generateLink || '#', external: true },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar bg-gray-900 text-white w-64 flex-shrink-0 hidden md:flex flex-col
          fixed md:relative h-screen z-50 ml-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:!translate-x-0 md:!block
        `}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <img
              src={client?.logo ? `/uploads/${client.logo}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSIyMCIgZmlsbD0iIzYzNjZmMSIvPjwvc3ZnPg=='}
              className="w-10 h-10 rounded-full object-cover"
              alt="Company Logo"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSIyMCIgZmlsbD0iIzYzNjZmMSIvPjwvc3ZnPg==';
              }}
            />
            <div>
              <h1 className="text-xl font-bold">{client?.name || 'Company'}</h1>
              <p className="text-gray-400 text-sm">Analytics Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul>
            {navItems.map((item, index) => (
              <li key={index} className="mb-2">
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 text-gray-400 hover:bg-gray-800 rounded-lg hover:text-white transition-colors"
                  >
                    <i className={`${item.icon} mr-3`}></i>
                    <span>{item.label}</span>
                  </a>
                ) : item.onClick === 'profile' ? (
                  <button
                    onClick={onClose}
                    className="w-full flex items-center p-3 text-gray-400 hover:bg-gray-800 rounded-lg hover:text-white transition-colors text-left"
                  >
                    <i className={`${item.icon} mr-3`}></i>
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                    onClick={onClose}
                  >
                    <i className={`${item.icon} mr-3`}></i>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
            <li className="mb-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center p-3 text-gray-400 hover:bg-red-600 rounded-lg hover:text-white transition-colors text-left"
              >
                <i className="fas fa-sign-out-alt mr-3"></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
