// src/controller/file.controller.ts
import { bucket, db } from '../config/firebase';
import { Storage } from '@google-cloud/storage';
import { getFormattedDateForFile } from '../common/utils';
import * as fs from 'fs';
import * as path from 'path';
import { Place } from '../types/place';
import { MediaItem, MediaItemResponse } from '../controller/file.controller';

const placeCollection = db.collection('places');

async function uploadToBucket(placeId: string, mediaItems: MediaItem[]): Promise<MediaItemResponse[]> {
    const uploaded: MediaItemResponse[] = [];

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
            uploaded.push({ url: url[0], type });
        }
    } catch (e) {
        console.error('Upload failed:', e);
        throw e; // 에러를 위로 던져서 호출자가 처리할 수 있도록
    }

    return uploaded;
}

async function computeMedias(
    placeId: string,
    uploaded: MediaItemResponse[]
): Promise<MediaItemResponse[]> {
    const placeSnap = await placeCollection
        .doc(placeId)
        .get()
        .catch(() => null); // 문서가 없을 경우null 반환

    // 기존 medias (없으면 빈 배열)
    const existingMedias: { url: string; type: string }[] =
        placeSnap?.data()?.medias ?? [];

    // 기존 URL 집합을 빠르게 찾기 위해 Map 으로 변환
    const existingMap = new Map<string, { url: string; type: string }>();
    existingMedias.forEach((m) => existingMap.set(m.url, m));

    // 업로드된 파일들의 URL 집합
    const uploadedMap = new Map<string, { url: string; type: string }>();
    uploaded.forEach((m) => uploadedMap.set(m.url, m));

    // 1 기존에만 있는 경우 → 삭제 대상 (여기서는 실제 삭제 로직을 넣지 않음)
    const toDelete = [...existingMap.keys()].filter((url) => !uploadedMap.has(url));

    // 2 양쪽 모두 있는 경우 → 유지
    const toKeep = [...uploadedMap.keys()].filter((url) => existingMap.has(url));

    // 3 새로 추가된 경우
    const toAdd = [...uploadedMap.keys()].filter((url) => !existingMap.has(url));

    // 실제 파일 삭제는 여기서 수행 (예시)
    for (const url of toDelete) {
        const file = bucket.file(url);
        await file.delete();
    }

    // 최종 medias 배열: 기존에 있던 것 + 새로 추가된 것
    const finalMedias = [
        ...existingMedias,
        ...toAdd.map((url) => uploadedMap.get(url)!),
    ];

    return finalMedias; // MediaItemResponse[] 배열 반환
}

/* -------------------------------------------------
   4️⃣  메인 함수 – 단계들을 순서대로 실행
   ------------------------------------------------- */
export const uploadFiles = async (
    placeId: string,
    mediaItems: MediaItem[]
): Promise<MediaItemResponse[]> => {
    // 1️⃣ 파일 업로드
    const uploadedItems = await uploadToBucket(placeId, mediaItems);

    // 3️⃣ 기존 문서와 비교해 medias 배열 계산
    const medias = await computeMedias(placeId, uploadedItems);

    // 최종 반환값
    return medias
};