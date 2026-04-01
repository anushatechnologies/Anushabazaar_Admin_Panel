import { baseApiWithAuth } from '@api/baseApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${BASE_URL}/api/stores`;

export interface StoreType {
    id: number;
    name: string;
    label: string;
    displayOrder: number;
    active: boolean;
    imageUrl: string;
    store1Id: number;
}

export interface StoreRequest {
    name: string;
    label: string;
    displayOrder: number;
    active: boolean;
    store1Id: number;
}

export const storeTypeApi = baseApiWithAuth.injectEndpoints({
    endpoints: (builder) => ({
        getStoreTypes: builder.query<{ content: StoreType[]; totalPages: number; totalElements: number }, { name?: string; page?: number; size?: number }>({
            query: ({ name, page = 0, size = 10 }) => ({
                url: '/api/stores',
                params: {
                    ...(name && { name }),
                    page,
                    size,
                },
            }),
            providesTags: ['StoreTypes', 'Stores'],
        }),
        suggestStoreTypes: builder.query<StoreType[], string>({
            query: (query) => `/api/stores/suggest?q=${encodeURIComponent(query)}`,
            providesTags: ['StoreTypes', 'Stores'],
        }),
        createStoreType: builder.mutation<StoreType, { data: StoreRequest; image?: File }>({
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
            invalidatesTags: ['StoreTypes', 'Stores'],
        }),
        updateStoreType: builder.mutation<StoreType, { id: number; data: StoreRequest; image?: File }>({
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
            invalidatesTags: ['StoreTypes', 'Stores'],
        }),
        deleteStoreType: builder.mutation<void, number>({
            query: (id) => ({
                url: `/api/stores/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['StoreTypes', 'Stores'],
        }),
    }),
});

export const {
    useGetStoreTypesQuery,
    useSuggestStoreTypesQuery,
    useCreateStoreTypeMutation,
    useUpdateStoreTypeMutation,
    useDeleteStoreTypeMutation,
} = storeTypeApi;

const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['Accept'] = 'application/json';
    if (!isFormData) headers['Content-Type'] = 'application/json';
    return headers;
};

export const fetchStores = async (
    name?: string,
    page = 0,
    size = 10,
    sort?: string,
): Promise<{ content: StoreType[]; totalPages: number; totalElements: number }> => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (sort) params.append('sort', sort);
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

export const suggestStores = async (query: string): Promise<StoreType[]> => {
    const res = await fetch(`${API_BASE_URL}/suggest?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to suggest stores');
    return res.json();
};

export const createStore = async (storeData: StoreRequest, imageFile: File): Promise<StoreType> => {
    const formData = new FormData();
    formData.append('store', new Blob([JSON.stringify(storeData)], { type: 'application/json' }));
    formData.append('image', imageFile);
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
    storeData: StoreRequest,
    imageFile?: File,
): Promise<StoreType> => {
    const formData = new FormData();
    formData.append('store', new Blob([JSON.stringify(storeData)], { type: 'application/json' }));
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
