import axios from 'axios';
import { Media, Place } from '../types/place';
import { Account } from '../types/account';
import FormData from 'form-data';
import { Category } from '../types/category';

const serverApiClient = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getHeaders = (token?: string): Record<string, string | number | boolean> => {
    const headers: Record<string, string | number | boolean> = {
        // 기본 헤더 (Content-Type 등)
        ...(serverApiClient.defaults.headers as Record<string, string | number | boolean>),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;               // 순수 객체만 반환
};

// -------------------------------------------------
// 3️⃣ GET 함수 (제네릭 T 로 반환 타입을 지정)
// -------------------------------------------------
export const get = async <T>(url: string, token?: string): Promise<T> => {
    try {
        const response = await serverApiClient.get<T>(url, {
            headers: getHeaders(token),
        });
        return response.data;
    } catch (err) {
        // 여기서 에러 로깅·전파 등을 자유롭게 처리
        console.error('GET request error:', err);
        throw err;
    }
};

// -------------------------------------------------
// 4️⃣ POST 함수 (응답 타입 TResponse, 요청 바디 TBody)
// -------------------------------------------------
export const post = async <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    token?: string
): Promise<TResponse> => {
    try {
        const response = await serverApiClient.post<TResponse>(url, body, {
            headers: getHeaders(token),
        });
        return response.data;
    } catch (err) {
        console.error('POST request error:', err);
        throw err;
    }
};

export const uploadFiles = async (
    placeId: string,
    pictures: Media[]
): Promise<Media[]> => {

    if (pictures.length === 0) {
        return []
    }

    const form = new FormData();
    form.append('placeId', placeId);

    for (const image of pictures) {
        const base64 = image.url

        // Base64 문자열이 비어 있거나 유효하지 않은 경우 처리
        const binary = atob(base64);
        const uint8 = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            uint8[i] = binary.charCodeAt(i);
        }

        // Blob 생성 (MIME 타입 지정)
        const blob = new Blob([uint8], { type: 'image/jpeg' });

        // 파일명은 image.id 로 지정 (필요하면 .jpg 등 확장자 추가)
        const fileName = `${image.fileName}`;
        console.log(`Appending file: ${fileName}`);
        form.append('files', blob, fileName);
    }

    try {
        // axios로 POST 요청 (헤더 지정 X)
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}file/upload`, form);
        return response.data
    } catch (error) {
        console.log(error)
    }

    return []
};


export const createPlace = async (placeData: Omit<Place, 'id' | 'created'>): Promise<Place> => {
    const response = await serverApiClient.post<Place>('/place', placeData);
    return response.data;
};

export const updatePlace = async (id: string, placeData: Partial<Omit<Place, 'id' | 'created'>>): Promise<Place> => {
    const response = await serverApiClient.put<Place>(`/place/${id}`, placeData);
    return response.data;
};


export const getPlaces = async (id: string): Promise<Place[] | []> => {
    const response = await serverApiClient.get<Place[] | []>(`/place/${id}`);
    return response.data;
};

export const deletePlace = async (id: string): Promise<void> => {
    await serverApiClient.delete(`/place/${id}`);
};

export const requestUserInfo = async (authorizationCode: string, referrer: string): Promise<Account | null> => {
    try {
        const response = await serverApiClient.get(`/toss/user/${authorizationCode}/${referrer}`)
        return response.data
    } catch (e) {
        return null
    }

}

export const requestLogout = async (userKey: number, referrer: string) => {
    return await serverApiClient.post("/toss/logout", { "userKey": userKey, "referrer": referrer })
}

export const createCategory = async (data: Omit<Category, 'id' | 'created'>): Promise<Place> => {
    const response = await serverApiClient.post<Place>('/category', data);
    return response.data;
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | 'created'>>): Promise<Category> => {
    const response = await serverApiClient.put<Category>(`/category/${id}`, data);
    return response.data;
};


export const getCategory = async (id: string): Promise<Category> => {
    const response = await serverApiClient.get<Category>(`/category/${id}`);
    return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await serverApiClient.delete(`/category/${id}`);
};