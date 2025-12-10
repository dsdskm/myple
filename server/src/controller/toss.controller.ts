import { Request, Response } from 'express';
import * as tossService from '../service/toss.service';
import * as accountService from '../service/account.service';
import { decryptUserData } from '../common/decrypt';
import { Account } from '../types/account';
import { updateAccount } from './account.controller';

export const getUserInfo = async (req: Request, res: Response) => {
    console.log(`getUserInfo`)
    try {
        const { authorizationCode, referrer } = req.params;
        const tossToken = await tossService.requestAccessToken(authorizationCode, referrer)
        if (tossToken) {
            const user = await tossService.requestUserInfo(tossToken);
            const accountData: Account | null = user ? {
                id: decryptUserData(user.email),
                type: 'user',
                status: 'active',
                userKey: user.userKey,
                scope: user.scope,
                agreedTerms: user.agreedTerms,
                name: decryptUserData(user.name),
                callingCode: decryptUserData(user.callingCode),
                phone: decryptUserData(user.phone),
                birthday: decryptUserData(user.birthday),
                ci: decryptUserData(user.ci),
                di: decryptUserData(user.di),
                gender: decryptUserData(user.gender),
                nationality: decryptUserData(user.nationality),
                email: decryptUserData(user.email)
            } : null
            if (accountData) {
                await accountService.update(accountData.id, accountData)
            }

            res.status(200).json(accountData);
        } else {
            res.status(500).json(null);
        }


    } catch (error) {
        res.status(500);
    }
};


export const logout = async (req: Request, res: Response) => {
    try {
        const { userKey } = req.body;
        await tossService.requestLogout(userKey)
        res.status(200).json(true);
    } catch (error) {
        res.status(500);
    }
};