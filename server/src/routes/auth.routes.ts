import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authLimiter, refreshLimiter } from '../middlewares/rateLimit.middleware.js';
import { loginSchema, updateProfileSchema } from '../schemas/auth.schema.js';

const router = Router();

// Não existe auto-cadastro: as credenciais são provisionadas pelo Time de TI
// em POST /api/users, sob autorização RBAC.

// Rota pública com Rate Limiting estrito (anti-força bruta)
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

router.post('/refresh', refreshLimiter, (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Rotas protegidas por JWT
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  (req, res, next) => authController.updateProfile(req, res, next)
);

export const authRoutes = router;
