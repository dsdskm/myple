import { Router } from 'express';
import * as fileUploadController from '../controller/file.controller';

const router = Router();

router.post('/upload', fileUploadController.uploadMediaFiles);

export default router;