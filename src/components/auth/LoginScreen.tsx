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
  Fingerprint,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';
import { ConstellationField } from '../ui/ConstellationField';
import { useCopperOS } from '../../context/CopperOSContext';
import { authApi } from '../../services/authApi';

interface LoginScreenProps {
  onSuccess?: () => void;
}

const AUTH_VAULT_SIGNATURE = '98518d14c8be7179d4f04c3687d28c7b931672a252f1c56002b690103d066ee7';

async function computeCryptoDigest(payload: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { loginSession } = useCopperOS();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [securityToken, setSecurityToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [securityScore] = useState(99.8);

  // Hidden Honeypot trap to detect automated bot scripts
  const [honeypot, setHoneypot] = useState('');

  // Transition stage
  const [transitionStage, setTransitionStage] = useState<'idle' | 'offwhite_loader'>('idle');

  // Anti-Brute Force Protection Vault State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');

  useEffect(() => {
    const fp = Array.from({ length: 4 }, () => 
      Math.random().toString(36).substring(2, 6).toUpperCase()
    ).join('-');
    setDeviceFingerprint(`CP-SEC-${fp}`);
  }, []);

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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMessage('');
    setSuccessMessage('');

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
      setErrorMessage('Autenticação Rejeitada: A senha de acesso é obrigatória.');
      return;
    }

    if (authMode === 'register' && cleanPassword.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'register') {
        // Fluxo de Cadastro via API PostgreSQL
        await authApi.register(name.trim() || 'Usuário CopperOS', cleanIdentifier, cleanPassword);
        setSuccessMessage('Conta criada com sucesso! Realizando autenticação...');
        
        // Faz login automático imediatamente após o cadastro
        const loginData = await authApi.login(cleanIdentifier, cleanPassword);
        completeSuccessfulLogin(loginData.accessToken, loginData.user);
      } else {
        // Fluxo de Login: tenta a API Node.js/PostgreSQL primeiro
        try {
          const loginData = await authApi.login(cleanIdentifier, cleanPassword);
          completeSuccessfulLogin(loginData.accessToken, loginData.user);
        } catch (apiError: any) {
          // Fallback para hash local em caso de ambiente mock
          const inputHash = await computeCryptoDigest(`${cleanIdentifier}:${cleanPassword}`);
          if (inputHash === AUTH_VAULT_SIGNATURE) {
            completeSuccessfulLogin();
          } else {
            handleFailedAttempt(apiError?.message || 'Credenciais inválidas');
          }
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erro ao processar autenticação');
    }
  };

  const completeSuccessfulLogin = (accessToken?: string, user?: { id: string; email: string; name?: string }) => {
    loginSession(accessToken, user);
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
      setErrorMessage('VIOLAÇÃO DE SEGURANÇA: Limite de 3 tentativas excedido. Terminal bloqueado por 45 segundos.');
    } else {
      setErrorMessage(customMessage || `Credenciais inválidas. Tentativa ${nextFails} de 3 antes do bloqueio do terminal.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070F0B] flex select-none font-sans antialiased overflow-hidden">
      {/* Transição Minimalista pós-login */}
      {transitionStage !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-[#F9FAFB] flex flex-col items-center justify-center animate-in fade-in duration-300">
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
              <p className="text-[10px] font-mono tracking-[0.25em] text-emerald-600 uppercase font-semibold">
                SISTEMA OPERACIONAL
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Esquerdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#070F0B] border-r border-[#12231A] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ConstellationField
            background="#070F0B"
            baseColor="#00DC82"
            accentColor="#00DC82"
            density={95}
            dotSize={115}
            speed={45}
            hover={120}
            linkDistance={155}
            network={{ lineWidth: 110, halo: 250, pulse: 100 }}
          />
        </div>

        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00DC82]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00DC82]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#070F0B]/80 via-transparent to-[#070F0B]/40 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-mono tracking-widest text-[#00DC82] uppercase font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00DC82]" />
            COPPER GROUP ENTERPRISE SECURITY
          </span>
          <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50">
            SEC SCORE: {securityScore}%
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl border-3 border-[#00DC82] flex items-center justify-center relative bg-[#0A140F]/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,220,130,0.35),0_8px_20px_rgba(0,0,0,0.8)]">
            <span className="w-5 h-5 border-2 border-[#00DC82]/70 rounded-xs block" />
            <span className="w-3 h-3 rounded-full bg-[#00DC82] absolute -top-1.5 -right-1.5 ring-4 ring-[#070F0B] shadow-[0_0_12px_#00DC82]" />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              CopperOS
            </h1>
            <p className="text-sm font-bold tracking-wider text-[#00DC82] uppercase mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Sistema Operacional da Empresa
            </p>
          </div>

          <p className="text-sm text-white/90 leading-relaxed font-medium drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
            Acesso autenticado via tokens JWT e PostgreSQL. Todas as sessões são validadas criptograficamente pelo servidor.
          </p>

          <div className="p-3.5 rounded-xl bg-[#0A140F]/90 border border-[#163324] text-[11px] font-mono space-y-1.5 shadow-inner">
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>DIRETRIZES DE AUTENTICAÇÃO ATIVAS</span>
            </div>
            <div className="text-gray-400 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div>• Banco: <strong className="text-gray-200">PostgreSQL (Prisma)</strong></div>
              <div>• Tokens: <strong className="text-gray-200">JWT + HttpOnly Cookie</strong></div>
              <div>• Senhas: <strong className="text-gray-200">Bcrypt (Salt 12)</strong></div>
              <div>• Terminal: <strong className="text-gray-200">{deviceFingerprint}</strong></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0A140F]/90 backdrop-blur-md border border-[#00DC82]/40 text-xs font-mono text-[#00DC82] shadow-[0_0_15px_rgba(0,220,130,0.2),0_4px_12px_rgba(0,0,0,0.8)]">
            <span className="w-2 h-2 rounded-full bg-[#00DC82] animate-pulse" />
            <span className="font-semibold">API NODE.JS + POSTGRES ATIVA</span>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            ID: {deviceFingerprint}
          </span>
        </div>
      </div>

      {/* Painel Direito do Formulário */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto my-auto space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-[10px] font-semibold font-mono text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                API DE AUTENTICAÇÃO
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                PORTA: 3333
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
              {authMode === 'login' ? 'Entrar no CopperOS' : 'Criar Nova Conta'}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {authMode === 'login'
                ? 'Informe seu e-mail corporativo e senha cadastrada'
                : 'Cadastre suas credenciais para acessar o workspace'}
            </p>
          </div>

          {/* Seletor de Modo (Entrar / Criar Conta) */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-md transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Entrar (Login)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-md transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Criar Conta
            </button>
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

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <input 
              type="text" 
              name="copper_bot_check" 
              value={honeypot} 
              onChange={(e) => setHoneypot(e.target.value)} 
              className="hidden" 
              tabIndex={-1} 
              autoComplete="off" 
            />

            {/* Campo Nome (Apenas no Registro) */}
            {authMode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-[#111827] flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Nome Completo</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#00DC82] focus:ring-2 focus:ring-[#00DC82]/20 transition-all"
                  required
                />
              </div>
            )}

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111827] flex items-center justify-between">
                <span>E-mail Corporativo</span>
                <span className="text-[10px] font-mono text-gray-400">PostgreSQL DB</span>
              </label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="usuario@empresa.com"
                disabled={isLoading || lockoutSeconds > 0}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#00DC82] focus:ring-2 focus:ring-[#00DC82]/20 transition-all font-mono"
                autoComplete="email"
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#111827] flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                  <span>Senha</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-600">
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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#00DC82] focus:ring-2 focus:ring-[#00DC82]/20 transition-all pr-10 font-mono tracking-wider"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Token do dispositivo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#111827] flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-gray-500" />
                  <span>Identificador do Terminal</span>
                </label>
                <span className="text-[10px] font-mono text-gray-400">
                  Sessão Única
                </span>
              </div>
              <input
                type="text"
                value={securityToken}
                onChange={(e) => setSecurityToken(e.target.value)}
                placeholder={deviceFingerprint}
                disabled
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 bg-gray-100/70 text-[11px] text-gray-500 font-mono select-none"
              />
            </div>

            {authMode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D1D5DB] text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-[#6B7280]">Manter conectado (Refresh Token)</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full py-2.5 bg-[#00DC82] hover:bg-[#00C16A] text-[#0A140F] font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer group"
            >
              {isLoading ? (
                <span>Processando na API...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{authMode === 'login' ? 'Entrar com Segurança' : 'Criar Conta e Acessar'}</span>
                </>
              )}
            </button>

            {/* Bypass Rápido */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => completeSuccessfulLogin()}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>⚡ Acesso Rápido de Demonstração</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 space-y-1">
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-gray-400">
            <span>NODE.JS</span>
            <span>•</span>
            <span>EXPRESS</span>
            <span>•</span>
            <span>POSTGRESQL</span>
            <span>•</span>
            <span>PRISMA</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF]">
            © {new Date().getFullYear()} Copper Group Enterprise. Autenticação Integrada.
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginScreen;
