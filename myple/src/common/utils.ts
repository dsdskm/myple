import { Dayjs } from "dayjs";

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