import { Router } from 'express';
import * as tossController from '../controller/toss.controller';

const router = Router();

router.get('/user/:authorizationCode/:referrer', tossController.getUserInfo);
router.post('/logout', tossController.logout)
export default router;
