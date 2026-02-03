import axios from "axios";
import { Media, Place, PlaceHistory } from "../types/place";
import { Account } from "../types/account";
import FormData from "form-data";
import { Category } from "../types/category";
import { SubscriptionInfo } from "../types/subscriptionInfo";
import { Product } from "../types/product";

const serverApiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.REACT_APP_SERVER_KEY,
  },
});

const getHeaders = (token?: string): Record<string, string | number | boolean> => {
  const headers: Record<string, string | number | boolean> = {
    // 기본 헤더 (Content-Type 등)
    ...(serverApiClient.defaults.headers as Record<string, string | number | boolean>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers; // 순수 객체만 반환
};

// -------------------------------------------------
// 3️⃣ GET 함수 (제네릭 T 로 반환 타입을 지정)
// -------------------------------------------------
export const get = async <T>(url: string, token?: string): Promise<T> => {
  try {
    const response = await serverApiClient.get<T>(url, {
      headers: getHeaders(token),
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    // 여기서 에러 로깅·전파 등을 자유롭게 처리
    console.error("GET request error:", err);
    return {} as T;
  }
};

// -------------------------------------------------
// 4️⃣ POST 함수 (응답 타입 TResponse, 요청 바디 TBody)
// -------------------------------------------------
export const post = async <TResponse, TBody = unknown>(
  url: string,
  body: TBody,
  token?: string,
): Promise<TResponse> => {
  try {
    const response = await serverApiClient.post<TResponse>(url, body, {
      headers: getHeaders(token),
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    console.error("POST request error:", err);
    return {} as TResponse;
  }
};

export const uploadFiles = async (placeId: string, id: string, pictures: Media[]): Promise<Media[]> => {
  if (pictures.length === 0) {
    return [];
  }

  const form = new FormData();
  form.append("placeId", placeId);
  form.append("id", id);

  for (const image of pictures) {
    const base64 = image.url;

    const binary = atob(base64);
    const uint8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      uint8[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([uint8], { type: "image/jpeg" });
    const fileName = `${image.fileName}`;
    form.append("files", blob, fileName);
  }

  try {
    // axios로 POST 요청 (헤더 지정 X)
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}file/upload`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-api-key": process.env.REACT_APP_SERVER_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }

  return [];
};

export const updateUser = async (userData: Partial<Account>): Promise<Account | null> => {
  try {
    const response = await serverApiClient.put<Account>(`/account/${userData.id}`, userData);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUser = async (id: string): Promise<Account | null> => {
  try {
    const response = await serverApiClient.get<Account>(`/account/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const createPlace = async (data: Omit<Place, "id" | "created">): Promise<Place | null> => {
  try {
    const response = await serverApiClient.post<Place>("/place", data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const createPlaceHistory = async (data: Omit<PlaceHistory, "id" | "created">): Promise<PlaceHistory | null> => {
  try {
    const response = await serverApiClient.post<PlaceHistory>("/place/history", data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updatePlace = async (
  id: string,
  placeData: Partial<Omit<Place, "id" | "created">>,
): Promise<Place | null> => {
  try {
    const response = await serverApiClient.put<Place>(`/place/${id}`, placeData);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updatePlaceHistory = async (
  id: string,
  data: Partial<Omit<PlaceHistory, "id" | "created">>,
): Promise<PlaceHistory | null> => {
  try {
    const response = await serverApiClient.put<PlaceHistory>(`/place/history/${id}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPlaces = async (creator: string): Promise<Place[]> => {
  try {
    const response = await serverApiClient.get<Place[]>(`/place/${creator}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getPlaceHistories = async (placeId: string): Promise<PlaceHistory[]> => {
  try {
    const response = await serverApiClient.get<PlaceHistory[]>(`/place/history/${placeId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const deletePlace = async (id: string): Promise<void> => {
  try {
    await serverApiClient.delete(`/place/${id}`);
  } catch (error) {
    console.log(error);
    return;
  }
};

export const deletePlaceHistory = async (placeId: string, id: string): Promise<void> => {
  try {
    await serverApiClient.delete(`/place/${placeId}/${id}`);
  } catch (error) {
    console.log(error);
    return;
  }
};

export const requestUserInfo = async (authorizationCode: string, referrer: string): Promise<Account | null> => {
  try {
    const response = await serverApiClient.get(`/toss/user/${authorizationCode}/${referrer}`);
    return response.data;
  } catch (e) {
    return null;
  }
};

export const requestLogout = async (userKey: number, referrer: string): Promise<void> => {
  try {
    await serverApiClient.post("/toss/logout", { userKey: userKey, referrer: referrer });
  } catch (error) {
    console.log(error);
  }
};

export const createCategory = async (data: Omit<Category, "id" | "created">): Promise<Place | null> => {
  try {
    const response = await serverApiClient.post<Place>("/category", data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateCategory = async (
  id: string,
  data: Partial<Omit<Category, "id" | "created">>,
): Promise<Category | null> => {
  try {
    const response = await serverApiClient.put<Category>(`/category`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getCategory = async (id: string): Promise<Category | null> => {
  try {
    const response = await serverApiClient.get<Category>(`/category/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await serverApiClient.delete(`/category/${id}`);
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getSubscriptionInfo = async () => {
  try {
    const response = await serverApiClient.get<SubscriptionInfo>("/info/subscription");
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getProductInfo = async (id: string): Promise<Product | null> => {
  try {
    const response = await serverApiClient.get<Product>(`/product/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateProduct = async (
  id: string,
  data: Partial<Omit<Product, "id" | "created">>,
): Promise<Product | null> => {
  try {
    const response = await serverApiClient.put<Product>(`/product/${id}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const sendLog = async (tag: string, message: string): Promise<void> => {
  try {
    await serverApiClient.post("/log", { tag, message });
  } catch (error) {
    console.log(error);
  }
};
