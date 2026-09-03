import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  AlertTriangle,
  History
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { Modal } from '../components/common/Modal';

interface EstoqueItem {
  id: string;
  name: string;
  code: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  status: 'Normal' | 'Baixo' | 'Crítico';
  imageType: 'screw' | 'sheet' | 'rod' | 'valve' | 'oil';
}

const initialEstoque: EstoqueItem[] = [
  {
    id: '1',
    name: 'Parafuso Sextavado M10',
    code: 'ITM-0001',
    category: 'Fixadores',
    currentStock: 2450,
    unit: 'Un',
    minStock: 500,
    status: 'Normal',
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
    status: 'Normal',
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
    status: 'Baixo',
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
    status: 'Normal',
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
    status: 'Normal',
    imageType: 'oil'
  }
];

export const EstoquePage: React.FC = () => {
  const { currentCompany } = useCopperOS();
  const [items, setItems] = useState<EstoqueItem[]>(initialEstoque);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    code: '',
    category: 'Fixadores',
    currentStock: 100,
    unit: 'Un',
    minStock: 50
  });

  const renderProductIcon = (type: EstoqueItem['imageType']) => {
    switch (type) {
      case 'screw':
        return <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#16291E] flex items-center justify-center text-xs">🔩</div>;
      case 'sheet':
        return <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-mono text-[10px] font-bold text-gray-700 dark:text-gray-300">2mm</div>;
      case 'rod':
        return <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold">⚡</div>;
      case 'valve':
        return <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xs">⚙️</div>;
      case 'oil':
        return <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs">🛢️</div>;
      default:
        return <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">📦</div>;
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    const created: EstoqueItem = {
      id: Date.now().toString(),
      name: newItem.name,
      code: newItem.code || `ITM-000${items.length + 1}`,
      category: newItem.category,
      currentStock: Number(newItem.currentStock),
      unit: newItem.unit,
      minStock: Number(newItem.minStock),
      status: Number(newItem.currentStock) < Number(newItem.minStock) ? 'Baixo' : 'Normal',
      imageType: 'screw'
    };

    setItems([created, ...items]);
    setIsModalOpen(false);
  };

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
            onClick={() => alert('Abrindo histórico de movimentações')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0A140F] border border-gray-200 dark:border-[#16291E] hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
            <span>Movimentações</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo item</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Itens ativos
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              1.248
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              +18 este mês
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Package className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Valor total em estoque
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              R$ 2.456.789,00
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              +12,4% este mês
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Itens com estoque baixo
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              32
            </div>
            <div className="text-[10px] text-rose-500 mt-0.5">
              +5 desde ontem
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Movimentações hoje
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              156
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              +8,2% vs ontem
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
            <History className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Main Stock Table Container */}
      <div className="bg-white dark:bg-[#0A140F] border border-gray-100 dark:border-[#16291E] rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-[#16291E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por item, código ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 dark:bg-[#0E1A14] border border-gray-200/80 dark:border-[#16291E] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#16291E] rounded-xl border border-gray-200/80 dark:border-[#16291E] transition-colors cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Filtros</span>
            </button>
            <div className="flex items-center bg-gray-50 dark:bg-[#0E1A14] border border-gray-200/80 dark:border-[#16291E] rounded-xl p-0.5">
              <button className="p-1 rounded-lg bg-white dark:bg-[#16291E] text-gray-700 dark:text-white shadow-xs">
                <List className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white">
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#16291E] text-gray-400 dark:text-gray-500 text-[11px] font-medium">
                <th className="py-3 px-4 font-normal">Item / Código</th>
                <th className="py-3 px-4 font-normal">Categoria</th>
                <th className="py-3 px-4 font-normal">Estoque atual</th>
                <th className="py-3 px-4 font-normal">Unidade</th>
                <th className="py-3 px-4 font-normal">Estoque mínimo</th>
                <th className="py-3 px-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#16291E]/60">
              {items
                .filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()))
                .map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-[#0E1A14]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {renderProductIcon(item.imageType)}
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                          {item.code}
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'Normal' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-800/40' 
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-800/40'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-[#16291E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-gray-400">
          <div>
            Mostrando 1 a 5 de 249 itens
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <button className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center">
              1
            </button>
            <button className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              2
            </button>
            <button className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              3
            </button>
            <button className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              4
            </button>
            <button className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              5
            </button>
            <span>...</span>
            <button className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              50
            </button>
            <button className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New Item Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Novo Item de Estoque"
        >
          <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Item *
              </label>
              <input
                type="text"
                required
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Ex: Broca de Aço Rápido 8mm"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0E1A14] border border-gray-200 dark:border-[#16291E] text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  placeholder="Ex: ITM-0006"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0E1A14] border border-gray-200 dark:border-[#16291E] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="Ex: Ferramentas"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0E1A14] border border-gray-200 dark:border-[#16291E] text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  value={newItem.currentStock}
                  onChange={(e) => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0E1A14] border border-gray-200 dark:border-[#16291E] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unidade
                </label>
                <input
                  type="text"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="Un, Kg, L"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0E1A14] border border-gray-200 dark:border-[#16291E] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0E1A14] border border-gray-200 dark:border-[#16291E] text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#16291E] text-gray-600 dark:text-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Salvar Item
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EstoquePage;
