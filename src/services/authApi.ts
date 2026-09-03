const API_BASE_URL = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL || '/api/auth';

export interface AuthResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  accessToken?: string;
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
};
