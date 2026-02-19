import { Account } from "@/types/account";
import { Bill } from "@/types/bill";
import { Category } from "@/types/category";
import { TossOrders } from "@/types/toss.orders";
import { Place } from "@/types/place";
import { Product } from "@/types/product";
import { Notice } from "@/types/notice";
import axios from "axios";
import { UpdateProductPayload } from "@/pages/AccountDetailPage";
import { ProductHistoryItem } from "@/types/product.history.item";

export const serverApiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "x-api-key": import.meta.env.VITE_SERVER_KEY,
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
  return headers;
};
export const get = async <T>(url: string, token?: string): Promise<T> => {
  try {
    const response = await serverApiClient.get<T>(url, {
      headers: getHeaders(token),
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    console.error("GET request error:", err);
    return {} as T;
  }
};

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

export const sendLog = async (tag: string, message: string): Promise<void> => {
  try {
    await serverApiClient.post("/log", { tag, message });
  } catch (error) {
    console.log(error);
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

export const getUsers = async (): Promise<Account[]> => {
  try {
    const response = await serverApiClient.get<Account[]>(`/account`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
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

export const updateProduct = async (
  id: string,
  data: UpdateProductPayload,
): Promise<Product | null> => {
  try {
    const response = await serverApiClient.put<Product>(`/product/${id}`, data);
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

export const getProductHistory = async (userKey: string): Promise<ProductHistoryItem[]> => {
  try {
    const response = await serverApiClient.get<ProductHistoryItem[]>(`/product/${userKey}/history`);
    return response.data;
  } catch (error) {
    return [];
  };
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

export const getAllPlaces = async():Promise<Place[]> => {
  try {
    const response = await serverApiClient.get<Place[]>(`/place`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const requestLogout = async (id: string): Promise<void> => {
  try {
    await serverApiClient.post("/toss/logout", { userKey: id, referrer: "UNLINK" });
  } catch (error) {
    console.log(error);
  }
};

export const getBills = async (): Promise<Bill[]> => {
  try {
    const response = await serverApiClient.get<Bill[]>(`/bill`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getBillsByCreator = async (id: string): Promise<Bill | null> => {
  try {
    const response = await serverApiClient.get<Bill>(`/bill/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getOrders = async (userKey: string, orderId: string): Promise<TossOrders | null> => {
  try {
    const response = await serverApiClient.post<TossOrders>(`/toss/orders`, { userKey, orderId });
    console.log(`response`, response);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const createNotice = async (data: Omit<Notice, "id" | "created" | "updated">): Promise<Notice | null> => {
  try {
    const response = await serverApiClient.post<Notice>(`/notice`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateNotice = async (
  id: string,
  data: Partial<Omit<Notice, "id" | "created" | "updated">>,
): Promise<Notice | null> => {
  try {
    const response = await serverApiClient.put<Notice>(`/notice/${id}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 전체 공지 목록
export const getNotices = async (): Promise<Notice[]> => {
  try {
    const response = await serverApiClient.get<Notice[]>(`/notice`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// ✅ 지금 노출 가능한 공지 목록 (startAt/endAt + isVisible 조합)
export const getVisibleNoticesNow = async (): Promise<Notice[]> => {
  try {
    const response = await serverApiClient.get<Notice[]>(`/notice/visible/now`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// 단건 조회
export const getNoticeById = async (id: string): Promise<Notice | null> => {
  try {
    const response = await serverApiClient.get<Notice>(`/notice/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 삭제
export const deleteNotice = async (id: string): Promise<boolean> => {
  try {
    await serverApiClient.delete(`/notice/${id}`);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getNotice = async (id: string): Promise<Notice | null> => {
  try {
    const response = await serverApiClient.get<Notice>(`/notice/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const deleteAllData = async (id: string): Promise<void> => {
  try {
    await serverApiClient.delete(`/account/${id}`);
    await serverApiClient.delete(`/category/${id}`);
    await serverApiClient.delete(`/product/${id}`);
  } catch (error) {
    console.log(error)

  }
}

export const deleteAllDataByIds = async (ids: string[]): Promise<void> => {
  try {
    for (const id of ids) {
      await requestLogout(id)
      console.log(`requestLogout ${id}`)
      await deleteAllData(id)
      console.log(`deleteAllData ${id}`)
    }
  } catch (error) {
    console.log(error)
  }
}