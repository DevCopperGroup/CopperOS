import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  Plus, 
  X,
  Moon,
  Sun,
  ShieldCheck,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { CopperLogo } from '../components/common/CopperLogo';
import { Modal } from '../components/common/Modal';
import { CommandPalette } from '../components/common/CommandPalette';
import { ITAdminModal } from '../components/it/ITAdminModal';
import { CompanyStatus } from '../types';

export const HubPage: React.FC = () => {
  const { 
    user, 
    companies, 
    logoutSession,
    isDarkMode,
    toggleDarkMode,
    setCurrentCompanyId, 
    addCompany,
  } = useCopperOS();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isITModalOpen, setIsITModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const canAccessITPanel = user.role === 'SUPERADMIN' || user.role === 'ADMIN';

  useEffect(() => {
    // Trigger smooth fade on mount
    const raf = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    tradeName: '',
    legalName: '',
    sector: '',
    cnpj: '',
    city: 'São Paulo',
    state: 'SP',
    unitsCount: 1,
    status: 'OPERATIONAL' as CompanyStatus,
    enabledModules: ['control-tower', 'cadastro', 'reports'],
  });

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(c => 
      c.tradeName.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      c.cnpj.includes(q) ||
      c.legalName.toLowerCase().includes(q)
    );
  }, [companies, search]);

  const handleSelectCompany = (companyId: string) => {
    setCurrentCompanyId(companyId);
    navigate(`/companies/${companyId}`);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tradeName || !formData.cnpj) return;

    const newId = addCompany({
      tradeName: formData.tradeName,
      legalName: formData.legalName || `${formData.tradeName} S/A`,
      sector: formData.sector || 'Soluções Corporativas',
      cnpj: formData.cnpj,
      city: formData.city,
      state: formData.state,
      unitsCount: formData.unitsCount,
      status: formData.status,
      enabledModules: formData.enabledModules,
    });

    setIsAddModalOpen(false);
    setCurrentCompanyId(newId);
    navigate(`/companies/${newId}`);
  };

  return (
    <div 
      className={`min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative transition-colors duration-300 ${
        isDarkMode ? 'dark bg-night-950 text-gray-100' : 'bg-gray-50 text-gray-900'
      } ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {/* Top Bar with Dark Mode Toggle & User & Logout */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-end gap-3 mb-2">
        {/* Botão de Destaque: Dashboard Geral da Holding */}
        <button
          onClick={() => navigate('/dashboard')}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#070F0B] font-bold text-xs shadow-xs hover:shadow-emerald-500/20 transition-all cursor-pointer"
          title="Acessar Dashboard Geral da Holding"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Dashboard Geral</span>
        </button>

        {/* Botão de Controle de TI.
            Este gate é apenas de apresentação: quem autoriza de fato é o RBAC
            do servidor em /api/users, que relê o papel no banco a cada chamada. */}
        {canAccessITPanel && (
          <button
            onClick={() => setIsITModalOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-brand-700 dark:text-brand-400 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            title="Gestão de Usuários e Segurança de TI"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Painel de TI</span>
          </button>
        )}

        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          type="button"
          className="p-2 rounded-full bg-white dark:bg-night-850 border border-gray-200/80 dark:border-night-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
          aria-label={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-night-850 border border-gray-200/80 dark:border-night-800 px-3 py-1.5 rounded-full shadow-xs">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 font-semibold flex items-center justify-center text-micro">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={() => {
              logoutSession();
              navigate('/login');
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors cursor-pointer"
            title="Sair do sistema"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Centered Content */}
      <div className="max-w-6xl w-full mx-auto space-y-10 my-auto animate-in fade-in duration-500">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col items-center justify-center">
            {/* Geometric Copper Icon */}
            <div className="relative mb-3">
              <svg 
                viewBox="0 0 54 54" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-12 h-12"
              >
                <rect 
                  x="8" 
                  y="12" 
                  width="32" 
                  height="32" 
                  rx="7" 
                  stroke="#10B981" 
                  strokeWidth="3.5" 
                />
                <circle 
                  cx="44" 
                  cy="10" 
                  r="3.5" 
                  fill="#10B981" 
                />
              </svg>
            </div>

            {/* Brand Title */}
            <span 
              className="text-gray-900 dark:text-white font-bold tracking-tight text-2xl"
            >
              CopperOS
            </span>

            {/* Subtitle */}
            <span 
              className="text-gray-600 dark:text-gray-400 text-xs font-mono uppercase tracking-[0.25em] mt-1 font-medium"
            >
              SISTEMA OPERACIONAL CORPORATIVO
            </span>
          </div>

          <div className="mt-7 space-y-1.5">
            <h1 
              className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold tracking-tight"
            >
              Bem-vindo, <span className="text-brand-600 dark:text-brand-400 font-bold">{user.name}</span>
            </h1>
            <p 
              className="text-gray-600 dark:text-gray-400 text-sm font-normal"
            >
              Selecione a empresa onde deseja iniciar o trabalho.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto w-full">
          <div className="relative">
            <Search 
              className="text-gray-600 dark:text-gray-400 w-4 h-4 absolute left-4 top-3.5" 
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empresa..."
              className="bg-white dark:bg-night-850 text-gray-900 dark:text-gray-50 border-gray-200 dark:border-night-700 w-full border rounded-xl py-3 pl-11 pr-4 text-sm placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hero CTA Card: Dashboard Geral da Holding (Diferenciado) */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-950/50 via-[#0B1510] to-[#070F0B] border-2 border-emerald-500/40 hover:border-emerald-400 shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-[#070F0B] transition-all duration-300 shadow-xs shrink-0">
              <BarChart3 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Holding Copper Group
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-[#070F0B]">
                  Visão Consolidada
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                Dashboard Geral da Holding
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xl leading-relaxed">
                Telemetria executiva em tempo real: faturamento consolidado, ordens ativas e conformidade operacional de todas as 4 unidades.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-500/20">
            <div className="flex flex-col text-left sm:text-right font-mono">
              <span className="text-xs font-bold text-emerald-400">R$ 4.82M MTD</span>
              <span className="text-[10px] text-gray-400">4 unidades ativas</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-[#070F0B] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0">
              <span>Acessar Painel Executivo</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Company Cards Grid - Premium minimalista & hi-fi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredCompanies.map((comp) => (
            <div
              key={comp.id}
              onClick={() => handleSelectCompany(comp.id)}
              className="bg-white dark:bg-night-900 border-gray-200 dark:border-night-800 group border hover:border-emerald-500 rounded-2xl p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left relative overflow-hidden"
            >
              {/* Top Section with Large Prominent Symbol */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-5">
                  {/* Clean Logo Box without harsh borders */}
                  <div 
                    className="bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/10 dark:border-brand-500/20 w-16 h-16 rounded-2xl border flex items-center justify-center p-3 shadow-xs group-hover:scale-105 group-hover:border-emerald-500/40 transition-all duration-300"
                  >
                    {comp.logoUrl ? (
                      <img 
                        src={comp.logoUrl} 
                        alt={comp.tradeName} 
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-lg font-mono">
                        {comp.monogram || comp.tradeName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <span 
                    className="bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-micro font-semibold uppercase tracking-wider border"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ativo
                  </span>
                </div>

                {/* Company Details */}
                <div className="space-y-1.5">
                  <h3 
                    className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug"
                  >
                    {comp.tradeName}
                  </h3>
                  <div 
                    className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-1"
                  >
                    {comp.sector}
                  </div>
                  <div 
                    className="text-gray-600 dark:text-gray-400 text-xs font-mono mt-1"
                  >
                    {comp.cnpj}
                  </div>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div 
                className="border-t-gray-100 dark:border-t-night-800 mt-6 pt-3.5 border-t flex items-center justify-between text-xs font-semibold text-brand-700 dark:text-brand-400 group-hover:text-brand-600 dark:group-hover:text-brand-400"
              >
                <span>Acessar workspace</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}

          {/* Action Card: Solicitar acesso a uma nova empresa */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white/70 dark:bg-night-900/60 border-brand-500/40 dark:border-brand-500/30 group border-2 border-dashed hover:border-emerald-500 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left min-h-[230px]"
          >
            <div>
              {/* Large Plus Badge */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center text-brand-700 dark:text-brand-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:scale-105 transition-all mb-5">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <div 
                  className="text-gray-900 dark:text-white text-base font-bold leading-tight"
                >
                  Solicitar acesso
                </div>
                <div 
                  className="text-gray-600 dark:text-gray-400 text-xs leading-normal"
                >
                  a uma nova empresa ou filial
                </div>
                <div 
                  className="text-gray-600 dark:text-gray-400 text-xs mt-1"
                >
                  Não encontrou sua empresa?
                </div>
              </div>
            </div>

            <div 
              className="border-t-gray-100 dark:border-t-brand-500/20 mt-6 pt-3.5 border-t flex items-center justify-between text-xs font-semibold text-brand-700 dark:text-brand-400 group-hover:text-brand-600 dark:group-hover:text-brand-400"
            >
              <span>Cadastrar nova</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
            Nenhuma empresa encontrada para "{search}".
          </div>
        )}
      </div>

      {/* Operational Status Footer */}
      <footer className="mt-12 text-center space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span>SISTEMA OPERACIONAL <span className="text-brand-700 dark:text-brand-400">ONLINE</span></span>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Todos os sistemas operando normalmente
        </div>
      </footer>

      {/* Add / Request Company Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Solicitar Acesso / Nova Empresa"
        subtitle="Cadastre uma nova filial, unidade ou empresa do grupo CopperOS"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Nome Fantasia *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Copper Mineração"
              value={formData.tradeName}
              onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
              className="w-full bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 rounded-lg p-2.5 text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Segmento / Setor *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Mineração e Extração"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="w-full bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 rounded-lg p-2.5 text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              CNPJ *
            </label>
            <input
              type="text"
              required
              placeholder="00.000.000/0001-00"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              className="w-full bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 rounded-lg p-2.5 text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-night-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
            >
              Criar & Acessar
            </button>
          </div>
        </form>
      </Modal>

      <CommandPalette />
      <ITAdminModal isOpen={isITModalOpen} onClose={() => setIsITModalOpen(false)} />
    </div>
  );
};
