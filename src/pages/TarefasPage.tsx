import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  CheckSquare
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { Modal } from '../components/common/Modal';

interface TarefaItem {
  id: string;
  title: string;
  project: string;
  assignee: string;
  dueDate: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Pendente' | 'Em andamento' | 'Concluída';
  completed: boolean;
}

const initialTarefas: TarefaItem[] = [
  {
    id: '1',
    title: 'Revisar pedidos de compra',
    project: 'Compras',
    assignee: 'Ana Paula',
    dueDate: '27/05/2025',
    priority: 'Alta',
    status: 'Pendente',
    completed: false,
  },
  {
    id: '2',
    title: 'Verificar estoque de matéria-prima',
    project: 'Estoque',
    assignee: 'Carlos Lima',
    dueDate: '27/05/2025',
    priority: 'Média',
    status: 'Em andamento',
    completed: false,
  },
  {
    id: '3',
    title: 'Relatório diário de produção',
    project: 'Produção',
    assignee: 'Você',
    dueDate: '27/05/2025',
    priority: 'Baixa',
    status: 'Em andamento',
    completed: false,
  },
  {
    id: '4',
    title: 'Manutenção caminhão TRK-015',
    project: 'Frota',
    assignee: 'João Pedro',
    dueDate: '26/05/2025',
    priority: 'Alta',
    status: 'Pendente',
    completed: false,
  },
  {
    id: '5',
    title: 'Reunião semanal de alinhamento',
    project: 'Administrativo',
    assignee: 'Você',
    dueDate: '26/05/2025',
    priority: 'Média',
    status: 'Pendente',
    completed: false,
  },
];

export const TarefasPage: React.FC = () => {
  const { currentCompany } = useCopperOS();
  const [tasks, setTasks] = useState<TarefaItem[]>(initialTarefas);
  const [activeTab, setActiveTab] = useState<'Minhas tarefas' | 'Equipe' | 'Projetos' | 'Calendário'>('Minhas tarefas');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    project: 'Compras',
    assignee: 'Você',
    dueDate: '28/05/2025',
    priority: 'Média' as const
  });

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          status: nextCompleted ? 'Concluída' : 'Em andamento'
        };
      }
      return t;
    }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const created: TarefaItem = {
      id: Date.now().toString(),
      title: newTask.title,
      project: newTask.project,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: 'Pendente',
      completed: false
    };

    setTasks([created, ...tasks]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tarefas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize, delegue e acompanhe tarefas e atividades.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('Visualização em calendário')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-night-900 border border-gray-200 dark:border-night-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Ver calendário</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova tarefa</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 dark:border-night-800 pb-2 text-xs font-medium">
        {(['Minhas tarefas', 'Equipe', 'Projetos', 'Calendário'] as const).map((tab) => (
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

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Pendentes
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              18
            </div>
            <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5">
              +5 hoje
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-700 dark:text-brand-400 flex items-center justify-center">
            <Clock className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Em andamento
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              7
            </div>
            <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5">
              3 prioridades
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckSquare className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Concluídas hoje
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              12
            </div>
            <div className="text-micro text-brand-700 dark:text-brand-400 mt-0.5">
              +20% vs ontem
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-700 dark:text-brand-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Atrasadas
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              3
            </div>
            <div className="text-micro text-rose-500 mt-0.5">
              Requer atenção
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-night-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar tarefa..."
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
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-night-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
                <th className="py-3 px-4 font-normal w-12"></th>
                <th className="py-3 px-4 font-normal">Tarefa</th>
                <th className="py-3 px-4 font-normal">Projeto</th>
                <th className="py-3 px-4 font-normal">Responsável</th>
                <th className="py-3 px-4 font-normal">Prazo</th>
                <th className="py-3 px-4 font-normal">Prioridade</th>
                <th className="py-3 px-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-night-800/60">
              {tasks
                .filter(t => {
                  const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                                      t.project.toLowerCase().includes(search.toLowerCase()) ||
                                      t.assignee.toLowerCase().includes(search.toLowerCase());
                  if (activeTab === 'Minhas tarefas') return matchSearch && (t.assignee === 'Você' || t.assignee === 'André Silva');
                  if (activeTab === 'Equipe') return matchSearch && t.assignee !== 'Você';
                  return matchSearch;
                })
                .map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/60 dark:hover:bg-night-850/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                      className="w-4 h-4 rounded text-brand-600 dark:text-brand-400 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                    <span className={task.completed ? 'line-through text-gray-600 dark:text-gray-400' : ''}>
                      {task.title}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                    {task.project}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                    {task.assignee}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {task.dueDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-medium ${
                      task.priority === 'Alta' 
                        ? 'text-rose-500 font-semibold' 
                        : task.priority === 'Média'
                        ? 'text-amber-500 font-semibold'
                        : 'text-gray-500'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold ${
                      task.status === 'Em andamento'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 border border-emerald-100/60 dark:border-emerald-800/40'
                        : task.status === 'Concluída'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-800/40'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-night-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div>
            Mostrando 1 a 5 de 28 tarefas
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
              6
            </button>
            <button className="p-1 rounded text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nova Tarefa"
        >
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título da Tarefa *
              </label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Ex: Auditoria interna de estoque"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Projeto
                </label>
                <input
                  type="text"
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prazo
                </label>
                <input
                  type="text"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Salvar Tarefa
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TarefasPage;
