import { Request, Response } from 'express';
import * as tossService from '../service/toss.service';
import { Place } from '../types/place';

export const getUserInfo = async (req: Request, res: Response) => {
    console.log(`getUserInfo`)
    try {
        const { authorizationCode, referrer } = req.params;
        const tossToken = await tossService.requestAccessToken(authorizationCode, referrer)
        if (tossToken) {
            const user = await tossService.requestUserInfo(tossToken);
            console.log(`user`,user)
            res.status(200).json(user);
        } else {
            res.status(500).json(null);
        }


    } catch (error) {
        res.status(500);
    }
};


export const logout = async (req: Request, res: Response) => {
    console.log(`logout`)
    try {
        const { userKey } = req.body;
        await tossService.requestLogout(userKey)
        res.status(200).json(true);
    } catch (error) {
        res.status(500);
    }
};