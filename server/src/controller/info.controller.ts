import { Request, Response } from 'express';
import * as infoService from '../service/info.service';

export const getSubscriptionInfo = async (req: Request, res: Response) => {
    try {
        const info = await infoService.findSubscription();
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching place', error });
    }
};