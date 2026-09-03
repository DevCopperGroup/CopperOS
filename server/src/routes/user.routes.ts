import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createUserSchema,
  resetPasswordSchema,
  updateRoleSchema,
  updateStatusSchema,
  userIdParamSchema,
} from '../schemas/user.schema.js';

const router = Router();

// O painel de TI exige autenticação E papel administrativo. O papel é lido do
// banco a cada requisição, nunca do JWT, então revogar acesso vale na hora.
router.use(authenticate, requireRole('SUPERADMIN', 'ADMIN'));

// Gestão de Usuários
router.get('/', (req, res, next) => userController.listUsers(req, res, next));

router.post(
  '/',
  validate(createUserSchema),
  (req, res, next) => userController.createUser(req, res, next)
);

router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  (req, res, next) => userController.updateStatus(req, res, next)
);

router.patch(
  '/:id/role',
  validate(updateRoleSchema),
  (req, res, next) => userController.updateRole(req, res, next)
);

router.post(
  '/:id/reset-password',
  validate(resetPasswordSchema),
  (req, res, next) => userController.resetPassword(req, res, next)
);

router.delete(
  '/:id/sessions',
  validate(userIdParamSchema),
  (req, res, next) => userController.revokeSessions(req, res, next)
);

export const userRoutes = router;
