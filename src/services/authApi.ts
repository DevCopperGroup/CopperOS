const API_BASE_URL = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL || '/api/auth';
const USERS_API_URL = '/api/users';

export interface AuthResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    status?: string;
    profile?: any;
    companyAccess?: string[];
  };
  accessToken?: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: string;
    fullName: string;
    displayName?: string;
    avatarUrl?: string;
    phone?: string;
    jobTitle?: string;
    department?: string;
  };
  companyAccess?: {
    companyId: string;
    roleInCompany: string;
  }[];
  _count?: {
    refreshTokens: number;
  };
}

/**
 * Fetch seguro com Interceptor para Renovação Silenciosa de Token JWT (Silent Refresh)
 */
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = sessionStorage.getItem('copperos_session_auth_token') || '';

  // Se o token for mock ou inexistente, tenta buscar um token real via Cookie HttpOnly
  if (!token || token === 'CP_SEC_TOKEN_ACTIVE') {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken) {
          token = refreshData.accessToken;
          sessionStorage.setItem('copperos_session_auth_token', token);
        }
      }
    } catch {
      // Ignora erro
    }
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers, credentials: 'include' });

  // Se deu 401 (token expirou durante o uso), tenta refresh e re-executa a requisição
  if (res.status === 401) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken) {
          token = refreshData.accessToken;
          sessionStorage.setItem('copperos_session_auth_token', token);
          headers.set('Authorization', `Bearer ${token}`);
          res = await fetch(url, { ...options, headers, credentials: 'include' });
        }
      }
    } catch {
      // Falha no refresh
    }
  }

  return res;
}

export const authApi = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao registrar usuário');
    }
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Credenciais inválidas');
    }
    return data;
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const res = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Sessão expirada');
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignora erro de rede no logout
    }
  },

  async getProfile() {
    const res = await authenticatedFetch(`${API_BASE_URL}/me`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Não autorizado');
    }
    return data.user;
  },

  // ── Módulo de TI e Gestão de Usuários ─────────────────────
  async listUsers(): Promise<ManagedUser[]> {
    const res = await authenticatedFetch(USERS_API_URL);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao carregar usuários');
    }
    return data.users;
  },

  async createUser(userData: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    department: string;
    jobTitle: string;
    companyIds: string[];
  }): Promise<ManagedUser> {
    const res = await authenticatedFetch(USERS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao provisionar colaborador');
    }
    return data.user;
  },

  async updateUserStatus(userId: string, status: string): Promise<void> {
    const res = await authenticatedFetch(`${USERS_API_URL}/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao atualizar status');
    }
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    const res = await authenticatedFetch(`${USERS_API_URL}/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao atualizar nível de acesso');
    }
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const res = await authenticatedFetch(`${USERS_API_URL}/${userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao redefinir senha');
    }
  },

  async revokeUserSessions(userId: string): Promise<string> {
    const res = await authenticatedFetch(`${USERS_API_URL}/${userId}/sessions`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao revogar sessões');
    }
    return data.message;
  },
};
