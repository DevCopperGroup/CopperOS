import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

const getCookieOptions = (expiresAt: Date) => ({
  ...baseCookieOptions,
  expires: expiresAt,
});

export class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      // Falhas de credencial e de status de conta são respostas esperadas (401).
      // Qualquer outra coisa é erro de servidor e vai para o handler global.
      if (error?.message === 'Credenciais inválidas' || error?.message?.startsWith('Conta inativa')) {
        res.status(401).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

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
      res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
      res.status(401).json({
        message: error?.message || 'Erro ao renovar token',
      });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

      if (token) {
        await authService.logout(token);
      }

      // Limpa o cookie HttpOnly no navegador
      res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);

      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me (Rota Protegida)
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      const user = await authService.getUserProfile(req.user.id);
      res.status(200).json({ user });
    } catch (error: any) {
      if (error?.message === 'Usuário não encontrado') {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PUT /api/auth/profile (Rota Protegida)
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
