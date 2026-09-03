import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Package, 
  Radio, 
  CheckSquare, 
  BarChart2, 
  Settings, 
  HelpCircle,
  X
} from 'lucide-react';
import { useCopperOS } from '../../context/CopperOSContext';

export const Sidebar: React.FC = () => {
  const { 
    currentCompany, 
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen 
  } = useCopperOS();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentCompany) return null;

  const basePath = `/companies/${currentCompany.id}`;

  const navItems = [
    {
      id: 'inicio',
      label: 'Início',
      icon: Home,
      to: basePath,
      end: true,
    },
    {
      id: 'registro',
      label: 'Registro',
      icon: FileText,
      to: `${basePath}/cadastro`,
      end: false,
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: Package,
      to: `${basePath}/estoque`,
      end: false,
    },
    {
      id: 'torre-de-controle',
      label: 'Torre de Controle',
      icon: Radio,
      to: `${basePath}/control-tower`,
      end: false,
    },
    {
      id: 'tarefas',
      label: 'Tarefas',
      icon: CheckSquare,
      to: `${basePath}/tarefas`,
      end: false,
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: BarChart2,
      to: `${basePath}/reports`,
      end: false,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      to: `${basePath}/settings`,
      end: false,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-16 bottom-0 left-0 z-20 w-60
        bg-white dark:bg-[#070F0B]
        border-r border-gray-100 dark:border-[#16291E]
        flex flex-col justify-between py-6 px-3
        transition-transform duration-200 ease-in-out lg:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Navigation List */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.end 
              ? location.pathname === item.to || location.pathname === `${item.to}/`
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group
                  ${isActive 
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#0E1A14]'
                  }
                `}
              >
                <IconComponent className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Button: Central de ajuda */}
        <div className="pt-4 border-t border-gray-100 dark:border-[#16291E]">
          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              navigate(`${basePath}/settings`);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/50 dark:border-emerald-600/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Central de ajuda</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
