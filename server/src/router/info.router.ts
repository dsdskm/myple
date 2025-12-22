import { Router } from 'express';
import * as infoController from '../controller/info.controller';

const router = Router();

router.get('/subscription', infoController.getSubscriptionInfo);

export default router;
