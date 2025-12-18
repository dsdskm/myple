// src/controller/file.controller.ts
import { bucket, db } from '../config/firebase';
import { getFormattedDateForFile } from '../common/utils';
import * as path from 'path';
import { Place } from '../types/place';
import { MediaFile, Media } from '../controller/file.controller';

async function uploadToBucket(placeId: string, mediaItems: MediaFile[]): Promise<Media[]> {
    const uploaded: Media[] = [];

    try {
        for (const { file, type } of mediaItems) {
            // 파일 이름에 날짜를 붙여 고유하게 만든다.
            const originalName = file.originalname; // 예: "myphoto.jpg"
            const ext = path.extname(originalName);
            const fileName = `${placeId}_${getFormattedDateForFile()}${ext}`;
            const destination = bucket.file(`places/${placeId}/${fileName}`);

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
    mediaItems: MediaFile[]
): Promise<Media[]> => {
    // 1️⃣ 파일 업로드
    return await uploadToBucket(placeId, mediaItems);
};

export async function deleteOrphanFiles(
    placeId: string,
): Promise<void> {
    // 1️⃣ Firestore에서 해당 장소 도큐먼트를 가져옵니다.
    const placeRef = db.collection('places').doc(placeId);
    const placeSnap = await placeRef.get();
    const placeData: Place = placeSnap.data() as Place
    const recordedMedias: string[] = (placeData.medias as Media[]).map(
        (m) => m.fileName ?? ''
    );

    // 2️⃣ GCP Storage에서 해당 폴더(places/${placeId})에 존재하는 모든 파일명을 조회합니다.
    const storageFolder = `places/${placeId}`;
    const [storageFiles] = await bucket.getFiles({
        prefix: storageFolder,
    });

    // 3️⃣ 각 파일을 순회하면서, Firestore에 기록되지 않은 파일이면 삭제합니다.
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

    console.log(`[deleteAllFilesInPlaceFolder] Deleting all objects under prefix: ${prefix}`);

    // 1️⃣ 해당 프리픽스를 가진 모든 객체(파일/폴더) 목록 조회
    const [files] = await bucket.getFiles({ prefix });

    if (files.length === 0) {
        console.log(`[deleteAllFilesInPlaceFolder] No files found under ${prefix}`);
        return;
    }

    // 2️⃣ 각 파일(객체) 삭제
    for (const file of files) {
        try {
            await file.delete();
            console.log(`[deleteAllFilesInPlaceFolder] Deleted: ${file.name}`);
        } catch (err) {
            console.error(`[deleteAllFilesInPlaceFolder] Failed to delete ${file.name}:`, err);
            // 개별 파일 삭제 실패 시에도 다른 파일은 계속 삭제
        }
    }

    console.log(`[deleteAllFilesInPlaceFolder] Finished deleting all objects under ${prefix}`);
}