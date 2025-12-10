import axios from 'axios';
import { Place } from '../types/place';
import { Account } from '../types/account';

const serverApiClient = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export const get = async <T>(url: string, token?: string): Promise<T> => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${url}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    return res.json();
};

export const post = async <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    token?: string
): Promise<TResponse> => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });

    return res.json();
};

export const createPlace = async (placeData: Omit<Place, 'id' | 'created'>): Promise<Place> => {
    console.log(`url ${process.env.REACT_APP_BACKEND_URL}`)
    const response = await serverApiClient.post<Place>('/place', placeData);
    return response.data;
};

export const updatePlace = async (id: string, placeData: Partial<Omit<Place, 'id' | 'created'>>): Promise<Place> => {
    const response = await serverApiClient.put<Place>(`/place/${id}`, placeData);
    return response.data;
};

export const getPlaces = async (): Promise<Place[]> => {
    const response = await serverApiClient.get<Place[]>('/place');
    return response.data;
};

export const getPlace = async (id: string): Promise<Place> => {
    const response = await serverApiClient.get<Place>(`/place/${id}`);
    return response.data;
};

export const deletePlace = async (id: string): Promise<void> => {
    await serverApiClient.delete(`/place/${id}`);
};

export const requestUserInfo = async (authorizationCode: string, referrer: string): Promise<Account | null> => {
    const response = await serverApiClient.get(`/toss/user/${authorizationCode}/${referrer}`)
    return response.data
}

export const requestLogout = async (userKey: number) => {
    console.log(`requestLogout`)
    return await serverApiClient.post("/toss/logout", { "userKey": userKey })
}