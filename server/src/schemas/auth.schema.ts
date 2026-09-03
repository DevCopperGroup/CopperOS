import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'O e-mail é obrigatório' })
      .email('Formato de e-mail inválido')
      .toLowerCase()
      .trim(),
    name: z
      .string()
      .min(2, 'O nome deve ter pelo menos 2 caracteres')
      .max(100, 'O nome deve ter no máximo 100 caracteres')
      .optional(),
    password: z
      .string({ required_error: 'A senha é obrigatória' })
      .min(6, 'A senha deve ter no mínimo 6 caracteres')
      .max(72, 'A senha deve ter no máximo 72 caracteres'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'O e-mail é obrigatório' })
      .email('Formato de e-mail inválido')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'A senha é obrigatória' })
      .min(1, 'A senha é obrigatória'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
