import { baseApiWithAuth } from '@api/baseApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${BASE_URL}/stores`;

// Store API (Sub-store) - Individual store locations that belong to a StoreType
// Base URL: /api/stores - This handles individual store locations (e.g., Grocery Store #1, Electronics Shop A)
export interface Store {
  id: number;
  name: string;
  label: string;
  displayOrder: number;
  active: boolean;
  imageUrl: string;
  storeTypeId: number; // Foreign key to StoreType
}

export interface StoreRequest {
  name: string;
  label: string;
  displayOrder: number;
  active: boolean;
  storeTypeId: number; // Foreign key to StoreType
}

// --- RTK QUERY (for other modules) ---
export const storeApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<Store[], { search?: string }>({
      query: (params = {}) => ({
        url: '/stores1',
        params: {
          ...(params.search && { search: params.search }),
        },
      }),
      providesTags: ['Stores'],
    }),
    getStoreTypeById: builder.query<StoreType, number>({
      query: (id) => `/stores1/${id}`,
      providesTags: (result, error, id) => [{ type: 'Stores', id }],
    }),
    createStoreType: builder.mutation<StoreType, { data: StoreTypeRequest; image?: File }>({
      query: ({ data, image }) => {
        const formData = new FormData();
        formData.append('store1', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        if (image) formData.append('image', image);
        return {
          url: '/stores1',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Stores'],
    }),
    updateStoreType: builder.mutation<StoreType, { id: number; data: StoreTypeRequest; image?: File }>({
      query: ({ id, data, image }) => {
        const formData = new FormData();
        formData.append('store1', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        if (image) formData.append('image', image);
        return {
          url: `/stores1/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Stores'],
    }),
    deleteStoreType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/stores1/${id}`,
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
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

export const fetchStoreTypes = async (search?: string): Promise<StoreType[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE_URL}?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch store types');
  return res.json();
};

export const fetchStoreTypeById = async (id: number): Promise<StoreType> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Store type not found');
  return res.json();
};

export const createStoreType = async (storeTypeData: StoreTypeRequest, imageFile?: File): Promise<StoreType> => {
  const formData = new FormData();
  formData.append('store1', new Blob([JSON.stringify(storeTypeData)], { type: 'application/json' }));
  if (imageFile) formData.append('image', imageFile);
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to create store type');
  return res.json();
};

export const updateStoreType = async (
  id: number,
  storeTypeData: StoreTypeRequest,
  imageFile?: File,
): Promise<StoreType> => {
  const formData = new FormData();
  formData.append('store1', new Blob([JSON.stringify(storeTypeData)], { type: 'application/json' }));
  if (imageFile) formData.append('image', imageFile);
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: formData,
    headers: getAuthHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to update store type');
  return res.json();
};

export const deleteStoreType = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete store type');
};