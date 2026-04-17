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

export interface ProductPerformanceItem {
  rank: number;
  productId: number;
  productName: string;
  imageUrl?: string | null;
  storeName?: string | null;
  unitsSold: number;
  revenue: number;
  orderCount: number;
}

export interface ProductPerformanceSummary {
  productsCount: number;
  unitsSold: number;
  productRevenue: number;
  deliveredOrders: number;
}

export interface ProductPerformanceResponse {
  period: string;
  from: string;
  to: string;
  summary: ProductPerformanceSummary;
  topProducts: ProductPerformanceItem[];
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

    getProductPerformance: builder.query<ProductPerformanceResponse, string>({
      query: (period = 'today') => `/api/admin/dashboard/product-performance?period=${period}`,
      providesTags: ['Dashboard'],
      transformResponse: (raw: any): ProductPerformanceResponse => ({
        period: raw?.period ?? 'today',
        from: raw?.from ?? '',
        to: raw?.to ?? '',
        summary: {
          productsCount: raw?.summary?.productsCount ?? 0,
          unitsSold: raw?.summary?.unitsSold ?? 0,
          productRevenue: raw?.summary?.productRevenue ?? 0,
          deliveredOrders: raw?.summary?.deliveredOrders ?? 0,
        },
        topProducts: Array.isArray(raw?.topProducts)
          ? raw.topProducts.map((item: any) => ({
              rank: Number(item?.rank ?? 0),
              productId: Number(item?.productId ?? 0),
              productName: item?.productName ?? 'Unknown Product',
              imageUrl: item?.imageUrl ?? null,
              storeName: item?.storeName ?? '',
              unitsSold: Number(item?.unitsSold ?? 0),
              revenue: Number(item?.revenue ?? 0),
              orderCount: Number(item?.orderCount ?? 0),
            }))
          : [],
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
  useGetProductPerformanceQuery,
  useGetActiveUsersQuery,
} = dashboardApi;
