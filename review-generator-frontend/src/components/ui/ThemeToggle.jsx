import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ size = 'md', showLabel = false, className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative ${sizes[size]} rounded-xl
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        motion-slow ease-out
        flex items-center justify-center
        group overflow-hidden
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun Icon */}
      <i
        className={`
          fas fa-sun ${iconSizes[size]} absolute
          motion-slow ease-out
          ${isDark
            ? 'text-warning rotate-0 scale-100 opacity-100'
            : 'text-warning -rotate-90 scale-0 opacity-0'
          }
        `}
      />

      {/* Moon Icon */}
      <i
        className={`
          fas fa-moon ${iconSizes[size]} absolute
          motion-slow ease-out
          ${isDark
            ? 'text-slate-400 rotate-90 scale-0 opacity-0'
            : 'text-primary-600 rotate-0 scale-100 opacity-100'
          }
        `}
      />

      {showLabel && (
        <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;

