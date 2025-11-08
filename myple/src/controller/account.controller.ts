import { Request, Response } from "express";
import * as accountService from "../service/account.service";
import { Account } from "../types/account";

export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await accountService.findAllAccounts();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching accounts", error });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const account = await accountService.findAccountById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: "Error fetching account", error });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const newAccount = await accountService.createNewAccount(req.body);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ message: "Error creating account", error });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: Partial<Omit<Account, "id">> = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const updatedAccount = await accountService.updateAccount(id, updateData);

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      message: "Error updating account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await accountService.deleteAccount(id);

    if (!deleted) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      message: "Error deleting account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const withdrawAccount = async (req: Request, res: Response) => {
  try {
    await accountService.withdrawAccount();
    console.log(`req.body ${JSON.stringify(req.body)}`);
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ message: "Error creating account", error });
  }
};
