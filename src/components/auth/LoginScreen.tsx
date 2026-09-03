import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  KeyRound,
  Info,
} from 'lucide-react';
import { ConstellationField } from '../ui/ConstellationField';
import { useCopperOS } from '../../context/CopperOSContext';
import { authApi } from '../../services/authApi';
import type { User } from '../../types';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { loginSession } = useCopperOS();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hidden Honeypot trap to detect automated bot scripts
  const [honeypot, setHoneypot] = useState('');

  // Transition stage
  const [transitionStage, setTransitionStage] = useState<'idle' | 'offwhite_loader'>('idle');

  // Anti-Brute Force Protection Vault State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutSeconds]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMessage('');

    if (honeypot.trim()) {
      setErrorMessage('Acesso negado: Detecção de bot / script não autorizado.');
      return;
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanIdentifier) {
      setErrorMessage('Autenticação Rejeitada: Insira o e-mail corporativo autorizado.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Autenticação Rejeitada: A chave de acesso é obrigatória.');
      return;
    }

    setIsLoading(true);

    try {
      // A API é a única autoridade de autenticação: sem access token emitido
      // pelo servidor, não existe sessão.
      const loginData = await authApi.login(cleanIdentifier, cleanPassword);

      if (!loginData.accessToken) {
        handleFailedAttempt('Resposta de autenticação inválida do servidor.');
        return;
      }

      completeSuccessfulLogin(loginData.accessToken, loginData.user);
    } catch (apiError: any) {
      handleFailedAttempt(apiError?.message || 'Credenciais inválidas');
    }
  };

  const completeSuccessfulLogin = (
    accessToken: string,
    user?: { id: string; email: string; name?: string; role?: string }
  ) => {
    loginSession(accessToken, user as Partial<User> | undefined);
    setFailedAttempts(0);
    setIsLoading(false);
    setTransitionStage('offwhite_loader');

    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/hub');
      }
    }, 1200);
  };

  const handleFailedAttempt = (customMessage?: string) => {
    const nextFails = failedAttempts + 1;
    setFailedAttempts(nextFails);
    setIsLoading(false);

    if (nextFails >= 3) {
      setLockoutSeconds(45);
      setErrorMessage('Muitas tentativas. Acesso bloqueado por 45 segundos por segurança.');
    } else {
      setErrorMessage(customMessage || `Credenciais inválidas. Tentativa ${nextFails} de 3.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-night-950 flex select-none font-sans antialiased overflow-hidden">
      {/* Transição Minimalista pós-login */}
      {transitionStage !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="absolute w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-700 ease-out">
            <div className="relative">
              <div className="absolute -inset-3 bg-emerald-400/20 rounded-3xl blur-2xl animate-pulse" />
              <svg 
                viewBox="0 0 64 64" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-16 h-16 transform transition-all duration-700"
              >
                <rect 
                  x="10" 
                  y="14" 
                  width="38" 
                  height="38" 
                  rx="9" 
                  stroke="#10B981" 
                  strokeWidth="4.5"
                  className="animate-pulse"
                />
                <rect 
                  x="20" 
                  y="24" 
                  width="18" 
                  height="18" 
                  rx="4" 
                  fill="#10B981" 
                  fillOpacity="0.08"
                />
                <circle cx="53" cy="11" r="4.5" fill="#10B981" />
                <circle cx="53" cy="11" r="7" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.4" className="animate-ping" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">CopperOS</h2>
              <p className="text-micro font-mono tracking-[0.25em] text-brand-700 uppercase font-semibold">
                SISTEMA OPERACIONAL
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Esquerdo (Constellation Field WebGL) */}
      <div className="hidden lg:flex lg:w-1/2 bg-night-950 border-r border-night-800 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ConstellationField
            background="#070F0B"
            baseColor="#34D399"
            accentColor="#34D399"
            density={95}
            dotSize={115}
            speed={45}
            hover={120}
            linkDistance={155}
            network={{ lineWidth: 110, halo: 250, pulse: 100 }}
          />
        </div>

        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-night-950/80 via-transparent to-night-950/40 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-mono tracking-widest text-brand-400 uppercase font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            COPPER GROUP ENTERPRISE SECURITY
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl border-3 border-brand-400 flex items-center justify-center relative bg-night-900/80 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.35),0_8px_20px_rgba(0,0,0,0.8)]">
            <span className="w-5 h-5 border-2 border-brand-400/70 rounded-xs block" />
            <span className="w-3 h-3 rounded-full bg-brand-500 absolute -top-1.5 -right-1.5 ring-4 ring-night-950 shadow-[0_0_12px_#10B981]" />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              CopperOS
            </h1>
            <p className="text-sm font-bold tracking-wider text-brand-400 uppercase mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Sistema Operacional da Empresa
            </p>
          </div>

          <p className="text-sm text-white/90 leading-relaxed font-medium drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
            Acesso restrito e criptografado. Todas as conexões são auditadas e validadas pelo Centro de Operações de Segurança (SOC).
          </p>

          <div className="p-3.5 rounded-xl bg-night-900/90 border border-night-700 text-xs font-mono space-y-1.5 shadow-inner">
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>DIRETRIZES DE AUTENTICAÇÃO ATIVAS</span>
            </div>
            <div className="text-gray-400 grid grid-cols-2 gap-x-2 gap-y-1 text-micro">
              <div>• Banco: <strong className="text-gray-200">PostgreSQL (Prisma)</strong></div>
              <div>• Tokens: <strong className="text-gray-200">JWT + HttpOnly Cookie</strong></div>
              <div>• Senhas: <strong className="text-gray-200">Bcrypt (Salt 12)</strong></div>
              <div>• Sessões: <strong className="text-gray-200">Rotação + revogação</strong></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-night-900/90 backdrop-blur-md border border-brand-400/40 text-xs font-mono text-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.2),0_4px_12px_rgba(0,0,0,0.8)]">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="font-semibold">ACESSO RESTRITO A COLABORADORES</span>
          </div>
        </div>
      </div>

      {/* Painel Direito do Formulário de Login */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto my-auto space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-micro font-semibold font-mono text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                ACESSO CORPORATIVO RESTRITO
              </span>
              <span className="text-micro font-mono text-gray-600">
                PORTA: 3333
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Autenticação Corporativa
            </h2>
            <p className="text-xs text-gray-500">
              Informe seu e-mail e chave de acesso segura do CopperOS
            </p>
          </div>

          {/* Bloqueio por tentativas */}
          {lockoutSeconds > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-800 flex items-start space-x-2.5 animate-in fade-in duration-200">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Terminal Bloqueado por Segurança</strong>
                <span>Múltiplas falhas detectadas. Aguarde <strong>{lockoutSeconds}s</strong>.</span>
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {errorMessage && lockoutSeconds === 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input 
              type="text" 
              name="copper_bot_check" 
              value={honeypot} 
              onChange={(e) => setHoneypot(e.target.value)} 
              className="hidden" 
              tabIndex={-1} 
              autoComplete="off" 
            />

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-900 flex items-center justify-between">
                <span>E-mail Corporativo</span>
                <span className="text-micro font-mono text-gray-600">@copperos.com</span>
              </label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@copperos.com"
                disabled={isLoading || lockoutSeconds > 0}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all font-mono"
                autoComplete="email"
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-900 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                  <span>Chave de Acesso (Senha)</span>
                </label>
                <span className="text-micro font-mono text-brand-700">
                  Bcrypt
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading || lockoutSeconds > 0}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all pr-10 font-mono tracking-wider"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs text-gray-500">Manter conectado (Refresh Token)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 text-night-900 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer group"
            >
              {isLoading ? (
                <span>Validando no Servidor...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Autenticar com Segurança Máxima</span>
                </>
              )}
            </button>

            {/* Informação sobre provisionamento de contas */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start space-x-2">
              <Info className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
              <span>
                Novas credenciais são provisionadas exclusivamente pelo <strong>Time de TI</strong> dentro do Hub de Administração.
              </span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 space-y-1">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Copper Group Enterprise. Uso interno autorizado.
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginScreen;
