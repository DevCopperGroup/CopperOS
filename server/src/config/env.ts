import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET deve ter ao menos 16 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET deve ter ao menos 16 caracteres'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas:', _env.error.format());
  throw new Error('Configurações de ambiente inválidas.');
}

export const env = _env.data;
