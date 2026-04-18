import { baseApiWithAuth } from '@api/baseApi';

export interface MarqueeAnnouncement {
  id: number;
  text: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarqueeRequest {
  text: string;
  active: boolean;
  displayOrder: number;
}

export const marqueeApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getMarqueeAll: builder.query<MarqueeAnnouncement[], void>({
      query: () => '/api/admin/marquee',
      providesTags: ['Marquee'],
    }),
    createMarquee: builder.mutation<MarqueeAnnouncement, CreateMarqueeRequest>({
      query: (body) => ({ url: '/api/admin/marquee', method: 'POST', body }),
      invalidatesTags: ['Marquee'],
    }),
    updateMarquee: builder.mutation<
      MarqueeAnnouncement,
      Partial<MarqueeAnnouncement> & { id: number }
    >({
      query: ({ id, ...body }) => ({ url: `/api/admin/marquee/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Marquee'],
    }),
    deleteMarquee: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/marquee/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Marquee'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMarqueeAllQuery,
  useCreateMarqueeMutation,
  useUpdateMarqueeMutation,
  useDeleteMarqueeMutation,
} = marqueeApi;
