import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({
  isOpen,
  isMobileOpen,
  onToggle,
  onMobileClose,
  onLogout,
  user,
}) => {
  const location = useLocation();

  const navItems = [
    { icon: 'fas fa-th-large', label: 'Dashboard', href: '/user/home' },
    { icon: 'fas fa-user-plus', label: 'Create Client', href: '/user/create' },
    { icon: 'fas fa-clock-rotate-left', label: 'Log History', href: '/user/log' },
    { icon: 'fas fa-user-circle', label: 'Profile', href: '/user/profile' },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isOpen ? 'w-72' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          text-white flex flex-col
          motion-slow ease-out
          fixed h-full z-50 lg:relative
          border-r border-slate-700/50
          shadow-xl
        `}
      >
        {/* Logo Section */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <i className="fas fa-star text-white text-sm"></i>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">ReviewGen</h1>
                  <span className="text-xs text-slate-400">Admin Panel</span>
                </div>
              </div>
            )}

            {/* Desktop Toggle */}
            <button
              onClick={onToggle}
              className="p-2.5 hover:bg-slate-700/50 rounded-xl motion-fast hidden lg:flex items-center justify-center"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <i className={`fas fa-${isOpen ? 'chevron-left' : 'chevron-right'} text-slate-400 text-sm motion-fast`}></i>
            </button>

            {/* Mobile Close */}
            <button
              onClick={onMobileClose}
              className="p-2.5 hover:bg-slate-700/50 rounded-xl motion-fast lg:hidden"
              aria-label="Close sidebar"
            >
              <i className="fas fa-times text-slate-400"></i>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
              isOpen={isOpen}
              onClick={onMobileClose}
            />
          ))}
        </nav>

        {/* Footer - Logout Only (Theme toggle moved to navbar) */}
        <div className="p-4 border-t border-slate-700/50">
          {/* User Info (when expanded) */}
          {isOpen && user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl bg-slate-800/50">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{user?.username || 'Admin'}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3
              hover:bg-red-500/10 rounded-xl
              motion-normal
              text-slate-300 hover:text-red-400
              group
              ${!isOpen ? 'justify-center' : ''}
            `}
          >
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              bg-slate-700/50 group-hover:bg-red-500/20
              motion-fast
            `}>
              <i className="fas fa-sign-out-alt text-sm"></i>
            </div>
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

// Navigation Link Component
const NavLink = ({ icon, label, href, active, isOpen, onClick }) => (
  <Link
    to={href}
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-xl
      motion-normal group relative
      ${active
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
      }
      ${!isOpen ? 'justify-center' : ''}
    `}
  >
    {/* Active Indicator */}
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-4 lg:hidden" />
    )}

    <div className={`
      w-8 h-8 rounded-lg flex items-center justify-center
      motion-fast
      ${active
        ? 'bg-white/20'
        : 'bg-slate-700/50 group-hover:bg-slate-600/50'
      }
    `}>
      <i className={`${icon} text-sm`}></i>
    </div>

    {isOpen && (
      <span className="text-sm font-medium">{label}</span>
    )}

    {/* Tooltip for collapsed state */}
    {!isOpen && (
      <div className="
        absolute left-full ml-3 px-3 py-2
        bg-slate-800 text-white text-sm font-medium
        rounded-lg shadow-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        motion-normal
        whitespace-nowrap z-50
        pointer-events-none
      ">
        {label}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45" />
      </div>
    )}
  </Link>
);

export default Sidebar;

