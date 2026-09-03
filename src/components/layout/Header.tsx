import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Menu, 
  Grid,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useCopperOS } from '../../context/CopperOSContext';
import { CompanySwitcher } from './CompanySwitcher';
import { Breadcrumbs } from './Breadcrumbs';

export const Header: React.FC = () => {
  const { 
    user, 
    organization, 
    alerts, 
    currentCompany,
    logoutSession,
    isDarkMode,
    toggleDarkMode,
    setIsCommandPaletteOpen, 
    setIsMobileSidebarOpen 
  } = useCopperOS();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const isHubPage = location.pathname === '/hub' || location.pathname === '/';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-night-900 border-b border-gray-100 dark:border-night-800 flex items-center justify-between px-4 sm:px-8 shadow-xs transition-colors">
      {/* Left Section: Logo & Company Switcher */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Abrir menu" title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global CopperOS Logo */}
        <Link to={currentCompany ? `/companies/${currentCompany.id}` : "/hub"} className="flex items-center gap-2.5 group">
          <div className="relative">
            <svg 
              viewBox="0 0 54 54" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-7 h-7"
            >
              <rect 
                x="8" 
                y="10" 
                width="34" 
                height="34" 
                rx="6" 
                stroke="#10B981" 
                strokeWidth="4" 
              />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            CopperOS
          </span>
        </Link>

        {/* Company Switcher Dropdown in Header */}
        <div className="hidden sm:block">
          <CompanySwitcher />
        </div>
      </div>

      {/* Right Section: System status + Notifications + Theme Toggle + User Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* System Online Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="leading-tight text-left">
            <div className="text-micro font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              SISTEMA OPERACIONAL
            </div>
            <div className="text-micro font-bold text-brand-700 dark:text-brand-400">
              ONLINE
            </div>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-night-800 transition-colors cursor-pointer"
          title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-gray-500 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-night-800 transition-colors relative cursor-pointer"
            aria-label="Notificações" title="Notificações"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                  Alertas Operacionais ({alerts.length})
                </span>
                <span className="text-micro text-brand-600 dark:text-brand-400 font-medium">Tempo Real</span>
              </div>
              <div className="mt-2 space-y-2 max-h-56 overflow-y-auto">
                {alerts.map(a => (
                  <div key={a.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-100 dark:border-night-800 text-left">
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {a.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {a.description}
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-4 text-xs text-gray-600 dark:text-gray-400">
                    Nenhum alerta pendente
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill with Avatar AS */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-night-700 text-emerald-400 font-bold flex items-center justify-center text-xs shadow-xs">
            {user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'AS'}
          </div>
          
          <div className="hidden md:block text-left leading-tight">
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              {user.name || 'André Silva'}
            </div>
            <div className="text-micro text-gray-600 dark:text-gray-400">
              {user.role || 'Administrador'}
            </div>
          </div>

          <button
            onClick={() => {
              logoutSession();
              navigate('/login');
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-rose-500 transition-colors cursor-pointer ml-1"
            aria-label="Sair" title="Sair"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
