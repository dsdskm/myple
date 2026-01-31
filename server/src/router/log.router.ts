import { Router } from "express";
import * as logController from "../controller/log.controller";

const router = Router();

router.post("/", logController.log);
export default router;
