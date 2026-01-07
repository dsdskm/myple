import { db } from '../config/firebase';
import { Place, PlaceHistory } from '../types/place';
import { getFormattedDateForAccount } from '../common/utils';

const placeCollection = db.collection('places');
const COLLECTION_PLACE_HISTORY = "history"

export const createNewPlace = async (data: Place): Promise<Place | null> => {
    try {
        const time = new Date()
        data.id = time.getTime().toString()
        data.created = getFormattedDateForAccount(time)
        data.updated = data.created
        await placeCollection.doc(data.id).set(data);
        return data
    } catch (e) {
        console.log(e)
    }

    return null
};

export const createNewPlaceHistory = async (data: PlaceHistory): Promise<PlaceHistory | null> => {
    try {
        const time = new Date()
        data.id = time.getTime().toString()
        data.created = getFormattedDateForAccount(time)
        data.updated = data.created
        await placeCollection.doc(data.placeId).collection(COLLECTION_PLACE_HISTORY).doc(data.id).set(data);
        return data
    } catch (e) {
        console.log(e)
    }

    return null
};

export const updatePlace = async (id: string, data: Partial<Omit<Place, 'id'>>): Promise<Place | null> => {
    const docRef = placeCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        return null;
    }
    data.updated = getFormattedDateForAccount(new Date())
    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...(updatedDoc.data() as Omit<Place, 'id'>) };
};

export const updatePlaceHistory = async (id: string, data: Partial<Omit<PlaceHistory, 'id'>>): Promise<PlaceHistory | null> => {
    if (!data.placeId) {
        return null;
    }
    const docRef = placeCollection.doc(data.placeId).collection(COLLECTION_PLACE_HISTORY).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        return null;
    }
    data.updated = getFormattedDateForAccount(new Date())
    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...(updatedDoc.data() as Omit<PlaceHistory, 'id'>) };
};

export const findAllPlaces = async (): Promise<Place[]> => {
    const snapshot = await placeCollection.get();
    if (snapshot.empty) {
        return [];
    }
    const list: Place[] = []
    for (const doc of snapshot.docs) {
        const data = doc.data()
        const placeHistorySnapshot = await placeCollection.doc(data.id).collection("history").get()
        const historyList = []
        for (const subdoc of placeHistorySnapshot.docs) {
            const subdata = subdoc.data()
            historyList.push(subdata)
        }
        data.historyList = historyList
        list.push(data as Place)
    }
    return list
};


export const findAllPlaceHistories = async (placeId: string): Promise<PlaceHistory[]> => {
    const snapshot = await placeCollection.doc(placeId).collection(COLLECTION_PLACE_HISTORY).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<PlaceHistory, 'id'>),
    }));
};


export const findPlacesByCreator = async (creator: string): Promise<Place[]> => {
    const query = placeCollection.where('creator', '==', creator);
    const snapshot = await query.get();
    if (snapshot.empty) {
        return [];
    }
    const list: Place[] = []
    for (const doc of snapshot.docs) {
        const data = doc.data()
        const placeHistorySnapshot = await placeCollection.doc(data.id).collection("history").get()
        const historyList = []
        for (const subdoc of placeHistorySnapshot.docs) {
            const subdata = subdoc.data()
            historyList.push(subdata)
        }
        data.historyList = historyList
        list.push(data as Place)
    }
    return list
};

export const findPlaceHistoryById = async (placeId: string, id: string): Promise<PlaceHistory> => {
    const query = placeCollection.doc(placeId).collection(COLLECTION_PLACE_HISTORY).doc(id)
    const doc = await query.get();
    return doc.data() as PlaceHistory
};


export const deletePlace = async (id: string): Promise<boolean> => {
    const docRef = placeCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        return false; // 장소를 찾을 수 없음
    }
    await docRef.delete();
    return true;
};

export const deletePlaceHistory = async (placeId: string, id: string): Promise<boolean> => {
    const docRef = placeCollection.doc(placeId).collection(COLLECTION_PLACE_HISTORY).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        return false; // 장소를 찾을 수 없음
    }
    await docRef.delete();
    return true;
};

export const deletePlaces = async (): Promise<boolean> => {
    const batch = db.batch()
    const snapshot = await placeCollection.get(); // 컬렉션의 모든 문서 가져오기

    snapshot.forEach(doc => {
        batch.delete(doc.ref); // 각 문서에 대해 삭제 작업 추가
    });
    await batch.commit(); // 배치 실행 (한 번에 모두 적용)
    return true;
};

export const deleteSamplePlaces = async (): Promise<boolean> => {
    const batch = db.batch()
    const snapshot = await placeCollection.where("sample", "==", true).get(); // 컬렉션의 모든 문서 가져오기

    snapshot.forEach(doc => {
        batch.delete(doc.ref); // 각 문서에 대해 삭제 작업 추가
    });
    await batch.commit(); // 배치 실행 (한 번에 모두 적용)
    return true;
};