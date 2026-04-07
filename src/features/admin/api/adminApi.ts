import { baseApiWithAuth } from '@api/baseApi';

// Dashboard APIs
export interface DashboardSummary {
  totalOrders: number;
  activeUsers: number;
  todayRevenue: number;
  newCustomers: number;
}

export interface ActiveUsersCount {
  count: number;
}

export interface OrderAnalytics {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  failed: number;
}

export interface DeliveryDashboardStats {
  success: boolean;
  statistics: {
    totalDeliveryPersons: number;
    activeDeliveryPersons: number;
    pendingApprovals: number;
    pendingDocuments: number;
    totalOrders: number;
    pendingOrders: number;
    assignedOrders: number;
    pickedUpOrders: number;
    deliveredOrders: number;
  };
}

export interface IncomeSummary {
  success: boolean;
  summary: {
    todayIncome: number;
    weekIncome: number;
    monthIncome: number;
    totalIncome: number;
    razorpayIncome: number;
    codIncome: number;
  };
}

export interface PaymentTransaction {
  id?: number | string;
  txnid?: string;
  transactionId?: string;
  amount: number;
  status: string;
  method?: string;
  paymentMethod?: string;
  source?: string;
  orderNumber?: string;
  date?: string;
  createdAt?: string;
}

export interface Rating {
  id: number;
  rating: number;
  review?: string;
  comment?: string;
  customerName?: string;
  userName?: string;
  productName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Customer Management
export interface Customer {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  customers: Customer[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

// Order Management
export interface OrderItem {
  variantId: number;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  grandTotal: number;
  orderStatus: string;
  paymentMethod: string;
  placedAt: string;
  items: OrderItem[];
}

// Document Management
export interface DeliveryDocument {
  id: number;
  documentType: 'AADHAAR_CARD' | 'PAN_CARD' | 'DRIVING_LICENSE';
  documentUrl: string;
  documentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REUPLOAD';
  adminRemarks?: string;
  uploadedAt: string;
}

// Fare Settings
export interface FareSettings {
  success: boolean;
  fareSettings: {
    baseFare: number;
    perKmFare: number;
    surgeMultiplier: number;
    bikeBaseFare: number;
    scooterBaseFare: number;
    km1Fare: number;
    km5Fare: number;
    km10Fare: number;
    km20PlusFare: number;
  };
}

// Banners
export interface Banner {
  id: number;
  name: string;
  imageUrl: string;
  videoUrl?: string;
  targetUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export const adminApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    // SECTION A - Dashboard
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/api/admin/dashboard/summary',
      providesTags: ['Dashboard'],
    }),

    getActiveUsersCount: builder.query<ActiveUsersCount, void>({
      query: () => '/api/admin/dashboard/active-users',
      providesTags: ['Dashboard'],
    }),

    getRecentOrders: builder.query<Order[], void>({
      query: () => '/api/admin/dashboard/recent-orders',
      providesTags: ['Dashboard'],
    }),

    getOrderAnalytics: builder.query<OrderAnalytics, { period: string }>({
      query: ({ period }) => `/api/admin/dashboard/analytics?period=${period}`,
      providesTags: ['Dashboard'],
    }),

    getIncomeSummary: builder.query<IncomeSummary, void>({
      query: () => '/api/admin/income/summary',
      providesTags: ['Dashboard'],
    }),

    getIncomeTransactions: builder.query<PaymentTransaction[], void>({
      query: () => '/api/admin/income/transactions',
      providesTags: ['Dashboard'],
    }),

    getDeliveryDashboardStats: builder.query<DeliveryDashboardStats, void>({
      query: () => '/api/admin/dashboard',
      providesTags: ['Dashboard'],
    }),

    // SECTION B - Customer Management
    getAllCustomers: builder.query<
      CustomersResponse,
      {
        search?: string;
        active?: boolean;
        page?: number;
        size?: number;
      }
    >({
      query: (params) => ({
        url: '/api/admin/customers',
        params: {
          ...(params.search && { search: params.search }),
          ...(params.active !== undefined && { active: params.active }),
          ...(params.page !== undefined && { page: params.page }),
          ...(params.size && { size: params.size }),
        },
      }),
      providesTags: ['Customers'],
    }),

    getCustomerById: builder.query<Customer, number>({
      query: (id) => `/api/admin/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customers', id }],
    }),

    updateCustomerStatus: builder.mutation<Customer, { id: number; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/api/admin/customers/${id}/status`,
        method: 'PUT',
        body: { active },
      }),
      invalidatesTags: ['Customers'],
    }),

    deleteCustomer: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/api/admin/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customers'],
    }),

    // SECTION C - Customer Orders (reusing orderApi endpoints)
    getAllCustomerOrders: builder.query<Order[], void>({
      query: () => '/api/admin/orders',
      providesTags: ['AdminOrders'],
    }),

    getOrderById: builder.query<Order, number>({
      query: (id) => `/api/admin/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'AdminOrders', id }],
    }),

    acceptOrder: builder.mutation<{ message: string; orderId: number }, number>({
      query: (orderId) => ({
        url: `/api/admin/orders/${orderId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    rejectOrder: builder.mutation<
      { message: string; orderId: number },
      { orderId: number; reason: string }
    >({
      query: ({ orderId, reason }) => ({
        url: `/api/admin/orders/${orderId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    // SECTION D - Delivery Person Management (reusing deliveryApi endpoints)
    getPendingDocuments: builder.query<{ success: boolean; documents: DeliveryDocument[] }, void>({
      query: () => '/api/admin/documents/pending-review',
      providesTags: ['Documents'],
    }),

    approveDocument: builder.mutation<
      { success: boolean; message: string; document: DeliveryDocument },
      { documentId: number; adminId: number }
    >({
      query: ({ documentId, adminId }) => ({
        url: `/api/admin/documents/${documentId}/approve`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['Documents'],
    }),

    rejectDocument: builder.mutation<
      { success: boolean; message: string; document: DeliveryDocument },
      {
        documentId: number;
        adminId: number;
        remarks: string;
      }
    >({
      query: ({ documentId, adminId, remarks }) => ({
        url: `/api/admin/documents/${documentId}/reject`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['Documents'],
    }),

    requestDocumentReupload: builder.mutation<
      { success: boolean; message: string; document: DeliveryDocument },
      {
        documentId: number;
        adminId: number;
        remarks: string;
      }
    >({
      query: ({ documentId, adminId, remarks }) => ({
        url: `/api/admin/documents/${documentId}/request-reupload`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['Documents'],
    }),

    // SECTION E - Profile Photo Verification
    approveProfilePhoto: builder.mutation<
      { success: boolean; message: string },
      { personId: number; adminId: number }
    >({
      query: ({ personId, adminId }) => ({
        url: `/api/admin/delivery-persons/${personId}/approve-photo`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User'],
    }),

    rejectProfilePhoto: builder.mutation<
      { success: boolean; message: string },
      {
        personId: number;
        adminId: number;
        remarks: string;
      }
    >({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/admin/delivery-persons/${personId}/reject-photo`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),

    requestPhotoReupload: builder.mutation<
      { success: boolean; message: string },
      {
        personId: number;
        adminId: number;
        remarks: string;
      }
    >({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/admin/delivery-persons/${personId}/request-photo-reupload`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),

    // SECTION G - Final Account Approval
    finalApproveDeliveryPerson: builder.mutation<
      { success: boolean; message: string },
      { personId: number; adminId: number }
    >({
      query: ({ personId, adminId }) => ({
        url: `/api/admin/delivery-persons/${personId}/approve`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User'],
    }),

    rejectDeliveryPerson: builder.mutation<
      { success: boolean; message: string },
      {
        personId: number;
        adminId: number;
        remarks: string;
      }
    >({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/admin/delivery-persons/${personId}/reject`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),

    updateDeliveryPersonStatus: builder.mutation<
      { success: boolean; message: string },
      { personId: number; isActive: boolean }
    >({
      query: ({ personId, isActive }) => ({
        url: `/api/admin/delivery-persons/${personId}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),

    // SECTION H - Delivery Order Assignment
    getOrdersPendingAssignment: builder.query<Order[], void>({
      query: () => '/api/admin/orders/pending-assignment',
      providesTags: ['AdminOrders'],
    }),

    assignOrderToDelivery: builder.mutation<
      { success: boolean; message: string },
      { orderId: number; deliveryPersonId: number }
    >({
      query: ({ orderId, deliveryPersonId }) => ({
        url: `/api/admin/orders/${orderId}/assign`,
        method: 'POST',
        body: { deliveryPersonId },
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    getAllDeliveryOrders: builder.query<Order[], void>({
      query: () => '/api/admin/delivery-orders',
      providesTags: ['AdminOrders'],
    }),

    getDeliveryOrdersByStatus: builder.query<Order[], string>({
      query: (status) => `/api/admin/delivery-orders/status/${status}`,
      providesTags: ['AdminOrders'],
    }),

    generateDeliveryOtp: builder.mutation<
      { success: boolean; message: string; deliveryOtp: string },
      number
    >({
      query: (orderId) => ({
        url: `/api/admin/orders/${orderId}/generate-delivery-otp`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    // SECTION I - Fare Settings
    getFareSettings: builder.query<FareSettings, void>({
      query: () => '/api/admin/fare-settings',
      providesTags: ['FareSettings'],
    }),

    updateFareSettings: builder.mutation<
      { success: boolean; message: string },
      Partial<FareSettings['fareSettings']>
    >({
      query: (fareSettings) => ({
        url: '/api/admin/fare-settings',
        method: 'PUT',
        body: fareSettings,
      }),
      invalidatesTags: ['FareSettings'],
    }),

    // SECTION J - Banners
    getAllBanners: builder.query<{ success: boolean; banners: Banner[] }, void>({
      query: () => '/api/admin/banners',
      providesTags: ['Banners'],
    }),

    createBanner: builder.mutation<{ success: boolean; message: string; banner: Banner }, FormData>(
      {
        query: (formData) => ({
          url: '/api/admin/banners',
          method: 'POST',
          body: formData,
        }),
        invalidatesTags: ['Banners'],
      },
    ),

    toggleBannerStatus: builder.mutation<
      { success: boolean; message: string },
      { id: number; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/api/admin/banners/${id}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['Banners'],
    }),

    deleteBanner: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/api/admin/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banners'],
    }),

    // SECTION K - Push Notifications
    sendNotificationToUser: builder.mutation<
      { success: boolean; message: string },
      {
        phoneNumber: string;
        title: string;
        message: string;
      }
    >({
      query: (data) => ({
        url: '/api/admin/notifications/send',
        method: 'POST',
        body: data,
      }),
    }),

    broadcastToCustomers: builder.mutation<
      { success: boolean; message: string },
      { title: string; message: string }
    >({
      query: (data) => ({
        url: '/api/admin/notifications/send-to-customers',
        method: 'POST',
        body: data,
      }),
    }),

    broadcastToDeliveryPartners: builder.mutation<
      { success: boolean; message: string },
      { title: string; message: string }
    >({
      query: (data) => ({
        url: '/api/admin/notifications/send-to-delivery',
        method: 'POST',
        body: data,
      }),
    }),

    getAllRatings: builder.query<Rating[], void>({
      query: () => '/api/admin/ratings',
      providesTags: ['Dashboard'],
    }),

    deleteRating: builder.mutation<{ success?: boolean; message?: string }, number>({
      query: (id) => ({
        url: `/api/admin/ratings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Dashboard'],
    }),

    // SECTION N - Store Management
    createStore: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/api/stores',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Stores'],
    }),

    updateStore: builder.mutation<any, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/stores/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Stores'],
    }),

    deleteStore: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/api/stores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stores'],
    }),

    // Alternative Store endpoints
    createStoreAlt: builder.mutation<any, any>({
      query: (storeData) => ({
        url: '/api/stores1',
        method: 'POST',
        body: storeData,
      }),
      invalidatesTags: ['Stores'],
    }),

    updateStoreAlt: builder.mutation<any, { id: number; storeData: any }>({
      query: ({ id, storeData }) => ({
        url: `/api/stores1/${id}`,
        method: 'PUT',
        body: storeData,
      }),
      invalidatesTags: ['Stores'],
    }),

    deleteStoreAlt: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/api/stores1/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stores'],
    }),

    // SECTION O - Payout Management
    getAllPayouts: builder.query<any[], void>({
      query: () => '/api/payouts',
      providesTags: ['Payouts'],
    }),

    getPendingPayouts: builder.query<any[], void>({
      query: () => '/api/payouts/pending',
      providesTags: ['Payouts'],
    }),

    getPayoutById: builder.query<any, number>({
      query: (id) => `/api/payouts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payouts', id }],
    }),

    generateWeeklyPayouts: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/api/payouts/generate-weekly',
        method: 'POST',
      }),
      invalidatesTags: ['Payouts'],
    }),

    processPayout: builder.mutation<
      { message: string },
      { id: number; transactionId: string; paymentMethod: string; adminId?: number }
    >({
      query: ({ id, transactionId, paymentMethod, adminId }) => ({
        url: `/api/payouts/${id}/process`,
        method: 'POST',
        body: { transactionId, paymentMethod, ...(adminId !== undefined && { adminId }) },
      }),
      invalidatesTags: ['Payouts'],
    }),

    failPayout: builder.mutation<{ message: string }, { id: number; remarks: string }>({
      query: ({ id, remarks }) => ({
        url: `/api/payouts/${id}/fail`,
        method: 'POST',
        body: { remarks },
      }),
      invalidatesTags: ['Payouts'],
    }),

    cancelPayout: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/api/payouts/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Payouts'],
    }),

    retryPayout: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/api/payouts/${id}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['Payouts'],
    }),

    getPayoutStatistics: builder.query<any, void>({
      query: () => '/api/payouts/statistics',
      providesTags: ['Payouts'],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetActiveUsersCountQuery,
  useGetRecentOrdersQuery,
  useGetOrderAnalyticsQuery,
  useGetIncomeSummaryQuery,
  useGetIncomeTransactionsQuery,
  useGetDeliveryDashboardStatsQuery,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerStatusMutation,
  useDeleteCustomerMutation,
  useGetAllCustomerOrdersQuery,
  useGetOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useGetPendingDocumentsQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useRequestDocumentReuploadMutation,
  useApproveProfilePhotoMutation,
  useRejectProfilePhotoMutation,
  useRequestPhotoReuploadMutation,
  useFinalApproveDeliveryPersonMutation,
  useRejectDeliveryPersonMutation,
  useUpdateDeliveryPersonStatusMutation,
  useGetOrdersPendingAssignmentQuery,
  useAssignOrderToDeliveryMutation,
  useGetAllDeliveryOrdersQuery,
  useGetDeliveryOrdersByStatusQuery,
  useGenerateDeliveryOtpMutation,
  useGetFareSettingsQuery,
  useUpdateFareSettingsMutation,
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useToggleBannerStatusMutation,
  useDeleteBannerMutation,
  useSendNotificationToUserMutation,
  useBroadcastToCustomersMutation,
  useBroadcastToDeliveryPartnersMutation,
  useGetAllRatingsQuery,
  useDeleteRatingMutation,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useCreateStoreAltMutation,
  useUpdateStoreAltMutation,
  useDeleteStoreAltMutation,
  // Payout Management
  useGetAllPayoutsQuery,
  useGetPendingPayoutsQuery,
  useGetPayoutByIdQuery,
  useGenerateWeeklyPayoutsMutation,
  useProcessPayoutMutation, // in adminApi — prefer payoutApi.useProcessPayoutMutation for PayoutList page
  useFailPayoutMutation,
  useCancelPayoutMutation,
  useRetryPayoutMutation,
  useGetPayoutStatisticsQuery,
} = adminApi;
