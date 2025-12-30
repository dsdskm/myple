import { Router } from 'express';
import * as placeController from '../controller/place.controller';

const router = Router();

router.post('/', placeController.createPlace);
router.post('/history', placeController.createPlaceHistory);
router.put("/:id", placeController.updatePlace);
router.put("/history/:id", placeController.updatePlaceHistory);

router.get('/', placeController.getAllPlaces);
router.get('/history/:placeId', placeController.getAllPlaceHistories);
router.get('/history/:placeId/:id', placeController.getPlaceHistoryByPlaceId);
router.get('/:creator', placeController.getPlaceByCreator);

router.delete("/:id", placeController.deletePlace)
router.delete("/:placeId/:id", placeController.deletePlaceHistory)

export default router;
