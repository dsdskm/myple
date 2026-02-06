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
