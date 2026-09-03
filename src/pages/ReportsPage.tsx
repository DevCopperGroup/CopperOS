import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileJson,
  Eye,
  Search,
  Printer,
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { ReportCategory, ReportItem } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ToastStack, useToast } from '../components/common/Toast';
import { downloadCsv, downloadJson, printHtmlDocument, slugify } from '../utils/exportFile';

/**
 * Linhas do demonstrativo. Ainda não há backend analítico: o mesmo conjunto
 * alimenta a pré-visualização e todos os formatos de exportação, para que o
 * arquivo gerado seja idêntico ao que a tela mostra.
 */
const reportRows = (rep: ReportItem): { indicator: string; actual: string; target: string; variation: string }[] => [
  { indicator: 'Volume de Operações', actual: '1.840 unid.', target: '1.750 unid.', variation: '+5,1%' },
  { indicator: 'Disponibilidade de Frota/Linha', actual: '95,4%', target: '92,0%', variation: '+3,4%' },
  { indicator: 'Índice de Ocorrências', actual: '1,2%', target: '< 2,0%', variation: '-0,8%' },
  { indicator: 'Período de referência', actual: rep.period, target: '—', variation: '—' },
];

const categories: { id: ReportCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Todos os Relatórios' },
  { id: 'OPERATIONAL', label: 'Operacionais' },
  { id: 'FINANCIAL', label: 'Financeiros' },
  { id: 'COMMERCIAL', label: 'Comerciais' },
  { id: 'PRODUCTION', label: 'Produção' },
  { id: 'INVENTORY', label: 'Estoque' },
];

export const ReportsPage: React.FC = () => {
  const { currentCompany, reports, user } = useCopperOS();
  const { toasts, showToast, dismissToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [activeReportForPreview, setActiveReportForPreview] = useState<ReportItem | null>(null);

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

  const handleExport = (rep: ReportItem, format: 'PDF' | 'XLS' | 'JSON') => {
    const rows = reportRows(rep);
    const baseName = `${slugify(rep.title)}-${slugify(rep.period)}`;

    if (format === 'XLS') {
      downloadCsv(
        `${baseName}.csv`,
        ['Indicador / Metrica', 'Realizado', 'Meta', 'Variacao'],
        rows.map(r => [r.indicator, r.actual, r.target, r.variation])
      );
      showToast(`"${rep.title}" exportado em CSV (abre no Excel).`);
      return;
    }

    if (format === 'JSON') {
      downloadJson(`${baseName}.json`, {
        empresa: currentCompany?.tradeName,
        cnpj: currentCompany?.cnpj,
        relatorio: rep.title,
        categoria: rep.category,
        periodo: rep.period,
        responsavel: rep.responsible,
        geradoEm: new Date().toISOString(),
        geradoPor: user.name,
        indicadores: rows,
      });
      showToast(`"${rep.title}" exportado em JSON.`);
      return;
    }

    printHtmlDocument(
      rep.title,
      `<h1>${rep.title}</h1>
       <div class="meta">
         ${currentCompany?.tradeName ?? ''} • CNPJ ${currentCompany?.cnpj ?? ''}<br />
         Categoria ${rep.category} • Período ${rep.period} • Responsável ${rep.responsible}
       </div>
       <p style="font-size:12px;line-height:1.6">${rep.description}</p>
       <table>
         <thead>
           <tr><th>Indicador / Métrica</th><th>Realizado</th><th>Meta</th><th>Variação</th></tr>
         </thead>
         <tbody>
           ${rows
             .map(
               r =>
                 `<tr><td>${r.indicator}</td><td><strong>${r.actual}</strong></td><td>${r.target}</td><td>${r.variation}</td></tr>`
             )
             .join('')}
         </tbody>
       </table>
       <footer>
         Gerado por CopperOS Engine em ${new Date().toLocaleString('pt-BR')} por ${user.name}.
       </footer>`
    );
    showToast('Documento aberto na janela de impressão — escolha "Salvar como PDF".', 'info');
  };

  if (!currentCompany) return null;

  return (
    <div className="space-y-6 font-sans">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-night-900 border border-gray-200/90 dark:border-night-800 shadow-card transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-lg flex-shrink-0">
            {currentCompany.monogram || currentCompany.tradeName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-micro font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
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
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Última compilação: Hoje, às 18:30
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-night-900 border border-gray-200/90 dark:border-night-800 rounded-2xl shadow-card transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-night-850'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar relatórios..."
            className="w-full bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 rounded-xl py-1.5 pl-10 pr-3 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-night-950 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white dark:bg-night-900 border border-gray-200/80 dark:border-night-800 rounded-2xl p-5 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-emerald-500/80 dark:hover:border-emerald-500/80 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center text-brand-700 dark:text-brand-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {rep.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="text-micro font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-night-850 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-night-800"
                    >
                      {fmt}
                    </span>
                  ))}
                  <Badge variant={rep.status === 'READY' ? 'success' : 'warning'} size="sm">
                    {rep.status === 'READY' ? 'Disponível' : 'Processando'}
                  </Badge>
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 dark:group-hover:text-emerald-400 transition-colors">
                {rep.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {rep.description}
              </p>

              {/* Metadata */}
              <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-100 dark:border-night-800 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Período:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{rep.period}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Responsável:</span>
                  <span className="text-gray-800 dark:text-gray-200">{rep.responsible}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Atualizado:</span>
                  <span className="text-gray-600 dark:text-gray-400">{rep.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-night-800 flex items-center gap-2">
              <button
                onClick={() => setActiveReportForPreview(rep)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-400 text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                aria-label="Visualizar Resumo" title="Visualizar Resumo"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar</span>
              </button>

              <button
                onClick={() => handleExport(rep, 'XLS')}
                disabled={rep.status !== 'READY'}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Exportar CSV" title="Exportar CSV (Excel)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => handleExport(rep, 'PDF')}
                disabled={rep.status !== 'READY'}
                className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Gerar PDF" title="Gerar PDF via impressão"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 rounded-2xl shadow-card">
            <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
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
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800">
              <div className="text-micro font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Sumário Executivo do Relatório
              </div>
              <p className="text-gray-800 dark:text-gray-200 mt-1.5 leading-relaxed">
                {activeReportForPreview.description}
              </p>

              <div className="mt-4 border border-gray-200 dark:border-night-800 rounded-xl overflow-hidden bg-white dark:bg-night-900 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-night-850 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-night-800">
                    <tr>
                      <th className="p-2.5">Indicador / Métrica</th>
                      <th className="p-2.5">Realizado</th>
                      <th className="p-2.5">Meta</th>
                      <th className="p-2.5 text-right">Variação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-night-800/60 text-gray-700 dark:text-gray-300">
                    {reportRows(activeReportForPreview).map((row) => (
                      <tr key={row.indicator}>
                        <td className="p-2.5">{row.indicator}</td>
                        <td className="p-2.5 font-bold text-gray-900 dark:text-white">{row.actual}</td>
                        <td className="p-2.5">{row.target}</td>
                        <td className="p-2.5 text-right text-brand-700 dark:text-brand-400 font-semibold">
                          {row.variation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-night-800">
              <span className="text-gray-600 dark:text-gray-400 text-xs">
                Responsável: {activeReportForPreview.responsible}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExport(activeReportForPreview, 'JSON')}
                  className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-night-850 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-night-800 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <FileJson className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => handleExport(activeReportForPreview, 'XLS')}
                  className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-night-850 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-night-800 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                  <span>Baixar CSV</span>
                </button>
                <button
                  onClick={() => handleExport(activeReportForPreview, 'PDF')}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Gerar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
