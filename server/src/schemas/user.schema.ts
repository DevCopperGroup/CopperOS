import { z } from 'zod';
import { ALL_ROLES } from '../middlewares/authorize.middleware.js';
import { corporateEmail, strongPassword, uuidField } from './common.js';

const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'] as const;

const idParams = z.object({
  id: uuidField('O identificador do usuário'),
});

const roleField = z.enum(ALL_ROLES, {
  errorMap: () => ({ message: 'Nível de acesso (Role) inválido' }),
});

export const createUserSchema = z.object({
  body: z
    .object({
      email: corporateEmail,
      password: strongPassword,
      fullName: z
        .string({ required_error: 'O nome completo é obrigatório' })
        .trim()
        .min(2, 'O nome completo deve ter pelo menos 2 caracteres')
        .max(100, 'O nome completo deve ter no máximo 100 caracteres'),
      role: roleField.default('OPERATOR'),
      department: z.string().trim().max(80, 'Departamento muito longo').optional(),
      jobTitle: z.string().trim().max(80, 'Cargo muito longo').optional(),
      companyIds: z
        .array(z.string().trim().min(1, 'Identificador de empresa inválido').max(64))
        .min(1, 'Informe ao menos uma empresa')
        .max(50, 'Limite de 50 empresas por usuário')
        .optional(),
    })
    .strict(),
});

export const updateStatusSchema = z.object({
  params: idParams,
  body: z
    .object({
      status: z.enum(USER_STATUSES, {
        errorMap: () => ({ message: 'Status inválido' }),
      }),
    })
    .strict(),
});

export const updateRoleSchema = z.object({
  params: idParams,
  body: z.object({ role: roleField }).strict(),
});

export const resetPasswordSchema = z.object({
  params: idParams,
  body: z.object({ newPassword: strongPassword }).strict(),
});

export const userIdParamSchema = z.object({
  params: idParams,
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
