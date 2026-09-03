import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, 
  Package, 
  Radio, 
  ClipboardCheck, 
  Sliders, 
  BarChart3, 
  FileBarChart2, 
  MessageSquare, 
  Calendar,
  Building2,
  User,
  SlidersHorizontal,
  Search,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  Zap
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';

interface WorkspaceModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  route: string;
  iconBgColor?: string;
}

export const OverviewPage: React.FC = () => {
  const { currentCompany, companies, setCurrentCompanyId, user, setIsCommandPaletteOpen } = useCopperOS();
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState({
    time: '09:42',
    date: '27/05/2025'
  });

  // Keep live time updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      
      setCurrentTime({
        time: `${hours}:${minutes}`,
        date: `${day}/${month}/${year}`
      });
    };
    
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!currentCompany) return null;

  // Exact 8 Core Modules depicted in the user's reference mockup
  const modules: WorkspaceModule[] = [
    {
      id: 'registro',
      name: 'Registro',
      description: 'Cadastre e gerencie informações e documentos operacionais.',
      icon: FileText,
      route: `/companies/${companyId}/cadastro`,
    },
    {
      id: 'estoque',
      name: 'Estoque',
      description: 'Controle de estoque, movimentações e inventários.',
      icon: Package,
      route: `/companies/${companyId}/estoque`,
    },
    {
      id: 'torre-de-controle',
      name: 'Torre de Controle',
      description: 'Acompanhe indicadores, alertas e operações em tempo real.',
      icon: Radio,
      route: `/companies/${companyId}/control-tower`,
    },
    {
      id: 'tarefas',
      name: 'Tarefas',
      description: 'Gerencie tarefas, prazos e responsabilidades da equipe.',
      icon: ClipboardCheck,
      route: `/companies/${companyId}/tarefas`,
    },
    {
      id: 'automacao',
      name: 'Automação',
      description: 'Crie e gerencie automações e processos inteligentes.',
      icon: Sliders,
      route: `/companies/${companyId}/modules`,
    },
    {
      id: 'indicadores',
      name: 'Indicadores',
      description: 'Visualize métricas, KPIs e performance operacional.',
      icon: BarChart3,
      route: `/companies/${companyId}/control-tower`,
    },
    {
      id: 'relatorios',
      name: 'Relatórios',
      description: 'Gere relatórios analíticos e personalizados.',
      icon: FileBarChart2,
      route: `/companies/${companyId}/reports`,
    },
    {
      id: 'comunicacao',
      name: 'Comunicação',
      description: 'Centralize comunicados, mensagens e notificações.',
      icon: MessageSquare,
      route: `/companies/${companyId}/settings`,
    },
  ];

  const handleSelectCompany = (newCompanyId: string) => {
    setCurrentCompanyId(newCompanyId);
    navigate(`/companies/${newCompanyId}`);
    setIsCompanyDropdownOpen(false);
  };

  const userFirstName = user.name ? user.name.split(' ')[0] : 'André';

  return (
    <div className="space-y-8 sm:space-y-10 font-sans animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Top Welcome Header + 3 Top Status Cards */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Greeting & Company Selector */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Bem-vindo, <span className="text-brand-600 dark:text-brand-400">{userFirstName}.</span>
          </h1>

          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 relative">
            <span>Você está em</span>
            
            <div className="relative inline-block">
              <button
                onClick={() => setIsCompanyDropdownOpen(prev => !prev)}
                className="inline-flex items-center gap-1.5 font-bold text-gray-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-400 dark:hover:text-emerald-400 cursor-pointer transition-colors"
              >
                <span>{currentCompany.tradeName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 transition-transform ${isCompanyDropdownOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''}`} />
              </button>

              {/* Company Quick Dropdown */}
              {isCompanyDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-micro font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 px-3 py-1.5">
                    Alternar Workspace
                  </div>
                  <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
                    {companies.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCompany(c.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          c.id === currentCompany.id 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-night-850'
                        }`}
                      >
                        <span className="truncate">{c.tradeName}</span>
                        {c.id === currentCompany.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 pt-0.5">
            Selecione um módulo para começar.
          </p>
        </div>

        {/* Right: 3 Summary Cards (Data e hora, Empresa, Usuário) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Data e hora */}
          <div className="bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none flex items-center gap-3.5 min-w-[170px] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-brand-700 dark:text-brand-400">
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Data e hora
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                {currentTime.time}
              </div>
              <div className="text-micro text-gray-600 dark:text-gray-400 font-mono">
                {currentTime.date}
              </div>
            </div>
          </div>

          {/* Card 2: Empresa */}
          <div className="bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none flex items-center gap-3.5 min-w-[190px] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-brand-700 dark:text-brand-400">
              <Building2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Empresa
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {currentCompany.tradeName}
              </div>
              <div className="text-micro text-gray-600 dark:text-gray-400 truncate">
                {currentCompany.sector || 'Soluções Industriais'}
              </div>
            </div>
          </div>

          {/* Card 3: Usuário */}
          <div className="bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none flex items-center gap-3.5 min-w-[170px] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-brand-700 dark:text-brand-400">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Usuário
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user.name || 'André Silva'}
              </div>
              <div className="text-micro text-gray-600 dark:text-gray-400 truncate">
                {user.role || 'Administrador'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Modules Section Header + Personalizar Button */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          Módulos principais
        </h2>

        <button
          onClick={() => navigate(`/companies/${companyId}/modules`)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-night-900 border border-gray-200/80 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-brand-700 dark:text-brand-400 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-card transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Personalizar módulos</span>
        </button>
      </div>

      {/* 8 Main Square Modules Grid (Exact Match to Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {modules.map((mod) => {
          const IconComp = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => navigate(mod.route)}
              className="group bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[220px]"
            >
              {/* Module Green Icon Pill */}
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/60 dark:border-emerald-800/40 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-xs">
                <IconComp className="w-6 h-6 stroke-[2]" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 my-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 dark:group-hover:text-emerald-400 transition-colors">
                  {mod.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 px-1">
                  {mod.description}
                </p>
              </div>

              {/* Green Circle Arrow Button */}
              <div className="w-8 h-8 rounded-full border border-gray-200/90 dark:border-night-800 group-hover:border-emerald-500 dark:group-hover:border-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 transition-all">
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar: Acesse rapidamente + Search Input with ⌘K + Central de ajuda */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        {/* Left: Quick Access Label */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              Acesse rapidamente
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Utilize a busca global ou comandos rápidos para navegar pelo sistema.
            </div>
          </div>
        </div>

        {/* Right: Search Bar with ⌘K & Help Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex-1 lg:w-96 relative flex items-center bg-gray-50 dark:bg-night-850 border border-gray-200/80 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer transition-all group"
          >
            <Search className="w-4 h-4 mr-2.5 text-gray-600 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
            <span className="flex-1 truncate">Buscar módulos, relatórios, tarefas...</span>
            <kbd className="text-micro font-mono bg-white dark:bg-night-950 border border-gray-200 dark:border-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400 shadow-xs">
              ⌘ K
            </kbd>
          </div>

          <button
            onClick={() => navigate(`/companies/${companyId}/settings`)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-night-850 border border-gray-200/80 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-400 dark:hover:text-emerald-400 transition-all whitespace-nowrap cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="hidden sm:inline">Central de ajuda</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default OverviewPage;
