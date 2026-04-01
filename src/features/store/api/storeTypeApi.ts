import { baseApiWithAuth } from '@api/baseApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${BASE_URL}/api/stores`;

export interface StoreType {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  pincode: string;
  city: string;
  announcement?: string;
  delivery: boolean;
  packageCost: number;
  rating: number;
  active: boolean;
  imageUrl?: string;
  timing?: string;
}

export interface StoreTypeRequest {
  name: string;
  address: string;
  phoneNumber: string;
  pincode: string;
  city: string;
  announcement?: string;
  delivery: boolean;
  packageCost: number;
  rating: number;
  active: boolean;
  timing?: string;
}

// --- RTK QUERY (for other modules) ---
export const storeTypeApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getStoreTypes: builder.query<StoreType[], { search?: string }>({
      query: (params = {}) => ({
        url: '/api/stores',
        params: {
          ...(params.search && { search: params.search }),
        },
      }),
      providesTags: ['StoreTypes'],
    }),
    getStoreTypeById: builder.query<StoreType, number>({
      query: (id) => ({
        url: `/api/stores/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'StoreTypes', id }],
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
      invalidatesTags: ['StoreTypes'],
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
      invalidatesTags: ['StoreTypes'],
    }),
    deleteStoreType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/stores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StoreTypes'],
    }),
  }),
});

export const { 
  useGetStoreTypesQuery, 
  useGetStoreTypeByIdQuery, 
  useCreateStoreTypeMutation,
  useUpdateStoreTypeMutation,
  useDeleteStoreTypeMutation 
} = storeTypeApi;

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
  formData.append('store', new Blob([JSON.stringify(storeTypeData)], { type: 'application/json' }));
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
  formData.append('store', new Blob([JSON.stringify(storeTypeData)], { type: 'application/json' }));
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
