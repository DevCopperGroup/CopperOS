import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  Search, 
  CheckCircle2, 
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { ReportCategory, ReportItem } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

const categories: { id: ReportCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Todos os Relatórios' },
  { id: 'OPERATIONAL', label: 'Operacionais' },
  { id: 'FINANCIAL', label: 'Financeiros' },
  { id: 'COMMERCIAL', label: 'Comerciais' },
  { id: 'PRODUCTION', label: 'Produção' },
  { id: 'INVENTORY', label: 'Estoque' },
];

export const ReportsPage: React.FC = () => {
  const { currentCompany, reports } = useCopperOS();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [activeReportForPreview, setActiveReportForPreview] = useState<ReportItem | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchSearch = 
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.responsible.toLowerCase().includes(search.toLowerCase());
      
      return matchCat && matchSearch;
    });
  }, [reports, selectedCategory, search]);

  const handleExport = (rep: ReportItem, format: string) => {
    setExportFeedback(`Exportando "${rep.title}" em formato ${format}... Arquivo pronto para download.`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  if (!currentCompany) return null;

  return (
    <div className="space-y-6 font-sans">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-200/90 dark:border-[#16291E] shadow-card transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-lg flex-shrink-0">
            {currentCompany.monogram || currentCompany.tradeName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                Business Intelligence & Compliance
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentCompany.tradeName}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Central de Relatórios & Auditoria
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Extratos analíticos, balancetes consolidados, demonstrativos fiscais e auditoria de produção.
            </p>
          </div>
        </div>

        {/* Global Export Summary */}
        <div className="text-right">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {reports.length} Dossiês Disponíveis
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500">
            Última compilação: Hoje, às 18:30
          </div>
        </div>
      </div>

      {/* Export Feedback Banner */}
      {exportFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-[#0A140F] border border-gray-200/90 dark:border-[#16291E] rounded-2xl shadow-card transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#0E1A14]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar relatórios..."
            className="w-full bg-gray-50 dark:bg-[#0E1A14] border border-gray-200 dark:border-[#16291E] rounded-xl py-1.5 pl-10 pr-3 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#070F0B] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white dark:bg-[#0A140F] border border-gray-200/80 dark:border-[#16291E] rounded-2xl p-5 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-emerald-500/80 dark:hover:border-emerald-500/80 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant={rep.status === 'READY' ? 'success' : 'warning'} size="sm">
                  {rep.status === 'READY' ? 'Disponível' : 'Processando'}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {rep.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {rep.description}
              </p>

              {/* Metadata */}
              <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-[#0E1A14] border border-gray-100 dark:border-[#16291E] text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-gray-500">Período:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{rep.period}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-gray-500">Responsável:</span>
                  <span className="text-gray-800 dark:text-gray-200">{rep.responsible}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-gray-500">Atualizado:</span>
                  <span className="text-gray-600 dark:text-gray-400">{rep.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Formats & Action CTAs */}
            <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-[#16291E] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {rep.formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#0E1A14] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#16291E]"
                  >
                    {fmt}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveReportForPreview(rep)}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#0E1A14] border border-gray-200 dark:border-[#16291E] hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium flex items-center gap-1 cursor-pointer"
                  title="Visualizar Resumo"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Visualizar</span>
                </button>

                <button
                  onClick={() => handleExport(rep, 'PDF')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Exportar PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-[#0A140F] border border-gray-200 dark:border-[#16291E] rounded-2xl shadow-card">
            <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Nenhum relatório encontrado para o filtro selecionado
            </div>
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      {activeReportForPreview && (
        <Modal
          isOpen={!!activeReportForPreview}
          onClose={() => setActiveReportForPreview(null)}
          title={`Demonstrativo: ${activeReportForPreview.title}`}
          subtitle={`Categoria: ${activeReportForPreview.category} • Período: ${activeReportForPreview.period}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-[10px] font-semibold text-gray-400 uppercase">
                Sumário Executivo do Relatório
              </div>
              <p className="text-gray-800 mt-1.5 leading-relaxed">
                {activeReportForPreview.description}
              </p>

              {/* Sample simulated table for preview */}
              <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="p-2.5">Indicador / Métrica</th>
                      <th className="p-2.5">Realizado</th>
                      <th className="p-2.5">Meta</th>
                      <th className="p-2.5 text-right">Variação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr>
                      <td className="p-2.5">Volume de Operações</td>
                      <td className="p-2.5 font-bold text-emerald-600">1.840 unid.</td>
                      <td className="p-2.5">1.750 unid.</td>
                      <td className="p-2.5 text-right text-emerald-600 font-semibold">+5.1%</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Disponibilidade de Frota/Linha</td>
                      <td className="p-2.5 font-bold text-gray-900">95.4%</td>
                      <td className="p-2.5">92.0%</td>
                      <td className="p-2.5 text-right text-emerald-600 font-semibold">+3.4%</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Índice de Ocorrências</td>
                      <td className="p-2.5 font-bold text-gray-900">1.2%</td>
                      <td className="p-2.5">&lt; 2.0%</td>
                      <td className="p-2.5 text-right text-emerald-600 font-semibold">-0.8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-gray-400 text-xs">Gerado por CopperOS Engine</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport(activeReportForPreview, 'XLS')}
                  className="px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1.5 font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Baixar Excel</span>
                </button>
                <button
                  onClick={() => handleExport(activeReportForPreview, 'PDF')}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
