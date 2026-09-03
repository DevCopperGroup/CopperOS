import React from 'react';
import { CompanyStatus } from '../../types';

interface StatusDotProps {
  status: CompanyStatus | 'CRITICAL' | 'WARNING' | 'INFO' | 'ACTIVE' | 'PENDING' | 'INACTIVE';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulse?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({ 
  status, 
  size = 'md', 
  showLabel = false,
  pulse = true 
}) => {
  let colorClass = 'bg-emerald-500';
  let glowClass = 'shadow-[0_0_8px_rgba(16,185,129,0.7)]';
  let label = 'Operacional';

  switch (status) {
    case 'OPERATIONAL':
    case 'ACTIVE':
      colorClass = 'bg-emerald-500';
      glowClass = 'shadow-[0_0_8px_rgba(16,185,129,0.7)]';
      label = status === 'OPERATIONAL' ? 'Operacional' : 'Ativo';
      break;
    case 'WARNING':
    case 'PENDING':
      colorClass = 'bg-amber-500';
      glowClass = 'shadow-[0_0_8px_rgba(245,158,11,0.7)]';
      label = status === 'WARNING' ? 'Atenção' : 'Pendente';
      break;
    case 'CRITICAL':
      colorClass = 'bg-red-500';
      glowClass = 'shadow-[0_0_8px_rgba(239,68,68,0.7)]';
      label = 'Crítico';
      break;
    case 'MAINTENANCE':
    case 'INFO':
      colorClass = 'bg-sky-500';
      glowClass = 'shadow-[0_0_8px_rgba(14,165,233,0.7)]';
      label = 'Manutenção';
      break;
    case 'INACTIVE':
    default:
      colorClass = 'bg-zinc-600';
      glowClass = '';
      label = 'Inativo';
      break;
  }

  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2 items-center justify-center">
        {pulse && (status === 'OPERATIONAL' || status === 'WARNING' || status === 'CRITICAL') && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`} />
        )}
        <span className={`relative inline-flex rounded-full ${sizeClasses[size]} ${colorClass} ${glowClass}`} />
      </span>
      {showLabel && (
        <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-300">
          {label}
        </span>
      )}
    </span>
  );
};
