import { Request, Response } from 'express';
import * as placeService from '../service/place.service';
import { Place } from '../types/place';

export const getAllPlaces = async (req: Request, res: Response) => {
    try {
        const places = await placeService.findAllPlaces();
        res.status(200).json(places);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching places', error });
    }
};

export const getPlaceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const place = await placeService.findPlaceById(id);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.status(200).json(place);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching place', error });
    }
};

export const createPlace = async (req: Request, res: Response) => {
    try {
        const newPlace = await placeService.createNewPlace(req.body);
        res.status(201).json(newPlace);
    } catch (error) {
        res.status(500).json({ message: 'Error creating place', error });
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

export const deletePlace = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await placeService.deletePlace(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Place not found' });
        }

        res.status(200).json({ message: 'Place deleted successfully' }); // 204 No Content를 반환할 수도 있습니다.
    } catch (error) {
        console.error('Error deleting place:', error); // 에러 로깅
        res.status(500).json({ message: 'Error deleting place', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};