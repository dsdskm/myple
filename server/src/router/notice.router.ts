import { Router } from "express";
import * as noticeController from "../controller/notice.controller";

const router = Router();

router.post("/", noticeController.createNotice);
router.put("/:id", noticeController.updateNotice);
router.get("/", noticeController.getAllNotices);
router.get("/visible/now", noticeController.getVisibleNoticesNow);
router.get("/:id", noticeController.getNoticeById);
router.delete("/:id", noticeController.deleteNotice);

export default router;
