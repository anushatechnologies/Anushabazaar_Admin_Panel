import { baseApiWithAuth } from '@api/baseApi';

export interface DashboardStats {
  totalOrders: number;
  activeUsers: number;
  todayRevenue: number;
  newCustomers: number;
}

export interface OrderAnalytics {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned?: number;
  failed?: number;
}

export interface SimpleAnalytics {
  total: number;
  successOrders: number;
}

export interface DashboardSummaryResponse {
  success: boolean;
  summary: Partial<DashboardStats>;
}

export const dashboardApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardStats | DashboardSummaryResponse, void>({
      query: () => '/api/admin/dashboard/summary',
      providesTags: ['Dashboard'],
    }),

    getAdminPanelDashboardSummary: builder.query<any, void>({
      query: () => '/api/delivery-admin/dashboard',
      providesTags: ['Dashboard'],
    }),

    getActiveUsers: builder.query<{ count: number }, void>({
      query: () => '/api/admin/dashboard/active-users',
      providesTags: ['Dashboard'],
    }),

    getRecentOrders: builder.query<any, void>({
      query: () => '/api/admin/dashboard/recent-orders',
      providesTags: ['Dashboard', 'AdminOrders' as any],
    }),

    getOrderAnalytics: builder.query<OrderAnalytics | SimpleAnalytics, string>({
      query: (period = 'today') => `/api/admin/dashboard/analytics?period=${period}`,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetAdminPanelDashboardSummaryQuery,
  useGetActiveUsersQuery,
  useGetRecentOrdersQuery,
  useGetOrderAnalyticsQuery,
} = dashboardApi;
