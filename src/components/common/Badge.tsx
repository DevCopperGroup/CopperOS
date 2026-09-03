import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'copper' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-md tracking-wide transition-colors';
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-normal',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200/80',
    copper: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    outline: 'bg-transparent text-gray-600 border border-gray-300',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
