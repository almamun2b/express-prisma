import express, { Router } from 'express';
import { UserControllers } from './user.controller';

const router: Router = express.Router();

router.get('/', UserControllers.getAllUsers);
router.get('/:id', UserControllers.getUserById);

export const UserRoutes = router;
