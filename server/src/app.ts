import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

export const app = express();

// Oculta header de fingerprinting de tecnologia
app.disable('x-powered-by');

// Cabeçalhos de segurança HTTP com Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
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
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Rate Limiter Geral
app.use('/api', generalLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Rota raiz com status
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'CopperOS Auth & IT Admin API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
      it_admin: {
        listUsers: 'GET /api/users',
        createUser: 'POST /api/users',
        updateStatus: 'PATCH /api/users/:id/status',
        updateRole: 'PATCH /api/users/:id/role',
        resetPassword: 'POST /api/users/:id/reset-password',
        revokeSessions: 'DELETE /api/users/:id/sessions',
      },
    },
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Fallback 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado' });
});

// Handler global de erros
app.use(errorHandler);
