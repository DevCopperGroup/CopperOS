import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  Layers,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  BarChart3,
  Package,
  Truck,
  FileSpreadsheet
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { CompanyLogo } from '../components/common/CompanyLogo';

export const GeneralDashboardPage: React.FC = () => {
  const { companies, isDarkMode, user, setCurrentCompanyId } = useCopperOS();
  const navigate = useNavigate();

  const [period, setPeriod] = useState<'HOJE' | 'SEMANA' | 'MES' | 'ANO'>('MES');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');

  // Métricas Consolidadas do Grupo (Holding)
  const consolidatedMetrics = {
    totalRevenue: 'R$ 4.820.500,00',
    revenueGrowth: '+14.2%',
    activeOrders: 348,
    ordersGrowth: '+8.6%',
    operationalEfficiency: '95.4%',
    efficiencyDelta: '+2.1%',
    totalEmployees: 184,
    criticalAlerts: 3,
  };

  // Dados comparativos por empresa
  const companyPerformance = [
    {
      id: 'emp-copper-group',
      name: 'Copper Group',
      sector: 'Soluções Industriais',
      revenue: 'R$ 2.450.000,00',
      revenuePercent: 50.8,
      orders: 164,
      efficiency: '96.2%',
      status: 'OPERATIONAL',
      growth: '+16.4%',
      positive: true,
      lastAudit: 'Hoje, às 08:30',
    },
    {
      id: 'emp-af-locacoes',
      name: 'AF Locações',
      sector: 'Locação de Equipamentos & Frotas',
      revenue: 'R$ 1.180.000,00',
      revenuePercent: 24.5,
      orders: 88,
      efficiency: '94.8%',
      status: 'OPERATIONAL',
      growth: '+11.2%',
      positive: true,
      lastAudit: 'Hoje, às 09:15',
    },
    {
      id: 'emp-dc-log',
      name: 'DC Log',
      sector: 'Logística & Transportes',
      revenue: 'R$ 720.500,00',
      revenuePercent: 14.9,
      orders: 62,
      efficiency: '93.5%',
      status: 'WARNING',
      growth: '+6.8%',
      positive: true,
      lastAudit: 'Ontem, às 17:40',
    },
    {
      id: 'emp-santa-barbara',
      name: 'Santa Bárbara',
      sector: 'Armazenagem & Insumos',
      revenue: 'R$ 470.000,00',
      revenuePercent: 9.8,
      orders: 34,
      efficiency: '97.1%',
      status: 'OPERATIONAL',
      growth: '-1.4%',
      positive: false,
      lastAudit: 'Hoje, às 10:00',
    },
  ];

  // Feed recente de atividades consolidadas
  const recentActivities = [
    {
      id: 'act-1',
      company: 'Copper Group',
      title: 'Meta de produção semanal atingida (+18%)',
      time: 'Há 12 minutos',
      type: 'SUCCESS',
    },
    {
      id: 'act-2',
      company: 'AF Locações',
      title: 'Contrato de locação pesada renovado (Cliente Mineradora Sul)',
      time: 'Há 45 minutos',
      type: 'INFO',
    },
    {
      id: 'act-3',
      company: 'DC Log',
      title: 'Alerta: Caminhão TRK-015 em manutenção preventiva',
      time: 'Há 2 horas',
      type: 'WARNING',
    },
    {
      id: 'act-4',
      company: 'Santa Bárbara',
      title: 'Inventário físico do galpão B concluído sem divergências',
      time: 'Há 3 horas',
      type: 'SUCCESS',
    },
  ];

  const handleNavigateToCompany = (companyId: string) => {
    setCurrentCompanyId(companyId);
    navigate(`/companies/${companyId}`);
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900 ${
      isDarkMode ? 'dark bg-[#070F0B] text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Top Bar de Navegação Executiva */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0E1A14]/80 backdrop-blur-md border-b border-gray-200/80 dark:border-[#162D20] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hub')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#162D20] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Hub</span>
          </button>

          <div className="h-4 w-px bg-gray-200 dark:bg-[#162D20]" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">Dashboard Geral da Holding</span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                Consolidado Multiempreitadas
              </span>
            </div>
          </div>
        </div>

        {/* Controles de Período */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-[#070F0B] p-1 rounded-xl border border-gray-200/80 dark:border-[#162D20] text-xs font-medium">
            {(['HOJE', 'SEMANA', 'MES', 'ANO'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  period === p
                    ? 'bg-emerald-500 text-[#070F0B] font-bold shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {p === 'HOJE' ? 'Hoje' : p === 'SEMANA' ? 'Semana' : p === 'MES' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Banner com Boas-Vindas e Resumo Executivo */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Holding Copper Group • Telemetria Consolidada
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Painel Executivo de Performance
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Visão consolidada em tempo real sobre faturamento, produtividade de ordens e conformidade operacional de todas as 4 unidades de negócio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Exportando relatório consolidado da Holding em PDF/XLS...')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0E1A14] border border-gray-200 dark:border-[#162D20] hover:border-emerald-500 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-200 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Exportar Dados</span>
            </button>
          </div>
        </div>

        {/* 4 Cards de KPIs Consolidados da Holding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* KPI 1: Faturamento Consolidado */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1A14] border border-gray-200/80 dark:border-[#162D20] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Faturamento do Grupo</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
                {consolidatedMetrics.totalRevenue}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{consolidatedMetrics.revenueGrowth} vs mês anterior</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Ordens e Operações */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1A14] border border-gray-200/80 dark:border-[#162D20] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ordens em Execução</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
                {consolidatedMetrics.activeOrders}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{consolidatedMetrics.ordersGrowth} volume ativo</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Eficiência Operacional Média */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1A14] border border-gray-200/80 dark:border-[#162D20] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Eficiência Média</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
                {consolidatedMetrics.operationalEfficiency}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Conforme SLA global</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Alertas Críticos do Grupo */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1A14] border border-gray-200/80 dark:border-[#162D20] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Alertas em Aberto</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
                {consolidatedMetrics.criticalAlerts}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                <span>1 manutenção • 2 estoque</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela Comparativa de Empresas do Grupo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Desempenho por Empresa do Grupo
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Compare a receita, volume de ordens e índice de eficiência entre as 4 empresas.
              </p>
            </div>
          </div>

          <div className="border border-gray-200/80 dark:border-[#162D20] bg-white dark:bg-[#0E1A14] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-[#070F0B] text-gray-500 dark:text-gray-400 border-b border-gray-200/80 dark:border-[#162D20] font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Empresa</th>
                  <th className="py-3.5 px-4">Segmento</th>
                  <th className="py-3.5 px-4">Faturamento</th>
                  <th className="py-3.5 px-4">Share (%)</th>
                  <th className="py-3.5 px-4">Ordens</th>
                  <th className="py-3.5 px-4">Eficiência</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Acesso Direto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#162D20]">
                {companyPerformance.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <CompanyLogo companyId={comp.id} size="sm" />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                            {comp.name}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {comp.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                      {comp.sector}
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-gray-900 dark:text-white">
                      <div>{comp.revenue}</div>
                      <div className={`text-[10px] ${comp.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {comp.growth}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-[#070F0B] overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${comp.revenuePercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-gray-500">{comp.revenuePercent}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-700 dark:text-gray-200 font-semibold">
                      {comp.orders} ordens
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {comp.efficiency}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        comp.status === 'OPERATIONAL'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          comp.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        <span>{comp.status === 'OPERATIONAL' ? 'Operacional' : 'Atenção'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleNavigateToCompany(comp.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-colors cursor-pointer border border-emerald-500/20"
                      >
                        <span>Abrir</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seção Inferior: Atividades em Tempo Real & Distribuição de Receita */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card: Linha do Tempo das Empresas */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0E1A14] border border-gray-200/80 dark:border-[#162D20] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Atividades Recentes Consolidadas</span>
              </h3>
              <span className="text-[11px] text-gray-500">Tempo real</span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-[#162D20] bg-gray-50/50 dark:bg-[#070F0B]/50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      act.type === 'SUCCESS' ? 'bg-emerald-500' : act.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {act.title}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {act.company} • {act.time}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase bg-gray-200/60 dark:bg-white/5 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                    {act.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Governança e Compliance do Grupo */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1A14] border border-gray-200/80 dark:border-[#162D20] space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Governança da Holding</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Todas as 4 empresas compartilham o mesmo repositório seguro de auditoria, com autenticação centralizada e banco de dados PostgreSQL blindado com SHA-256.
              </p>

              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#162D20] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">PostgreSQL Status:</span>
                  <span className="font-mono text-emerald-500 font-semibold">ONLINE • 5432</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Sessões Ativas no Grupo:</span>
                  <span className="font-mono text-gray-900 dark:text-white font-semibold">12 colaboradores</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Última Cópia de Segurança:</span>
                  <span className="font-mono text-gray-900 dark:text-white">03/09/2026 03:00</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/hub')}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-[#070F0B] font-bold text-xs rounded-xl transition-colors text-center cursor-pointer shadow-xs"
            >
              Ir para o Seletor de Empresas
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default GeneralDashboardPage;
