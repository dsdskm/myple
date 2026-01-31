import { Request, Response } from "express";

export const log = async (req: Request, res: Response) => {
  try {
    const tag = req.body.tag;
    const message = req.body.message;
    console.log(`[${tag}] ${message}`);
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
  }
};
