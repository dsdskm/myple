import axios from 'axios';
import { Place } from '../types/place';

const apiClient = axios.create({
    // baseURL: process.env.REACT_APP_BACKEND_URL,
    baseURL: "http://192.168.0.5:8080",
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 새로운 장소를 생성합니다. (POST /place)
 * @param placeData id와 created를 제외한 장소 데이터
 * @returns 생성된 장소 정보
 */
export const createPlace = async (placeData: Omit<Place, 'id' | 'created'>): Promise<Place> => {
    console.log(`url ${process.env.REACT_APP_BACKEND_URL}`)
    const response = await apiClient.post<Place>('/place', placeData);
    return response.data;
};

/**
 * 기존 장소 정보를 수정합니다. (PUT /place/:id)
 * @param id 수정할 장소의 ID
 * @param placeData 수정할 장소 데이터 (부분 업데이트 가능)
 * @returns 수정된 장소 정보
 */
export const updatePlace = async (id: string, placeData: Partial<Omit<Place, 'id' | 'created'>>): Promise<Place> => {
    const response = await apiClient.put<Place>(`/place/${id}`, placeData);
    return response.data;
};

/**
 * 모든 장소 목록을 가져옵니다. (GET /place)
 * @returns 장소 목록 배열
 */
export const getPlaces = async (): Promise<Place[]> => {
    const response = await apiClient.get<Place[]>('/place');
    return response.data;
};

/**
 * 특정 ID의 장소 정보를 가져옵니다. (GET /place/:id)
 * @param id 가져올 장소의 ID
 * @returns 특정 장소 정보
 */
export const getPlace = async (id: string): Promise<Place> => {
    const response = await apiClient.get<Place>(`/place/${id}`);
    return response.data;
};

/**
 * 특정 ID의 장소를 삭제합니다. (DELETE /place/:id)
 * @param id 삭제할 장소의 ID
 */
export const deletePlace = async (id: string): Promise<void> => {
    await apiClient.delete(`/place/${id}`);
};

