import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// Rotas públicas com Rate Limiting estrito (anti-força bruta)
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  (req, res) => authController.register(req, res)
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  (req, res) => authController.login(req, res)
);

router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

// Rotas protegidas por JWT
router.get('/me', authenticate, (req, res) => authController.me(req, res));
router.put('/profile', authenticate, (req, res) => authController.updateProfile(req, res));

export const authRoutes = router;
