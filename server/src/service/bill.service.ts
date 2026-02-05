import { db } from "../config/firebase";
import { getFormattedDateForAccount } from "../common/utils";
import { Bill } from "../types/bill";

const billCollection = db.collection("bill");

export const createBill = async (data: Bill): Promise<Bill | null> => {
  try {
    const time = new Date();
    data.id = time.getTime().toString();
    data.created = getFormattedDateForAccount(time);
    await billCollection.doc(data.id).set(data);
    return data;
  } catch (e) {
    console.log(e);
  }

  return null;
};

export const getBills = async (): Promise<Bill[]> => {
  const snapshot = await billCollection.get();
  if (snapshot.empty) {
    return [];
  }
  const list: Bill[] = [];
  for (const doc of snapshot.docs) {
    list.push(doc.data() as Bill);
  }
  return list;
};

export const getBillsByCreator = async (creator: string): Promise<Bill[]> => {
  const snapshot = await billCollection.where("creator", "==", creator).get();
  if (snapshot.empty) {
    return [];
  }
  const list: Bill[] = [];
  for (const doc of snapshot.docs) {
    list.push(doc.data() as Bill);
  }
  return list;
};
