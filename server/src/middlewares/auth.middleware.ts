import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token de autenticação não fornecido ou inválido' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ message: 'Token de autenticação expirado ou inválido' });
    return;
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
  };

  next();
};
