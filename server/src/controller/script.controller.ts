import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Media, Place, PlaceHistory } from '../types/place';
import { requestAddress } from '../api/api';
dotenv.config();
import * as placeService from '../service/place.service';
import { decryptUserData } from '../common/decrypt';

const generateNameCategoryMemoTags = (i: number) => {
    const arr = [
        ["광장시장", 1766372877839, "전통 음식이 맛있는 시장", ["#시장", "#맛집", "#국밥"]],
        ["서래마을", 1766372877839, "프랑스식 레스토랑이 많은 곳", ["#프랑스", "#맛집", "#껍데기"]],
        ["광장동 맛집 거리", 1766372877839, "다양한 지역 음식을 즐길 수 있는 곳", ["#중식", "#데이트"]],
        ["잠실 맛집 거리", 1766372877839, "다양한 지역 음식을 즐길 수 있는 곳", ["#잠실", "#연예인", "#인플루언서"]],
        ["스타벅스 리저브", 1766372877839, "프리미엄 커피를 즐길 수 있는 곳", ["#카페", "#분위기", "#사진"]],
        ["홍대입구 카페거리", 1766372877840, "젊은 문화와 예술이 넘치는 곳", ["#커피", "#카페", "#분위기"]],
        ["북촌 한옥마을 카페", 1766372877840, "전통과 현대가 어우러진 카페", ["#한옥", "#외국인", "#한복"]],
        ["강남역 카페거리", 1766372877840, "도심 속 휴식을 제공하는 곳", ["#커피"]],
        ["달빛정원", 1766372877840, "깔끔하고 편안했던 숙소", ["#호텔", "#5성급", "#청결", "#룸서비스"]],
        ["서울숲 숙소", 1766372877840, "자연 속에서 휴식을 취할 수 있는 곳", ["#호텔", "#5성급", "#청결", "#룸서비스", "#서울숲", "#산책로", "#조식"]],
        ["남산타워", 1766372877841, "서울의 야경이 아름다운 곳", ["#야경", "#전망", "#뷰"]],
        ["경복궁", 1766372877841, "한국의 대표적인 궁궐", ["#궁궐"]],
        ["경복궁 근정전", 1766372877841, "한국 전통 건축의 정수를 볼 수 있는 곳"],
        ["부산역", 1766372877841, "부산의 중심 교통 허브", ["#기차역", "#뷰"]],
        ["해운대", 1766372877843, "부산의 대표적인 해변", ["#바닷가", "#해변", "#포토존"]],
        ["서울숲", 1766372877843, "서울의 대표적인 공원", ["#공원"]],
        ["코엑스", 1766372877843, "전시와 컨벤션이 열리는 복합 공간", ["#코엑스", "#쇼핑"]],
        ["잠실운동장", 1766372877843, "운동 경기와 콘서트가 열리는 장소", ["#콘서트", "#HOT"]],
        ["잠실 롯데월드몰", 1766382476297, "쇼핑과 엔터테인먼트가 결합된 복합 공간", ["#잠실", "#롯데"]],
        ["강남역", 1766382476297, "서울의 중심 상업지구", ["#강남", "#롯데"]],
        ["인사동", 1766382476297, "전통 공예품과 갤러리가 많은 거리", ["#인사동", "#전통", "#찻집", "#도자기"]],
    ]
    const index = i % arr.length
    return { name: arr[index][0], category: arr[index][1], memo: arr[index][2], tags: arr[index][3] as string[] }
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

const getMedias = (): Media[] => {
    const images: Media[] = [
        {
            "url": "https://firebasestorage.googleapis.com/v0/b/myple-15ea9.firebasestorage.app/o/places%2F_sample%2Ffood001.jpg?alt=media&token=4f15862d-4194-41a4-88ea-e51e3a9f2cb5",
            "type": "image",
            "fileName": "sample_image1.jpg"
        },
        {
            "url": "https://firebasestorage.googleapis.com/v0/b/myple-15ea9.firebasestorage.app/o/places%2F_sample%2Ffood001.jpg?alt=media&token=4f15862d-4194-41a4-88ea-e51e3a9f2cb5",
            "type": "image",
            "fileName": "sample_image2.jpg"
        },
        {
            "url": "https://firebasestorage.googleapis.com/v0/b/myple-15ea9.firebasestorage.app/o/places%2F_sample%2Fhotel001.jpg?alt=media&token=4ad1f2e3-477e-4201-a03c-2cb577ea625b",
            "type": "image",
            "fileName": "sample_image3.jpg"
        },
        {
            "url": "https://firebasestorage.googleapis.com/v0/b/myple-15ea9.firebasestorage.app/o/places%2F_sample%2Fhotel002.jpg?alt=media&token=a7fec2f0-ba5d-4410-bafe-fabc10671f48",
            "type": "image",
            "fileName": "sample_image4.jpg"
        },
        {
            "url": "https://firebasestorage.googleapis.com/v0/b/myple-15ea9.firebasestorage.app/o/places%2F_sample%2Fsight001.jpg?alt=media&token=75250046-2332-419f-9280-cd458ee66496",
            "type": "image",
            "fileName": "sample_image5.jpg"
        },
        {
            "url": "https://firebasestorage.googleapis.com/v0/b/myple-15ea9.firebasestorage.app/o/places%2F_sample%2Fsight002.jpg?alt=media&token=e44bb184-77b2-4dcf-8a43-d5311bdd2d1e",
            "type": "image",
            "fileName": "sample_image6.jpg"
        }
    ];
    // 2️⃣ 길이가 1-6 사이인지 검증 (범위를 벗어나면 자동 보정)
    const maxLen = Math.min(6, images.length);
    const minLen = 1;
    const randomLen = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;

    // 3️⃣ Fisher‑Yates 알고리즘으로 배열을 섞음
    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 4️⃣ 앞에서 randomLen 개만 슬라이스해서 반환
    return shuffled.slice(0, randomLen);
}


export const generatePlaces = async (req: Request, res: Response) => {
    try {
        const list: Place[] = []
        const count = Number(req.query.count)
        for (let i = 0; i < count; i++) {
            const { name, category } = generateNameCategoryMemoTags(i)
            const { latitude, longitude, address } = await generateLatitudeLongitudeAddress()
            const data: Place = {
                id: '',
                name: name.toString(),
                category: Number(category),
                latitude: latitude,
                longitude: longitude,
                address: address,
                created: '',
                updated: '',
                creator: 'tothetg@naver.com',
                historyList: []
            }
            const createdData = await placeService.createNewPlace(data)
            if (createdData) {
                for (let j = 0; j < Math.floor(Math.random() * 5) + 5; j++) {
                    const { memo, tags } = generateNameCategoryMemoTags(Math.floor(Math.random() * 21) + 1)
                    const history: PlaceHistory = {
                        id: '',
                        placeId: createdData.id,
                        memo: memo.toString(),
                        rating: Math.floor(Math.random() * 5) + 1,
                        visitAt: generatetRandomDateString(),
                        tags: tags,
                        medias: getMedias(),
                        created: '',
                        updated: ''
                    }
                    await placeService.createNewPlaceHistory(history)
                }
            }


        }


        res.status(200).json(list)
    } catch (error) {
        res.status(500)
    }
}

export const deletePlaces = async (req: Request, res: Response) => {
    try {
        console.log(`deletePlaces`)
        await placeService.deleteSamplePlaces()

        res.status(200).json(true)
    } catch (error) {
        res.status(500)
    }
}

export const decryption = async (req: Request, res: Response) => {
    console.log(`decryption`)
    try {
        const cryptedIds: any[] = [
            {
                "name": "EPIMrUaREaajnUL0oabRIyM12bwz4IsbnBioF/icH4dvY/jCIw==",
                "birthday": "EPIMrUaREaajnUL0fwtV+JiqAzTTBGQU5jSOfed4Zojbf2lH",
                "gender": "EPIMrUaREaajnUL0C34oieTYnwmnDuAecaFV38LqJjcukg==",
                "nationality": "EPIMrUaREaajnUL0AXQmieTooXXP7oZfZgUxjlG/aiwy",
                "email": "EPIMrUaREaajnUL07SGPwaM/olfyHf5BWAfWcA=="
            },
            {
                "name": "sWzl2bMMdsXdFtKTuE0a9N9A28HUdiiJlAzm4J/yQarGRCsANr33l2qNPQ==",
                "birthday": "sWzl2bMMdsXdFtKTZeGSLHPKB3Sx8184HMKUrjyZjIIz5+bc",
                "gender": "sWzl2bMMdsXdFtKTGZnnXYbMvYH8XCjBg2SbwznbEcQ=",
                "nationality": "sWzl2bMMdsXdFtKTGJfoWQ6eOBrYrvOeBKVXtftaDTZW",
                "email": "sWzl2bMMdsXdFtKTs6hYy+qXAjChhUuQ9NIGEw=="
            },
            {
                "name": "XFX27dK2+azeHSpHGScIYU/2FfbwWAlxDmeWZr1hVBuxZJvabQ==",
                "birthday": "XFX27dK2+azeHSpHwqews8dxyFRQdTL9ydiL798+Ly+7s5Mm",
                "gender": "XFX27dK2+azeHSpHvt/EzhMY7FSupXhPmIp0wsvxOjg=",
                "nationality": "XFX27dK2+azeHSpHv9HLyrtQIW0ISt8rED2BTwtKSUlh",
                "email": "XFX27dK2+azeHSpHh/H845Iyny0WJQNg2n4mvr51TeRC6ythnxtfk8TuBSPw"
            }


        ]

        cryptedIds.forEach((data) => {
            const name = decryptUserData(data.name || "")
            const birthday = decryptUserData(data.birthday || "")
            const gender = decryptUserData(data.gender || "")
            const nationality = decryptUserData(data.nationality || "")
            const email = decryptUserData(data.email || "")
            console.log(`${data.name} => ${name}`)
            console.log(`${data.birthday} => ${birthday}`)
            console.log(`${data.gender} => ${gender}`)
            console.log(`${data.nationality} => ${nationality}`)
            console.log(`${data.email} => ${email}`)
            console.log()
        })
        res.status(200).json(true)
    } catch (error) {
        res.status(500)
    }
}

