import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de TI exigem autenticação
router.use(authenticate);

// Gestão de Usuários
router.get('/', (req, res) => userController.listUsers(req, res));
router.post('/', (req, res) => userController.createUser(req, res));
router.patch('/:id/status', (req, res) => userController.updateStatus(req, res));
router.patch('/:id/role', (req, res) => userController.updateRole(req, res));
router.post('/:id/reset-password', (req, res) => userController.resetPassword(req, res));
router.delete('/:id/sessions', (req, res) => userController.revokeSessions(req, res));

export const userRoutes = router;
