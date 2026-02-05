import { Request, Response } from 'express';
import * as tossService from '../service/toss.service';
import * as accountService from '../service/account.service';
import * as categoryService from '../service/category.service';
import * as productService from "../service/product.service"
import { decryptUserData } from '../common/decrypt';
import { Account } from '../types/account';
import { Product } from '../types/product';
import { PRODUCT_LIMIT } from '../common/constants';


export const getUserInfo = async (req: Request, res: Response) => {
    try {
        const { authorizationCode, referrer } = req.params;
        const tossToken = await tossService.requestAccessToken(authorizationCode, referrer)
        console.log(`getUserInfo authorizationCode ${authorizationCode} referrer ${referrer} tossToken ${JSON.stringify(tossToken)}`)
        if (tossToken) {
            const user = await tossService.requestUserInfo(tossToken);
            console.log(`getUserInfo user ${JSON.stringify(user)}`)
            if (user) {
                const accountData: Account | null = {
                    id: user.userKey.toString(),
                    type: 'BASIC',
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
                    email: decryptUserData(user.email),
                    updated: ""
                }
                const a = await accountService.findById(accountData.id)
                if (a) {
                    accountData.type = a.type
                    accountData.status = a.status
                    accountData.updated = a.updated
                }
                await accountService.update(accountData.id, accountData)
                await categoryService.init(accountData.id)
                const p = await productService.findById(accountData.id)
                if (!p) {
                    const product: Product = {
                        id: accountData.id,
                        category_limit: PRODUCT_LIMIT.CATEGORY,
                        place_limit: PRODUCT_LIMIT.PLACE,
                        place_history_photo_limit: PRODUCT_LIMIT.PLACE_HISTORY_PHOTO,
                        created: '',
                        updated: ''
                    }
                    await productService.create(product)
                    console.log(`user product info created ${JSON.stringify(product)}`)
                }
                res.status(200).json(accountData);
                return
            }
        }
        res.status(500).json(null);


    } catch (error) {
        console.log(`error`, error)
        res.status(500).json(null);
    }
};


export const logout = async (req: Request, res: Response) => {
    console.log(`logout`)
    try {
        const { userKey, referrer } = req.body;
        await tossService.requestLogout(userKey, referrer)
        res.status(200).json(true);
    } catch (error) {
        res.status(500);
    }
};