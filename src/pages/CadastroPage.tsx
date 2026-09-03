import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  UploadCloud, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { Modal } from '../components/common/Modal';

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

export const CadastroPage: React.FC = () => {
  const { currentCompany } = useCopperOS();
  const [activeTab, setActiveTab] = useState<'Itens' | 'Pessoas' | 'Fornecedores' | 'Departamentos' | 'Locais'>('Itens');
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [items, setItems] = useState<RegistroItem[]>(initialRegistros);

  const [newItem, setNewItem] = useState({
    name: '',
    code: '',
    category: 'Fixadores',
    type: 'Material' as RegistroItem['type'],
    status: 'Ativo' as const
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.code.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
      if (activeTab === 'Itens') return matchSearch && (item.type === 'Material' || item.type === 'Equipamento');
      if (activeTab === 'Pessoas') return matchSearch && item.type === 'Pessoa';
      if (activeTab === 'Fornecedores') return matchSearch && item.type === 'Fornecedor';
      if (activeTab === 'Departamentos') return matchSearch && item.type === 'Departamento';
      if (activeTab === 'Locais') return matchSearch && item.type === 'Local';
      return matchSearch;
    });
  }, [items, search, activeTab]);

  const handleOpenModal = () => {
    let defaultType: RegistroItem['type'] = 'Material';
    let defaultCategory = 'Fixadores';
    let defaultPrefix = 'ITM';

    if (activeTab === 'Pessoas') {
      defaultType = 'Pessoa';
      defaultCategory = 'Operações';
      defaultPrefix = 'PES';
    } else if (activeTab === 'Fornecedores') {
      defaultType = 'Fornecedor';
      defaultCategory = 'Materiais';
      defaultPrefix = 'FOR';
    } else if (activeTab === 'Departamentos') {
      defaultType = 'Departamento';
      defaultCategory = 'Administrativo';
      defaultPrefix = 'DEP';
    } else if (activeTab === 'Locais') {
      defaultType = 'Local';
      defaultCategory = 'Galpão';
      defaultPrefix = 'LOC';
    }

    setNewItem({
      name: '',
      code: `${defaultPrefix}-000${items.length + 1}`,
      category: defaultCategory,
      type: defaultType,
      status: 'Ativo'
    });
    setIsNewModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    let iconType: RegistroItem['iconType'] = 'screw';
    if (newItem.type === 'Pessoa') iconType = 'avatar1';
    else if (newItem.type === 'Fornecedor') iconType = 'supplier1';
    else if (newItem.type === 'Departamento') iconType = 'dept1';
    else if (newItem.type === 'Local') iconType = 'location1';

    const created: RegistroItem = {
      id: Date.now().toString(),
      name: newItem.name,
      code: newItem.code || `REG-000${items.length + 1}`,
      category: newItem.category,
      type: newItem.type,
      status: newItem.status,
      lastUpdated: 'Agora mesmo',
      iconType
    };

    setItems([created, ...items]);
    setIsNewModalOpen(false);
  };

  const renderIcon = (type: RegistroItem['iconType'], name: string) => {
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
          <button 
            onClick={() => alert('Função de importação CSV/XLS ativada')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Importar</span>
          </button>

          <button 
            onClick={handleOpenModal}
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
            onClick={() => setActiveTab(tab)}
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 dark:bg-night-850 border border-gray-200/80 dark:border-night-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-night-800 rounded-xl border border-gray-200/80 dark:border-night-800 transition-colors cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              <span>Filtros</span>
            </button>
            <div className="flex items-center bg-gray-50 dark:bg-night-850 border border-gray-200/80 dark:border-night-800 rounded-xl p-0.5">
              <button className="p-1 rounded-lg bg-white dark:bg-night-800 text-gray-700 dark:text-white shadow-xs">
                <List className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-night-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
                <th className="py-3 px-4 font-normal">Nome / Código</th>
                <th className="py-3 px-4 font-normal">Categoria</th>
                <th className="py-3 px-4 font-normal">Tipo</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 font-normal">Última atualização</th>
                <th className="py-3 px-4 font-normal text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-night-800/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-night-850/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {renderIcon(item.iconType, item.name)}
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </div>
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
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 border border-emerald-100/60 dark:border-emerald-800/40">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {item.lastUpdated}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-night-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div>
            Mostrando 1 a {filteredItems.length} de {filteredItems.length} {activeTab.toLowerCase()}
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <button className="p-1 rounded text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 font-bold flex items-center justify-center">
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
              26
            </button>
            <button className="p-1 rounded text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Novo Registro */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Novo Registro"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Item ou Pessoa *
              </label>
              <input
                type="text"
                required
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Ex: Parafuso Sextavado M12"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código (Opcional)
                </label>
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
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
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="Ex: Fixadores"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
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
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Salvar Registro
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CadastroPage;
