import { db } from "../config/firebase";
import { Account, TossUser } from "../types/account";

import { requestTossAccessToken, requestTossLogout, requestTossOrders, requestTossUserInfo } from "../api/api";
import { TossToken } from "../types/toss.token";
import { TossOrders } from "../types/toss.orders";

export const requestAccessToken = async (authorizationCode: string, referrer: string): Promise<TossToken | null> => {
  const tossToken = await requestTossAccessToken(authorizationCode, referrer);
  return tossToken;
};

export const requestUserInfo = async (tossToken: TossToken): Promise<TossUser | null> => {
  const tossUser = await requestTossUserInfo(tossToken.accessToken);
  return tossUser;
};

export const requestLogout = async (userKey: string, referrer: string): Promise<Boolean> => {
  return await requestTossLogout(userKey, referrer);
};

export const requsetTossOrders = async (userKey: string, orderId: string): Promise<TossOrders> => {
  return await requestTossOrders(userKey, orderId);
};
