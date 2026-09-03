import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Pencil,
  Trash2,
  Play,
  Download,
  UserPlus,
  X,
  Repeat,
  Send,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Bell,
  Check,
  RotateCcw,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { RowActions } from '../components/common/RowActions';
import { Pagination } from '../components/common/Pagination';
import { ToastStack, useToast } from '../components/common/Toast';
import { downloadCsv, slugify } from '../utils/exportFile';

type TaskPriority = 'Alta' | 'Média' | 'Baixa';
type TaskStatus = 'Pendente' | 'Em andamento' | 'Concluída';

interface TarefaItem {
  id: string;
  title: string;
  project: string;
  assignee: string;
  /** ISO (yyyy-mm-dd) para permitir ordenação e detecção de atraso. */
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  
  // ── Gestão de Rotinas Diárias do Gestor ──
  /** Define se é uma tarefa que se repete diariamente */
  isDaily?: boolean;
  /** Horário diário de envio / notificação (ex: "08:00") */
  dailyTime?: string;
  /** Se deve ser enviada somente em dias úteis (Segunda a Sexta) */
  dailyWeekdaysOnly?: boolean;
  /** Nome do gestor responsável pela atribuição da rotina */
  assignedBy?: string;
  /** Se a automação diária está ativa ou pausada */
  dailyActive?: boolean;
  /** Instruções adicionais / checklist para a execução diária */
  routineDescription?: string;
  /** Data do último disparo efetuado */
  lastDispatchedDate?: string;
}

type TarefaTab = 'Minhas tarefas' | 'Equipe' | 'Rotinas Diárias' | 'Projetos' | 'Calendário';

const PAGE_SIZE = 8;
const STORAGE_KEY = 'copperos_tasks_data';

/** Referência de "hoje" usada para atraso — só a data importa. */
const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const parseIsoDate = (iso: string) => {
  const [year, month, day] = (iso || '').split('-').map(Number);
  return new Date(year || 2026, (month || 1) - 1, day || 1);
};

const formatDate = (iso: string) => parseIsoDate(iso).toLocaleDateString('pt-BR');

const isOverdue = (task: TarefaItem) =>
  task.status !== 'Concluída' && parseIsoDate(task.dueDate) < startOfToday();

const todayIso = () => {
  const now = startOfToday();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const initialTarefas: TarefaItem[] = [
  {
    id: '1',
    title: 'Revisar pedidos de compra',
    project: 'Compras',
    assignee: 'Ana Paula',
    dueDate: '2026-09-04',
    priority: 'Alta',
    status: 'Pendente',
  },
  {
    id: '2',
    title: 'Verificar estoque de matéria-prima',
    project: 'Estoque',
    assignee: 'Carlos Lima',
    dueDate: '2026-09-05',
    priority: 'Média',
    status: 'Em andamento',
  },
  {
    id: '3',
    title: 'Relatório diário de produção e expedição',
    project: 'Produção',
    assignee: 'Você',
    dueDate: todayIso(),
    priority: 'Alta',
    status: 'Em andamento',
    isDaily: true,
    dailyTime: '08:00',
    dailyWeekdaysOnly: true,
    assignedBy: 'Carlos Alencar (Gestor Geral)',
    dailyActive: true,
    routineDescription: 'Conferir o fechamento das máquinas da manhã e validar contagem física com o sistema.',
    lastDispatchedDate: todayIso(),
  },
  {
    id: '4',
    title: 'Manutenção preventiva caminhão TRK-015',
    project: 'Frota',
    assignee: 'João Pedro',
    dueDate: '2026-09-01',
    priority: 'Alta',
    status: 'Pendente',
  },
  {
    id: '5',
    title: 'Reunião semanal de alinhamento',
    project: 'Administrativo',
    assignee: 'Você',
    dueDate: '2026-09-08',
    priority: 'Média',
    status: 'Pendente',
  },
  {
    id: '6',
    title: 'Checklist matinal de segurança e EPIs',
    project: 'Segurança & Operação',
    assignee: 'João Pedro',
    dueDate: todayIso(),
    priority: 'Alta',
    status: 'Pendente',
    isDaily: true,
    dailyTime: '07:30',
    dailyWeekdaysOnly: false,
    assignedBy: 'Gestão de Frota e Segurança',
    dailyActive: true,
    routineDescription: 'Verificar o uso de capacetes, botas e luvas antes da saída dos veículos.',
    lastDispatchedDate: todayIso(),
  },
  {
    id: '7',
    title: 'Fechamento diário de caixa e sangrias',
    project: 'Financeiro',
    assignee: 'Ana Paula',
    dueDate: todayIso(),
    priority: 'Alta',
    status: 'Concluída',
    isDaily: true,
    dailyTime: '17:00',
    dailyWeekdaysOnly: true,
    assignedBy: 'Diretoria Financeira',
    dailyActive: true,
    routineDescription: 'Auditar o saldo em dinheiro, comprovantes de cartão e conciliar com extrato bancário.',
    lastDispatchedDate: todayIso(),
  },
];

const emptyForm = {
  title: '',
  project: 'Operações',
  assignee: 'Você',
  dueDate: todayIso(),
  priority: 'Média' as TaskPriority,
  status: 'Pendente' as TaskStatus,
  isDaily: false,
  dailyTime: '08:00',
  dailyWeekdaysOnly: true,
  assignedBy: 'Gestão de Operações',
  dailyActive: true,
  routineDescription: '',
};

export const TarefasPage: React.FC = () => {
  const { currentCompany, user } = useCopperOS();
  const { toasts, showToast, dismissToast } = useToast();

  const [tasks, setTasks] = useState<TarefaItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignora erro de parse
    }
    return initialTarefas;
  });

  const [activeTab, setActiveTab] = useState<TarefaTab>('Minhas tarefas');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | TaskStatus>('Todos');
  const [priorityFilter, setPriorityFilter] = useState<'Todas' | TaskPriority>('Todas');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<TarefaItem | null>(null);
  const [reassignTarget, setReassignTarget] = useState<TarefaItem | null>(null);
  const [reassignTo, setReassignTo] = useState('');

  // Salva no localStorage a cada alteração
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Erro ao salvar tarefas no localStorage:', e);
    }
  }, [tasks]);

  const isMine = (task: TarefaItem) => task.assignee === 'Você' || task.assignee === user?.name || task.assignee === 'André Silva';

  // Tarefas com rotina diária
  const dailyRoutines = useMemo(() => tasks.filter(t => t.isDaily), [tasks]);
  const activeDailyRoutines = useMemo(() => dailyRoutines.filter(t => t.dailyActive !== false), [dailyRoutines]);

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tasks
      .filter(task => {
        const matchSearch =
          !term ||
          task.title.toLowerCase().includes(term) ||
          task.project.toLowerCase().includes(term) ||
          task.assignee.toLowerCase().includes(term) ||
          (task.assignedBy && task.assignedBy.toLowerCase().includes(term));

        const matchStatus = statusFilter === 'Todos' || task.status === statusFilter;
        const matchPriority = priorityFilter === 'Todas' || task.priority === priorityFilter;

        const matchTab =
          activeTab === 'Minhas tarefas'
            ? isMine(task)
            : activeTab === 'Equipe'
            ? !isMine(task)
            : activeTab === 'Rotinas Diárias'
            ? task.isDaily
            : true;

        return matchSearch && matchStatus && matchPriority && matchTab;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, search, statusFilter, priorityFilter, activeTab, user]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTasks.slice(start, start + PAGE_SIZE);
  }, [filteredTasks, currentPage]);

  const summary = useMemo(
    () => ({
      pending: tasks.filter(t => t.status === 'Pendente').length,
      inProgress: tasks.filter(t => t.status === 'Em andamento').length,
      highPriorityOpen: tasks.filter(t => t.status !== 'Concluída' && t.priority === 'Alta').length,
      done: tasks.filter(t => t.status === 'Concluída').length,
      overdue: tasks.filter(isOverdue).length,
      dailyCount: dailyRoutines.length,
      dailyPendingToday: dailyRoutines.filter(t => t.dueDate === todayIso() && t.status !== 'Concluída').length,
      dailyDoneToday: dailyRoutines.filter(t => t.dueDate === todayIso() && t.status === 'Concluída').length,
    }),
    [tasks, dailyRoutines]
  );

  /** Agrupamento por projeto */
  const groupedByProject = useMemo(() => {
    const groups = new Map<string, TarefaItem[]>();
    filteredTasks.forEach(task => {
      const list = groups.get(task.project) || [];
      list.push(task);
      groups.set(task.project, list);
    });
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTasks]);

  /** Agrupamento por prazo */
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, TarefaItem[]>();
    filteredTasks.forEach(task => {
      const list = groups.get(task.dueDate) || [];
      list.push(task);
      groups.set(task.dueDate, list);
    });
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTasks]);

  const resetToFirstPage = () => setPage(1);

  const handleOpenCreate = (isDailyPreset = false) => {
    setEditingId(null);
    setForm({ 
      ...emptyForm, 
      dueDate: todayIso(),
      isDaily: isDailyPreset,
      assignedBy: user?.name ? `${user.name} (Gestor)` : 'Gestão de Operações'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: TarefaItem) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      project: task.project,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      isDaily: !!task.isDaily,
      dailyTime: task.dailyTime || '08:00',
      dailyWeekdaysOnly: task.dailyWeekdaysOnly ?? true,
      assignedBy: task.assignedBy || 'Gestão de Operações',
      dailyActive: task.dailyActive ?? true,
      routineDescription: task.routineDescription || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingId) {
      setTasks(prev =>
        prev.map(task =>
          task.id === editingId
            ? {
                ...task,
                title: form.title.trim(),
                project: form.project.trim() || task.project,
                assignee: form.assignee.trim() || task.assignee,
                dueDate: form.dueDate || task.dueDate,
                priority: form.priority,
                status: form.status,
                isDaily: form.isDaily,
                dailyTime: form.isDaily ? form.dailyTime : undefined,
                dailyWeekdaysOnly: form.isDaily ? form.dailyWeekdaysOnly : undefined,
                assignedBy: form.isDaily ? form.assignedBy : undefined,
                dailyActive: form.isDaily ? form.dailyActive : undefined,
                routineDescription: form.isDaily ? form.routineDescription : undefined,
              }
            : task
        )
      );
      showToast(`Tarefa "${form.title.trim()}" atualizada.`);
    } else {
      const created: TarefaItem = {
        id: `tsk-${Date.now()}`,
        title: form.title.trim(),
        project: form.project.trim() || 'Operações',
        assignee: form.assignee.trim() || 'Você',
        dueDate: form.dueDate || todayIso(),
        priority: form.priority,
        status: form.status,
        isDaily: form.isDaily,
        dailyTime: form.isDaily ? form.dailyTime : undefined,
        dailyWeekdaysOnly: form.isDaily ? form.dailyWeekdaysOnly : undefined,
        assignedBy: form.isDaily ? form.assignedBy : undefined,
        dailyActive: form.isDaily ? true : undefined,
        routineDescription: form.isDaily ? form.routineDescription : undefined,
        lastDispatchedDate: form.isDaily ? todayIso() : undefined,
      };
      setTasks(prev => [created, ...prev]);
      
      if (created.isDaily) {
        showToast(
          `Rotina diária criada para ${created.assignee}! Envio programado às ${created.dailyTime}.`,
          'success'
        );
      } else {
        showToast(`Tarefa criada para ${created.assignee}, prazo ${formatDate(created.dueDate)}.`);
      }
      resetToFirstPage();
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const changeStatus = (task: TarefaItem, status: TaskStatus) => {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status } : t)));
    showToast(`"${task.title}" → ${status}.`, status === 'Concluída' ? 'success' : 'info');
  };

  const toggleComplete = (task: TarefaItem) => {
    changeStatus(task, task.status === 'Concluída' ? 'Em andamento' : 'Concluída');
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    setTasks(prev => prev.filter(t => t.id !== pendingDelete.id));
    showToast(`Tarefa "${pendingDelete.title}" excluída.`, 'error');
    setPendingDelete(null);
  };

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTarget || !reassignTo.trim()) return;

    setTasks(prev =>
      prev.map(t => (t.id === reassignTarget.id ? { ...t, assignee: reassignTo.trim() } : t))
    );
    showToast(`"${reassignTarget.title}" delegada para ${reassignTo.trim()}.`);
    setReassignTarget(null);
    setReassignTo('');
  };

  /** Disparo manual imediato da rotina diária pelo gestor */
  const handleDispatchRoutine = (task: TarefaItem) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
              ...t,
              dueDate: todayIso(),
              status: 'Pendente',
              lastDispatchedDate: todayIso(),
            }
          : t
      )
    );
    showToast(
      `🔔 Rotina diária disparada agora para ${task.assignee}! Tarefa de hoje gerada como pendente.`,
      'success'
    );
  };

  /** Alternar pausa ou ativação da rotina diária */
  const handleToggleDailyActive = (task: TarefaItem) => {
    const nextState = !task.dailyActive;
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, dailyActive: nextState } : t))
    );
    showToast(
      `Rotina diária "${task.title}" ${nextState ? 'ativada' : 'pausada temporariamente'}.`,
      nextState ? 'success' : 'info'
    );
  };

  const handleExport = () => {
    if (filteredTasks.length === 0) {
      showToast('Nada para exportar com os filtros atuais.', 'error');
      return;
    }

    downloadCsv(
      `tarefas-${slugify(currentCompany?.tradeName || 'copperos')}.csv`,
      ['Tarefa', 'Projeto', 'Responsavel', 'Prazo', 'Prioridade', 'Status', 'Rotina Diaria', 'Horario', 'Gestor'],
      filteredTasks.map(t => [
        t.title,
        t.project,
        t.assignee,
        formatDate(t.dueDate),
        t.priority,
        t.status,
        t.isDaily ? 'Sim' : 'Não',
        t.dailyTime || '-',
        t.assignedBy || '-',
      ])
    );
    showToast(`${filteredTasks.length} tarefa(s) exportada(s) em CSV.`);
  };

  const rowActionsFor = (task: TarefaItem) => [
    { label: 'Editar', icon: Pencil, onClick: () => handleOpenEdit(task) },
    ...(task.isDaily ? [
      {
        label: 'Disparar para Hoje',
        icon: Send,
        onClick: () => handleDispatchRoutine(task),
      },
      {
        label: task.dailyActive ? 'Pausar Rotina' : 'Ativar Rotina',
        icon: task.dailyActive ? ToggleRight : ToggleLeft,
        onClick: () => handleToggleDailyActive(task),
      },
    ] : []),
    {
      label: task.status === 'Em andamento' ? 'Voltar p/ pendente' : 'Iniciar tarefa',
      icon: Play,
      onClick: () => changeStatus(task, task.status === 'Em andamento' ? 'Pendente' : 'Em andamento'),
    },
    {
      label: task.status === 'Concluída' ? 'Reabrir' : 'Concluir',
      icon: CheckCircle2,
      onClick: () => toggleComplete(task),
    },
    {
      label: 'Delegar',
      icon: UserPlus,
      onClick: () => {
        setReassignTarget(task);
        setReassignTo(task.assignee);
      },
    },
    { label: 'Excluir', icon: Trash2, variant: 'danger' as const, onClick: () => setPendingDelete(task) },
  ];

  const statusBadgeClass = (status: TaskStatus) =>
    status === 'Em andamento'
      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-brand-400 border-emerald-100/60 dark:border-emerald-800/40'
      : status === 'Concluída'
      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100/60 dark:border-blue-800/40'
      : 'bg-gray-100 dark:bg-night-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-night-800';

  const renderTaskRow = (task: TarefaItem) => (
    <tr key={task.id} className="hover:bg-gray-50/60 dark:hover:bg-night-850/60 transition-colors">
      <td className="py-3.5 px-4">
        <input
          type="checkbox"
          checked={task.status === 'Concluída'}
          onChange={() => toggleComplete(task)}
          aria-label={`Concluir ${task.title}`}
          className="w-4 h-4 rounded text-brand-600 dark:text-brand-400 border-gray-300 focus:ring-emerald-500 cursor-pointer"
        />
      </td>
      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenEdit(task)}
              className={`text-left hover:text-brand-700 dark:hover:text-brand-400 cursor-pointer ${
                task.status === 'Concluída' ? 'line-through text-gray-500 dark:text-gray-500' : ''
              }`}
            >
              {task.title}
            </button>
            {task.isDaily && (
              <span 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                title={`Rotina diária enviada às ${task.dailyTime || '08:00'} pelo gestor ${task.assignedBy || ''}`}
              >
                <Repeat className="w-2.5 h-2.5" />
                <span>Diária ({task.dailyTime || '08:00'})</span>
              </span>
            )}
          </div>
          {task.isDaily && task.assignedBy && (
            <span className="text-[11px] text-gray-400 font-normal">
              Gestor: <strong className="text-gray-600 dark:text-gray-300">{task.assignedBy}</strong>
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">{task.project}</td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center">
            {task.assignee[0]?.toUpperCase() || 'U'}
          </div>
          <span>{task.assignee}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 font-mono text-xs">
        <span className={isOverdue(task) ? 'text-rose-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
          {task.dueDate === todayIso() ? 'Hoje' : formatDate(task.dueDate)}
        </span>
        {isOverdue(task) && (
          <span className="ml-1.5 text-micro font-semibold text-rose-500">atrasada</span>
        )}
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
        <select
          value={task.status}
          onChange={(e) => changeStatus(task, e.target.value as TaskStatus)}
          aria-label={`Status de ${task.title}`}
          className={`px-2 py-1 rounded-full text-micro font-semibold border cursor-pointer focus:outline-none focus:border-emerald-500 ${statusBadgeClass(task.status)}`}
        >
          <option value="Pendente">Pendente</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Concluída">Concluída</option>
        </select>
      </td>
      <td className="py-3.5 px-4 text-right">
        <RowActions actions={rowActionsFor(task)} />
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tarefas
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              <span>Rotinas & Automação</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize, delegue e acompanhe tarefas pontuais e rotinas diárias para a equipe.
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
            onClick={() => handleOpenCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Criar tarefa que se repete automaticamente todos os dias"
          >
            <Repeat className="w-4 h-4" />
            <span>+ Rotina Diária</span>
          </button>

          <button
            onClick={() => handleOpenCreate(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova tarefa</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 dark:border-night-800 pb-2 text-xs font-medium overflow-x-auto">
        {(['Minhas tarefas', 'Equipe', 'Rotinas Diárias', 'Projetos', 'Calendário'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              resetToFirstPage();
            }}
            className={`pb-2 transition-colors relative cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === tab
                ? 'text-brand-700 dark:text-brand-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'Rotinas Diárias' && <Repeat className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{tab}</span>
            {tab === 'Rotinas Diárias' && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-[#070F0B]">
                {summary.dailyCount}
              </span>
            )}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'Pendente' ? 'Todos' : 'Pendente');
            setIsFilterOpen(true);
            resetToFirstPage();
          }}
          className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors hover:border-emerald-300 dark:hover:border-emerald-800 text-left cursor-pointer"
        >
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Pendentes</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{summary.pending}</div>
            <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5">Clique para filtrar</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-700 dark:text-brand-400 flex items-center justify-center">
            <Clock className="w-4 h-4 stroke-[2]" />
          </div>
        </button>

        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'Em andamento' ? 'Todos' : 'Em andamento');
            setIsFilterOpen(true);
            resetToFirstPage();
          }}
          className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors hover:border-emerald-300 dark:hover:border-emerald-800 text-left cursor-pointer"
        >
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Em andamento</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{summary.inProgress}</div>
            <div className="text-micro text-gray-600 dark:text-gray-400 mt-0.5">
              {summary.highPriorityOpen} de prioridade alta
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckSquare className="w-4 h-4 stroke-[2]" />
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('Rotinas Diárias');
            resetToFirstPage();
          }}
          className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-emerald-500/20 dark:border-emerald-500/20 shadow-xs flex items-center justify-between transition-colors hover:border-emerald-500 text-left cursor-pointer"
        >
          <div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              <span>Rotinas Diárias</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {summary.dailyCount} programadas
            </div>
            <div className="text-micro text-gray-500 dark:text-gray-400 mt-0.5">
              {summary.dailyPendingToday} pendente(s) hoje
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bell className="w-4 h-4 stroke-[2]" />
          </div>
        </button>

        <div className="p-4 rounded-2xl bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Atrasadas</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{summary.overdue}</div>
            <div className="text-micro text-rose-500 mt-0.5">
              {summary.overdue > 0 ? 'Requer atenção' : 'Nada atrasado'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-night-900 border border-gray-100 dark:border-night-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-night-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar tarefa, projeto, responsável ou gestor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 dark:bg-night-850 border border-gray-200/80 dark:border-night-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer ${
              statusFilter !== 'Todos' || priorityFilter !== 'Todas' || isFilterOpen
                ? 'border-emerald-500 text-brand-700 dark:text-brand-400 bg-emerald-50/60 dark:bg-emerald-950/40 font-semibold'
                : 'border-gray-200/80 dark:border-night-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-night-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Filter Row */}
        {isFilterOpen && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-night-800 bg-gray-50/60 dark:bg-night-850/50 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Status:</span>
            {(['Todos', 'Pendente', 'Em andamento', 'Concluída'] as const).map((status) => (
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

            <span className="text-gray-600 dark:text-gray-400 font-medium ml-3">Prioridade:</span>
            {(['Todas', 'Alta', 'Média', 'Baixa'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => {
                  setPriorityFilter(priority);
                  resetToFirstPage();
                }}
                className={`px-3 py-1 rounded-xl border font-medium transition-colors cursor-pointer ${
                  priorityFilter === priority
                    ? 'bg-emerald-600 border-emerald-600 text-white font-semibold'
                    : 'bg-white dark:bg-night-900 border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-300 hover:border-emerald-500'
                }`}
              >
                {priority}
              </button>
            ))}

            <button
              onClick={() => {
                setStatusFilter('Todos');
                setPriorityFilter('Todas');
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

        {/* ── ABA: ROTINAS DIÁRIAS (VISÃO DO GESTOR) ── */}
        {activeTab === 'Rotinas Diárias' ? (
          <div className="p-4 space-y-4">
            {/* Banner explicativo do Gestor */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <Repeat className="w-4 h-4" />
                  <span>Central de Automação de Tarefas Diárias</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 max-w-2xl">
                  Configure rotinas automáticas atribuídas pelo gestor. A tarefa é enviada e cobrada diariamente para o colaborador no horário estipulado.
                </p>
              </div>

              <button
                onClick={() => handleOpenCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#070F0B] font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Rotina Diária</span>
              </button>
            </div>

            {/* Lista das Rotinas Programadas */}
            {dailyRoutines.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <Repeat className="w-8 h-8 mx-auto text-emerald-500/40" />
                <p>Nenhuma rotina diária configurada ainda.</p>
                <button
                  onClick={() => handleOpenCreate(true)}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline cursor-pointer"
                >
                  Clique aqui para criar a primeira rotina diária
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyRoutines.map((routine) => {
                  const isDoneToday = routine.dueDate === todayIso() && routine.status === 'Concluída';
                  return (
                    <div
                      key={routine.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        routine.dailyActive !== false
                          ? 'border-emerald-500/30 bg-white dark:bg-night-850 shadow-xs'
                          : 'border-gray-200 dark:border-night-800 bg-gray-50/50 dark:bg-night-900/50 opacity-70'
                      }`}
                    >
                      <div>
                        {/* Header do Card da Rotina */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-gray-900 dark:text-white">
                                {routine.title}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {routine.project}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                <Clock className="w-3.5 h-3.5" />
                                {routine.dailyTime || '08:00'}
                              </span>
                              <span>•</span>
                              <span>{routine.dailyWeekdaysOnly ? 'Dias úteis (Seg-Sex)' : 'Todos os dias'}</span>
                            </div>
                          </div>

                          {/* Toggle Ativa / Pausada */}
                          <button
                            onClick={() => handleToggleDailyActive(routine)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                              routine.dailyActive !== false
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-gray-200 dark:bg-night-800 border-gray-300 dark:border-night-700 text-gray-500'
                            }`}
                            title={routine.dailyActive !== false ? 'Clique para pausar esta rotina' : 'Clique para ativar esta rotina'}
                          >
                            {routine.dailyActive !== false ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Ativa</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" />
                                <span>Pausada</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Descrição / Instruções do Gestor */}
                        {routine.routineDescription && (
                          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-night-900 border border-gray-100 dark:border-night-800 text-[11px] text-gray-600 dark:text-gray-300 my-2.5 leading-relaxed">
                            💡 <strong>Instrução:</strong> {routine.routineDescription}
                          </div>
                        )}

                        {/* Informações de Gestor e Colaborador */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-gray-100 dark:border-night-800">
                          <div>
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 block">Colaborador (Destinatário):</span>
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white mt-0.5">
                              <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold flex items-center justify-center">
                                {routine.assignee[0]?.toUpperCase() || 'C'}
                              </div>
                              <span className="truncate">{routine.assignee}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 block">Gestor Atribuinte:</span>
                            <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="truncate">{routine.assignedBy || 'Gestão'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer do Card da Rotina */}
                      <div className="pt-3 border-t border-gray-100 dark:border-night-800 flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isDoneToday
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {isDoneToday ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span>{isDoneToday ? 'Entregue Hoje' : 'Pendente para Hoje'}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDispatchRoutine(routine)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Disparar/Reenviar notificação da tarefa para hoje imediatamente"
                          >
                            <Send className="w-3 h-3" />
                            <span>Disparar Agora</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(routine)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-night-800 hover:bg-gray-100 dark:hover:bg-night-800 text-gray-600 dark:text-gray-300 cursor-pointer"
                            title="Editar rotina"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setPendingDelete(routine)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 cursor-pointer"
                            title="Excluir rotina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'Calendário' ? (
          <div className="p-4 space-y-4">
            {groupedByDate.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400">
                Nenhuma tarefa no período com os filtros atuais.
              </div>
            )}

            {groupedByDate.map(([date, dateTasks]) => (
              <div key={date} className="rounded-2xl border border-gray-200 dark:border-night-800 overflow-hidden">
                <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-semibold ${
                  parseIsoDate(date) < startOfToday()
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    : date === todayIso()
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-gray-50 dark:bg-night-850 text-gray-700 dark:text-gray-300'
                }`}>
                  <span>
                    {parseIsoDate(date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                    })}
                    {date === todayIso() && ' • hoje'}
                  </span>
                  <span>{dateTasks.length} tarefa(s)</span>
                </div>

                <ul className="divide-y divide-gray-100 dark:divide-night-800/60">
                  {dateTasks.map(task => (
                    <li key={task.id} className="px-4 py-3 flex items-center gap-3 text-xs">
                      <input
                        type="checkbox"
                        checked={task.status === 'Concluída'}
                        onChange={() => toggleComplete(task)}
                        aria-label={`Concluir ${task.title}`}
                        className="w-4 h-4 rounded text-brand-600 dark:text-brand-400 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-gray-900 dark:text-white truncate ${
                            task.status === 'Concluída' ? 'line-through text-gray-500 dark:text-gray-500' : ''
                          }`}>
                            {task.title}
                          </span>
                          {task.isDaily && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Diária
                            </span>
                          )}
                        </div>
                        <div className="text-micro text-gray-500 dark:text-gray-400">
                          {task.project} • {task.assignee} • prioridade {task.priority.toLowerCase()}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold border ${statusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
                      <RowActions actions={rowActionsFor(task)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : activeTab === 'Projetos' ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedByProject.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-gray-500 dark:text-gray-400">
                Nenhum projeto com tarefas nos filtros atuais.
              </div>
            )}

            {groupedByProject.map(([project, projectTasks]) => {
              const done = projectTasks.filter(t => t.status === 'Concluída').length;
              const progress = Math.round((done / projectTasks.length) * 100);

              return (
                <div key={project} className="p-4 rounded-2xl border border-gray-200 dark:border-night-800 bg-white dark:bg-night-950/60">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{project}</div>
                    <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">{progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-night-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-micro text-gray-500 dark:text-gray-400 mt-1.5">
                    {done} de {projectTasks.length} concluída(s)
                    {projectTasks.filter(isOverdue).length > 0 && (
                      <span className="text-rose-500 font-semibold">
                        {' '}• {projectTasks.filter(isOverdue).length} atrasada(s)
                      </span>
                    )}
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {projectTasks.slice(0, 4).map(task => (
                      <li key={task.id} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={task.status === 'Concluída'}
                          onChange={() => toggleComplete(task)}
                          aria-label={`Concluir ${task.title}`}
                          className="w-3.5 h-3.5 rounded text-brand-600 border-gray-300 cursor-pointer"
                        />
                        <span className={`flex-1 truncate text-gray-700 dark:text-gray-300 ${
                          task.status === 'Concluída' ? 'line-through text-gray-500' : ''
                        }`}>
                          {task.title}
                        </span>
                        <span className="font-mono text-micro text-gray-500 dark:text-gray-400">
                          {formatDate(task.dueDate)}
                        </span>
                      </li>
                    ))}
                    {projectTasks.length > 4 && (
                      <li className="text-micro text-gray-500 dark:text-gray-400">
                        +{projectTasks.length - 4} tarefa(s)
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <>
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
                    <th className="py-3 px-4 font-normal text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-night-800/60">
                  {pagedTasks.map(renderTaskRow)}

                  {pagedTasks.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        Nenhuma tarefa encontrada para os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              totalItems={filteredTasks.length}
              itemLabel="tarefas"
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Modal: criar / editar tarefa */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingId(null);
          }}
          title={editingId ? 'Editar Tarefa' : form.isDaily ? 'Nova Rotina Diária' : 'Nova Tarefa'}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título da Tarefa *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Checklist matinal de segurança / Relatório diário de produção"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Projeto / Departamento
                </label>
                <input
                  type="text"
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  placeholder="Ex: Operações / Compras / Financeiro"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Colaborador Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  placeholder="Nome do colaborador (ex: João Pedro)"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* ── CARD DESTACADO: AUTOMAÇÃO DE ROTINA DIÁRIA DO GESTOR ── */}
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setForm(f => ({ ...f, isDaily: !f.isDaily }))}>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                      <span>Repetir Diariamente (Rotina Diária do Gestor)</span>
                      <span className="text-[10px] font-semibold bg-emerald-500 text-[#070F0B] px-1.5 py-0.2 rounded">
                        Novo
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      O gestor programa uma vez e a tarefa é atribuída e cobrada todos os dias
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isDaily}
                  onChange={(e) => setForm({ ...form, isDaily: e.target.checked })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

              {form.isDaily && (
                <div className="pt-3 border-t border-emerald-500/20 space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ⏰ Horário Diário de Envio / Notificação
                      </label>
                      <input
                        type="time"
                        value={form.dailyTime}
                        onChange={(e) => setForm({ ...form, dailyTime: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-night-800 bg-white dark:bg-night-900 text-gray-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                        📅 Frequência de Disparo
                      </label>
                      <select
                        value={form.dailyWeekdaysOnly ? 'weekdays' : 'all'}
                        onChange={(e) => setForm({ ...form, dailyWeekdaysOnly: e.target.value === 'weekdays' })}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-night-800 bg-white dark:bg-night-900 text-gray-900 dark:text-white"
                      >
                        <option value="weekdays">Dias úteis (Segunda a Sexta)</option>
                        <option value="all">Todos os dias (Inclui Fim de Semana)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      🛡️ Gestor Responsável pela Atribuição
                    </label>
                    <input
                      type="text"
                      value={form.assignedBy}
                      onChange={(e) => setForm({ ...form, assignedBy: e.target.value })}
                      placeholder="Ex: Carlos Alencar (Gestor Operacional)"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-night-800 bg-white dark:bg-night-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      📝 Instruções Diárias / Procedimento para o Colaborador
                    </label>
                    <textarea
                      rows={2}
                      value={form.routineDescription}
                      onChange={(e) => setForm({ ...form, routineDescription: e.target.value })}
                      placeholder="Ex: Realizar a contagem até às 09h e validar com os relatórios de expedição..."
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-night-800 bg-white dark:bg-night-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Inicial / Prazo
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status Inicial
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-night-800">
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
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold cursor-pointer shadow-xs"
              >
                {editingId ? 'Salvar Alterações' : form.isDaily ? 'Salvar Rotina Diária' : 'Salvar Tarefa'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: delegar tarefa */}
      {reassignTarget && (
        <Modal
          isOpen={!!reassignTarget}
          onClose={() => setReassignTarget(null)}
          title="Delegar Tarefa"
          subtitle={reassignTarget.title}
          maxWidth="sm"
        >
          <form onSubmit={handleReassign} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Novo responsável *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                placeholder="Ex: Beatriz Lima"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-200 dark:border-night-800 text-gray-900 dark:text-white"
              />
              <p className="text-micro text-gray-500 dark:text-gray-400 mt-1">
                Atualmente com {reassignTarget.assignee}.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReassignTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold cursor-pointer"
              >
                Delegar
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Excluir tarefa"
        message={
          <>
            A tarefa <strong>{pendingDelete?.title}</strong> ({pendingDelete?.project}) será removida
            do quadro. Esta ação não pode ser desfeita.
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

export default TarefasPage;
