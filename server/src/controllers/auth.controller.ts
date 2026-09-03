import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

const getCookieOptions = (expiresAt: Date) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  expires: expiresAt,
  path: '/',
});

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        user,
      });
    } catch (error: any) {
      const isConflict = error.message === 'E-mail já está cadastrado';
      res.status(isConflict ? 409 : 500).json({
        message: error.message || 'Erro ao registrar usuário',
      });
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { user, accessToken, refreshToken, refreshTokenExpiresAt } =
        await authService.login(req.body);

      // Define o Refresh Token em cookie HttpOnly seguro
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions(refreshTokenExpiresAt));

      res.status(200).json({
        message: 'Login realizado com sucesso',
        user,
        accessToken,
      });
    } catch (error: any) {
      const isUnauthorized = error.message === 'Credenciais inválidas';
      res.status(isUnauthorized ? 401 : 500).json({
        message: error.message || 'Erro ao realizar login',
      });
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;

      if (!token) {
        res.status(401).json({ message: 'Refresh token não fornecido' });
        return;
      }

      const { accessToken, refreshToken, refreshTokenExpiresAt } =
        await authService.refreshToken(token);

      // Atualiza o cookie com o novo Refresh Token (Rotação)
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions(refreshTokenExpiresAt));

      res.status(200).json({
        message: 'Token renovado com sucesso',
        accessToken,
      });
    } catch (error: any) {
      // Limpa cookie caso o token seja inválido
      res.clearCookie(REFRESH_COOKIE_NAME);
      res.status(401).json({
        message: error.message || 'Erro ao renovar token',
      });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

      if (token) {
        await authService.logout(token);
      }

      // Limpa o cookie HttpOnly no navegador
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao realizar logout' });
    }
  }

  /**
   * GET /api/auth/me (Rota Protegida)
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      const user = await authService.getUserProfile(req.user.id);
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(error.message === 'Usuário não encontrado' ? 404 : 500).json({
        message: error.message || 'Erro ao carregar perfil',
      });
    }
  }

  /**
   * PUT /api/auth/profile (Rota Protegida)
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      const updatedProfile = await authService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        message: 'Perfil atualizado com sucesso',
        profile: updatedProfile,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || 'Erro ao atualizar perfil',
      });
    }
  }
}

export const authController = new AuthController();
