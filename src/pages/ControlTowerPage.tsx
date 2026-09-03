import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  Navigation,
  Radio,
  X,
  Bell,
  Search
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { Modal } from '../components/common/Modal';
import { ToastStack, useToast } from '../components/common/Toast';

type VehicleStatus = 'Em trânsito' | 'Parado' | 'Entregue';

interface FleetVehicle {
  id: string;
  name: string;
  speed: string;
  status: VehicleStatus;
  driver: string;
  route: string;
  eta: string;
  lastPing: string;
  x: number; // Percentual no canvas do mapa
  y: number;
}

const initialVehicles: FleetVehicle[] = [
  { id: '1', name: 'TRK-015', speed: '60 km/h', status: 'Em trânsito', driver: 'João Pedro', route: 'Centro → Distrito Industrial', eta: '10:40', lastPing: 'há 30 s', x: 28, y: 32 },
  { id: '2', name: 'TRK-021', speed: 'Parado', status: 'Parado', driver: 'Marcos Silveira', route: 'R. das Indústrias, 123', eta: '—', lastPing: 'há 45 min', x: 42, y: 38 },
  { id: '3', name: 'TRK-007', speed: '40 km/h', status: 'Em trânsito', driver: 'Ana Paula', route: 'Vila Nova → Jardim América', eta: '11:15', lastPing: 'há 1 min', x: 62, y: 25 },
  { id: '4', name: 'TRK-012', speed: 'Entregue', status: 'Entregue', driver: 'Carlos Lima', route: 'Metalúrgica São João', eta: 'concluída', lastPing: 'há 12 min', x: 72, y: 46 },
  { id: '5', name: 'TRK-034', speed: '75 km/h', status: 'Em trânsito', driver: 'Beatriz Lima', route: 'Matriz → CD-Leste', eta: '12:05', lastPing: 'há 20 s', x: 30, y: 72 },
];

const severityStyles = {
  CRITICAL: {
    wrapper: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500',
    icon: AlertTriangle,
    label: 'Crítico',
    text: 'text-rose-500',
  },
  WARNING: {
    wrapper: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500',
    icon: Clock,
    label: 'Atenção',
    text: 'text-amber-500',
  },
  INFO: {
    wrapper: 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-600 dark:text-brand-400',
    icon: CheckCircle2,
    label: 'Informativo',
    text: 'text-brand-700 dark:text-brand-400',
  },
} as const;

export const ControlTowerPage: React.FC = () => {
  const { currentCompany, alerts, dismissAlert } = useCopperOS();
  const { toasts, showToast, dismissToast } = useToast();

  const [vehicles, setVehicles] = useState<FleetVehicle[]>(initialVehicles);
  const [viewMode, setViewMode] = useState<'Mapa' | 'Lista'>('Mapa');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | VehicleStatus>('Todos');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // A saída do modo tela cheia pode vir do próprio navegador (ESC), então o
  // estado acompanha o evento em vez de assumir o clique no botão.
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === panelRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await panelRef.current?.requestFullscreen();
      }
    } catch {
      showToast('O navegador bloqueou o modo tela cheia nesta janela.', 'error');
    }
  };

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return vehicles.filter(v => {
      const matchSearch =
        !term ||
        v.name.toLowerCase().includes(term) ||
        v.driver.toLowerCase().includes(term) ||
        v.route.toLowerCase().includes(term);
      const matchStatus = statusFilter === 'Todos' || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vehicles, search, statusFilter]);

  const metrics = useMemo(() => {
    const inTransit = vehicles.filter(v => v.status === 'Em trânsito').length;
    const delivered = vehicles.filter(v => v.status === 'Entregue').length;
    const stopped = vehicles.filter(v => v.status === 'Parado').length;
    const share = vehicles.length ? Math.round((inTransit / vehicles.length) * 100) : 0;

    return { active: vehicles.length, inTransit, delivered, stopped, share };
  }, [vehicles]);

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;

  const handleContactDriver = (vehicle: FleetVehicle) => {
    showToast(`Chamado aberto para ${vehicle.driver} (${vehicle.name}). Aguardando confirmação de rádio.`, 'info');
  };

  const handleMarkDelivered = (vehicle: FleetVehicle) => {
    setVehicles(prev =>
      prev.map(v => (v.id === vehicle.id ? { ...v, status: 'Entregue', speed: 'Entregue', eta: 'concluída' } : v))
    );
    setSelectedVehicle(null);
    showToast(`${vehicle.name} marcado como entregue.`);
  };

  const handleDismissAlert = (alertId: string, title: string) => {
    dismissAlert(alertId);
    showToast(`Alerta "${title}" baixado.`, 'info');
  };

  const statusColor = (status: VehicleStatus) =>
    status === 'Parado' ? 'bg-amber-500' : status === 'Entregue' ? 'bg-blue-500' : 'bg-emerald-500';

  const statusBadgeClass = (status: VehicleStatus) =>
    status === 'Parado'
      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/40'
      : status === 'Entregue'
      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/40'
      : 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 border-emerald-100 dark:border-emerald-800/40';

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Torre de Controle
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Acompanhe a operação da frota de {currentCompany?.tradeName ?? 'sua unidade'} em tempo real.
          </p>
        </div>

        {/* View Mode Toggle & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAlertsModalOpen(true)}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-xs cursor-pointer"
          >
            <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Alertas</span>
            {alerts.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-micro font-bold ${
                criticalAlerts > 0
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400'
              }`}>
                {alerts.length}
              </span>
            )}
          </button>

          <div className="flex items-center bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 rounded-xl p-0.5 shadow-xs">
            {(['Mapa', 'Lista'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs cursor-pointer"
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Expandir tela'}
            title={isFullscreen ? 'Sair da tela cheia' : 'Expandir tela'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Realtime View & Left Metrics Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: métricas derivadas da frota */}
        <div className="lg:col-span-3 space-y-4">
          <button
            onClick={() => {
              setStatusFilter('Todos');
              setViewMode('Lista');
            }}
            className="w-full text-left p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Frota ativa</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metrics.active}</div>
            <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5">veículos monitorados</div>
          </button>

          <button
            onClick={() => {
              setStatusFilter('Em trânsito');
              setViewMode('Lista');
            }}
            className="w-full text-left p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Em trânsito</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metrics.inTransit}</div>
            <div className="text-micro text-brand-700 dark:text-brand-400 mt-0.5 font-medium">
              {metrics.share}% da frota
            </div>
          </button>

          <button
            onClick={() => {
              setStatusFilter('Entregue');
              setViewMode('Lista');
            }}
            className="w-full text-left p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Entregas concluídas</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metrics.delivered}</div>
            <div className="text-micro text-brand-700 dark:text-brand-400 mt-0.5 font-medium">no turno atual</div>
          </button>

          <button
            onClick={() => {
              setStatusFilter('Parado');
              setViewMode('Lista');
            }}
            className="w-full text-left p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-900 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Paradas / atrasos</div>
            <div className="text-2xl font-bold text-rose-500 mt-1">{metrics.stopped}</div>
            <div className="text-micro text-rose-500 mt-0.5 font-medium">
              {metrics.stopped > 0 ? 'Requer atenção' : 'Sem ocorrências'}
            </div>
          </button>
        </div>

        {/* Right Side: mapa ou lista */}
        <div
          ref={panelRef}
          className="lg:col-span-9 bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 rounded-3xl shadow-xs overflow-hidden relative min-h-[440px] flex flex-col"
        >
          {/* Barra de busca / filtro do painel */}
          <div className="p-3 border-b border-gray-100 dark:border-night-800 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar veículo, motorista ou rota..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 dark:bg-night-850 border border-gray-200/80 dark:border-night-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['Todos', 'Em trânsito', 'Parado', 'Entregue'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer ${
                    statusFilter === status
                      ? 'bg-emerald-600 border-emerald-600 text-white font-semibold'
                      : 'bg-white dark:bg-night-900 border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-300 hover:border-emerald-500'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'Mapa' ? (
            <div className="relative w-full flex-1 min-h-[400px] bg-gray-100 dark:bg-night-850/80 overflow-hidden">
              {/* Subtle street map pattern */}
              <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* City District Labels */}
              <span className="absolute top-10 left-1/3 text-micro uppercase font-bold tracking-widest text-gray-600 dark:text-gray-400/70 select-none">
                Vila Nova
              </span>
              <span className="absolute top-1/3 left-1/2 -translate-x-1/2 text-xs uppercase font-bold tracking-widest text-gray-500/70 select-none">
                Centro
              </span>
              <span className="absolute bottom-16 left-1/3 text-micro uppercase font-bold tracking-widest text-gray-600 dark:text-gray-400/70 select-none">
                Jardim América
              </span>
              <span className="absolute top-1/2 right-8 text-micro uppercase font-bold tracking-widest text-gray-600 dark:text-gray-400/70 select-none">
                Distrito Industrial
              </span>

              {/* Route SVG Vectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  points="120,280 210,140 280,140 380,240 500,240 580,310"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-70"
                />
                <polyline
                  points="210,140 280,180 440,180 500,120 620,120"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="opacity-60"
                />
                <circle cx="210" cy="140" r="4" fill="#10B981" />
                <circle cx="380" cy="240" r="4" fill="#F59E0B" />
                <circle cx="500" cy="240" r="4" fill="#10B981" />
              </svg>

              {/* Pins clicáveis */}
              {filteredVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  style={{ left: `${v.x}%`, top: `${v.y}%` }}
                  aria-label={`Detalhes de ${v.name}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white dark:bg-night-950 border border-gray-200/90 dark:border-night-800 rounded-xl px-2.5 py-1 shadow-md hover:scale-105 hover:border-emerald-500 transition-all cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-white ${statusColor(v.status)}`}>
                    <Truck className="w-3 h-3" />
                  </div>
                  <div className="leading-none text-left">
                    <div className="text-micro font-bold text-gray-900 dark:text-white">{v.name}</div>
                    <div className={`text-micro font-semibold ${
                      v.status === 'Parado'
                        ? 'text-amber-500'
                        : v.status === 'Entregue'
                        ? 'text-blue-500'
                        : 'text-brand-700 dark:text-brand-400'
                    }`}>
                      {v.speed}
                    </div>
                  </div>
                </button>
              ))}

              {filteredVehicles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                  Nenhum veículo corresponde ao filtro atual.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-night-800 text-gray-600 dark:text-gray-400 font-medium">
                    <th className="py-3 px-4 font-normal">Veículo</th>
                    <th className="py-3 px-4 font-normal">Motorista</th>
                    <th className="py-3 px-4 font-normal">Rota / Posição</th>
                    <th className="py-3 px-4 font-normal">Velocidade</th>
                    <th className="py-3 px-4 font-normal">ETA</th>
                    <th className="py-3 px-4 font-normal">Último sinal</th>
                    <th className="py-3 px-4 font-normal">Status</th>
                    <th className="py-3 px-4 font-normal text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-night-800/60">
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/60 dark:hover:bg-night-850/60 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedVehicle(v)}
                          className="flex items-center gap-2 font-bold text-gray-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-400 cursor-pointer"
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${statusColor(v.status)}`}>
                            <Truck className="w-3.5 h-3.5" />
                          </span>
                          {v.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{v.driver}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{v.route}</td>
                      <td className="py-3 px-4 font-mono text-gray-700 dark:text-gray-300">{v.speed}</td>
                      <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">{v.eta}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{v.lastPing}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold border ${statusBadgeClass(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleContactDriver(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 hover:border-emerald-500 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                          <span className="hidden sm:inline">Chamar</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredVehicles.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        Nenhum veículo corresponde ao filtro atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Alertas e eventos — vindos do contexto da empresa */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Alertas e eventos
          </h2>
          <button
            onClick={() => setIsAlertsModalOpen(true)}
            className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline cursor-pointer"
          >
            Ver todos ({alerts.length})
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs text-center text-xs text-gray-500 dark:text-gray-400">
            Nenhum alerta em aberto para esta unidade.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alerts.slice(0, 3).map((alert) => {
              const style = severityStyles[alert.severity];
              const Icon = style.icon;

              return (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-start gap-3 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${style.wrapper}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {alert.title}
                    </div>
                    <div className={`text-xs font-medium ${style.text}`}>
                      {style.label} • {alert.moduleSource}
                    </div>
                    <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate">{alert.description}</span>
                      <span className="flex-shrink-0">{alert.timestamp}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(alert.id, alert.title)}
                    aria-label={`Dar baixa no alerta ${alert.title}`}
                    title="Dar baixa no alerta"
                    className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-night-800 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: detalhe do veículo */}
      {selectedVehicle && (
        <Modal
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          title={`Veículo ${selectedVehicle.name}`}
          subtitle={`${selectedVehicle.status} • último sinal ${selectedVehicle.lastPing}`}
        >
          <div className="space-y-4 text-xs">
            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: 'Motorista', value: selectedVehicle.driver },
                { label: 'Velocidade', value: selectedVehicle.speed },
                { label: 'Rota / Posição', value: selectedVehicle.route },
                { label: 'Previsão de chegada', value: selectedVehicle.eta },
              ].map((row) => (
                <div
                  key={row.label}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-100 dark:border-night-800"
                >
                  <dt className="text-micro uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                    {row.label}
                  </dt>
                  <dd className="text-gray-900 dark:text-white font-medium mt-1">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-100 dark:border-night-800">
              <button
                onClick={() => handleContactDriver(selectedVehicle)}
                className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-night-850 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-night-800 font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                <span>Chamar motorista</span>
              </button>
              <button
                onClick={() => handleMarkDelivered(selectedVehicle)}
                disabled={selectedVehicle.status === 'Entregue'}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Marcar entrega concluída</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: todos os alertas */}
      {isAlertsModalOpen && (
        <Modal
          isOpen={isAlertsModalOpen}
          onClose={() => setIsAlertsModalOpen(false)}
          title="Alertas da operação"
          subtitle={`${alerts.length} em aberto • ${criticalAlerts} crítico(s)`}
          maxWidth="2xl"
        >
          <div className="space-y-2 text-xs">
            {alerts.length === 0 ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                Nenhum alerta em aberto. Tudo sob controle nesta unidade.
              </div>
            ) : (
              alerts.map((alert) => {
                const style = severityStyles[alert.severity];
                const Icon = style.icon;

                return (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl border border-gray-200 dark:border-night-800 flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${style.wrapper}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white">{alert.title}</div>
                      <p className="text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="text-micro text-gray-500 dark:text-gray-400 mt-1">
                        {style.label} • {alert.moduleSource} • {alert.timestamp}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismissAlert(alert.id, alert.title)}
                      className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 hover:border-emerald-500 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap cursor-pointer"
                    >
                      Dar baixa
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Modal>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default ControlTowerPage;
