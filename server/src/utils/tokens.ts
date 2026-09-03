import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export interface TokenPayload {
  sub: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Gera um Refresh Token seguro (40 bytes hex)
 */
export function generateRefreshToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_DAYS);

  return { token, expiresAt };
}

/**
 * Gera um hash SHA-256 irreversível para salvar no banco de dados.
 * Impede o uso indevido de tokens caso o banco seja exposto.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
