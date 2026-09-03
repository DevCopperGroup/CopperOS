import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

export const app = express();

// Oculta header de fingerprinting de tecnologia
app.disable('x-powered-by');

// Cabeçalhos de segurança HTTP com Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Permite flexibilidade com frontend SPA
    crossOriginEmbedderPolicy: false,
  })
);

// Middlewares globais
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
        origin === env.CLIENT_URL
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Flexível em desenvolvimento
      }
    },
    credentials: true,
  })
);

// Rate Limiter Geral
app.use('/api', generalLimiter);

app.use(express.json({ limit: '10kb' })); // Limita payload a 10kb contra DoS por payload excessivo
app.use(cookieParser());

// Rota raiz com status
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'CopperOS Auth API',
    version: '1.0.0',
    status: 'online',
    security: {
      helmet: 'enabled',
      rateLimiting: 'enabled',
      tokenHashing: 'sha-256',
      bruteForceShield: 'active',
    },
    endpoints: {
      health: 'GET /health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      refresh: 'POST /api/auth/refresh',
      logout: 'POST /api/auth/logout',
      me: 'GET /api/auth/me (Bearer Token required)',
    },
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', authRoutes);

// Fallback 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado' });
});

// Handler global de erros
app.use(errorHandler);
