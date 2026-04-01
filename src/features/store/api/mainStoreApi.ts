import { baseApiWithAuth } from '@api/baseApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${BASE_URL}/api/main-store`;

// Main Store API - Single main store
export interface MainStore {
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

export interface MainStoreRequest {
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

// --- RTK QUERY ---
export const mainStoreApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getMainStore: builder.query<MainStore, void>({
      query: () => '/api/main-store',
      providesTags: ['Stores'],
    }),
    updateMainStore: builder.mutation<MainStore, { data: MainStoreRequest; image?: File }>({
      query: ({ data, image }) => {
        const formData = new FormData();
        formData.append('mainStore', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        if (image) formData.append('image', image);
        return {
          url: '/api/main-store',
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Stores'],
    }),
  }),
});

export const { 
  useGetMainStoreQuery, 
  useUpdateMainStoreMutation
} = mainStoreApi;

// --- MANUAL FETCH ---
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Accept'] = 'application/json';
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

export const fetchMainStore = async (): Promise<MainStore> => {
  const res = await fetch(`${API_BASE_URL}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch main store');
  return res.json();
};

export const updateMainStore = async (storeData: MainStoreRequest, imageFile?: File): Promise<MainStore> => {
  const formData = new FormData();
  formData.append('mainStore', new Blob([JSON.stringify(storeData)], { type: 'application/json' }));
  if (imageFile) formData.append('image', imageFile);
  const res = await fetch(API_BASE_URL, {
    method: 'PUT',
    body: formData,
    headers: getAuthHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to update main store');
  return res.json();
};
