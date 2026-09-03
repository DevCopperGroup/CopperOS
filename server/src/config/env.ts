import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET deve ter ao menos 32 caracteres'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET deve ter ao menos 32 caracteres'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),
    CLIENT_URL: z.string().url('CLIENT_URL deve ser uma URL completa').default('http://localhost:5173'),
    // Número de proxies confiáveis à frente da API. Mantenha 0 quando não há
    // proxy: confiar em X-Forwarded-For sem proxy real deixa o rate limit por
    // IP ser burlado com um header falsificado.
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  })
  .refine((data) => data.JWT_ACCESS_SECRET !== data.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET e JWT_REFRESH_SECRET devem ser diferentes',
    path: ['JWT_REFRESH_SECRET'],
  });

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas:', _env.error.format());
  throw new Error('Configurações de ambiente inválidas.');
}

export const env = _env.data;
