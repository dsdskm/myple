import { Request, Response } from 'express';
import * as accountService from '../service/account.service';

export const createAccount = async (req: Request, res: Response) => {
  try {
    const account = await accountService.create(req.body);
    res.status(201).json(account);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await accountService.findAll();
    res.status(200).json(accounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const account = await accountService.findById(req.params.id);
    if (account) {
      res.status(200).json(account);
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    await accountService.update(req.params.id, req.body);
    res.status(200).json({ message: 'Account updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    await accountService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const withdrawAccount = async (req: Request, res: Response) => {
  try {
    await accountService.withdraw(req.body);
    res.status(200).send()
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}