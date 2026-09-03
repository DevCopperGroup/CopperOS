import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

export class UserController {
  /**
   * GET /api/users - Lista todos os usuários e perfis cadastrados
   */
  async listUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatarUrl: true,
              phone: true,
              jobTitle: true,
              department: true,
            },
          },
          companyAccess: {
            select: {
              companyId: true,
              roleInCompany: true,
            },
          },
          _count: {
            select: {
              refreshTokens: {
                where: { revoked: false },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ users });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao listar usuários' });
    }
  }

  /**
   * POST /api/users - Provisiona um novo colaborador pelo Time de TI
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName, role, department, jobTitle, companyIds } = req.body;

      if (!email || !password || !fullName) {
        res.status(400).json({ message: 'E-mail, senha e nome completo são obrigatórios' });
        return;
      }

      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (existing) {
        res.status(409).json({ message: 'E-mail corporativo já cadastrado' });
        return;
      }

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const targetCompanies = Array.isArray(companyIds) && companyIds.length > 0
        ? companyIds
        : ['emp-copper-group'];

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: role || 'OPERATOR',
          status: 'ACTIVE',
          profile: {
            create: {
              fullName,
              displayName: fullName.split(' ')[0],
              department: department || 'Geral',
              jobTitle: jobTitle || 'Colaborador',
              timezone: 'America/Sao_Paulo',
              locale: 'pt-BR',
              themePreference: 'dark',
            },
          },
          companyAccess: {
            create: targetCompanies.map((cid: string) => ({
              companyId: cid,
              roleInCompany: role || 'MEMBER',
            })),
          },
        },
        include: {
          profile: true,
          companyAccess: true,
        },
      });

      res.status(201).json({
        message: 'Usuário provisionado com sucesso pelo TI',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          profile: user.profile,
          companyAccess: user.companyAccess,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao criar usuário' });
    }
  }

  /**
   * PATCH /api/users/:id/status - Altera status (ACTIVE, SUSPENDED, INACTIVE)
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { status } = req.body;

      if (!['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'].includes(status)) {
        res.status(400).json({ message: 'Status inválido' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { status },
        select: { id: true, email: true, status: true },
      });

      // Se foi suspenso ou inativado, revoga todas as sessões ativas imediatamente
      if (status === 'SUSPENDED' || status === 'INACTIVE') {
        await prisma.refreshToken.updateMany({
          where: { userId: id },
          data: { revoked: true },
        });
      }

      res.status(200).json({ message: 'Status atualizado com sucesso', user: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao atualizar status' });
    }
  }

  /**
   * PATCH /api/users/:id/role - Altera nível de acesso (RBAC)
   */
  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { role } = req.body;

      if (!['SUPERADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'].includes(role)) {
        res.status(400).json({ message: 'Nível de acesso (Role) inválido' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, email: true, role: true },
      });

      res.status(200).json({ message: 'Permissão de acesso atualizada', user: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao atualizar role' });
    }
  }

  /**
   * POST /api/users/:id/reset-password - Redefinição forçada de senha pelo TI
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres' });
        return;
      }

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });

      // Revoga sessões antigas forçando novo login
      await prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { revoked: true },
      });

      res.status(200).json({ message: 'Senha redefinida com sucesso. Sessões anteriores revogadas.' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao redefinir senha' });
    }
  }

  /**
   * DELETE /api/users/:id/sessions - Revoga todas as sessões ativas (Logout Remoto Forçado)
   */
  async revokeSessions(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const result = await prisma.refreshToken.updateMany({
        where: { userId: id, revoked: false },
        data: { revoked: true },
      });

      res.status(200).json({
        message: `${result.count} sessão(ões) revogada(s) com sucesso.`,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao revogar sessões' });
    }
  }
}

export const userController = new UserController();
