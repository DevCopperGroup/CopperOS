import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  UserPlus,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Power,
  X,
  Database,
  Terminal,
} from 'lucide-react';
import { authApi, ManagedUser } from '../../services/authApi';
import { useCopperOS } from '../../context/CopperOSContext';

interface ITAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ITAdminModal: React.FC<ITAdminModalProps> = ({ isOpen, onClose }) => {
  const { companies, isDarkMode } = useCopperOS();
  const token = sessionStorage.getItem('copperos_session_auth_token') || '';

  const [activeTab, setActiveTab] = useState<'users' | 'security'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Criação de Usuário
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'OPERATOR',
    department: 'Operações',
    jobTitle: 'Analista de Operações',
    companyIds: ['emp-copper-group'],
  });

  // Modal de Redefinição de Senha
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await authApi.listUsers(token);
      setUsers(data);
    } catch (err: any) {
      console.warn('Usando lista local de contingência:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password || !createForm.fullName) return;

    try {
      await authApi.createUser(token, createForm);
      setFeedback({ type: 'success', message: `Colaborador ${createForm.fullName} provisionado com sucesso!` });
      setIsCreateOpen(false);
      setCreateForm({
        fullName: '',
        email: '',
        password: '',
        role: 'OPERATOR',
        department: 'Operações',
        jobTitle: 'Analista de Operações',
        companyIds: ['emp-copper-group'],
      });
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao provisionar usuário' });
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await authApi.updateUserStatus(token, user.id, nextStatus);
      setFeedback({
        type: 'success',
        message: `Status do usuário ${user.profile?.fullName || user.email} alterado para ${nextStatus}.`,
      });
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword) return;

    try {
      await authApi.resetUserPassword(token, selectedUserForPassword.id, newPassword);
      setFeedback({
        type: 'success',
        message: `Senha de ${selectedUserForPassword.profile?.fullName || selectedUserForPassword.email} redefinida com sucesso. Todas as sessões anteriores foram revogadas.`,
      });
      setSelectedUserForPassword(null);
      setNewPassword('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRevokeSessions = async (user: ManagedUser) => {
    if (!confirm(`Deseja revogar todas as sessões ativas de ${user.profile?.fullName || user.email}? O usuário será deslogado imediatamente.`)) return;

    try {
      const msg = await authApi.revokeUserSessions(token, user.id);
      setFeedback({ type: 'success', message: msg || 'Sessões revogadas com sucesso' });
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.profile?.fullName.toLowerCase().includes(q) ||
      u.profile?.department?.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
        isDarkMode ? 'bg-[#0B1510] border-[#162D20] text-gray-100' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        
        {/* Header do Módulo de TI */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#162D20] bg-emerald-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Centro de Controle e Gestão de TI</h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  RBAC & Provisioning
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Provisionamento de contas, revogação de acessos, papéis corporativos e segurança
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Toolbar & Abas */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-emerald-500 text-[#070F0B] shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Colaboradores ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-emerald-500 text-[#070F0B] shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Telemetria do Banco & SOC</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeTab === 'users' && (
              <>
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar colaborador ou e-mail..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#1A3324] bg-gray-50 dark:bg-[#070F0B] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#070F0B] font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provisionar Conta</span>
                </button>
              </>
            )}
            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="p-1.5 text-gray-400 hover:text-gray-200 rounded-lg border border-gray-200 dark:border-[#1A3324] hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {activeTab === 'users' ? (
            <div className="border border-gray-200 dark:border-[#162D20] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-[#0E1A14] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#162D20] font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Colaborador / Perfil</th>
                    <th className="py-3 px-4">Cargo & Departamento</th>
                    <th className="py-3 px-4">Papel (Role)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sessões</th>
                    <th className="py-3 px-4 text-right">Ações de Segurança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#162D20]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Nenhum colaborador encontrado com os critérios de busca.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs">
                              {u.profile?.fullName?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {u.profile?.fullName || 'Sem Nome'}
                              </div>
                              <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-900 dark:text-gray-200">{u.profile?.jobTitle || 'Colaborador'}</div>
                          <div className="text-[10px] text-gray-500">{u.profile?.department || 'Geral'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            u.role === 'ADMIN' || u.role === 'SUPERADMIN'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : u.role === 'MANAGER'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            }`}
                            title="Clique para alternar status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span>{u.status === 'ACTIVE' ? 'Ativo' : 'Suspenso'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] text-gray-400">
                            {u._count?.refreshTokens || 0} ativa(s)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedUserForPassword(u); setNewPassword(''); }}
                              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-200 cursor-pointer"
                              title="Redefinir Senha do Usuário"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                            <button
                              onClick={() => handleRevokeSessions(u)}
                              className="p-1.5 rounded-md hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 cursor-pointer"
                              title="Revogar Todas as Sessões Ativas (Kill Switch)"
                            >
                              <Power className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Aba de Telemetria de Segurança & Banco */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#162D20] bg-gray-50/50 dark:bg-[#0E1A14]">
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>PostgreSQL Docker</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">Conectado</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Porta 5432 • Prisma Engine v6</div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#162D20] bg-gray-50/50 dark:bg-[#0E1A14]">
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Criptografia de Sessões</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">SHA-256 Hashed</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Zero Plaintext Tokens em Disco</div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#162D20] bg-gray-50/50 dark:bg-[#0E1A14]">
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Rate Limiter & Shield</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">Ativo</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">10 req / 15 min max por IP</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-[#162D20] bg-gray-50/50 dark:bg-[#070F0B] font-mono text-xs space-y-2">
                <div className="text-emerald-400 font-semibold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>Diretrizes de Auditoria e Governança de TI</span>
                </div>
                <div className="text-gray-400 text-[11px] leading-relaxed">
                  • Toda criação de colaborador gera automaticamente registros em cascata em <code className="text-gray-200">users</code>, <code className="text-gray-200">profiles</code> e <code className="text-gray-200">user_company_access</code>.<br />
                  • Senhas nunca são trafegadas em claro ou recuperáveis, apenas redefiníveis via hash Bcrypt (salt 12).<br />
                  • O desligamento ou suspensão de um colaborador no painel revoga imediatamente todos os Refresh Tokens emitidos em qualquer dispositivo.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Provisionamento */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
              isDarkMode ? 'bg-[#0B1510] border-[#162D20] text-gray-100' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm">Provisionar Novo Colaborador</h3>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="Ex: Roberto Alencar"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#1A3324] bg-gray-50 dark:bg-[#070F0B] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="roberto@copperos.com"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#1A3324] bg-gray-50 dark:bg-[#070F0B] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Senha Temporária Inicial</label>
                  <input
                    type="text"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#1A3324] bg-gray-50 dark:bg-[#070F0B] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Cargo</label>
                    <input
                      type="text"
                      value={createForm.jobTitle}
                      onChange={(e) => setCreateForm({ ...createForm, jobTitle: e.target.value })}
                      placeholder="Diretor / Analista"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#1A3324] bg-gray-50 dark:bg-[#070F0B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Departamento</label>
                    <input
                      type="text"
                      value={createForm.department}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                      placeholder="Operações / Finanças"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#1A3324] bg-gray-50 dark:bg-[#070F0B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Nível de Permissão (Role)</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#1A3324] bg-gray-50 dark:bg-[#070F0B] focus:outline-none"
                  >
                    <option value="VIEWER">VIEWER (Apenas Leitura)</option>
                    <option value="OPERATOR">OPERATOR (Operações Diárias)</option>
                    <option value="MANAGER">MANAGER (Gestor / Relatórios)</option>
                    <option value="ADMIN">ADMIN (Administrador Completo)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-[#162D20]">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-gray-400 hover:text-gray-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#070F0B] font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Confirmar Provisionamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Redefinição de Senha */}
        {selectedUserForPassword && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl ${
              isDarkMode ? 'bg-[#0B1510] border-[#162D20] text-gray-100' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm">Redefinir Senha</h3>
                </div>
                <button onClick={() => setSelectedUserForPassword(null)} className="text-gray-400 hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-3">
                Usuário: <strong className="text-gray-200">{selectedUserForPassword.profile?.fullName || selectedUserForPassword.email}</strong>
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Nova Senha</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#1A3324] bg-gray-50 dark:bg-[#070F0B] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForPassword(null)}
                    className="px-3.5 py-1.5 text-xs text-gray-400 hover:text-gray-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#070F0B] font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Salvar Nova Senha
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
