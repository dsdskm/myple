import dayjs, { Dayjs } from "dayjs";

export const roundToFour = (num: number) => {
  return Math.round(num * 10000) / 10000;
};

export const dayjsToText = (dateObj: Dayjs | null) => {
  // date -> 2025-12-23 화요일 16:12
  if (dateObj) {
    const dayOfWeek = dateObj.day(); // 0 - 6 반환
    const koreanDays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const formattedDay = koreanDays[dayOfWeek];

    const formattedDate = `${dateObj.format("YYYY-MM-DD")} ${formattedDay} ${dateObj.hour()}:${dateObj.minute().toString().padStart(2, "0")}`;
    return formattedDate;
  } else {
    return "";
  }
};

export const textToDayjs = (str: string): Dayjs => {
  // 2025-12-23 화요일 16:12 -> dayjs
  if (!str) return dayjs(new Date());
  const regex = /^(\d{4}-\d{2}-\d{2})\s+([가-힣]{3,4})\s+(\d{1,2}:\d{2})$/;
  const match = str.match(regex);
  if (!match) return dayjs(new Date());
  const [, datePart, timePart] = match;
  const parsed = dayjs(`${datePart} ${timePart}`, "YYYY-MM-DD HH:mm");
  if (!parsed.isValid()) return dayjs(new Date());
  return parsed;
};

export const slicingVisitAtTime = (visitAt: string) => {
  const a = visitAt.split(" ");
  return a[0] + " " + a[1];
};

/**
 * 입력 문자열(예: "2025-12-23 화요일 16:12")을 오늘 기준으로
 * 아래 규칙에 맞게 변환한다.
 *
 * 1️⃣ 1년 이상 차이 → "x년 x개월 전 방문"
 * 2️⃣ 1년 미만·1개월 이상 → "x개월 전 방문"
 * 3️⃣ 1개월 미만·1주 이상 → "x주 전 방문"
 * 4️⃣ 1주 미만 → "x일 전 방문"
 * 5️⃣ 어제 → "어제 방문"
 * 6️⃣ 오늘 → "오늘 방문"
 *
 * @param time - "YYYY-MM-DD 요일 HH:mm" 형태 문자열
 * @returns 변환된 문자열
 */
/**
 * "YYYY-MM-DD 요일 HH:mm" 형태 문자열을 오늘 기준으로
 * 아래 규칙에 맞게 변환한다.
 *
 * 1️⃣ 1년 이상 차이 → "x년 x개월 전 방문"
 * 2️⃣ 1년 미만·1개월 이상 → "x개월 전 방문"
 * 3️⃣ 1개월 미만·1주 이상 → "x주 전 방문"
 * 4️⃣ 1주 미만 → "x일 전 방문"
 * 5️⃣ 어제 → "어제 방문"
 * 6️⃣ 오늘 → "오늘 방문"
 *
 * @param time - "2025-12-23 화요일 16:12" 형태 문자열
 * @returns 변환된 문자열
 */
export const getDPlusTime = (time: string): string => {
  // -------------------------------------------------
  // 1️⃣ 입력 파싱
  // -------------------------------------------------
  const datePart = time.split(" ")[0]; // "2025-12-23"
  const [year, month, day] = datePart.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day); // 월은 0‑base

  // -------------------------------------------------
  // 2️⃣ 오늘·어제 날짜 준비 (시간은 00:00:00)
  // -------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // -------------------------------------------------
  // 3️⃣ 오늘·어제 여부 먼저 체크
  // -------------------------------------------------
  if (targetDate.toDateString() === today.toDateString()) {
    return "오늘 방문";
  }
  if (targetDate.toDateString() === yesterday.toDateString()) {
    return "어제 방문";
  }

  // -------------------------------------------------
  // 4️⃣ 차이 계산 (밀리초 → 일)
  // -------------------------------------------------
  // targetDate 가 과거이면 diffMs 가 음수이므로 절대값을 사용
  const diffMs = Math.abs(targetDate.getTime() - today.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // -------------------------------------------------
  // 5️⃣ 연·월·주·일 로 분해
  // -------------------------------------------------
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1; // 1‑base
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;

  // 연·월 차이는 절대값을 기준으로 계산
  let months = Math.abs((targetYear - todayYear) * 12 + (targetMonth - todayMonth));
  let years = 0;
  if (months >= 12) {
    years = Math.floor(months / 12);
    months = months % 12;
  }

  // 남은 일수를 주·일로 변환
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;

  // -------------------------------------------------
  // 6️⃣ 조건에 맞는 문자열 반환
  // -------------------------------------------------
  // 1️⃣ 1년 이상 차이
  if (years > 0) {
    const monthPart = months > 0 ? `${months}개월` : "";
    return `${years}년 ${monthPart} 전 방문`;
  }

  // 2️⃣ 1년 미만·1개월 이상
  if (months > 0) {
    return `${months}개월 전 방문`;
  }

  // 3️⃣ 1개월 미만·1주 이상
  if (weeks > 0) {
    return `${weeks}주 전 방문`;
  }

  // 4️⃣ 1주 미만
  return `${days}일 전 방문`;
};

export const parseKoreanDateTime = (raw: string): Dayjs => {
  const iso = raw.replace(/(\d{4}-\d{2}-\d{2})\s+.+\s+(\d{2}:\d{2})$/, "$1T$2");
  return dayjs(iso); //
};

export const saveId = (id: string) => {
  localStorage.setItem("id", id);
};

export const loadId = (): string => {
  return localStorage.getItem("id") || "";
};
