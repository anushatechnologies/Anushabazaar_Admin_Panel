import { baseApiWithAuth } from '@api/baseApi';

// Full shape returned by /api/admin/dashboard/summary
export interface DashboardSummary {
  // Orders
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;

  // Cancelled
  cancelledTotal: number;
  cancelledToday: number;
  cancelledWeek: number;
  cancelledMonth: number;

  // Delivered
  deliveredTotal: number;
  deliveredToday: number;
  deliveredWeek: number;
  deliveredMonth: number;

  // Income
  totalIncome: number;
  todayIncome: number;
  weekIncome: number;
  monthIncome: number;
  razorpayIncome: number;
  codIncome: number;

  // Users
  activeUsers: number;
  newCustomers: number;

  // Delivery personnel
  totalDeliveryPersons: number;
  approvedDeliveryPersons: number;
  onlineDeliveryPersons: number;
  pendingApprovals: number;

  // Delivery orders
  deliveryOrdersTotal: number;
  deliveryOrdersActive: number;
  deliveryOrdersCompleted: number;
}

// Shape returned by /api/admin/dashboard/analytics?period=...
export interface OrderAnalytics {
  placed: number;
  confirmed: number;
  assigned: number;
  delivered: number;
  cancelled: number;
  rejected: number;
  processing: number;
  total: number;
}

export const dashboardApi = baseApiWithAuth.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/api/admin/dashboard/summary',
      providesTags: ['Dashboard'],
      transformResponse: (raw: any) => {
        // Handle both { summary: {...} } and flat response shapes
        const s = raw?.summary ?? raw ?? {};
        return s as DashboardSummary;
      },
    }),

    getRecentOrders: builder.query<any[], void>({
      query: () => '/api/admin/dashboard/recent-orders',
      providesTags: ['Dashboard', 'AdminOrders' as any],
      transformResponse: (raw: any) => {
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.orders)) return raw.orders;
        return [];
      },
    }),

    getOrderAnalytics: builder.query<OrderAnalytics, string>({
      query: (period = 'today') => `/api/admin/dashboard/analytics?period=${period}`,
      providesTags: ['Dashboard'],
      transformResponse: (raw: any): OrderAnalytics => ({
        placed: raw?.placed ?? 0,
        confirmed: raw?.confirmed ?? 0,
        assigned: raw?.assigned ?? 0,
        delivered: raw?.delivered ?? 0,
        cancelled: raw?.cancelled ?? 0,
        rejected: raw?.rejected ?? 0,
        processing: raw?.processing ?? 0,
        total: raw?.total ?? 0,
      }),
    }),

    // Kept for backward compat if other pages import it
    getActiveUsers: builder.query<{ count: number }, void>({
      query: () => '/api/admin/dashboard/active-users',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetRecentOrdersQuery,
  useGetOrderAnalyticsQuery,
  useGetActiveUsersQuery,
} = dashboardApi;
