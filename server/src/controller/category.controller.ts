import { Request, Response } from 'express';
import * as categoryService from '../service/category.service';
import { Category } from '../types/category';

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await categoryService.findCategoryById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const newCategory = await categoryService.createNewCategory(req.body);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData: Partial<Omit<Category, 'id'>> = req.body; // Partial을 사용하여 부분 업데이트 허용
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        const updateCategory = await categoryService.updateCategory(id, updateData);

        if (!updateCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(updateCategory);
    } catch (error) {
        console.error('Error updating category:', error); // 에러 로깅
        res.status(500).json({ message: 'Error updating category', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await categoryService.deleteCategory(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' }); // 204 No Content를 반환할 수도 있습니다.
    } catch (error) {
        console.error('Error deleting category:', error); // 에러 로깅
        res.status(500).json({ message: 'Error deleting category', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};