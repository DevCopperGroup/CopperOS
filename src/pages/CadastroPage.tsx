import React, { useMemo, useRef, useState } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  UploadCloud,
  Download,
  Plus,
  Pencil,
  Copy,
  Trash2,
  Power,
  X
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { RowActions } from '../components/common/RowActions';
import { Pagination } from '../components/common/Pagination';
import { ToastStack, useToast } from '../components/common/Toast';
import { downloadCsv, parseCsv, slugify } from '../utils/exportFile';

interface RegistroItem {
  id: string;
  name: string;
  code: string;
  category: string;
  type: 'Material' | 'Equipamento' | 'Pessoa' | 'Fornecedor' | 'Departamento' | 'Local';
  status: 'Ativo' | 'Inativo' | 'Pendente';
  lastUpdated: string;
  iconType: 'screw' | 'sheet' | 'avatar1' | 'avatar2' | 'valve' | 'supplier1' | 'supplier2' | 'dept1' | 'dept2' | 'location1' | 'location2';
}

type RegistroTab = 'Itens' | 'Pessoas' | 'Fornecedores' | 'Departamentos' | 'Locais';
type StatusFilter = 'Todos' | RegistroItem['status'];

const PAGE_SIZE = 8;

const initialRegistros: RegistroItem[] = [
  // Itens
  {
    id: '1',
    name: 'Parafuso Sextavado M10',
    code: 'ITM-0001',
    category: 'Fixadores',
    type: 'Material',
    status: 'Ativo',
    lastUpdated: '27/05/2025 09:41',
    iconType: 'screw'
  },
  {
    id: '2',
    name: 'Chapa de Aço 2mm',
    code: 'ITM-0002',
    category: 'Matéria-prima',
    type: 'Material',
    status: 'Ativo',
    lastUpdated: '27/05/2025 08:15',
    iconType: 'sheet'
  },
  {
    id: '5',
    name: 'Válvula Industrial',
    code: 'ITM-0003',
    category: 'Equipamento',
    type: 'Equipamento',
    status: 'Ativo',
    lastUpdated: '25/05/2025 11:03',
    iconType: 'valve'
  },
  // Pessoas
  {
    id: '3',
    name: 'João Silva',
    code: 'PES-0001',
    category: 'Operador',
    type: 'Pessoa',
    status: 'Ativo',
    lastUpdated: '26/05/2025 16:22',
    iconType: 'avatar1'
  },
  {
    id: '4',
    name: 'Maria Oliveira',
    code: 'PES-0002',
    category: 'Administrativo',
    type: 'Pessoa',
    status: 'Ativo',
    lastUpdated: '26/05/2025 15:10',
    iconType: 'avatar2'
  },
  // Fornecedores
  {
    id: '6',
    name: 'Aços & Metais Gerdau S.A.',
    code: 'FOR-0001',
    category: 'Siderurgia & Metais',
    type: 'Fornecedor',
    status: 'Ativo',
    lastUpdated: '24/05/2025 14:30',
    iconType: 'supplier1'
  },
  {
    id: '7',
    name: 'Fixatec Soluções Fixação',
    code: 'FOR-0002',
    category: 'Componentes Industriais',
    type: 'Fornecedor',
    status: 'Ativo',
    lastUpdated: '23/05/2025 10:18',
    iconType: 'supplier2'
  },
  // Departamentos
  {
    id: '8',
    name: 'Engenharia & Manutenção',
    code: 'DEP-0001',
    category: 'Operações Técnicas',
    type: 'Departamento',
    status: 'Ativo',
    lastUpdated: '22/05/2025 17:00',
    iconType: 'dept1'
  },
  {
    id: '9',
    name: 'Logística & Suprimentos',
    code: 'DEP-0002',
    category: 'Supply Chain',
    type: 'Departamento',
    status: 'Ativo',
    lastUpdated: '21/05/2025 11:45',
    iconType: 'dept2'
  },
  // Locais
  {
    id: '10',
    name: 'Galpão Principal de Produção A1',
    code: 'LOC-0001',
    category: 'Unidade Fabril',
    type: 'Local',
    status: 'Ativo',
    lastUpdated: '20/05/2025 08:30',
    iconType: 'location1'
  },
  {
    id: '11',
    name: 'Centro de Distribuição CD-Leste',
    code: 'LOC-0002',
    category: 'Armazém Logístico',
    type: 'Local',
    status: 'Ativo',
    lastUpdated: '19/05/2025 16:15',
    iconType: 'location2'
  }
];

const tabDefaults: Record<RegistroTab, { type: RegistroItem['type']; category: string; prefix: string }> = {
  Itens: { type: 'Material', category: 'Fixadores', prefix: 'ITM' },
  Pessoas: { type: 'Pessoa', category: 'Operações', prefix: 'PES' },
  Fornecedores: { type: 'Fornecedor', category: 'Materiais', prefix: 'FOR' },
  Departamentos: { type: 'Departamento', category: 'Administrativo', prefix: 'DEP' },
  Locais: { type: 'Local', category: 'Galpão', prefix: 'LOC' },
};

const iconForType = (type: RegistroItem['type']): RegistroItem['iconType'] => {
  if (type === 'Pessoa') return 'avatar1';
  if (type === 'Fornecedor') return 'supplier1';
  if (type === 'Departamento') return 'dept1';
  if (type === 'Local') return 'location1';
  return 'screw';
};

const formatNow = () =>
  new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const emptyForm = {
  name: '',
  code: '',
  category: '',
  type: 'Material' as RegistroItem['type'],
  status: 'Ativo' as RegistroItem['status'],
};

export const CadastroPage: React.FC = () => {
  const { currentCompany } = useCopperOS();
  const { toasts, showToast, dismissToast } = useToast();

  const [items, setItems] = useState<RegistroItem[]>(initialRegistros);
  const [activeTab, setActiveTab] = useState<RegistroTab>('Itens');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<RegistroItem | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter(item => {
      const matchSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term);

      const matchStatus = statusFilter === 'Todos' || item.status === statusFilter;

      const matchTab =
        activeTab === 'Itens'
          ? item.type === 'Material' || item.type === 'Equipamento'
          : activeTab === 'Pessoas'
          ? item.type === 'Pessoa'
          : activeTab === 'Fornecedores'
          ? item.type === 'Fornecedor'
          : activeTab === 'Departamentos'
          ? item.type === 'Departamento'
          : item.type === 'Local';

      return matchSearch && matchStatus && matchTab;
    });
  }, [items, search, statusFilter, activeTab]);

  // Se um filtro encolher a lista, a página exibida é limitada ao que existe.
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const resetToFirstPage = () => setPage(1);

  const nextCode = (prefix: string) => {
    const used = items
      .filter(i => i.code.startsWith(`${prefix}-`))
      .map(i => Number(i.code.split('-')[1]))
      .filter(n => !Number.isNaN(n));
    const next = (used.length ? Math.max(...used) : 0) + 1;
    return `${prefix}-${String(next).padStart(4, '0')}`;
  };

  const handleOpenCreate = () => {
    const defaults = tabDefaults[activeTab];
    setEditingId(null);
    setForm({
      name: '',
      code: nextCode(defaults.prefix),
      category: defaults.category,
      type: defaults.type,
      status: 'Ativo',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: RegistroItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      code: item.code,
      category: item.category,
      type: item.type,
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setItems(prev =>
        prev.map(item =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                code: form.code.trim() || item.code,
                category: form.category.trim() || item.category,
                type: form.type,
                status: form.status,
                iconType: item.type === form.type ? item.iconType : iconForType(form.type),
                lastUpdated: formatNow(),
              }
            : item
        )
      );
      showToast(`Registro "${form.name.trim()}" atualizado.`);
    } else {
      const created: RegistroItem = {
        id: `reg-${Date.now()}`,
        name: form.name.trim(),
        code: form.code.trim() || nextCode(tabDefaults[activeTab].prefix),
        category: form.category.trim() || tabDefaults[activeTab].category,
        type: form.type,
        status: form.status,
        lastUpdated: formatNow(),
        iconType: iconForType(form.type),
      };
      setItems(prev => [created, ...prev]);
      showToast(`Registro "${created.name}" criado com o código ${created.code}.`);
      resetToFirstPage();
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDuplicate = (item: RegistroItem) => {
    const prefix = item.code.split('-')[0] || 'REG';
    const copy: RegistroItem = {
      ...item,
      id: `reg-${Date.now()}`,
      code: nextCode(prefix),
      name: `${item.name} (cópia)`,
      status: 'Pendente',
      lastUpdated: formatNow(),
    };
    setItems(prev => [copy, ...prev]);
    showToast(`Cópia criada: ${copy.code}.`, 'info');
    resetToFirstPage();
  };

  const handleToggleStatus = (item: RegistroItem) => {
    const nextStatus: RegistroItem['status'] = item.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, status: nextStatus, lastUpdated: formatNow() } : i))
    );
    showToast(`${item.code} agora está ${nextStatus.toLowerCase()}.`, 'info');
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    setItems(prev => prev.filter(i => i.id !== pendingDelete.id));
    showToast(`Registro ${pendingDelete.code} excluído.`, 'error');
    setPendingDelete(null);
  };

  const handleExport = () => {
    if (filteredItems.length === 0) {
      showToast('Nada para exportar com os filtros atuais.', 'error');
      return;
    }

    downloadCsv(
      `registros-${slugify(currentCompany?.tradeName || 'copperos')}-${slugify(activeTab)}.csv`,
      ['Nome', 'Codigo', 'Categoria', 'Tipo', 'Status', 'Atualizado em'],
      filteredItems.map(i => [i.name, i.code, i.category, i.type, i.status, i.lastUpdated])
    );
    showToast(`${filteredItems.length} registro(s) exportado(s) em CSV.`);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const rows = parseCsv(await file.text());
      if (rows.length === 0) {
        showToast('Arquivo vazio ou sem cabeçalho reconhecido.', 'error');
        return;
      }

      const allowedTypes: RegistroItem['type'][] = [
        'Material', 'Equipamento', 'Pessoa', 'Fornecedor', 'Departamento', 'Local',
      ];
      const allowedStatus: RegistroItem['status'][] = ['Ativo', 'Inativo', 'Pendente'];

      const imported: RegistroItem[] = rows
        .map((row, index) => {
          const name = row['nome'] || row['name'] || '';
          if (!name) return null;

          const rawType = (row['tipo'] || row['type'] || '') as RegistroItem['type'];
          const rawStatus = (row['status'] || '') as RegistroItem['status'];
          const type = allowedTypes.includes(rawType) ? rawType : tabDefaults[activeTab].type;
          const status = allowedStatus.includes(rawStatus) ? rawStatus : 'Pendente';

          return {
            id: `imp-${Date.now()}-${index}`,
            name,
            code: row['codigo'] || row['código'] || row['code'] || `${tabDefaults[activeTab].prefix}-IMP${index + 1}`,
            category: row['categoria'] || row['category'] || tabDefaults[activeTab].category,
            type,
            status,
            lastUpdated: formatNow(),
            iconType: iconForType(type),
          } as RegistroItem;
        })
        .filter((r): r is RegistroItem => r !== null);

      if (imported.length === 0) {
        showToast('Nenhuma linha válida encontrada (coluna "Nome" é obrigatória).', 'error');
        return;
      }

      setItems(prev => [...imported, ...prev]);
      resetToFirstPage();
      showToast(`${imported.length} registro(s) importado(s) do arquivo ${file.name}.`);
    } catch {
      showToast('Não foi possível ler o arquivo. Use CSV separado por ";" ou ",".', 'error');
    }
  };

  const renderIcon = (type: RegistroItem['iconType']) => {
    if (type === 'avatar1') {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
          JS
        </div>
      );
    }
    if (type === 'avatar2') {
      return (
        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 font-bold flex items-center justify-center text-xs">
          MO
        </div>
      );
    }
    if (type === 'sheet') {
      return (
        <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-mono text-micro font-bold">
          2mm
        </div>
      );
    }
    if (type === 'valve') {
      return (
        <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">
          ⚙️
        </div>
      );
    }
    if (type === 'supplier1' || type === 'supplier2') {
      return (
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
          🏭
        </div>
      );
    }
    if (type === 'dept1' || type === 'dept2') {
      return (
        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">
          🏢
        </div>
      );
    }
    if (type === 'location1' || type === 'location2') {
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
          📍
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-night-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs font-bold">
        🔩
      </div>
    );
  };

  const statusBadgeClass = (status: RegistroItem['status']) =>
    status === 'Ativo'
      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 border-emerald-100/60 dark:border-emerald-800/40'
      : status === 'Pendente'
      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100/60 dark:border-amber-800/40'
      : 'bg-gray-100 dark:bg-night-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-night-800';

  const rowActionsFor = (item: RegistroItem) => [
    { label: 'Editar', icon: Pencil, onClick: () => handleOpenEdit(item) },
    { label: 'Duplicar', icon: Copy, onClick: () => handleDuplicate(item) },
    {
      label: item.status === 'Ativo' ? 'Inativar' : 'Ativar',
      icon: Power,
      onClick: () => handleToggleStatus(item),
    },
    { label: 'Excluir', icon: Trash2, variant: 'danger' as const, onClick: () => setPendingDelete(item) },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Registro
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cadastre e gerencie itens, pessoas, fornecedores e demais informações.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => importInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Importar</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo registro</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 dark:border-night-800 pb-2 text-xs font-medium">
        {(['Itens', 'Pessoas', 'Fornecedores', 'Departamentos', 'Locais'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              resetToFirstPage();
            }}
            className={`pb-2 transition-colors relative cursor-pointer ${
              activeTab === tab
                ? 'text-brand-700 dark:text-brand-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Table & Filter Box */}
      <div className="bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-night-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou descrição..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 dark:bg-night-850 border border-gray-200/80 dark:border-night-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer ${
                statusFilter !== 'Todos' || isFilterOpen
                  ? 'border-emerald-500 text-brand-700 dark:text-brand-400 bg-emerald-50/60 dark:bg-emerald-950/40 font-semibold'
                  : 'border-gray-200/80 dark:border-night-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-night-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{statusFilter === 'Todos' ? 'Filtros' : `Status: ${statusFilter}`}</span>
            </button>

            <div className="flex items-center bg-gray-50 dark:bg-night-850 border border-gray-200/80 dark:border-night-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('list')}
                aria-label="Ver em lista"
                title="Ver em lista"
                className={`p-1 rounded-lg cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-night-800 text-gray-700 dark:text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Ver em grade"
                title="Ver em grade"
                className={`p-1 rounded-lg cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-night-800 text-gray-700 dark:text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        {isFilterOpen && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-night-800 bg-gray-50/60 dark:bg-night-850/50 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Status:</span>
            {(['Todos', 'Ativo', 'Pendente', 'Inativo'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  resetToFirstPage();
                }}
                className={`px-3 py-1 rounded-xl border font-medium transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-emerald-600 border-emerald-600 text-white font-semibold'
                    : 'bg-white dark:bg-night-900 border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-300 hover:border-emerald-500'
                }`}
              >
                {status}
              </button>
            ))}

            <button
              onClick={() => {
                setStatusFilter('Todos');
                setSearch('');
                setIsFilterOpen(false);
                resetToFirstPage();
              }}
              className="ml-auto inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          </div>
        )}

        {/* Content: list or grid */}
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-night-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
                  <th className="py-3 px-4 font-normal">Nome / Código</th>
                  <th className="py-3 px-4 font-normal">Categoria</th>
                  <th className="py-3 px-4 font-normal">Tipo</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Última atualização</th>
                  <th className="py-3 px-4 font-normal text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-night-800/60">
                {pagedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-night-850/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {renderIcon(item.iconType)}
                        <div>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="font-bold text-gray-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-400 text-left cursor-pointer"
                          >
                            {item.name}
                          </button>
                          <div className="text-micro text-gray-600 dark:text-gray-400 font-mono">
                            {item.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      {item.type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold border ${statusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {item.lastUpdated}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <RowActions actions={rowActionsFor(item)} />
                    </td>
                  </tr>
                ))}

                {pagedItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      Nenhum registro encontrado para os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-night-800 bg-white dark:bg-night-950/60 shadow-xs hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  {renderIcon(item.iconType)}
                  <RowActions actions={rowActionsFor(item)} />
                </div>
                <div className="mt-3">
                  <div className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                    {item.name}
                  </div>
                  <div className="text-micro font-mono text-gray-600 dark:text-gray-400 mt-0.5">
                    {item.code} • {item.type}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.category}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold border ${statusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}

            {pagedItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-gray-500 dark:text-gray-400">
                Nenhum registro encontrado para os filtros atuais.
              </div>
            )}
          </div>
        )}

        <Pagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={filteredItems.length}
          itemLabel={activeTab.toLowerCase()}
          onPageChange={setPage}
        />
      </div>

      {/* Modal: criar / editar registro */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingId(null);
          }}
          title={editingId ? 'Editar Registro' : 'Novo Registro'}
          subtitle={editingId ? `Código ${form.code}` : undefined}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Item ou Pessoa *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Parafuso Sextavado M12"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Ex: ITM-0006"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Ex: Fixadores"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as RegistroItem['type'] })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                >
                  <option value="Material">Material</option>
                  <option value="Equipamento">Equipamento</option>
                  <option value="Pessoa">Pessoa</option>
                  <option value="Fornecedor">Fornecedor</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Local">Local</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as RegistroItem['status'] })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold cursor-pointer"
              >
                {editingId ? 'Salvar Alterações' : 'Salvar Registro'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Excluir registro"
        message={
          <>
            O registro <strong>{pendingDelete?.name}</strong> ({pendingDelete?.code}) será removido
            da base de cadastro. Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default CadastroPage;
