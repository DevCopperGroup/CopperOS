import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
} from 'lucide-react';
import { useCopperOS } from '../context/CopperOSContext';
import { Badge } from '../components/common/Badge';

export const CompanySettingsPage: React.FC = () => {
  const { currentCompany, organization, user, updateCompany } = useCopperOS();
  const [tradeName, setTradeName] = useState(currentCompany?.tradeName || '');
  const [legalName, setLegalName] = useState(currentCompany?.legalName || '');
  const [sector, setSector] = useState(currentCompany?.sector || '');
  const [city, setCity] = useState(currentCompany?.city || '');
  const [state, setState] = useState(currentCompany?.state || '');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!currentCompany) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(currentCompany.id, {
      tradeName,
      legalName,
      sector,
      city,
      state,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/90 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-micro font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            Configurações da Entidade
          </span>
          <span className="text-xs text-gray-500">
            ID: {currentCompany.id}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Parâmetros da Empresa & Governança
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Cadastros fiscais, identificadores internos de holding e controle de permissões (RBAC).
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-brand-700 dark:text-brand-400" />
          <span className="font-medium">Configurações atualizadas com sucesso para este workspace.</span>
        </div>
      )}

      {/* Fiscal & Organizational Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-gray-200/90 shadow-card space-y-4 text-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Building2 className="w-4 h-4 text-brand-700 dark:text-brand-400" />
          <span>Identificação Fiscal & Cadastral</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nome Fantasia</label>
            <input
              type="text"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Razão Social</label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">CNPJ (Identificador Fiscal)</label>
            <input
              type="text"
              disabled
              value={currentCompany.cnpj}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-500 cursor-not-allowed"
            />
            <span className="text-micro text-gray-600 dark:text-gray-400 mt-0.5 block">Chave fiscal protegida</span>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Segmento / Setor</label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Localização (Cidade - UF)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-14 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 text-center uppercase focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* RBAC Security & Permissions Overview */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/90 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            <span>Controle de Acesso & Permissões (RBAC)</span>
          </h2>
          <Badge variant="copper">Role: {user.role}</Badge>
        </div>

        <p className="text-xs text-gray-600">
          Os usuários do grupo corporativo <span className="text-gray-900 font-semibold">{organization.name}</span> possuem privilégios segregados por perfil de governança.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-gray-900 font-bold flex items-center justify-between">
              <span>ADMIN (Executivo)</span>
              <span className="text-xs text-emerald-700 font-semibold">Acesso Total</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Pode gerenciar empresas, habilitar módulos, editar cadastros e auditar telemetria.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-gray-900 font-bold flex items-center justify-between">
              <span>MANAGER (Gerente de Unidade)</span>
              <span className="text-xs text-emerald-700 font-semibold">Operações & Relatórios</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Pode visualizar Torre de Controle, gerenciar cadastros e emitir relatórios executivos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
