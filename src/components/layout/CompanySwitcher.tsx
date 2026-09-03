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
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1A14] border border-gray-200/90 dark:border-[#16291E] hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs transition-all text-left group cursor-pointer"
        title="Trocar de empresa (Company Switcher)"
      >
        {currentCompany.logoUrl ? (
          <div className="w-7 h-7 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/25 p-1 flex items-center justify-center flex-shrink-0">
            <img src={currentCompany.logoUrl} alt={currentCompany.tradeName} className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs flex-shrink-0">
            {currentCompany.monogram || currentCompany.tradeName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="leading-tight">
          <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {currentCompany.tradeName}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
            {currentCompany.cnpj}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-transform duration-200 ml-1.5 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-[#0A140F] border border-gray-200 dark:border-[#16291E] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3 border-b border-gray-100 dark:border-[#16291E] bg-gray-50/60 dark:bg-[#0E1A14]">
            <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center justify-between">
              <span>Alternar Empresa</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{companies.length} empresas</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por nome ou CNPJ..."
                className="w-full bg-white dark:bg-[#070F0B] border border-gray-200 dark:border-[#16291E] rounded-lg py-1.5 pl-8 pr-3 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-sans"
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
                      : 'hover:bg-gray-50 dark:hover:bg-[#0E1A14] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {c.logoUrl ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/25 p-1 flex items-center justify-center flex-shrink-0">
                        <img src={c.logoUrl} alt={c.tradeName} className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs flex-shrink-0">
                        {c.monogram || c.tradeName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {c.tradeName}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {c.sector} • <span className="font-mono">{c.cnpj}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}

            {filteredCompanies.length === 0 && (
              <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500">
                Nenhuma empresa encontrada
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-2 border-t border-gray-100 dark:border-[#16291E] bg-gray-50/80 dark:bg-[#0E1A14]">
            <button
              onClick={handleGoToHub}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-[#070F0B] text-xs text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-500" />
                <span>Gerenciar todas as empresas (Hub)</span>
              </div>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">/hub</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
