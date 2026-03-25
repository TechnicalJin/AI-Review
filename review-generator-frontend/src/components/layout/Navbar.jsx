import React from 'react';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = ({
  onMobileMenuClick,
  user,
  title = 'Client Dashboard',
  subtitle,
}) => {
  return (
    <header className="
      bg-white/80 dark:bg-slate-800/90
      backdrop-blur-xl
      border-b border-slate-200 dark:border-slate-700/50
      sticky top-0 z-30
      motion-slow
    ">
      <div className="flex justify-between items-center px-4 lg:px-8 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuClick}
            className="
              p-2.5 rounded-xl
              hover:bg-slate-100 dark:hover:bg-slate-700
              motion-fast lg:hidden
            "
            aria-label="Open menu"
          >
            <i className="fas fa-bars text-slate-600 dark:text-slate-300"></i>
          </button>

          {/* Page Title */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-500 dark:text-slate-400 text-sm hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section - Theme Toggle & Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle size="md" />

          {/* Profile */}
          <div className="
            flex items-center gap-3
            cursor-pointer
            hover:bg-slate-100 dark:hover:bg-slate-700
            rounded-xl px-3 py-2
            motion-fast
          ">
            {/* Avatar */}
            <div className="
              w-10 h-10 rounded-xl
              bg-gradient-to-br from-indigo-500 to-purple-600
              flex items-center justify-center
              text-white font-bold text-sm
              shadow-lg shadow-indigo-500/25
            ">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* User Info (hidden on mobile) */}
            <div className="hidden md:block">
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {user?.username || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrator
              </p>
            </div>

            {/* Dropdown indicator */}
            <i className="fas fa-chevron-down text-xs text-slate-400 hidden md:block"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
