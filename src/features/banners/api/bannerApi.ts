import { baseApiWithAuth } from '@api/baseApi';

export interface Banner {
  id: number;
  name: string;
  targetUrl: string | null;
  displayOrder: number;
  imageUrl: string;
  videoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  success: boolean;
  banners: Banner[];
}

export interface CreateBannerRequest {
  name: string;
  targetUrl?: string;
  displayOrder: number;
  image: File;
  video?: File;
}

export const bannerApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    // Get all banners (admin)
    getBanners: builder.query<BannerResponse, void>({
      query: () => '/api/admin-panel/api/banners',
      providesTags: ['Banners'],
    }),

    // Create banner (multipart form)
    createBanner: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/api/admin-panel/api/banners',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Banners'],
    }),

    // Toggle banner status
    toggleBannerStatus: builder.mutation<any, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/api/admin-panel/api/banners/${id}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['Banners'],
    }),

    // Delete banner
    deleteBanner: builder.mutation<any, number>({
      query: (id) => ({
        url: `/api/admin-panel/api/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banners'],
    }),

    // Get active banners (customer)
    getActiveBanners: builder.query<BannerResponse, void>({
      query: () => '/api/customer/banners',
      providesTags: ['Banners'],
    }),
    updateBanner: builder.mutation<any, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/admin-panel/api/banners/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Banners'],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetActiveBannersQuery,
  useCreateBannerMutation,
  useToggleBannerStatusMutation,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} = bannerApi;
