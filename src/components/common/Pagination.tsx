import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

/**
 * Janela de páginas visíveis com elipses. Ex: 1 ... 4 5 6 ... 20
 */
const buildPageWindow = (page: number, totalPages: number): (number | 'gap')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push('gap');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push('gap');
  pages.push(totalPages);

  return pages;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalItems,
  itemLabel,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-4 border-t border-gray-100 dark:border-night-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
      <div>
        Mostrando {firstItem} a {lastItem} de {totalItems} {itemLabel}
      </div>

      <div className="flex items-center gap-1.5 font-medium">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
          title="Página anterior"
          className="p-1 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {buildPageWindow(currentPage, totalPages).map((entry, index) =>
          entry === 'gap' ? (
            <span key={`gap-${index}`}>...</span>
          ) : (
            <button
              key={entry}
              onClick={() => onPageChange(entry)}
              aria-current={entry === currentPage ? 'page' : undefined}
              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                entry === currentPage
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 font-bold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {entry}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Próxima página"
          title="Próxima página"
          className="p-1 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
