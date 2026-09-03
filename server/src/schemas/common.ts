import { z } from 'zod';

/**
 * Política de senha corporativa. O teto de 72 respeita o bloco do bcrypt,
 * que ignora silenciosamente qualquer byte além disso.
 */
export const strongPassword = z
  .string({ required_error: 'A senha é obrigatória' })
  .min(12, 'A senha deve ter no mínimo 12 caracteres')
  .max(72, 'A senha deve ter no máximo 72 caracteres')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um caractere especial');

export const corporateEmail = z
  .string({ required_error: 'O e-mail é obrigatório' })
  .trim()
  .toLowerCase()
  .email('Formato de e-mail inválido')
  .max(180, 'O e-mail deve ter no máximo 180 caracteres');

export const uuidField = (label: string) =>
  z.string({ required_error: `${label} é obrigatório` }).uuid(`${label} inválido`);
