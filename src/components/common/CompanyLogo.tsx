import React from 'react';

interface CompanyLogoProps {
  companyId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ 
  companyId, 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // 1. AF Locações Logo
  if (companyId === 'emp-af-locacoes' || companyId.includes('af-locacoes')) {
    return (
      <div className={`flex items-center justify-center p-1 bg-white rounded-xl ${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Top Blue Bar */}
          <rect x="54" y="24" width="46" height="11" rx="5" fill="#1B6CA8" />
          {/* Middle Blue Bar */}
          <rect x="64" y="44" width="30" height="10" rx="5" fill="#1B6CA8" />
          {/* Bottom Left Blue Bar */}
          <rect x="18" y="63" width="30" height="10" rx="4" transform="skewX(-24)" fill="#1B6CA8" />
          
          {/* Central Copper / Bronze 'A' Glyph with Gradient */}
          <defs>
            <linearGradient id="afCopperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97736" />
              <stop offset="50%" stopColor="#B85D26" />
              <stop offset="100%" stopColor="#8C3B14" />
            </linearGradient>
          </defs>
          
          <path 
            d="M50 24L18 73H34L44 57L54 73H70L50 24ZM48 42L44 48L40 42H48Z" 
            fill="url(#afCopperGrad)" 
          />
          
          {/* Text: LOCAÇÕES */}
          <text x="60" y="87" textAnchor="middle" fill="#B85D26" fontSize="9" fontWeight="800" letterSpacing="3.5" fontFamily="sans-serif">
            LOCAÇÕES
          </text>
        </svg>
      </div>
    );
  }

  // 2. DCOPPER - Fios e Cabos Elétricos Logo
  if (companyId === 'emp-dcopper' || companyId.includes('dcopper')) {
    return (
      <div className={`flex items-center justify-center p-1 bg-white rounded-xl ${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Upper Green Swoosh / Cable */}
          <path d="M15 36C40 24 90 23 110 32" stroke="#00875A" strokeWidth="3.5" strokeLinecap="round" />
          {/* Exposed Copper Wire Strand Tip */}
          <circle cx="16" cy="36" r="2" fill="#E08A4E" />
          <circle cx="13" cy="38" r="1.5" fill="#D97736" />
          
          {/* Bold DCOPPER Text */}
          <text x="14" y="52" fill="#00875A" fontSize="20" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
            D
          </text>
          <text x="31" y="52" fill="#1C3F60" fontSize="20" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
            COPPER
          </text>

          {/* Bottom Blue Cable with Connector */}
          <path d="M70 57C95 62 125 61 148 53" stroke="#1C3F60" strokeWidth="3" strokeLinecap="round" />
          <rect x="135" y="50" width="7" height="4" rx="1" fill="#1C3F60" transform="rotate(-15 135 50)" />

          {/* Subtitle */}
          <text x="76" y="65" textAnchor="middle" fill="#6B7280" fontSize="5.5" fontWeight="600" letterSpacing="1.8" fontFamily="sans-serif">
            FIOS E CABOS ELÉTRICOS
          </text>
        </svg>
      </div>
    );
  }

  // 3. Sallve Ambiental Logo
  if (companyId === 'emp-sallve' || companyId.includes('sallve')) {
    return (
      <div className={`flex items-center justify-center p-1 bg-white rounded-xl ${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Tree of Life Circle Border */}
          <circle cx="60" cy="40" r="26" stroke="#2D5A3F" strokeWidth="2.5" />
          
          {/* Tree Trunk & Roots */}
          <path d="M60 48V32M60 48C56 54 48 58 42 60M60 48C64 54 72 58 78 60M60 40C52 36 46 42 42 46M60 40C68 36 74 42 78 46" stroke="#2D5A3F" strokeWidth="2" strokeLinecap="round" />
          
          {/* Tree Canopy Foliage Leaves */}
          <circle cx="60" cy="23" r="3.5" fill="#2D5A3F" />
          <circle cx="52" cy="26" r="3" fill="#2D5A3F" />
          <circle cx="68" cy="26" r="3" fill="#2D5A3F" />
          <circle cx="45" cy="32" r="3" fill="#2D5A3F" />
          <circle cx="75" cy="32" r="3" fill="#2D5A3F" />
          <circle cx="55" cy="35" r="2.5" fill="#2D5A3F" />
          <circle cx="65" cy="35" r="2.5" fill="#2D5A3F" />
          <circle cx="50" cy="20" r="2" fill="#2D5A3F" />
          <circle cx="70" cy="20" r="2" fill="#2D5A3F" />

          {/* Sallve Wordmark */}
          <text x="60" y="86" textAnchor="middle" fill="#2D5A3F" fontSize="20" fontWeight="900" fontFamily="serif" letterSpacing="0.5">
            Sallve
          </text>
          
          {/* AMBIENTAL subtitle */}
          <text x="60" y="98" textAnchor="middle" fill="#4B6B56" fontSize="6.5" fontWeight="700" letterSpacing="3" fontFamily="sans-serif">
            AMBIENTAL
          </text>
        </svg>
      </div>
    );
  }

  // 4. Copper Group (Official Logo)
  return (
    <div className={`flex items-center justify-center p-1 bg-white rounded-xl ${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Rounded Square in Green */}
        <rect x="36" y="24" width="40" height="40" rx="8" stroke="#34684A" strokeWidth="4.5" />
        {/* Orbit Dot in Gray */}
        <circle cx="82" cy="22" r="4.5" fill="#6B7280" />

        {/* Wordmark: COPPER GROUP */}
        <text x="60" y="85" textAnchor="middle" fill="#34684A" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
          COPPER <tspan fill="#6B7280" fontWeight="400">GROUP</tspan>
        </text>

        {/* Tagline */}
        <text x="60" y="96" textAnchor="middle" fill="#6B7280" fontSize="5" fontWeight="500" letterSpacing="0.5" fontFamily="sans-serif">
          Sustentabilidade que move o mundo.
        </text>
      </svg>
    </div>
  );
};
