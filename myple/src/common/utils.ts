import dayjs, { Dayjs } from "dayjs";
import { ACCOUNT_TYPE_USER_BASIC, ACCOUNT_TYPE_USER_PRO } from "./constants";

export const formatDate = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) {
        return dateTimeString; // 유효하지 않은 경우 원본 반환
    }

    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return `${dateTimeString.split(' ')[0]} ${days[date.getDay()]} ${dateTimeString.split(' ')[1]}`;
}

export const roundToFour = (num: number) => {
    return Math.round(num * 10000) / 10000;
};

export const formatDateWithDay = (dateObj: Dayjs | null) => {
    if (dateObj) {
        const dayOfWeek = dateObj.day(); // 0 - 6 반환
        const koreanDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const formattedDay = koreanDays[dayOfWeek];

        const formattedDate = `${dateObj.format('YYYY-MM-DD')} ${formattedDay} ${dateObj.hour()}:${dateObj.minute().toString().padStart(2, '0')}`;
        return formattedDate;
    } else {
        return ""
    }
}

export const parseDateWithDay = (str: string): Dayjs | null => {
    // 입력이 없으면 바로 null 반환
    if (!str) return null;

    // 정규식으로 날짜·시간·요일을 추출
    //   2025-12-16   → datePart
    //   화요일       → koreanWeekday
    //   14:49        → timePart
    const regex = /^(\d{4}-\d{2}-\d{2})\s+([가-힣]{3,4})\s+(\d{1,2}:\d{2})$/;
    const match = str.match(regex);
    if (!match) return null;               // 포맷이 맞지 않으면 null

    const [, datePart, timePart] = match;

    // 요일은 파싱에 필요 없으므로 무시하고, 날짜·시간만 사용
    // dayjs는 기본적으로 ISO‑8601 형식(YYYY-MM-DDTHH:mm) 을 인식하므로
    // 문자열을 그대로 전달하면 된다.
    const parsed = dayjs(`${datePart} ${timePart}`, 'YYYY-MM-DD HH:mm');

    // (선택) 파싱 결과가 유효한지 한 번 더 확인
    if (!parsed.isValid()) return null;

    return parsed;
};
