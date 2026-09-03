import React, { useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Maximize2, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Truck,
  Navigation
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';

interface VehicleVehicle {
  id: string;
  name: string;
  speed: string;
  status: 'Em trânsito' | 'Parado' | 'Entregue';
  x: number; // Percentage
  y: number; // Percentage
}

const vehicles: VehicleVehicle[] = [
  { id: '1', name: 'TRK-015', speed: '60 km/h', status: 'Em trânsito', x: 28, y: 32 },
  { id: '2', name: 'TRK-021', speed: 'Parado', status: 'Parado', x: 42, y: 38 },
  { id: '3', name: 'TRK-007', speed: '40 km/h', status: 'Em trânsito', x: 62, y: 25 },
  { id: '4', name: 'TRK-012', speed: 'Entregue', status: 'Entregue', x: 72, y: 46 },
  { id: '5', name: 'TRK-012', speed: '75 km/h', status: 'Em trânsito', x: 30, y: 72 },
];

export const ControlTowerPage: React.FC = () => {
  const { currentCompany } = useCopperOS();
  const [viewMode, setViewMode] = useState<'Mapa' | 'Lista'>('Mapa');

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Torre de Controle
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Acompanhe a operação da frota em tempo real.
          </p>
        </div>

        {/* View Mode Toggle & Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-[#0A140F] border border-gray-200 dark:border-[#16291E] rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('Mapa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'Mapa'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setViewMode('Lista')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'Lista'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Lista
            </button>
          </div>

          <button 
            onClick={() => alert('Modo tela cheia')}
            className="p-2 rounded-xl bg-white dark:bg-[#0A140F] border border-gray-200 dark:border-[#16291E] text-gray-400 hover:text-gray-700 dark:hover:text-white shadow-xs cursor-pointer"
            title="Expandir tela"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Realtime Map View & Left Metrics Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: 4 Vertical Metric Counters */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs">
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Frota ativa
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              24
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              de 28 veículos
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs">
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Em trânsito
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              16
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              67% da frota
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs">
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Entregas hoje
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              42
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Concluídas: 31
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs">
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Atrasos
            </div>
            <div className="text-2xl font-bold text-rose-500 mt-1">
              3
            </div>
            <div className="text-[10px] text-rose-500 mt-0.5 font-medium">
              Requer atenção
            </div>
          </div>
        </div>

        {/* Right Side: Map Canvas (Matching exact route graphics in mockup) */}
        <div className="lg:col-span-9 bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] rounded-3xl shadow-xs overflow-hidden relative min-h-[440px] flex flex-col justify-between">
          {/* Mockup Map Canvas */}
          <div className="relative w-full h-[400px] sm:h-[440px] bg-[#EEF2F0] dark:bg-[#0E1A14]/80 overflow-hidden">
            {/* Subtle street map pattern */}
            <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* City District Labels */}
            <span className="absolute top-10 left-1/3 text-[10px] uppercase font-bold tracking-widest text-gray-400/70 select-none">
              Vila Nova
            </span>
            <span className="absolute top-1/3 left-1/2 -translate-x-1/2 text-[11px] uppercase font-bold tracking-widest text-gray-500/70 select-none">
              Centro
            </span>
            <span className="absolute bottom-16 left-1/3 text-[10px] uppercase font-bold tracking-widest text-gray-400/70 select-none">
              Jardim América
            </span>
            <span className="absolute top-1/2 right-8 text-[10px] uppercase font-bold tracking-widest text-gray-400/70 select-none">
              Distrito Industrial
            </span>

            {/* Route SVG Vectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Route 1: Cyan/Emerald Path */}
              <polyline
                points="120,280 210,140 280,140 380,240 500,240 580,310"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              />
              {/* Route 2: Secondary Path */}
              <polyline
                points="210,140 280,180 440,180 500,120 620,120"
                fill="none"
                stroke="#34D399"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="opacity-60"
              />
              {/* Route Checkpoints / Stops */}
              <circle cx="210" cy="140" r="4" fill="#10B981" />
              <circle cx="380" cy="240" r="4" fill="#F59E0B" />
              <circle cx="500" cy="240" r="4" fill="#10B981" />
            </svg>

            {/* Interactive Vehicle Marker Pins (Mockup Exact Match) */}
            {vehicles.map((v) => (
              <div
                key={v.id}
                style={{ left: `${v.x}%`, top: `${v.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white dark:bg-[#070F0B] border border-gray-200/90 dark:border-[#16291E] rounded-xl px-2.5 py-1 shadow-md hover:scale-105 transition-transform cursor-pointer"
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-white ${
                  v.status === 'Parado' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  <Truck className="w-3 h-3" />
                </div>
                <div className="leading-none text-left">
                  <div className="text-[10px] font-bold text-gray-900 dark:text-white">
                    {v.name}
                  </div>
                  <div className={`text-[8px] font-semibold ${
                    v.status === 'Parado' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {v.speed}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Events & Alerts Row (Exact match to mockup) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Alertas e eventos
          </h2>
          <button 
            onClick={() => alert('Visualizar todos os alertas')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Alert 1 */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs flex items-center gap-3 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                TRK-021
              </div>
              <div className="text-[11px] text-rose-500 font-medium">
                Parado há 45 min
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center justify-between">
                <span className="truncate">R. das Indústrias, 123</span>
                <span>09:15</span>
              </div>
            </div>
          </div>

          {/* Alert 2 */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs flex items-center gap-3 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                TRK-012
              </div>
              <div className="text-[11px] text-amber-500 font-medium">
                Manutenção preventiva
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center justify-between">
                <span>Agendada para hoje</span>
                <span>08:50</span>
              </div>
            </div>
          </div>

          {/* Alert 3 */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs flex items-center gap-3 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                TRK-003
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Entrega concluída
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center justify-between">
                <span className="truncate">Cliente: Metalúrgica São João</span>
                <span>08:20</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlTowerPage;
