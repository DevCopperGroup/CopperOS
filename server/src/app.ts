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

// Quantos proxies à frente da API podem ser confiados para definir o IP real.
// Precisa vir antes do rate limiter, que deriva a chave de req.ip.
app.set('trust proxy', env.TRUST_PROXY);

// Cabeçalhos de segurança HTTP com Helmet. A API só devolve JSON, então a CSP
// pode ser a mais restritiva possível.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

/**
 * Origens autorizadas a enviar credenciais para a API.
 * localhost só é aceito fora de produção.
 */
const allowedOrigins = new Set<string>([env.CLIENT_URL]);

const isLocalDevOrigin = (origin: string): boolean =>
  env.NODE_ENV !== 'production' &&
  (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      // Requisições sem Origin (curl, health check, same-origin) seguem normais.
      if (!origin || allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }
      // Nega sem lançar erro: o navegador bloqueia por ausência do header
      // Access-Control-Allow-Origin, sem transformar isso num 500.
      callback(null, false);
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
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
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
