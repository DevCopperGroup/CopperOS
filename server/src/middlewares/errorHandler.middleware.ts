import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log estruturado no servidor
  console.error('🚨 Erro interno não tratado:', err);

  const status = err.status || 500;
  
  // Em produção, nunca vaza stack trace ou detalhes de conexão do PostgreSQL
  const message =
    env.NODE_ENV === 'production' && status === 500
      ? 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'
      : err.message || 'Erro interno no servidor';

  res.status(status).json({
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
