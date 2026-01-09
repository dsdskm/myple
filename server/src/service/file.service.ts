// src/controller/file.controller.ts
import { bucket, db } from '../config/firebase';
import { getFormattedDateForFile } from '../common/utils';
import * as path from 'path';
import { Media, MediaFile, Place, PlaceHistory } from '../types/place';

async function uploadToBucket(placeId: string, id: string, mediaItems: MediaFile[]): Promise<Media[]> {
    const uploaded: Media[] = [];
    console.log(`uploadToBucket placeId ${placeId} place history id ${id}`)
    try {
        for (const { file, type } of mediaItems) {
            // 파일 이름에 날짜를 붙여 고유하게 만든다.
            const originalName = file.originalname; // 예: "myphoto.jpg"
            const ext = path.extname(originalName);
            const fileName = `${placeId}_${id}_${getFormattedDateForFile()}${ext}`;
            const destination = bucket.file(`places/${placeId}/${id}/${fileName}`);

            // 버퍼를 이용해 업로드
            await destination.save(file.buffer, {
                gzip: false,
                resumable: true,
            });

            const url = await destination.getSignedUrl({ action: 'read', expires: '03-01-2500' });
            uploaded.push({ url: url[0], type: type, fileName: fileName });
        }
    } catch (e) {
        console.error('Upload failed:', e);
        throw e; // 에러를 위로 던져서 호출자가 처리할 수 있도록
    }

    return uploaded;
}

/* -------------------------------------------------
   4️⃣  메인 함수 – 단계들을 순서대로 실행
   ------------------------------------------------- */
export const uploadFiles = async (
    placeId: string,
    id: string,
    mediaItems: MediaFile[]
): Promise<Media[]> => {
    console.log(`uploadFiles placeId ${placeId} place history id ${id}`)
    return await uploadToBucket(placeId, id, mediaItems);
};

export async function deleteOrphanFiles(
    placeId: string,
    id: string
): Promise<void> {
    const placeHistoryRef = db.collection('places').doc(placeId).collection("history").doc(id);
    const placeHistoryDoc = await placeHistoryRef.get();
    const placeHistoryData: PlaceHistory = placeHistoryDoc.data() as PlaceHistory
    const recordedMedias: string[] = (placeHistoryData.medias as Media[]).map(
        (m) => m.fileName ?? ''
    );

    const storageFolder = `places/${placeId}/${id}`;
    const [storageFiles] = await bucket.getFiles({
        prefix: storageFolder,
    });

    for (const file of storageFiles) {
        const fullPath = file.name; // 예: "places/<placeId>/abc_20231101.jpg"
        const relativePath = path.basename(fullPath); // "abc_20231101.jpg"

        // 이미 DB에 존재하는 파일이면 건너뛰기
        if (recordedMedias.includes(relativePath)) continue;

        // DB에 없으니 실제 파일을 삭제
        try {
            await file.delete();
            console.info(`[deleteOrphanFiles] Deleted orphan file: ${relativePath}`);
        } catch (err) {
            console.error(`[deleteOrphanFiles] Failed to delete file ${relativePath}:`, err);
            // 여기서는 계속 진행하도록 하고, 필요하면 에러를 재throw 할 수 있습니다.
        }
    }
}

export async function deleteAllFilesInPlaceFolder(placeId: string): Promise<void> {
    const prefix = `places/${placeId}/`;
    const [files] = await bucket.getFiles({ prefix });

    if (files.length === 0) {
        return;
    }

    // 2️⃣ 각 파일(객체) 삭제
    for (const file of files) {
        try {
            await file.delete();
            console.log(`[deleteAllFilesInPlaceFolder] Deleted: ${file.name}`);
        } catch (err) {
        }
    }
}

export async function deleteAllFilesInPlaceHistoryFolder(placeId: string, id: string): Promise<void> {
    const prefix = `places/${placeId}/${id}`;
    const [files] = await bucket.getFiles({ prefix });

    if (files.length === 0) {
        return;
    }
    for (const file of files) {
        try {
            await file.delete();
            console.log(`[deleteAllFilesInPlaceHistoryFolder] Deleted: ${file.name}`);
        } catch (err) {
        }
    }
}