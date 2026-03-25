import React from 'react';

const StatCard = ({ icon, label, value, color = 'indigo', trend, className = '' }) => {
  // Map existing color names to design-system semantic statuses.
  const colorConfig = {
    indigo: {
      light: {
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        trendBg: 'bg-primary-100',
        trendColor: 'text-primary-600',
        accent: 'border-primary-100',
      },
      dark: {
        iconBg: 'dark:bg-primary-600/20',
        iconColor: 'dark:text-primary-400',
        trendBg: 'dark:bg-primary-600/20',
        trendColor: 'dark:text-primary-400',
        accent: 'dark:border-primary-600/30',
      },
    },
    emerald: {
      light: {
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        trendBg: 'bg-emerald-100',
        trendColor: 'text-emerald-600',
        accent: 'border-emerald-200',
      },
      dark: {
        iconBg: 'dark:bg-emerald-500/20',
        iconColor: 'dark:text-emerald-500',
        trendBg: 'dark:bg-emerald-500/20',
        trendColor: 'dark:text-emerald-500',
        accent: 'dark:border-emerald-500/30',
      },
    },
    amber: {
      light: {
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        trendBg: 'bg-amber-100',
        trendColor: 'text-amber-600',
        accent: 'border-amber-200',
      },
      dark: {
        iconBg: 'dark:bg-amber-500/20',
        iconColor: 'dark:text-amber-500',
        trendBg: 'dark:bg-amber-500/20',
        trendColor: 'dark:text-amber-500',
        accent: 'dark:border-amber-500/30',
      },
    },
    purple: {
      light: {
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        trendBg: 'bg-purple-100',
        trendColor: 'text-purple-600',
        accent: 'border-purple-200',
      },
      dark: {
        iconBg: 'dark:bg-purple-500/20',
        iconColor: 'dark:text-purple-400',
        trendBg: 'dark:bg-purple-500/20',
        trendColor: 'dark:text-purple-400',
        accent: 'dark:border-purple-500/30',
      },
    },
  };

  const c = colorConfig[color] || colorConfig.indigo;

  return (
    <div
      className={`
        card card-hover p-5
        border ${c.light.accent} ${c.dark.accent}
        shadow-sm hover:shadow-lg
        motion-slow
        hover:-translate-y-1
        group
        ${className}
      `}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div
          className={`
            w-12 h-12 rounded-xl
            ${c.light.iconBg} ${c.dark.iconBg}
            flex items-center justify-center
            motion-slow
            group-hover:scale-110
          `}
        >
          <i className={`${icon} text-lg ${c.light.iconColor} ${c.dark.iconColor}`}></i>
        </div>

        {/* Trend Badge */}
        {trend && (
          <span
            className={`
              text-xs font-semibold
              ${c.light.trendColor} ${c.dark.trendColor}
              ${c.light.trendBg} ${c.dark.trendBg}
              px-2 py-1 rounded-full
              flex items-center gap-1
            `}
          >
            <i className="fas fa-arrow-up text-xs"></i>
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tabular-nums">
        {value}
      </p>

      {/* Label */}
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {label}
      </p>
    </div>
  );
};

export default StatCard;

