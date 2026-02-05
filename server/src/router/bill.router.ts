import { Router } from 'express';
import * as billController from '../controller/bill.controller';

const router = Router();

router.post('/', billController.createBill);
router.get('/', billController.getBills);
router.get('/:creator', billController.getBillsByCreator);


export default router;
