import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Pencil,
  Trash2,
  Download,
  Package,
  TrendingUp,
  AlertTriangle,
  History,
  X
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { RowActions } from '../components/common/RowActions';
import { Pagination } from '../components/common/Pagination';
import { ToastStack, useToast } from '../components/common/Toast';
import { downloadCsv, slugify } from '../utils/exportFile';

interface EstoqueItem {
  id: string;
  name: string;
  code: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  unitCost: number;
  imageType: 'screw' | 'sheet' | 'rod' | 'valve' | 'oil';
}

type MovementKind = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  kind: MovementKind;
  quantity: number;
  balanceAfter: number;
  reason: string;
  user: string;
  at: string;
}

type StockStatus = 'Normal' | 'Baixo' | 'Crítico';
type StatusFilter = 'Todos' | StockStatus;

const PAGE_SIZE = 8;

const initialEstoque: EstoqueItem[] = [
  {
    id: '1',
    name: 'Parafuso Sextavado M10',
    code: 'ITM-0001',
    category: 'Fixadores',
    currentStock: 2450,
    unit: 'Un',
    minStock: 500,
    unitCost: 0.85,
    imageType: 'screw'
  },
  {
    id: '2',
    name: 'Chapa de Aço 2mm',
    code: 'ITM-0002',
    category: 'Matéria-prima',
    currentStock: 320,
    unit: 'Kg',
    minStock: 200,
    unitCost: 18.4,
    imageType: 'sheet'
  },
  {
    id: '3',
    name: 'Eletrodo AWS 6013',
    code: 'ITM-0003',
    category: 'Suprimentos',
    currentStock: 45,
    unit: 'Kg',
    minStock: 100,
    unitCost: 32.9,
    imageType: 'rod'
  },
  {
    id: '4',
    name: 'Válvula Industrial',
    code: 'ITM-0004',
    category: 'Equipamentos',
    currentStock: 8,
    unit: 'Un',
    minStock: 5,
    unitCost: 1240,
    imageType: 'valve'
  },
  {
    id: '5',
    name: 'Óleo Lubrificante 68',
    code: 'ITM-0005',
    category: 'Insumos',
    currentStock: 12,
    unit: 'L',
    minStock: 10,
    unitCost: 46.5,
    imageType: 'oil'
  }
];

/**
 * O status é sempre derivado do saldo: abaixo da metade do mínimo é crítico,
 * abaixo do mínimo é baixo.
 */
const statusOf = (item: EstoqueItem): StockStatus => {
  if (item.currentStock <= item.minStock * 0.5) return 'Crítico';
  if (item.currentStock < item.minStock) return 'Baixo';
  return 'Normal';
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const movementLabel: Record<MovementKind, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  AJUSTE: 'Ajuste de inventário',
};

const emptyItemForm = {
  name: '',
  code: '',
  category: 'Fixadores',
  currentStock: 100,
  unit: 'Un',
  minStock: 50,
  unitCost: 0,
};

export const EstoquePage: React.FC = () => {
  const { currentCompany, user } = useCopperOS();
  const { toasts, showToast, dismissToast } = useToast();

  const [items, setItems] = useState<EstoqueItem[]>(initialEstoque);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);

  const [movementTarget, setMovementTarget] = useState<EstoqueItem | null>(null);
  const [movementForm, setMovementForm] = useState({
    kind: 'ENTRADA' as MovementKind,
    quantity: 0,
    reason: '',
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItemId, setHistoryItemId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EstoqueItem | null>(null);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter(item => {
      const matchSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term);

      const matchStatus = statusFilter === 'Todos' || statusOf(item) === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const summary = useMemo(() => {
    const totalValue = items.reduce((acc, i) => acc + i.currentStock * i.unitCost, 0);
    const lowStock = items.filter(i => statusOf(i) !== 'Normal').length;
    const today = new Date().toDateString();
    const movementsToday = movements.filter(m => new Date(m.at).toDateString() === today).length;

    return { activeItems: items.length, totalValue, lowStock, movementsToday };
  }, [items, movements]);

  const historyMovements = useMemo(() => {
    if (!historyItemId) return movements;
    return movements.filter(m => m.itemId === historyItemId);
  }, [movements, historyItemId]);

  const resetToFirstPage = () => setPage(1);

  const nextCode = () => {
    const used = items
      .map(i => Number(i.code.split('-')[1]))
      .filter(n => !Number.isNaN(n));
    const next = (used.length ? Math.max(...used) : 0) + 1;
    return `ITM-${String(next).padStart(4, '0')}`;
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setItemForm({ ...emptyItemForm, code: nextCode() });
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item: EstoqueItem) => {
    setEditingId(item.id);
    setItemForm({
      name: item.name,
      code: item.code,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      minStock: item.minStock,
      unitCost: item.unitCost,
    });
    setIsItemModalOpen(true);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) return;

    if (editingId) {
      setItems(prev =>
        prev.map(item =>
          item.id === editingId
            ? {
                ...item,
                name: itemForm.name.trim(),
                code: itemForm.code.trim() || item.code,
                category: itemForm.category.trim() || item.category,
                currentStock: Number(itemForm.currentStock),
                unit: itemForm.unit.trim() || item.unit,
                minStock: Number(itemForm.minStock),
                unitCost: Number(itemForm.unitCost),
              }
            : item
        )
      );
      showToast(`Item "${itemForm.name.trim()}" atualizado.`);
    } else {
      const created: EstoqueItem = {
        id: `itm-${Date.now()}`,
        name: itemForm.name.trim(),
        code: itemForm.code.trim() || nextCode(),
        category: itemForm.category.trim() || 'Geral',
        currentStock: Number(itemForm.currentStock),
        unit: itemForm.unit.trim() || 'Un',
        minStock: Number(itemForm.minStock),
        unitCost: Number(itemForm.unitCost),
        imageType: 'screw',
      };
      setItems(prev => [created, ...prev]);
      showToast(`Item ${created.code} cadastrado com saldo inicial de ${created.currentStock} ${created.unit}.`);
      resetToFirstPage();
    }

    setIsItemModalOpen(false);
    setEditingId(null);
  };

  const handleOpenMovement = (item: EstoqueItem, kind: MovementKind = 'ENTRADA') => {
    setMovementTarget(item);
    setMovementForm({ kind, quantity: 0, reason: '' });
  };

  const handleSubmitMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementTarget) return;

    const quantity = Number(movementForm.quantity);
    if (!quantity || quantity <= 0) {
      showToast('Informe uma quantidade maior que zero.', 'error');
      return;
    }

    const balanceAfter =
      movementForm.kind === 'ENTRADA'
        ? movementTarget.currentStock + quantity
        : movementForm.kind === 'SAIDA'
        ? movementTarget.currentStock - quantity
        : quantity;

    if (balanceAfter < 0) {
      showToast(
        `Saldo insuficiente: ${movementTarget.code} tem apenas ${movementTarget.currentStock} ${movementTarget.unit}.`,
        'error'
      );
      return;
    }

    setItems(prev =>
      prev.map(i => (i.id === movementTarget.id ? { ...i, currentStock: balanceAfter } : i))
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: movementTarget.id,
      itemName: movementTarget.name,
      itemCode: movementTarget.code,
      kind: movementForm.kind,
      quantity: movementForm.kind === 'AJUSTE' ? balanceAfter : quantity,
      balanceAfter,
      reason: movementForm.reason.trim() || movementLabel[movementForm.kind],
      user: user.name,
      at: new Date().toISOString(),
    };
    setMovements(prev => [movement, ...prev]);

    const nextStatus = statusOf({ ...movementTarget, currentStock: balanceAfter });
    showToast(
      `${movementLabel[movementForm.kind]} registrada em ${movementTarget.code}. Novo saldo: ${balanceAfter} ${movementTarget.unit}.`,
      nextStatus === 'Normal' ? 'success' : 'info'
    );

    if (nextStatus !== 'Normal') {
      showToast(
        `Atenção: ${movementTarget.code} ficou com estoque ${nextStatus.toLowerCase()} (mínimo ${movementTarget.minStock} ${movementTarget.unit}).`,
        'error'
      );
    }

    setMovementTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    setItems(prev => prev.filter(i => i.id !== pendingDelete.id));
    showToast(`Item ${pendingDelete.code} excluído do estoque.`, 'error');
    setPendingDelete(null);
  };

  const handleExport = () => {
    if (filteredItems.length === 0) {
      showToast('Nada para exportar com os filtros atuais.', 'error');
      return;
    }

    downloadCsv(
      `estoque-${slugify(currentCompany?.tradeName || 'copperos')}.csv`,
      ['Item', 'Codigo', 'Categoria', 'Saldo', 'Unidade', 'Minimo', 'Custo unitario', 'Valor total', 'Status'],
      filteredItems.map(i => [
        i.name,
        i.code,
        i.category,
        i.currentStock,
        i.unit,
        i.minStock,
        i.unitCost.toFixed(2).replace('.', ','),
        (i.currentStock * i.unitCost).toFixed(2).replace('.', ','),
        statusOf(i),
      ])
    );
    showToast(`${filteredItems.length} item(ns) exportado(s) em CSV.`);
  };

  const handleExportMovements = () => {
    if (historyMovements.length === 0) {
      showToast('Nenhuma movimentação registrada ainda.', 'error');
      return;
    }

    downloadCsv(
      `movimentacoes-${slugify(currentCompany?.tradeName || 'copperos')}.csv`,
      ['Data', 'Item', 'Codigo', 'Tipo', 'Quantidade', 'Saldo apos', 'Motivo', 'Usuario'],
      historyMovements.map(m => [
        new Date(m.at).toLocaleString('pt-BR'),
        m.itemName,
        m.itemCode,
        movementLabel[m.kind],
        m.quantity,
        m.balanceAfter,
        m.reason,
        m.user,
      ])
    );
    showToast(`${historyMovements.length} movimentação(ões) exportada(s).`);
  };

  const renderProductIcon = (type: EstoqueItem['imageType']) => {
    switch (type) {
      case 'screw':
        return <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-night-800 flex items-center justify-center text-xs">🔩</div>;
      case 'sheet':
        return <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-mono text-micro font-bold text-gray-700 dark:text-gray-300">2mm</div>;
      case 'rod':
        return <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold">⚡</div>;
      case 'valve':
        return <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xs">⚙️</div>;
      case 'oil':
        return <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs">🛢️</div>;
      default:
        return <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs">📦</div>;
    }
  };

  const statusBadgeClass = (status: StockStatus) =>
    status === 'Normal'
      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 border-emerald-100/60 dark:border-emerald-800/40'
      : status === 'Baixo'
      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100/60 dark:border-amber-800/40'
      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100/60 dark:border-rose-900/50';

  const rowActionsFor = (item: EstoqueItem) => [
    { label: 'Registrar entrada', icon: ArrowDownCircle, onClick: () => handleOpenMovement(item, 'ENTRADA') },
    { label: 'Registrar saída', icon: ArrowUpCircle, onClick: () => handleOpenMovement(item, 'SAIDA') },
    { label: 'Ajustar inventário', icon: ArrowRightLeft, onClick: () => handleOpenMovement(item, 'AJUSTE') },
    {
      label: 'Ver histórico',
      icon: History,
      onClick: () => {
        setHistoryItemId(item.id);
        setIsHistoryOpen(true);
      },
    },
    { label: 'Editar item', icon: Pencil, onClick: () => handleOpenEdit(item) },
    { label: 'Excluir', icon: Trash2, variant: 'danger' as const, onClick: () => setPendingDelete(item) },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Estoque
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Acompanhe o controle de estoque, movimentações e saldos em tempo real.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => {
              setHistoryItemId(null);
              setIsHistoryOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Movimentações</span>
            {movements.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 text-micro font-bold">
                {movements.length}
              </span>
            )}
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo item</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards — calculados a partir dos itens e movimentações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Itens ativos
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {summary.activeItems.toLocaleString('pt-BR')}
            </div>
            <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5">
              Cadastrados nesta unidade
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-700 dark:text-brand-400 flex items-center justify-center">
            <Package className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Valor total em estoque
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(summary.totalValue)}
            </div>
            <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5">
              Saldo x custo unitário
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-700 dark:text-brand-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'Baixo' ? 'Todos' : 'Baixo');
            setIsFilterOpen(true);
            resetToFirstPage();
          }}
          className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors hover:border-rose-300 dark:hover:border-rose-900 text-left cursor-pointer"
        >
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Itens com estoque baixo
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {summary.lowStock}
            </div>
            <div className="text-micro text-rose-500 mt-0.5">
              Clique para filtrar
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 stroke-[2]" />
          </div>
        </button>

        <div className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Movimentações hoje
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {summary.movementsToday}
            </div>
            <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5">
              {movements.length} no total da sessão
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
            <History className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Main Stock Table Container */}
      <div className="bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-night-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por item, código ou categoria..."
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
            <span className="text-gray-600 dark:text-gray-400 font-medium">Status do saldo:</span>
            {(['Todos', 'Normal', 'Baixo', 'Crítico'] as const).map((status) => (
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
                  <th className="py-3 px-4 font-normal">Item / Código</th>
                  <th className="py-3 px-4 font-normal">Categoria</th>
                  <th className="py-3 px-4 font-normal">Estoque atual</th>
                  <th className="py-3 px-4 font-normal">Unidade</th>
                  <th className="py-3 px-4 font-normal">Estoque mínimo</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal text-right">Movimentar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-night-800/60">
                {pagedItems.map((item) => {
                  const status = statusOf(item);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-night-850/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {renderProductIcon(item.imageType)}
                          <div>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="font-bold text-gray-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-400 text-left cursor-pointer"
                            >
                              {item.name}
                            </button>
                            <div className="text-micro text-gray-600 dark:text-gray-400 font-mono">
                              {item.code} • {formatCurrency(item.unitCost)}/{item.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        {item.currentStock.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                        {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                        {item.minStock}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold border ${statusBadgeClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenMovement(item, 'ENTRADA')}
                            aria-label={`Registrar entrada em ${item.code}`}
                            title="Registrar entrada"
                            className="p-1.5 rounded-lg text-brand-700 dark:text-brand-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          >
                            <ArrowDownCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenMovement(item, 'SAIDA')}
                            aria-label={`Registrar saída em ${item.code}`}
                            title="Registrar saída"
                            className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                          </button>
                          <RowActions actions={rowActionsFor(item)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {pagedItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      Nenhum item encontrado para os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedItems.map((item) => {
              const status = statusOf(item);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-gray-200 dark:border-night-800 bg-white dark:bg-night-950/60 shadow-xs hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    {renderProductIcon(item.imageType)}
                    <RowActions actions={rowActionsFor(item)} />
                  </div>
                  <div className="mt-3 text-sm font-bold text-gray-900 dark:text-white leading-snug">
                    {item.name}
                  </div>
                  <div className="text-micro font-mono text-gray-600 dark:text-gray-400 mt-0.5">
                    {item.code} • {item.category}
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                        {item.currentStock.toLocaleString('pt-BR')}
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400"> {item.unit}</span>
                      </div>
                      <div className="text-micro text-gray-500 dark:text-gray-400 mt-1">
                        mínimo {item.minStock} {item.unit}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold border ${statusBadgeClass(status)}`}>
                      {status}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-night-800 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenMovement(item, 'ENTRADA')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-700 dark:text-brand-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
                    >
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                      Entrada
                    </button>
                    <button
                      onClick={() => handleOpenMovement(item, 'SAIDA')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      Saída
                    </button>
                  </div>
                </div>
              );
            })}

            {pagedItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-gray-500 dark:text-gray-400">
                Nenhum item encontrado para os filtros atuais.
              </div>
            )}
          </div>
        )}

        <Pagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={filteredItems.length}
          itemLabel="itens"
          onPageChange={setPage}
        />
      </div>

      {/* Modal: criar / editar item */}
      {isItemModalOpen && (
        <Modal
          isOpen={isItemModalOpen}
          onClose={() => {
            setIsItemModalOpen(false);
            setEditingId(null);
          }}
          title={editingId ? 'Editar Item de Estoque' : 'Novo Item de Estoque'}
          subtitle={editingId ? `Código ${itemForm.code}` : undefined}
        >
          <form onSubmit={handleSubmitItem} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Item *
              </label>
              <input
                type="text"
                required
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Ex: Broca de Aço Rápido 8mm"
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
                  value={itemForm.code}
                  onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
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
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  placeholder="Ex: Ferramentas"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Saldo
                </label>
                <input
                  type="number"
                  min={0}
                  value={itemForm.currentStock}
                  onChange={(e) => setItemForm({ ...itemForm, currentStock: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unidade
                </label>
                <input
                  type="text"
                  value={itemForm.unit}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                  placeholder="Un, Kg, L"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mínimo
                </label>
                <input
                  type="number"
                  min={0}
                  value={itemForm.minStock}
                  onChange={(e) => setItemForm({ ...itemForm, minStock: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custo (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={itemForm.unitCost}
                  onChange={(e) => setItemForm({ ...itemForm, unitCost: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsItemModalOpen(false);
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
                {editingId ? 'Salvar Alterações' : 'Salvar Item'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: movimentação de estoque */}
      {movementTarget && (
        <Modal
          isOpen={!!movementTarget}
          onClose={() => setMovementTarget(null)}
          title="Movimentar Estoque"
          subtitle={`${movementTarget.name} • saldo atual ${movementTarget.currentStock} ${movementTarget.unit}`}
        >
          <form onSubmit={handleSubmitMovement} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2">
              {(['ENTRADA', 'SAIDA', 'AJUSTE'] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setMovementForm({ ...movementForm, kind })}
                  className={`px-3 py-2 rounded-xl border font-semibold transition-colors cursor-pointer ${
                    movementForm.kind === kind
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-brand-700 dark:text-brand-400'
                      : 'bg-gray-50 dark:bg-night-850 border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-400 hover:border-emerald-400'
                  }`}
                >
                  {movementLabel[kind]}
                </button>
              ))}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                {movementForm.kind === 'AJUSTE'
                  ? `Saldo contado (${movementTarget.unit}) *`
                  : `Quantidade (${movementTarget.unit}) *`}
              </label>
              <input
                type="number"
                required
                min={movementForm.kind === 'AJUSTE' ? 0 : 1}
                value={movementForm.quantity || ''}
                onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
              />
              {movementForm.kind === 'SAIDA' && (
                <p className="text-micro text-gray-500 dark:text-gray-400 mt-1">
                  Disponível: {movementTarget.currentStock} {movementTarget.unit}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motivo / Documento
              </label>
              <input
                type="text"
                value={movementForm.reason}
                onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                placeholder="Ex: NF-e 18291, requisição OP-221, contagem cíclica"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMovementTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold cursor-pointer"
              >
                Confirmar Movimentação
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: histórico de movimentações */}
      {isHistoryOpen && (
        <Modal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          title="Histórico de Movimentações"
          subtitle={
            historyItemId
              ? items.find(i => i.id === historyItemId)?.name
              : 'Todos os itens desta unidade'
          }
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {historyMovements.length === 0 ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                Nenhuma movimentação registrada ainda. Use os botões de entrada e saída na tabela.
              </div>
            ) : (
              <>
                <div className="border border-gray-200 dark:border-night-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-night-850 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-night-800">
                      <tr>
                        <th className="p-2.5 font-normal">Data</th>
                        <th className="p-2.5 font-normal">Item</th>
                        <th className="p-2.5 font-normal">Tipo</th>
                        <th className="p-2.5 font-normal">Qtd.</th>
                        <th className="p-2.5 font-normal">Saldo</th>
                        <th className="p-2.5 font-normal">Motivo</th>
                        <th className="p-2.5 font-normal">Usuário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-night-800/60 text-gray-700 dark:text-gray-300">
                      {historyMovements.map((m) => (
                        <tr key={m.id}>
                          <td className="p-2.5 font-mono text-micro whitespace-nowrap">
                            {new Date(m.at).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-2.5">
                            <div className="font-semibold text-gray-900 dark:text-white">{m.itemName}</div>
                            <div className="text-micro font-mono text-gray-500 dark:text-gray-400">{m.itemCode}</div>
                          </td>
                          <td className="p-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold border ${
                              m.kind === 'ENTRADA'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 border-emerald-100 dark:border-emerald-800/40'
                                : m.kind === 'SAIDA'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/40'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/40'
                            }`}>
                              {movementLabel[m.kind]}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold">
                            {m.kind === 'SAIDA' ? '-' : m.kind === 'ENTRADA' ? '+' : '='}
                            {m.quantity.toLocaleString('pt-BR')}
                          </td>
                          <td className="p-2.5">{m.balanceAfter.toLocaleString('pt-BR')}</td>
                          <td className="p-2.5 text-gray-600 dark:text-gray-400">{m.reason}</td>
                          <td className="p-2.5 text-gray-600 dark:text-gray-400">{m.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    {historyMovements.length} movimentação(ões)
                  </span>
                  <div className="flex gap-2">
                    {historyItemId && (
                      <button
                        onClick={() => setHistoryItemId(null)}
                        className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-night-850 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                      >
                        Ver todos os itens
                      </button>
                    )}
                    <button
                      onClick={handleExportMovements}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar CSV</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Excluir item de estoque"
        message={
          <>
            O item <strong>{pendingDelete?.name}</strong> ({pendingDelete?.code}) e seu saldo de{' '}
            {pendingDelete?.currentStock} {pendingDelete?.unit} serão removidos da listagem.
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

export default EstoquePage;
