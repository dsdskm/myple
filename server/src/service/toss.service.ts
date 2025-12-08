import { requestTossAccessToken, requestTossLogout, requestTossUserInfo } from '../api/api';
import { TossToken } from '../types/toss.token';
import { TossUser } from '../types/toss.user';

export const requestAccessToken = async (authorizationCode: string, referrer: string): Promise<TossToken | null> => {
    const tossToken = await requestTossAccessToken(authorizationCode, referrer)
    return tossToken
};


export const requestUserInfo = async (tossToken: TossToken): Promise<TossUser | null> => {
    const tossUser = await requestTossUserInfo(tossToken.accessToken)
    return tossUser
};

export const requestLogout = async (userKey: string): Promise<Boolean> => {
    return await requestTossLogout(userKey)

}