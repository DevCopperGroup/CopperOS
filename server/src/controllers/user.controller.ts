import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { CurrentUser, Role, rankOf } from '../middlewares/authorize.middleware.js';

const SALT_ROUNDS = 12;
const DEFAULT_COMPANY_ID = 'emp-copper-group';

interface TargetUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Registro mínimo de auditoria das ações privilegiadas de TI, para que uma
 * troca de papel ou reset de senha sempre tenha autor identificado.
 */
function auditLog(actor: CurrentUser, action: string, targetId: string, detail?: string): void {
  const suffix = detail ? ` detail=${detail}` : '';
  console.info(
    `[AUDIT] actor=${actor.email} (${actor.role}) action=${action} target=${targetId}${suffix}`
  );
}

/**
 * Carrega o usuário alvo e verifica se o solicitante pode administrá-lo.
 *
 * Duas regras, ambas necessárias para impedir escalada de privilégio:
 *  - ninguém altera a própria conta pelo painel de TI (salvo onde `allowSelf`),
 *    o que bloquearia a auto-promoção e o auto-bloqueio;
 *  - o solicitante precisa de patente estritamente superior à do alvo, então um
 *    ADMIN não mexe em outro ADMIN nem em um SUPERADMIN.
 */
async function resolveManageableTarget(
  res: Response,
  actor: CurrentUser,
  targetId: string,
  options: { allowSelf: boolean }
): Promise<TargetUser | null> {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, email: true, role: true },
  });

  if (!target) {
    res.status(404).json({ message: 'Usuário não encontrado' });
    return null;
  }

  const isSelf = target.id === actor.id;

  if (isSelf && !options.allowSelf) {
    res.status(403).json({
      message: 'Não é permitido alterar a sua própria conta pelo painel de TI.',
    });
    return null;
  }

  if (!isSelf && rankOf(actor.role) <= rankOf(target.role as Role)) {
    res.status(403).json({
      message: 'Você não pode administrar um usuário de nível igual ou superior ao seu.',
    });
    return null;
  }

  return { id: target.id, email: target.email, role: target.role as Role };
}

/**
 * Impede que o solicitante conceda uma patente acima da própria.
 */
function canAssignRole(actor: CurrentUser, role: Role): boolean {
  return rankOf(actor.role) >= rankOf(role);
}

export class UserController {
  /**
   * GET /api/users - Lista todos os usuários e perfis cadastrados
   */
  async listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users - Provisiona um novo colaborador pelo Time de TI
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.currentUser!;
      const { email, password, fullName, role, department, jobTitle, companyIds } = req.body;

      if (!canAssignRole(actor, role)) {
        res.status(403).json({
          message: 'Você não pode provisionar um usuário com nível de acesso superior ao seu.',
        });
        return;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ message: 'E-mail corporativo já cadastrado' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const targetCompanies: string[] =
        companyIds && companyIds.length > 0 ? companyIds : [DEFAULT_COMPANY_ID];

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
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
              roleInCompany: role,
            })),
          },
        },
        include: {
          profile: true,
          companyAccess: true,
        },
      });

      auditLog(actor, 'user.create', user.id, `role=${role}`);

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
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/status - Altera status (ACTIVE, SUSPENDED, INACTIVE)
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.currentUser!;
      const id = String(req.params.id);
      const { status } = req.body;

      const target = await resolveManageableTarget(res, actor, id, { allowSelf: false });
      if (!target) return;

      const updated = await prisma.user.update({
        where: { id },
        data: { status },
        select: { id: true, email: true, status: true },
      });

      // Qualquer status diferente de ACTIVE encerra as sessões vigentes na hora.
      if (status !== 'ACTIVE') {
        await prisma.refreshToken.updateMany({
          where: { userId: id, revoked: false },
          data: { revoked: true },
        });
      }

      auditLog(actor, 'user.status', id, `status=${status}`);

      res.status(200).json({ message: 'Status atualizado com sucesso', user: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/role - Altera nível de acesso (RBAC)
   */
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.currentUser!;
      const id = String(req.params.id);
      const { role } = req.body as { role: Role };

      const target = await resolveManageableTarget(res, actor, id, { allowSelf: false });
      if (!target) return;

      if (!canAssignRole(actor, role)) {
        res.status(403).json({
          message: 'Você não pode conceder um nível de acesso superior ao seu.',
        });
        return;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, email: true, role: true },
      });

      // O papel mudou: derruba as sessões para que o novo nível valha já no
      // próximo login, sem access token antigo em circulação.
      await prisma.refreshToken.updateMany({
        where: { userId: id, revoked: false },
        data: { revoked: true },
      });

      auditLog(actor, 'user.role', id, `${target.role} -> ${role}`);

      res.status(200).json({ message: 'Permissão de acesso atualizada', user: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/:id/reset-password - Redefinição forçada de senha pelo TI
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.currentUser!;
      const id = String(req.params.id);
      const { newPassword } = req.body;

      const target = await resolveManageableTarget(res, actor, id, { allowSelf: true });
      if (!target) return;

      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });

      // Revoga sessões antigas forçando novo login
      await prisma.refreshToken.updateMany({
        where: { userId: id, revoked: false },
        data: { revoked: true },
      });

      auditLog(actor, 'user.reset-password', id);

      res.status(200).json({
        message: 'Senha redefinida com sucesso. Sessões anteriores revogadas.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id/sessions - Revoga todas as sessões ativas (Logout Remoto Forçado)
   */
  async revokeSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.currentUser!;
      const id = String(req.params.id);

      const target = await resolveManageableTarget(res, actor, id, { allowSelf: true });
      if (!target) return;

      const result = await prisma.refreshToken.updateMany({
        where: { userId: id, revoked: false },
        data: { revoked: true },
      });

      auditLog(actor, 'user.revoke-sessions', id, `count=${result.count}`);

      res.status(200).json({
        message: `${result.count} sessão(ões) revogada(s) com sucesso.`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
