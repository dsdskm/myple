import { db } from "../config/firebase";
import { Notice } from "../types/notice";
import { getFormattedDateForAccount } from "../common/utils";

const noticeCollection = db.collection("notices");

export const createNewNotice = async (data: Notice): Promise<Notice | null> => {
  try {
    const time = new Date();
    data.id = time.getTime().toString();
    data.created = getFormattedDateForAccount(time);
    data.updated = data.created;

    // startAt/endAt은 프론트가 안 줄 수도 있으면 "" 대신 undefined로 통일 추천
    await noticeCollection.doc(data.id).set(data);
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const updateNotice = async (
  id: string,
  data: Partial<Omit<Notice, "id" | "created">>,
): Promise<Notice | null> => {
  const docRef = noticeCollection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) return null;

  data.updated = getFormattedDateForAccount(new Date());
  await docRef.update(data);

  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...(updatedDoc.data() as Omit<Notice, "id">) };
};

export const findAllNotices = async (): Promise<Notice[]> => {
  const snapshot = await noticeCollection.get();
  if (snapshot.empty) return [];

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Notice, "id">),
  }));
};

export const findNoticeById = async (id: string): Promise<Notice | null> => {
  const doc = await noticeCollection.doc(id).get();
  if (!doc.exists) return null;

  return { id: doc.id, ...(doc.data() as Omit<Notice, "id">) };
};

export const deleteNotice = async (id: string): Promise<boolean> => {
  const docRef = noticeCollection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) return false;

  await docRef.delete();
  return true;
};


// ✅ "YYYYMMDD" -> KST 기준 Date (해당 날짜 00:00:00)
const parseYYYYMMDDToKSTStart = (yyyymmdd: string): Date | null => {
  if (!/^\d{8}$/.test(yyyymmdd)) return null;

  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));

  // KST(UTC+9) 기준 00:00을 UTC로 환산: 전날 15:00Z
  // Date.UTC는 월이 0-based라서 m-1
  return new Date(Date.UTC(y, m - 1, d, -9, 0, 0)); // = KST 00:00
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

// ✅ 현재 시각(now)이 노출 구간에 있는지 검사
// 규칙: startAt 포함, endAt는 "해당 endAt 다음날 00:00" 미만
const isNowWithinNoticeWindow = (notice: Notice, now: Date): boolean => {
  const start = notice.startAt ? parseYYYYMMDDToKSTStart(notice.startAt) : null;
  const end = notice.endAt ? parseYYYYMMDDToKSTStart(notice.endAt) : null;

  // 값이 없으면 열린 구간으로 처리
  const startOk = !start || start.getTime() <= now.getTime();

  // endAt은 "endAt 다음날 00:00"을 종료 시각으로 (exclusive)
  const endExclusive = end ? addDays(end, 1) : null;
  const endOk = !endExclusive || now.getTime() < endExclusive.getTime();

  return startOk && endOk;
};

export const findVisibleNoticesNow = async (): Promise<Notice[]> => {
  // 1) Firestore에서 isVisible=true만 가져오기
  const snapshot = await noticeCollection.where("isVisible", "==", true).get();
  if (snapshot.empty) return [];

  const now = new Date();

  // 2) 현재 시각 기준 기간 필터링
  const list = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Notice, "id">),
  }));

  return list.filter((n) => isNowWithinNoticeWindow(n, now));
};