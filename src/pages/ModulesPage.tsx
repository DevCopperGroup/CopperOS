import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Check, 
  Plus, 
  Boxes, 
  Cpu, 
  Truck, 
  Receipt, 
  TrendingUp, 
  Sparkles, 
  Banknote, 
  FileBarChart, 
  LayoutDashboard,
  ArrowLeft
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { ModuleCategory } from '../types';
import { Badge } from '../components/common/Badge';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Layers,
  FileBarChart,
  Banknote,
  Boxes,
  Cpu,
  Truck,
  Receipt,
  TrendingUp,
  Sparkles,
};

export const ModulesPage: React.FC = () => {
  const { currentCompany, modulesCatalog, toggleCompanyModule } = useCopperOS();
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'ALL'>('ALL');
  const navigate = useNavigate();

  if (!currentCompany) return null;

  const filteredModules = modulesCatalog.filter(m => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-200/90 dark:border-[#16291E] shadow-card transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-lg flex-shrink-0">
            {currentCompany.monogram || currentCompany.tradeName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                Extensões & Marketplace
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentCompany.tradeName}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Personalizar Módulos Operacionais
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Ative ou desative módulos corporativos sob demanda para este CNPJ sem necessidade de refatoração estrutural.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-right hidden sm:block">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{currentCompany.enabledModules.length}</span>
            <span className="text-gray-500 dark:text-gray-400"> de {modulesCatalog.length} módulos ativos</span>
          </div>
          <button 
            onClick={() => navigate(`/companies/${currentCompany.id}`)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#16291E] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['ALL', 'CORE', 'OPERATIONS', 'MANAGEMENT', 'ADVANCED'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-semibold'
                : 'bg-white dark:bg-[#0A140F] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#16291E] hover:text-gray-900 dark:hover:text-white shadow-xs'
            }`}
          >
            {cat === 'ALL' ? 'Todos os Módulos' : cat}
          </button>
        ))}
      </div>

      {/* Modules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((mod) => {
          const Icon = iconMap[mod.iconName] || Layers;
          const isEnabled = currentCompany.enabledModules.includes(mod.id);
          const isCore = mod.category === 'CORE';

          return (
            <div
              key={mod.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-card hover:shadow-card-hover ${
                isEnabled
                  ? 'bg-white dark:bg-[#0A140F] border-emerald-300 dark:border-emerald-800/80'
                  : 'bg-white/70 dark:bg-[#070F0B]/80 border-gray-200 dark:border-[#16291E] opacity-90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isEnabled 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mod.status === 'BETA' && (
                      <Badge variant="warning" size="sm">BETA</Badge>
                    )}
                    <Badge variant={isEnabled ? 'copper' : 'default'} size="sm">
                      v{mod.version}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3.5">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {mod.name}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {mod.tags.map(t => (
                    <span 
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#16291E] text-gray-600 dark:text-gray-400 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#16291E] flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-mono">
                  MOD-{mod.id.toUpperCase()}
                </span>

                <button
                  onClick={() => toggleCompanyModule(currentCompany.id, mod.id)}
                  disabled={isCore}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer
                    ${isCore
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : isEnabled
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                    }
                  `}
                >
                  {isCore ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Essencial</span>
                    </>
                  ) : isEnabled ? (
                    <span>Desativar</span>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ativar Módulo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
