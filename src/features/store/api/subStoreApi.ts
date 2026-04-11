import { baseApiWithAuth } from '@api/baseApi';
import { getStoredAccessToken } from '@features/auth/authCookies';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${BASE_URL}/api/stores1`;

export interface SubStore {
  id: number;
  name: string;
  address: string;
  priceRange: string;
  phoneNumber: string;
  pincode: string;
  city: string;
  announcement: string;
  delivery: string;
  packageCost: string;
  active: boolean;
  rating: number;
  imageUrl: string;
  preferredOrder: number;
  timings: string;
}

export interface SubStoreRequest {
  name: string;
  address: string;
  priceRange: string;
  phoneNumber: string;
  pincode: string;
  city: string;
  announcement: string;
  delivery: string;
  packageCost: string;
  active: boolean;
  rating: number;
  preferredOrder: number;
  timings: string;
}

export interface PaginatedStoresResponse {
  content: SubStore[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

const buildStore1RequestBody = (data: SubStoreRequest, image?: File) => {
  if (!image) {
    return {
      body: data,
    };
  }

  const formData = new FormData();
  formData.append('store', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  formData.append('image', image);

  return {
    body: formData,
  };
};

// --- RTK QUERY (for other modules) ---
export const subStoreApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getSubStores: builder.query<
      PaginatedStoresResponse,
      { name?: string; page?: number; size?: number }
    >({
      query: (params = {}) => ({
        url: '/api/stores1',
        params: {
          ...(params.name && { search: params.name }),
          ...(params.page !== undefined && { page: params.page.toString() }),
          ...(params.size && { size: params.size.toString() }),
        },
      }),
      providesTags: ['Stores'],
    }),
    getSubStoreById: builder.query<SubStore, number>({
      query: (id) => `/api/stores1/${id}`,
      providesTags: (result, error, id) => [{ type: 'Stores', id }],
    }),
    createSubStore: builder.mutation<SubStore, { data: SubStoreRequest; image?: File }>({
      query: ({ data, image }) => {
        const request = buildStore1RequestBody(data, image);
        return {
          url: '/api/stores1',
          method: 'POST',
          body: request.body,
        };
      },
      invalidatesTags: ['Stores'],
    }),
    updateSubStore: builder.mutation<SubStore, { id: number; data: SubStoreRequest; image?: File }>(
      {
        query: ({ id, data, image }) => {
          const request = buildStore1RequestBody(data, image);
          return {
            url: `/api/stores1/${id}`,
            method: 'PUT',
            body: request.body,
          };
        },
        invalidatesTags: ['Stores'],
      },
    ),
    deleteSubStore: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/stores1/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stores'],
    }),
  }),
});

export const {
  useGetSubStoresQuery,
  useGetSubStoreByIdQuery,
  useCreateSubStoreMutation,
  useUpdateSubStoreMutation,
  useDeleteSubStoreMutation,
} = subStoreApi;

// --- MANUAL FETCH (for Store.tsx) ---
const getAuthHeaders = (isFormData = false) => {
  const token = getStoredAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Accept'] = 'application/json';
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

export const fetchSubStores = async (
  name?: string,
  page = 0,
  size = 10,
): Promise<PaginatedStoresResponse | SubStore[]> => {
  const params = new URLSearchParams();
  if (name) params.append('search', name); // Stores1 uses search ? maybe, prompt says ?search= for GET /api/stores1
  // GET /api/stores1 Get all stores1 (optional ?search= filter)
  params.append('page', page.toString());
  params.append('size', size.toString());

  const res = await fetch(`${API_BASE_URL}?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch stores');
  return res.json();
};

export const fetchSubStoreById = async (id: number): Promise<SubStore> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Store not found');
  return res.json();
};

export const createSubStore = async (
  storeData: SubStoreRequest,
  imageFile?: File,
): Promise<SubStore> => {
  const body = imageFile
    ? (() => {
        const formData = new FormData();
        formData.append(
          'store',
          new Blob([JSON.stringify(storeData)], { type: 'application/json' }),
        );
        formData.append('image', imageFile);
        return formData;
      })()
    : JSON.stringify(storeData);

  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    body,
    headers: imageFile ? getAuthHeaders(true) : getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to create store');
  return res.json();
};

export const updateSubStore = async (
  id: number,
  storeData: SubStoreRequest,
  imageFile?: File,
): Promise<SubStore> => {
  const body = imageFile
    ? (() => {
        const formData = new FormData();
        formData.append(
          'store',
          new Blob([JSON.stringify(storeData)], { type: 'application/json' }),
        );
        formData.append('image', imageFile);
        return formData;
      })()
    : JSON.stringify(storeData);

  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body,
    headers: imageFile ? getAuthHeaders(true) : getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to update store');
  return res.json();
};

export const deleteSubStore = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete store');
};
