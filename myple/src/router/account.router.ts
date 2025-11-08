import { Router } from "express";
import * as accountController from "../controller/account.controller";

const router = Router();

router.get("/", accountController.getAllAccounts);

router.post("/withdraw", accountController.withdrawAccount);

router.get("/:id", accountController.getAccountById);

router.post("/", accountController.createAccount);

router.put("/:id", accountController.updateAccount);

router.delete("/:id", accountController.deleteAccount);

export default router;
