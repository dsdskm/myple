import { db } from '../config/firebase';
import { Account } from '../types/account';
import { getFormattedDate } from '../utils';

const accountCollection = db.collection('accounts');

export const create = async (accountData: Omit<Account, 'id' | 'created'>): Promise<Account> => {
    const newAccount = {
        ...accountData,
        created: getFormattedDate(new Date()),
    };
    const docRef = await accountCollection.add(newAccount);
    return {
        id: docRef.id,
        ...newAccount,
    } as Account;
};

export const findAll = async (): Promise<Account[]> => {
    const snapshot = await accountCollection.get();
    if (snapshot.empty) {
        return [];
    }
    const accounts: Account[] = [];
    snapshot.forEach(doc => {
        accounts.push({ id: doc.id, ...doc.data() } as Account);
    });
    return accounts;
};

export const findById = async (id: string): Promise<Account | null> => {
    const doc = await accountCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Account : null;
};

export const update = async (id: string, accountData: Partial<Account>): Promise<void> => {
    await accountCollection.doc(id).update(accountData);
};

export const remove = async (id: string): Promise<void> => {
    await accountCollection.doc(id).delete();
};

export const withdraw = async (body: any): Promise<void> => {
    console.log(`withdraw ${JSON.stringify(body)}`)
}