import { Request, Response } from 'express';
import * as placeService from '../service/place.service';
import { Place, PlaceHistory } from '../types/place';
import { deleteAllFilesInPlaceFolder, deleteAllFilesInPlaceHistoryFolder, deleteOrphanFiles } from '../service/file.service';

export const createPlace = async (req: Request, res: Response) => {
    try {
        const newPlace = await placeService.createNewPlace(req.body);
        res.status(201).json(newPlace);
    } catch (error) {
        res.status(500).json({ message: 'Error creating place', error });
    }
};

export const createPlaceHistory = async (req: Request, res: Response) => {
    try {
        const newPlaceHistory = await placeService.createNewPlaceHistory(req.body);
        res.status(201).json(newPlaceHistory);

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating place history', error });
    }
};
export const updatePlace = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData: Partial<Omit<Place, 'id'>> = req.body; // Partial을 사용하여 부분 업데이트 허용
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        const updatedPlace = await placeService.updatePlace(id, updateData);

        if (!updatedPlace) {
            return res.status(404).json({ message: 'Place not found' });
        }

        res.status(200).json(updatedPlace);
    } catch (error) {
        console.error('Error updating place:', error); // 에러 로깅
        res.status(500).json({ message: 'Error updating place', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const updatePlaceHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData: PlaceHistory = req.body; // Partial을 사용하여 부분 업데이트 허용
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }
        if (updateData && updateData.id) {
            const updatedPlaceHistory = await placeService.updatePlaceHistory(updateData.id, updateData);
            if (updatedPlaceHistory) {
                await deleteOrphanFiles(updatedPlaceHistory.placeId, id)
                res.status(200).json(updatedPlaceHistory);
            } else {
                res.status(500).json(false);
            }
        } else {
            res.status(500).json(false);
        }




    } catch (error) {
        res.status(500).json({ message: 'Error updating place history', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const getAllPlaces = async (req: Request, res: Response) => {
    try {
        const places = await placeService.findAllPlaces();
        res.status(200).json(places);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching places', error });
    }
};

export const getAllPlaceHistories = async (req: Request, res: Response) => {
    try {
        const { placeId } = req.params;
        const placeHistories = await placeService.findAllPlaceHistories(placeId);
        res.status(200).json(placeHistories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching place histories', error });
    }
};

export const getPlaceByCreator = async (req: Request, res: Response) => {
    try {
        const { creator } = req.params;
        console.log(`getPlaceByCreator creator`,creator)
        const place = await placeService.findPlacesByCreator(creator);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.status(200).json(place);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching place', error });
    }
};

export const getPlaceHistoryByPlaceId = async (req: Request, res: Response) => {
    try {
        const { placeId, id } = req.params;
        const placeHistory = await placeService.findPlaceHistoryById(placeId, id);
        if (!placeHistory) {
            return res.status(404).json({ message: 'Place History not found' });
        }
        res.status(200).json(placeHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching place history', error });
    }
};



export const deletePlace = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await placeService.deletePlace(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Place not found' });
        }
        await deleteAllFilesInPlaceFolder(id)
        res.status(200).json({ message: 'Place deleted successfully' }); // 204 No Content를 반환할 수도 있습니다.
    } catch (error) {
        console.error('Error deleting place:', error); // 에러 로깅
        res.status(500).json({ message: 'Error deleting place', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const deletePlaceHistory = async (req: Request, res: Response) => {
    try {
        const { id, placeId } = req.params;
        const deleted = await placeService.deletePlaceHistory(placeId, id);

        if (!deleted) {
            return res.status(404).json({ message: 'Place History not found' });
        }
        await deleteAllFilesInPlaceHistoryFolder(placeId, id)
        res.status(200).json({ message: 'Place History deleted successfully' }); // 204 No Content를 반환할 수도 있습니다.
    } catch (error) {
        res.status(500).json({ message: 'Error deleting place history', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};