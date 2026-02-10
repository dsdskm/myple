import { Router } from 'express';
import * as accountController from '../controller/account.controller';

const router = Router();

router.post('/:id', accountController.createAccount);
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);
router.post('/withdraw', accountController.withdrawAccount);

export default router;
