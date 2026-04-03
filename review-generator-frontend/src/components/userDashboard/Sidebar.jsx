import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiPlusCircle, FiHome, FiUser, FiClock, FiLogOut, FiX } from 'react-icons/fi';

const Sidebar = ({ isMobileOpen, onMobileClose, onLogout, user }) => {
  const location = useLocation();

  const navItems = [
    { to: '/user/home', label: 'Dashboard', icon: <FiHome className="text-lg" /> },
    { to: '/user/create', label: 'Add Client', icon: <FiPlusCircle className="text-lg" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={[
          'fixed left-0 top-0 z-50 h-full w-64 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl',
          'transition-transform duration-300 md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="border-b border-slate-700 px-6 py-8">
          <h3 className="flex items-center text-2xl font-bold tracking-wide text-white">
            <span className="mr-2 text-yellow-400">★</span>
            ReviewGen
          </h3>
          <p className="mt-1 text-sm text-slate-400">Admin Panel</p>
        </div>

        <nav className="py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onMobileClose}
                  className={[
                    'group flex items-center rounded-lg px-4 py-3 transition-all duration-300',
                    isActive(item.to)
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                  ].join(' ')}
                >
                  <span className="mr-3 transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 space-y-2 border-t border-slate-700 p-4">
          <Link
            to="/user/profile"
            onClick={onMobileClose}
            className="group flex items-center rounded-lg px-4 py-3 text-slate-300 transition-all duration-300 hover:bg-slate-700 hover:text-white"
          >
            <FiUser className="mr-3 text-lg transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium">Profile</span>
          </Link>

          <Link
            to="/user/log"
            onClick={onMobileClose}
            className="group flex items-center rounded-lg px-4 py-3 text-slate-300 transition-all duration-300 hover:bg-slate-700 hover:text-white"
          >
            <FiClock className="mr-3 text-lg transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium">Log History</span>
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center rounded-lg px-4 py-3 text-red-300 transition-all duration-300 hover:bg-red-600 hover:text-white"
          >
            <FiLogOut className="mr-3 text-lg transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onMobileClose}
          className="absolute right-3 top-3 rounded-md p-1 text-slate-300 hover:bg-slate-700 md:hidden"
          aria-label="Close menu"
        >
          <FiX className="text-lg" />
        </button>

        <span className="sr-only">{user?.username || 'User sidebar'}</span>
      </aside>
    </>
  );
};

export default Sidebar;
