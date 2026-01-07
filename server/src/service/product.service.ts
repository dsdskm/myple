import { db } from '../config/firebase';
import { Account } from '../types/account';
import { getFormattedDateForAccount } from '../common/utils';
import { Product } from '../types/product';

const productCollection = db.collection('products');

export const create = async (data: Omit<Product, 'updated' | 'created'>): Promise<Product> => {
    const newData = {
        ...data,
        created: getFormattedDateForAccount(new Date()),
        updated: getFormattedDateForAccount(new Date()),
    };
    await productCollection.doc(newData.id).set(newData);
    return newData as Product;
};

export const findAll = async (): Promise<Product[]> => {
    const snapshot = await productCollection.get();
    if (snapshot.empty) {
        return [];
    }
    const accounts: Product[] = [];
    snapshot.forEach(doc => {
        accounts.push({ id: doc.id, ...doc.data() } as Product);
    });
    return accounts;
};

export const findById = async (id: string): Promise<Product | null> => {
    const doc = await productCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Product : null;
};

export const update = async (
    id: string,
    data: Partial<Product>
): Promise<void> => {
    try {
        data.updated = getFormattedDateForAccount(new Date())
        await productCollection
            .doc(id)
            .set(data, { merge: true })
            .catch(err => {
                console.error('Firestore error:', err);
            });

    } catch (e) {
        console.error('update 함수 내부 오류:', e);
    }
};

export const remove = async (id: string): Promise<void> => {
    await productCollection.doc(id).delete();
};