import { baseApiWithAuth } from '@api/baseApi';

export interface Payout {
  id: number;
  deliveryPersonId: number;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  periodStart: string;
  periodEnd: string;
  transactionId?: string;
  paymentMethod?: string;
  remarks?: string;
  createdAt: string;
}

export interface PayoutStats {
  totalPaid: number;
  totalPending: number;
  totalFailed: number;
  totalPayouts: number;
  pendingPayouts: number;
}

export const payoutApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    // 10.1 Get All Payouts
    getPayouts: builder.query<{ success: boolean; payouts: Payout[] }, void>({
      query: () => '/api/payouts',
      providesTags: ['User'],
    }),

    // 10.2 Get Pending Payouts
    getPendingPayouts: builder.query<{ success: boolean; payouts: Payout[] }, void>({
      query: () => '/api/payouts/pending',
      providesTags: ['User'],
    }),

    // 10.3 Get Payout Statistics
    getPayoutStats: builder.query<{ success: boolean; statistics: PayoutStats }, void>({
      query: () => '/api/payouts/statistics',
      providesTags: ['User'],
    }),

    // 10.4 Generate Weekly Payouts
    generateWeeklyPayouts: builder.mutation<{ success: boolean; count: number }, void>({
      query: () => ({
        url: '/api/payouts/generate-weekly',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // 10.6 Process Payout (Mark as Paid)
    processPayout: builder.mutation<any, { 
      id: number; 
      transactionId: string; 
      paymentMethod: string; 
      adminId: number 
    }>({
      query: ({ id, ...body }) => ({
        url: `/api/payouts/${id}/process`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 10.7 Fail Payout
    failPayout: builder.mutation<any, { id: number; remarks: string; adminId: number }>({
      query: ({ id, ...body }) => ({
        url: `/api/payouts/${id}/fail`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 10.9 Retry Failed Payout
    retryPayout: builder.mutation<any, number>({
      query: (id) => ({
        url: `/api/payouts/${id}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetPayoutsQuery,
  useGetPendingPayoutsQuery,
  useGetPayoutStatsQuery,
  useGenerateWeeklyPayoutsMutation,
  useProcessPayoutMutation,
  useFailPayoutMutation,
  useRetryPayoutMutation,
} = payoutApi;
