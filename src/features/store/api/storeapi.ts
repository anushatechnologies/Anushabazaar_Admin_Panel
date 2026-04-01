import { baseApiWithAuth } from '@api/baseApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${BASE_URL}/api/stores`;

// StoreType API (Main Store Categories/Types)
// Base URL: /api/stores - Main categories like Grocery, Electronics, Pharmacy
export interface StoreType {
  id: number;
  name: string;
  label: string;
  displayOrder: number;
  active: boolean;
  store1Id: number;
  imageUrl?: string;
}

export interface StoreTypeRequest {
  name: string;
  label: string;
  displayOrder: number;
  active: boolean;
  store1Id: number;
}

// --- RTK QUERY (for other modules) ---
export const storeApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getStoreTypes: builder.query<StoreType[], { search?: string }>({
      query: (params = {}) => ({
        url: '/api/stores',
        params: {
          ...(params.search && { search: params.search }),
        },
      }),
      providesTags: ['Stores'],
    }),
    getStoreTypeById: builder.query<StoreType, number>({
      query: (id) => `/api/stores/${id}`,
      providesTags: (result, error, id) => [{ type: 'Stores', id }],
    }),
    createStoreType: builder.mutation<StoreType, { data: StoreTypeRequest; image?: File }>({
      query: ({ data, image }) => {
        const formData = new FormData();
        formData.append('store', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        if (image) formData.append('image', image);
        return {
          url: '/api/stores',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Stores'],
    }),
    updateStoreType: builder.mutation<StoreType, { id: number; data: StoreTypeRequest; image?: File }>({
      query: ({ id, data, image }) => {
        const formData = new FormData();
        formData.append('store', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        if (image) formData.append('image', image);
        return {
          url: `/api/stores/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Stores'],
    }),
    deleteStoreType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/stores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stores'],
    }),
  }),
});

export const { 
  useGetStoreTypesQuery, 
  useGetStoreTypeByIdQuery, 
  useCreateStoreTypeMutation,
  useUpdateStoreTypeMutation,
  useDeleteStoreTypeMutation 
} = storeApi;

// --- MANUAL FETCH (for StoreType.tsx) ---
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Accept'] = 'application/json';
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

export const fetchStores = async (search?: string): Promise<StoreType[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE_URL}?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch stores');
  return res.json();
};

export const fetchStoreById = async (id: number): Promise<StoreType> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Store not found');
  return res.json();
};

export const createStore = async (storeTypeData: StoreTypeRequest, imageFile?: File): Promise<StoreType> => {
  const formData = new FormData();
  formData.append('store', new Blob([JSON.stringify(storeTypeData)], { type: 'application/json' }));
  if (imageFile) formData.append('image', imageFile);
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to create store');
  return res.json();
};

export const updateStore = async (
  id: number,
  storeTypeData: StoreTypeRequest,
  imageFile?: File,
): Promise<StoreType> => {
  const formData = new FormData();
  formData.append('store', new Blob([JSON.stringify(storeTypeData)], { type: 'application/json' }));
  if (imageFile) formData.append('image', imageFile);
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: formData,
    headers: getAuthHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to update store');
  return res.json();
};

export const deleteStore = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete store');
};
