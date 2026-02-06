import { Request, Response } from 'express';
import * as productService from '../service/product.service';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.findAll();
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productService.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    await productService.update(req.params.id, req.body);
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const getProductHistory = async (req: Request, res: Response) => {
  try {
    const userKey = req.params.userKey;
    if (!userKey) {
      return res.status(400).json({ message: 'userKey is required' });
    }

    const result = await productService.fetchProductHistoryAll(userKey);

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[getProductHistory] error:', err);
    return res.status(500).json({ message: err?.message ?? 'Failed to fetch product history' });
  }
};
