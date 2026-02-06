// src/types/history.ts
export type HistoryAction = "create" | "update" | "delete";

/**
 * Product 히스토리 레코드 공용 타입
 * - updated: 문자열(로컬 포맷) 또는 서버 timestamp를 쓰는 경우를 고려해 string | number | Date 허용
 *   (현재 프로젝트는 getFormattedDateForAccount(new Date())로 string 사용)
 */
export interface ProductHistoryRecord<TBefore = any, TAfter = any> {
    action: HistoryAction;            // "create" | "update" | "delete"
    before: TBefore | null;           // 업데이트/삭제 시 이전 상태(부분 또는 전체)
    after: TAfter | null;             // 업데이트/생성 시 이후 상태(부분 또는 전체)
    changedFields?: string[];         // update 시 변경된 필드 목록 (선택)
    reason?: string | null;           // UI에서 전달받은 사유
    updated: string;                  // 표시용(예: "YYYY-MM-DD HH:mm:ss") - 프로젝트 규칙에 맞게 string 사용
    // 아래는 선택: 정렬/검색 등에 쓰려면 추가
    updatedAtMs?: number;             // 정렬용 epoch ms
}

/**
 * before/after를 '부분 스냅샷'으로 쓰고 싶을 때의 타입 별칭
 * 예) before: { place_limit: 10 }, after: { place_limit: 12 }
 */
export type PartialSnapshot<T> = Partial<T>;


export interface ProductHistoryItem {
    id: string;            // history 문서 ID (Date.now() 문자열)
    action?: 'create' | 'update' | 'delete';
    before?: any;
    after?: any;
    changedFields?: string[];
    reason?: string | null;
    updated?: string;      // 표시용 포맷(프로젝트 규칙에 맞춰 string 사용)
    // updatedAtMs?: number; // 저장 중이면 함께 반환 가능
}
