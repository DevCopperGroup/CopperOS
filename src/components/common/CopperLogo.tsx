import React from 'react';

interface CopperLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const CopperLogo: React.FC<CopperLogoProps> = ({ 
  size = 'md',
  showSubtitle = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Exact CopperOS Geometric Icon */}
      <div className="relative mb-2">
        <svg 
          viewBox="0 0 54 54" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className={iconSizes[size]}
        >
          {/* Rounded Square */}
          <rect 
            x="8" 
            y="12" 
            width="32" 
            height="32" 
            rx="7" 
            stroke="#10B981" 
            strokeWidth="3.5" 
          />
          {/* Top-Right Orbit Dot */}
          <circle 
            cx="44" 
            cy="10" 
            r="3.5" 
            fill="#10B981" 
          />
        </svg>
      </div>

      {/* Brand Name */}
      <span className={`font-semibold tracking-tight text-gray-900 dark:text-white ${textSizes[size]}`}>
        CopperOS
      </span>

      {/* Optional Corporate Tagline */}
      {showSubtitle && (
        <span className="text-micro font-mono uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 mt-1">
          SISTEMA OPERACIONAL CORPORATIVO
        </span>
      )}
    </div>
  );
};
