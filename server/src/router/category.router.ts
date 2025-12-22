import { Router } from 'express';
import * as category from '../controller/category.controller';

const router = Router();

router.get('/:id', category.getCategoryById);

router.post('/', category.createCategory);

router.put("/", category.updateCategory);

router.delete("/:id", category.deleteCategory)

export default router;
