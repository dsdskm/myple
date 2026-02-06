import { db } from '../config/firebase';
import { getFormattedDateForAccount } from '../common/utils';
import { Product } from '../types/product';
import { PartialSnapshot, ProductHistoryItem, ProductHistoryRecord } from '../types/product.history';
import { firestore } from 'firebase-admin';

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


function getShallowDiff(before: Record<string, any>, after: Record<string, any>): string[] {
    const changedKeys = new Set<string>();
    const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    for (const k of keys) {
        const b = before?.[k];
        const a = after?.[k];
        const same =
            b === a ||
            (Number.isNaN(b) && Number.isNaN(a)) ||
            (b == null && a == null);
        if (!same) changedKeys.add(k);
    }
    return Array.from(changedKeys);
}

function picked<T extends object>(obj: T, keys: string[]): Partial<T> {
    const out: Partial<T> = {};
    for (const k of keys) (out as any)[k] = (obj as any)[k];
    return out;
}

/**
 * 업데이트 + 이력 기록
 * - 요청 data에서 reason 분리
 * - products/{id} 문서에는 reason 저장하지 않음
 * - products/{id}/history/{timestamp} 문서에 reason 포함하여 저장
 */
export async function updateWithHistory(
    id: string,
    data: Partial<Product> & { reason?: string }
): Promise<void> {
    const productRef = productCollection.doc(id);
    const historyColRef = productRef.collection("history");
    const historyDocId = `${Date.now()}`;

    const { reason, ...patch } = data || {};

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(productRef);
        if (!snap.exists) throw new Error(`Product(${id}) 문서가 존재하지 않습니다.`);
        const before = snap.data() as Product;

        const clientUpdated = getFormattedDateForAccount(new Date());
        const afterPatch: Partial<Product> = { ...patch, updated: clientUpdated };
        const mergedAfter = { ...before, ...afterPatch };

        let changedFields = getShallowDiff(before, mergedAfter)
            .filter((k) => k !== "updated"); // 시스템 필드 제외

        // 변경 없음이면 스킵(사유만 기록하려면 이 조건 제거)
        if (changedFields.length === 0) return;

        // 1) 문서 업데이트
        tx.set(productRef, afterPatch, { merge: true });

        // 2) 히스토리 기록 (부분 스냅샷)
        const historyPayload: ProductHistoryRecord<PartialSnapshot<Product>, PartialSnapshot<Product>> = {
            action: "update",
            before: picked(before, changedFields),
            after: picked(mergedAfter, changedFields),
            changedFields,
            reason: reason ?? null,
            updated: getFormattedDateForAccount(new Date()),
            // updatedAtMs: Number(historyDocId),                 // 필요 시 활성화
            // updatedAt: firebase.firestore.FieldValue.serverTimestamp(), // 서버 timestamp를 함께 저장하고 싶다면 타입에 필드 추가 필요
        };

        tx.set(historyColRef.doc(historyDocId), historyPayload);
    });
}

/** 기존 update() 래핑 */
export const update = async (
    id: string,
    data: Partial<Product> & { reason?: string }
): Promise<void> => {
    try {
        await updateWithHistory(id, data);
    } catch (e) {
        console.error("updateWithHistory 내부 오류:", e);
    }
};

/**
 * 삭제 + 이력 기록 (선택 구현)
 * - 삭제 이전 전체 스냅샷(before) 기록
 * - after=null, action="delete", reason 함께 저장
 */
export const remove = async (id: string, reason?: string): Promise<void> => {
    const productRef = productCollection.doc(id);
    const historyColRef = productRef.collection("history");
    const historyDocId = `${Date.now()}`;

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(productRef);
        if (!snap.exists) return;

        const before = snap.data() as Product;

        const historyPayload: ProductHistoryRecord<Product, null> = {
            action: "delete",
            before,                   // 전체 스냅샷
            after: null,
            changedFields: Object.keys(before ?? {}),
            reason: reason ?? null,
            updated: getFormattedDateForAccount(new Date()),
            // updatedAtMs: Number(historyDocId),
        };

        tx.set(historyColRef.doc(historyDocId), historyPayload);
        tx.delete(productRef);
    });
};


export async function fetchProductHistoryAll(userKey: string): Promise<ProductHistoryItem[]> {
    const historyColRef = db.collection('products').doc(userKey).collection('history');

    const snap = await historyColRef.get();

    const items: ProductHistoryItem[] = [];
    snap.forEach(doc => {
        items.push({
            id: doc.id,
            ...(doc.data() as Omit<ProductHistoryItem, 'id'>),
        });
    });

    return items;
}
