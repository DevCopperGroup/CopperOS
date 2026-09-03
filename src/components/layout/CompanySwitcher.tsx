import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Search, Grid } from 'lucide-react';
import { useCopperOS } from '../../context/CopperOSContext';

export const CompanySwitcher: React.FC = () => {
  const { companies, currentCompany, setCurrentCompanyId } = useCopperOS();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.tradeName.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj.includes(search) ||
    c.legalName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (companyId: string) => {
    setCurrentCompanyId(companyId);
    navigate(`/companies/${companyId}`);
    setIsOpen(false);
  };

  const handleGoToHub = () => {
    navigate('/hub');
    setIsOpen(false);
  };

  if (!currentCompany) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-night-850 border border-gray-200/90 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs transition-all text-left group cursor-pointer"
        title="Trocar de empresa (Company Switcher)"
      >
        {currentCompany.logoUrl ? (
          <div className="w-7 h-7 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/25 p-1 flex items-center justify-center flex-shrink-0">
            <img src={currentCompany.logoUrl} alt={currentCompany.tradeName} className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-xs flex-shrink-0">
            {currentCompany.monogram || currentCompany.tradeName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="leading-tight">
          <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 dark:group-hover:text-emerald-400 transition-colors">
            {currentCompany.tradeName}
          </div>
          <div className="text-micro text-gray-600 dark:text-gray-400 font-mono">
            {currentCompany.cnpj}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-transform duration-200 ml-1.5 ${isOpen ? 'rotate-180 text-brand-700 dark:text-brand-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3 border-b border-gray-100 dark:border-night-800 bg-gray-50/60 dark:bg-night-850">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-between">
              <span>Alternar Empresa</span>
              <span className="text-brand-700 dark:text-brand-400 font-semibold">{companies.length} empresas</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-600 dark:text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por nome ou CNPJ..."
                className="w-full bg-white dark:bg-night-950 border border-gray-200 dark:border-night-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-sans"
                autoFocus
              />
            </div>
          </div>

          {/* Company List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
            {filteredCompanies.map(c => {
              const isSelected = c.id === currentCompany.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-gray-900 dark:text-white' 
                      : 'hover:bg-gray-50 dark:hover:bg-night-850 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {c.logoUrl ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/25 p-1 flex items-center justify-center flex-shrink-0">
                        <img src={c.logoUrl} alt={c.tradeName} className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-xs flex-shrink-0">
                        {c.monogram || c.tradeName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {c.tradeName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {c.sector} • <span className="font-mono">{c.cnpj}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-700 dark:text-brand-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}

            {filteredCompanies.length === 0 && (
              <div className="text-center py-4 text-xs text-gray-600 dark:text-gray-400">
                Nenhuma empresa encontrada
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-2 border-t border-gray-100 dark:border-night-800 bg-gray-50/80 dark:bg-night-850">
            <button
              onClick={handleGoToHub}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-night-950 text-xs text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-400 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Gerenciar todas as empresas (Hub)</span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">/hub</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
