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

export const findPlacesById = async (creatorId: string): Promise<Place[]> => {
    const query = placeCollection.where('creator', '==', creatorId);
    const snapshot = await query.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => doc.data() as Place);
};

export const createNewPlace = async (placeData: Place): Promise<Place | null> => {
    try {
        const time = new Date()
        placeData.id = time.getTime().toString()
        placeData.created = getFormattedDateForAccount(time)
        placeData.updated = placeData.created
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

export const deletePlaces = async (): Promise<boolean> => {
    const batch = db.batch()
    const snapshot = await placeCollection.get(); // 컬렉션의 모든 문서 가져오기

    snapshot.forEach(doc => {
        batch.delete(doc.ref); // 각 문서에 대해 삭제 작업 추가
    });
    await batch.commit(); // 배치 실행 (한 번에 모두 적용)
    return true;
};