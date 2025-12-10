import { db } from '../config/firebase';
import { Account } from '../types/account';
import { getFormattedDateForAccount } from '../common/utils';

const accountCollection = db.collection('accounts');

export const create = async (accountData: Omit<Account, 'id' | 'created'>): Promise<Account> => {
    const newAccount = {
        ...accountData,
        created: getFormattedDateForAccount(new Date()),
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

export const update = async (
    id: string,
    accountData: Partial<Account>
): Promise<void> => {
    console.log(`update id=${id} accountData=${JSON.stringify(accountData)}`);

    try {
        // set() 에 merge:true 를 주면 "업데이트 + 생성"을 한 번에 처리합니다.
        await accountCollection
            .doc(id)
            .set(accountData, { merge: true })
            .catch(err => {
                // Firestore 에러는 구체적인 코드와 메시지를 확인해 주세요.
                console.error('Firestore error:', err);
            });

        console.log(`✅ id=${id} 에 대한 ${accountData ? '업데이트' : '생성'} 완료`);
    } catch (e) {
        console.error('update 함수 내부 오류:', e);
    }
};

export const remove = async (id: string): Promise<void> => {
    await accountCollection.doc(id).delete();
};

export const withdraw = async (body: any): Promise<void> => {
    console.log(`withdraw ${JSON.stringify(body)}`)
}