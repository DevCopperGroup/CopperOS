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

  async getProfile(accessToken: string) {
    const res = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Não autorizado');
    }
    return data.user;
  },

  // ── Módulo de TI e Gestão de Usuários ─────────────────────
  async listUsers(accessToken: string): Promise<ManagedUser[]> {
    const res = await fetch(USERS_API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao carregar usuários');
    }
    return data.users;
  },

  async createUser(
    accessToken: string,
    userData: {
      fullName: string;
      email: string;
      password: string;
      role: string;
      department: string;
      jobTitle: string;
      companyIds: string[];
    }
  ): Promise<ManagedUser> {
    const res = await fetch(USERS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao provisionar colaborador');
    }
    return data.user;
  },

  async updateUserStatus(accessToken: string, userId: string, status: string): Promise<void> {
    const res = await fetch(`${USERS_API_URL}/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao atualizar status');
    }
  },

  async updateUserRole(accessToken: string, userId: string, role: string): Promise<void> {
    const res = await fetch(`${USERS_API_URL}/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao atualizar nível de acesso');
    }
  },

  async resetUserPassword(accessToken: string, userId: string, newPassword: string): Promise<void> {
    const res = await fetch(`${USERS_API_URL}/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao redefinir senha');
    }
  },

  async revokeUserSessions(accessToken: string, userId: string): Promise<string> {
    const res = await fetch(`${USERS_API_URL}/${userId}/sessions`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao revogar sessões');
    }
    return data.message;
  },
};
