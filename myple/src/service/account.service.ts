import { db } from "../config/firebase";
import { Account } from "../types/account";
import { getFormattedDate } from "../utils";

const accountCollection = db.collection("accounts");

export const findAllAccounts = async (): Promise<Account[]> => {
  const snapshot = await accountCollection.get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Account, "id">),
  }));
};

export const findAccountById = async (id: string): Promise<Account | null> => {
  const doc = await accountCollection.doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...(doc.data() as Omit<Account, "id">) };
};

export const createNewAccount = async (accountData: Account): Promise<void> => {
  try {
    const time = new Date();
    accountData.id = time.getTime().toString();
    accountData.created = getFormattedDate(time);
    console.log(`createNewAccount ${JSON.stringify(accountData)}`);
    await accountCollection.doc(accountData.id).set(accountData);
  } catch (e) {
    console.error(e);
  }
};

export const updateAccount = async (
  id: string,
  updateData: Partial<Omit<Account, "id">>
): Promise<Account | null> => {
  const docRef = accountCollection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null; // 계정을 찾을 수 없음
  }

  await docRef.update(updateData);

  // 업데이트된 계정 정보를 다시 가져와 반환
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...(updatedDoc.data() as Omit<Account, "id">) };
};

export const deleteAccount = async (id: string): Promise<boolean> => {
  const docRef = accountCollection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return false; // 계정을 찾을 수 없음
  }
  await docRef.delete();
  return true;
};

export const withdrawAccount = async (): Promise<void> => {
  console.log("withdrawAccount");
  return;
};
