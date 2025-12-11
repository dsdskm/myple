import { db } from '../config/firebase';
import { Place } from '../types/place';
import { getFormattedDateForAccount } from '../common/utils';

const placeCollection = db.collection('places');

export const findAllPlaces = async (): Promise<Place[]> => {
    const snapshot = await placeCollection.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Place, 'id'>),
    }));
};

export const findPlaceById = async (id: string): Promise<Place | null> => {
    const doc = await placeCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...(doc.data() as Omit<Place, 'id'>) };
};

export const createNewPlace = async (placeData: Place): Promise<Place | null> => {
    try {
        const time = new Date()
        placeData.id = time.getTime().toString()
        placeData.created = getFormattedDateForAccount(time)
        await placeCollection.doc(placeData.id).set(placeData);
        return placeData
    } catch (e) {
        console.log(e)
    }

    return null


};


export const updatePlace = async (id: string, updateData: Partial<Omit<Place, 'id'>>): Promise<Place | null> => {
    const docRef = placeCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        return null; // 장소를 찾을 수 없음
    }

    await docRef.update(updateData);

    // 업데이트된 장소 정보를 다시 가져와 반환
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...(updatedDoc.data() as Omit<Place, 'id'>) };
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
