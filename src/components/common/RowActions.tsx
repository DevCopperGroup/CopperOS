import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';

export interface RowAction {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface RowActionsProps {
  actions: RowAction[];
  align?: 'left' | 'right';
}

/**
 * Menu de ações por linha de tabela (Editar / Excluir / ações do módulo).
 * Fecha ao clicar fora ou pressionar ESC.
 */
export const RowActions: React.FC<RowActionsProps> = ({ actions, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Mais ações"
        title="Mais ações"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-night-800 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-30 mt-1 w-44 py-1 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                role="menuitem"
                type="button"
                disabled={action.disabled}
                onClick={() => {
                  setIsOpen(false);
                  action.onClick();
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  action.variant === 'danger'
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-night-850'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RowActions;
