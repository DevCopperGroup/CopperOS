import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'copper' | 'warning' | 'danger' | 'success';
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'copper',
  icon,
  trend,
  trendPositive = true,
}) => {
  const badgeClasses = {
    default: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    copper: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
    warning: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
    danger: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/60',
    success: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
  };

  return (
    <div className="bg-white dark:bg-night-900 border border-gray-200/80 dark:border-night-800 rounded-xl p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {icon && (
          <div className="text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {value}
        </div>
        {badgeText && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${badgeClasses[badgeVariant]}`}>
            {badgeText}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-night-800">
          <span>{subtitle}</span>
          {trend && (
            <span className={trendPositive ? 'text-brand-700 dark:text-brand-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
