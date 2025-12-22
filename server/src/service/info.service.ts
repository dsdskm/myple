import { db } from '../config/firebase';
import { SubscriptionInfo } from '../types/subscriptionInfo';

const infoCollection = db.collection('_info');

export const findSubscription = async (): Promise<SubscriptionInfo> => {
    const doc = await infoCollection.doc("subscription").get()
    return doc.data() as SubscriptionInfo
};
