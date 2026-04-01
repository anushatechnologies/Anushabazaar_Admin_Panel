import { baseApiWithAuth } from './baseApi';

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minCartValue: number;
  maxDiscountAmount: number;
  firstTimeUserOnly: boolean;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usageLimitPerUser: number;
  active: boolean;
  createdAt?: string;
}

export const couponsApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getAllCoupons: builder.query<Coupon[], void>({
      query: () => '/api/admin/coupons',
      providesTags: ['Coupons'],
    }),
    getCouponById: builder.query<Coupon, number>({
      query: (id) => `/api/admin/coupons/${id}`,
      providesTags: ['Coupons'],
    }),
    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (body) => ({
        url: '/api/admin/coupons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coupons'],
    }),
    updateCoupon: builder.mutation<Coupon, { id: number; data: Partial<Coupon> }>({
      query: ({ id, data }) => ({
        url: `/api/admin/coupons/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Coupons'],
    }),
    deleteCoupon: builder.mutation<{ success?: boolean; message?: string }, number>({
      query: (id) => ({
        url: `/api/admin/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupons'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllCouponsQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
