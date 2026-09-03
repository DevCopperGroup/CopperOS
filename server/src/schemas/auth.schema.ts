import { z } from 'zod';
import { corporateEmail } from './common.js';

export const loginSchema = z.object({
  body: z
    .object({
      email: corporateEmail,
      password: z
        .string({ required_error: 'A senha é obrigatória' })
        .min(1, 'A senha é obrigatória')
        .max(72, 'A senha deve ter no máximo 72 caracteres'),
    })
    .strict(),
});

/**
 * Campos de perfil que o próprio usuário pode editar.
 *
 * `.strict()` é essencial aqui: sem ele, chaves extras do corpo chegariam ao
 * Prisma e permitiriam escrever colunas sensíveis do Profile (userId, document).
 */
export const updateProfileSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres').max(100).optional(),
      displayName: z.string().trim().min(1).max(60).optional(),
      avatarUrl: z.string().trim().url('URL de avatar inválida').max(500).optional(),
      phone: z.string().trim().max(30, 'Telefone muito longo').optional(),
      jobTitle: z.string().trim().max(80, 'Cargo muito longo').optional(),
      department: z.string().trim().max(80, 'Departamento muito longo').optional(),
      bio: z.string().trim().max(1000, 'A bio deve ter no máximo 1000 caracteres').optional(),
      themePreference: z.enum(['dark', 'light'], {
        errorMap: () => ({ message: 'Preferência de tema inválida' }),
      }).optional(),
    })
    .strict(),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
