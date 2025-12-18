import { Router } from "express";
import * as scriptController from '../controller/script.controller';

const router = Router()

router.post("/generate/places", scriptController.generatePlaces)
router.post("/delete/places", scriptController.deletePlaces)

export default router;
