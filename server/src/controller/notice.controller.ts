import { Request, Response } from "express";
import * as noticeService from "../service/notice.service";
import { Notice } from "../types/notice";

export const createNotice = async (req: Request, res: Response) => {
  try {
    // body는 title/content/isVisible/startAt/endAt 정도만 온다고 가정
    const created = await noticeService.createNewNotice(req.body as Notice);
    if (!created) return res.status(500).json({ message: "Failed to create notice" });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: "Error creating notice", error });
  }
};

export const updateNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateData: Partial<Omit<Notice, "id" | "created">> = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    // created는 수정 불가로 막기
    if ("created" in updateData) {
      delete (updateData as any).created;
    }
    if ("id" in updateData) {
      delete (updateData as any).id;
    }

    const updated = await noticeService.updateNotice(id, updateData);

    if (!updated) return res.status(404).json({ message: "Notice not found" });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Error updating notice",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllNotices = async (req: Request, res: Response) => {
  try {
    // 옵션: ?visibleOnly=true 면 현재 노출중만
    const visibleOnly = String(req.query.visibleOnly || "").toLowerCase() === "true";

    const notices = visibleOnly ? await noticeService.findVisibleNoticesNow() : await noticeService.findAllNotices();

    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notices", error });
  }
};

export const getNoticeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await noticeService.findNoticeById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notice", error });
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await noticeService.deleteNotice(id);
    if (!deleted) return res.status(404).json({ message: "Notice not found" });

    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting notice",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getVisibleNoticesNow = async (req: Request, res: Response) => {
  try {
    const notices = await noticeService.findVisibleNoticesNow();
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching visible notices", error });
  }
};