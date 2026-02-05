import { Request, Response } from "express";
import * as billService from "../service/bill.service";

export const createBill = async (req: Request, res: Response) => {
  try {
    const newPlace = await billService.createBill(req.body);
    res.status(201).json(newPlace);
  } catch (error) {
    res.status(500).json({ message: "Error creating bill", error });
  }
};

export const getBills = async (req: Request, res: Response) => {
  try {
    const bills = await billService.getBills();
    res.status(201).json(bills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bills", error });
  }
};

export const getBillsByCreator = async (req: Request, res: Response) => {
  try {
    const { creator } = req.params;
    const bills = await billService.getBillsByCreator(creator);
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bills", error });
  }
};
