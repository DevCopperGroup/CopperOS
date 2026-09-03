import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Layers, FileText, ArrowRight, UserCheck, Shield, ExternalLink, X } from 'lucide-react';
import { useCopperOS } from '../../context/CopperOSContext';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    companies, 
    setCurrentCompanyId,
    modulesCatalog,
    currentCompany,
    directoryRecords,
    reports
  } = useCopperOS();
  
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return {
        companies: companies.slice(0, 4),
        modules: modulesCatalog.slice(0, 4),
        records: directoryRecords.slice(0, 3),
        reports: reports.slice(0, 2),
      };
    }

    const q = query.toLowerCase();

    return {
      companies: companies.filter(c => 
        c.tradeName.toLowerCase().includes(q) || 
        c.sector.toLowerCase().includes(q) || 
        c.cnpj.includes(q)
      ),
      modules: modulesCatalog.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      ),
      records: directoryRecords.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.code.toLowerCase().includes(q) ||
        (r.document && r.document.toLowerCase().includes(q))
      ),
      reports: reports.filter(rep => 
        rep.title.toLowerCase().includes(q) || 
        rep.category.toLowerCase().includes(q)
      ),
    };
  }, [query, companies, modulesCatalog, directoryRecords, reports]);

  if (!isCommandPaletteOpen) return null;

  const handleSelectCompany = (companyId: string) => {
    setCurrentCompanyId(companyId);
    navigate(`/companies/${companyId}`);
    setIsCommandPaletteOpen(false);
  };

  const handleSelectModule = (route: string) => {
    if (currentCompany) {
      navigate(`/companies/${currentCompany.id}${route}`);
    }
    setIsCommandPaletteOpen(false);
  };

  const handleSelectRecord = (recordId: string) => {
    if (currentCompany) {
      navigate(`/companies/${currentCompany.id}/cadastro?record=${recordId}`);
    }
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <Search className="w-5 h-5 text-emerald-500 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar empresas, módulos, CNPJs, clientes, relatórios..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Companies Section */}
          {filteredResults.companies.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Empresas & Unidades
              </div>
              <div className="space-y-1">
                {filteredResults.companies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCompany(c.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-xs">
                        {c.monogram || c.tradeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                          {c.tradeName}
                          <span className="text-[11px] text-gray-400 font-normal">
                            CNPJ: {c.cnpj}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-sans">
                          {c.sector}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transform group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modules Section */}
          {filteredResults.modules.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Módulos Operacionais
              </div>
              <div className="space-y-1">
                {filteredResults.modules.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModule(m.route)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                        {m.name}
                        <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 border border-gray-200 text-gray-500 rounded">
                          v{m.version}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {m.description}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Records Section */}
          {filteredResults.records.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Cadastros & Entidades
              </div>
              <div className="space-y-1">
                {filteredResults.records.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRecord(r.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                        {r.name}
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded">
                          {r.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {r.detail} {r.document ? `• ${r.document}` : ''}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reports Section */}
          {filteredResults.reports.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Relatórios Executivos
              </div>
              <div className="space-y-1">
                {filteredResults.reports.map(rep => (
                  <button
                    key={rep.id}
                    onClick={() => handleSelectModule('/reports')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {rep.title}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {rep.category} • {rep.period} • Resp: {rep.responsible}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredResults.companies.length === 0 && 
           filteredResults.modules.length === 0 && 
           filteredResults.records.length === 0 && 
           filteredResults.reports.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-xs font-mono">
              Nenhum resultado encontrado para "{query}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>CopperOS Command Search</span>
          </div>
          <span>Clique ou pressione ENTER para navegar</span>
        </div>
      </div>
    </div>
  );
};
