import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Place } from '../types/place';
import { requestAddress } from '../api/api';
dotenv.config();
import * as placeService from '../service/place.service';

const generateNameCategoryMemo = (i: number) => {
    const arr = [
        ["광장시장", "맛집", "전통 음식이 맛있는 시장"],
        ["서래마을", "맛집", "프랑스식 레스토랑이 많은 곳"],
        ["광장동 맛집 거리", "맛집", "다양한 지역 음식을 즐길 수 있는 곳"],
        ["잠실 맛집 거리", "맛집", "다양한 지역 음식을 즐길 수 있는 곳"],
        ["스타벅스 리저브", "카페", "프리미엄 커피를 즐길 수 있는 곳"],
        ["홍대입구 카페거리", "카페", "젊은 문화와 예술이 넘치는 곳"],
        ["북촌 한옥마을 카페", "카페", "전통과 현대가 어우러진 카페"],
        ["강남역 카페거리", "카페", "도심 속 휴식을 제공하는 곳"],
        ["달빛정원", "숙소", "깔끔하고 편안했던 숙소"],
        ["서울숲 숙소", "숙소", "자연 속에서 휴식을 취할 수 있는 곳"],
        ["남산타워", "숙소", "서울의 야경이 아름다운 곳"],
        ["경복궁", "숙소", "한국의 대표적인 궁궐"],
        ["경복궁 근정전", "관광", "한국 전통 건축의 정수를 볼 수 있는 곳"],
        ["부산역", "관광", "부산의 중심 교통 허브"],
        ["해운대", "관광", "부산의 대표적인 해변"],
        ["서울숲", "관광", "서울의 대표적인 공원"],
        ["코엑스", "기타", "전시와 컨벤션이 열리는 복합 공간"],
        ["잠실운동장", "기타", "운동 경기와 콘서트가 열리는 장소"],
        ["잠실 롯데월드몰", "기타", "쇼핑과 엔터테인먼트가 결합된 복합 공간"],
        ["강남역", "기타", "서울의 중심 상업지구"],
        ["인사동", "관광", "전통 공예품과 갤러리가 많은 거리"],
        ["잠실", "기타", "서울의 대표적인 상업지구"]
    ]
    const index = i % arr.length
    return { name: arr[index][0], category: arr[index][1], memo: arr[index][2] }
}

const generateLatitudeLongitudeAddress = async (): Promise<{
    latitude: number;
    longitude: number;
    address: string;
}> => {
    // 남한 내에서만 랜덤 좌표 생성
    const lat = Math.random() * (38.0 - 33.0) + 33.0; // 위도: 33 - 38
    const lng = Math.random() * (129.5 - 126.0) + 126.0; // 경도: 126 - 130

    // 소수점 6자리로 반올림
    const latitude = Math.round(lat * 1_000_000) / 1_000_000;
    const longitude = Math.round(lng * 1_000_000) / 1_000_000;

    let address = await requestAddress(latitude, longitude);
    if (!address.startsWith("대한민국")) {
        address = ""
    }

    return { latitude, longitude, address };
};
function generatetRandomDateString(): string {
    // 1️⃣ 시작·끝 시점 (밀리초)
    const start = new Date('2024-01-01T00:00:00');
    const end = new Date('2025-12-01T23:59:59');

    // 2️⃣ 두 시점 사이의 전체 밀리초 차이
    const maxMs = end.getTime() - start.getTime();

    // 3️⃣ 무작위 밀리초 값 (0 - maxMs)
    const randomMs = Math.floor(Math.random() * (maxMs + 1));

    // 4️⃣ 시작 시점에 무작위 밀리초를 더해 목표 날짜·시간을 만든다
    const randomDate = new Date(start.getTime() + randomMs);

    // 5️⃣ 요일 한글 매핑
    const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = weekDays[randomDate.getDay()]; // getDay(): 0=일, 1=월, ...

    // 6️⃣ 원하는 포맷으로 문자열 생성
    const pad = (n: number) => String(n).padStart(2, '0');

    const formatted = `${randomDate.getFullYear()}-${pad(randomDate.getMonth() + 1)}-${pad(randomDate.getDate())} ` +
        `${dayName} ${pad(randomDate.getHours())}:${pad(randomDate.getMinutes())}`;

    return formatted;
}


export const generatePlaces = async (req: Request, res: Response) => {
    try {
        console.log(`generatePlaces`)
        const list: Place[] = []
        const count = 20
        for (let i = 0; i < count; i++) {
            const { name, category, memo } = generateNameCategoryMemo(i)
            const { latitude, longitude, address } = await generateLatitudeLongitudeAddress()
            const data: Place = {
                id: '',
                name: name,
                category: category,
                latitude: latitude,
                longitude: longitude,
                address: address,
                memo: memo,
                rating: Math.floor(Math.random() * 5) + 1,
                visitAt: generatetRandomDateString(),
                created: '',
                updated: '',
                medias: [],
                tags: [],
                creator: 'tothetg@naver.com'
            }
            await placeService.createNewPlace(data)
        }


        res.status(200).json(list)
    } catch (error) {
        res.status(500)
    }
}

export const deletePlaces = async (req: Request, res: Response) => {
    try {
        console.log(`deletePlaces`)
        await placeService.deletePlaces()

        res.status(200).json(true)
    } catch (error) {
        res.status(500)
    }
}