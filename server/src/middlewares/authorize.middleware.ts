import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export type Role = 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

/**
 * Hierarquia de privilégios. Patentes maiores dominam as menores.
 */
const ROLE_RANK: Record<Role, number> = {
  SUPERADMIN: 4,
  ADMIN: 3,
  MANAGER: 2,
  OPERATOR: 1,
  VIEWER: 0,
};

export const ALL_ROLES = Object.keys(ROLE_RANK) as [Role, ...Role[]];

export function rankOf(role: Role): number {
  return ROLE_RANK[role];
}

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: CurrentUser;
    }
  }
}

/**
 * Autorização baseada em papel (RBAC).
 *
 * O papel é sempre lido do banco e nunca do JWT: assim uma troca de papel ou
 * uma suspensão de conta passa a valer imediatamente, sem esperar a expiração
 * do access token.
 */
export const requireRole = (...allowed: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, role: true, status: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        res.status(401).json({ message: 'Sessão inválida. Autentique-se novamente.' });
        return;
      }

      if (!allowed.includes(user.role as Role)) {
        res.status(403).json({ message: 'Você não possui permissão para executar esta ação.' });
        return;
      }

      req.currentUser = { id: user.id, email: user.email, role: user.role as Role };
      next();
    } catch (error) {
      next(error);
    }
  };
};
