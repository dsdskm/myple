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
export const getDPlusTime = (time: string): string => {
  const datePart = time.split(" ")[0]; // "2025-12-23"
  const [year, month, day] = datePart.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day); // 월은 0‑base

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (targetDate.toDateString() === today.toDateString()) {
    return "오늘 방문";
  }
  if (targetDate.toDateString() === yesterday.toDateString()) {
    return "어제 방문";
  }

  const diffMs = Math.abs(targetDate.getTime() - today.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1; // 1‑base
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;

  let months = Math.abs((targetYear - todayYear) * 12 + (targetMonth - todayMonth));
  let years = 0;
  if (months >= 12) {
    years = Math.floor(months / 12);
    months = months % 12;
  }

  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  if (years > 0) {
    const monthPart = months > 0 ? `${months}개월` : "";
    return `${years}년 ${monthPart} 전 방문`;
  }

  if (months > 0) {
    return `${months}개월 전 방문`;
  }

  if (weeks > 0) {
    return `${weeks}주 전 방문`;
  }

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

export const generateTossId = (): string => {
  const num = Math.floor(1000000000 + Math.random() * 9000000000);
  return `toss_${num}`;
};
