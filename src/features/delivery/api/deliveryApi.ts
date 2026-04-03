import { baseApiWithAuth } from '@api/baseApi';

export interface DeliveryPerson {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'AUTO' | 'HEAVY';
  isOnline: boolean;
  isActive: boolean;
  isApprovedByAdmin: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  profilePhotoUrl?: string;
  profilePhotoStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REUPLOAD';
  vehicleModel?: string;
  rating?: number;
  verified: boolean;
  createdAt?: string;
}

export interface DeliveryDocument {
  id: number;
  documentType: 'AADHAAR_CARD' | 'PAN_CARD' | 'DRIVING_LICENSE';
  documentUrl: string;
  documentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REUPLOAD';
  adminRemarks?: string;
  uploadedAt: string;
}

export interface DeliveryDashboardStats {
  totalDeliveryPersons: number;
  approvedDeliveryPersons: number;
  onlineDeliveryPersons: number;
  pendingApprovals: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
}

export interface DeliveryOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderStatus: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: string;
  totalAmount: number;
  deliveryFee: number;
  placedAt: string;
  assignedTo?: DeliveryPerson;
}

export interface FareSettings {
  id: number;
  baseFare: number;
  perKmFare: number;
  surgeMultiplier: number;
  maxSurgeBonus: number;
  bikeBaseFare: number;
  scooterBaseFare: number;
  autoBaseFare: number;
  heavyBaseFare: number;
  km1Fare: number;
  km5Fare: number;
  km10Fare: number;
  km20PlusFare: number;
  createdAt?: string;
  updatedAt?: string;
}

export const deliveryApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getDeliveryDashboardStats: builder.query<{ success: boolean; statistics: DeliveryDashboardStats }, void>({
      query: () => '/api/delivery-admin/dashboard',
      providesTags: ['Dashboard'],
    }),

    getAdminPanelDashboard: builder.query<{ success: boolean; statistics: DeliveryDashboardStats }, void>({
      query: () => '/api/delivery-admin/dashboard',
      providesTags: ['Dashboard'],
    }),

    getDeliveryPersons: builder.query<{ success: boolean; deliveryPersons: DeliveryPerson[] }, void>({
      query: () => '/api/delivery-admin/delivery-persons',
      providesTags: ['User'],
    }),

    getAdminPanelDeliveryPersons: builder.query<{ success: boolean; deliveryPersons: DeliveryPerson[] }, void>({
      query: () => '/api/delivery-admin/delivery-persons',
      providesTags: ['User'],
    }),

    getAvailableDeliveryPersons: builder.query<{ success: boolean; availableDeliveryPersons: DeliveryPerson[] }, void>({
      query: () => '/api/delivery-admin/delivery-persons/available',
      providesTags: ['User'],
    }),

    getPendingDeliveryPersons: builder.query<{ success: boolean; pendingDeliveryPersons: DeliveryPerson[] }, void>({
      query: () => '/api/delivery-admin/delivery-persons/pending-approval',
      providesTags: ['User'],
    }),

    getDeliveryPersonById: builder.query<{ success: boolean; deliveryPerson: DeliveryPerson }, number>({
      query: (id) => `/api/delivery-admin/delivery-persons/${id}`,
      providesTags: ['User'],
    }),

    getDeliveryPersonDocuments: builder.query<{ success: boolean; documents: DeliveryDocument[] }, number>({
      query: (id) => `/api/delivery-admin/delivery-persons/${id}/documents`,
      providesTags: ['Documents'],
    }),

    getPendingDocuments: builder.query<{ success: boolean; pendingDocuments: DeliveryDocument[] }, void>({
      query: () => '/api/delivery-admin/documents/pending-review',
      providesTags: ['Documents'],
    }),

    approveDocument: builder.mutation<{ success: boolean; message: string; document: DeliveryDocument }, { documentId: number; adminId: number }>({
      query: ({ documentId, adminId }) => ({
        url: `/api/delivery-admin/documents/${documentId}/approve`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    approveAdminPanelDocument: builder.mutation<{ success: boolean; message: string; document: DeliveryDocument }, { documentId: number; adminId: number }>({
      query: ({ documentId, adminId }) => ({
        url: `/api/delivery-admin/documents/${documentId}/approve`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    rejectDocument: builder.mutation<{ success: boolean; message: string; document: DeliveryDocument }, { documentId: number; adminId: number; remarks: string }>({
      query: ({ documentId, adminId, remarks }) => ({
        url: `/api/delivery-admin/documents/${documentId}/reject`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    rejectAdminPanelDocument: builder.mutation<{ success: boolean; message: string; document: DeliveryDocument }, { documentId: number; adminId: number; remarks: string }>({
      query: ({ documentId, adminId, remarks }) => ({
        url: `/api/delivery-admin/documents/${documentId}/reject`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    requestDocumentReupload: builder.mutation<{ success: boolean; message: string }, { documentId: number; adminId: number; remarks: string }>({
      query: ({ documentId, adminId, remarks }) => ({
        url: `/api/delivery-admin/documents/${documentId}/request-reupload`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    requestAdminPanelDocumentReupload: builder.mutation<{ success: boolean; message: string }, { documentId: number; adminId: number; remarks: string }>({
      query: ({ documentId, adminId, remarks }) => ({
        url: `/api/delivery-admin/documents/${documentId}/request-reupload`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    approveProfilePhoto: builder.mutation<{ success: boolean; message: string }, { personId: number; adminId: number }>({
      query: ({ personId, adminId }) => ({
        url: `/api/admin/delivery-persons/${personId}/approve-photo`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User'],
    }),

    rejectProfilePhoto: builder.mutation<{ success: boolean; message: string }, { personId: number; adminId: number; remarks: string }>({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/admin/delivery-persons/${personId}/reject-photo`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),

    requestProfilePhotoReupload: builder.mutation<{ success: boolean; message: string }, { personId: number; adminId: number; remarks: string }>({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/admin/delivery-persons/${personId}/request-photo-reupload`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),


    updateDeliveryPersonStatus: builder.mutation<{ success: boolean; message: string }, { personId: number; isActive: boolean }>({
      query: ({ personId, isActive }) => ({
        url: `/api/admin/delivery-persons/${personId}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),

    approveDeliveryPerson: builder.mutation<{ success: boolean; message: string; deliveryPerson: DeliveryPerson }, { personId: number; adminId: number }>({
      query: ({ personId, adminId }) => ({
        url: `/api/admin/delivery-persons/${personId}/approve`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User'],
    }),

    rejectDeliveryPerson: builder.mutation<{ success: boolean; message: string }, { personId: number; adminId: number; remarks: string }>({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/admin/delivery-persons/${personId}/reject`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),

    getDeliveryOrders: builder.query<{ success: boolean; orders: DeliveryOrder[] }, void>({
      query: () => '/api/admin/delivery-orders',
      providesTags: ['AdminOrders'],
    }),

    getOrdersPendingAssignment: builder.query<{ success: boolean; orders: DeliveryOrder[] }, void>({
      query: () => '/api/admin/orders/pending-assignment',
      providesTags: ['AdminOrders'],
    }),

    assignOrder: builder.mutation<{ success: boolean; message: string; order: any }, { orderId: number; deliveryPersonId: number }>({
      query: ({ orderId, deliveryPersonId }) => ({
        url: `/api/admin/orders/${orderId}/assign`,
        method: 'POST',
        body: { deliveryPersonId },
      }),
      invalidatesTags: ['AdminOrders', 'Dashboard'],
    }),

    generateDeliveryOtp: builder.mutation<{ success: boolean; message: string; deliveryOtp: string }, number>({
      query: (orderId) => ({
        url: `/api/admin/orders/${orderId}/generate-delivery-otp`,
        method: 'POST',
      }),
    }),

    getFareSettings: builder.query<{ success: boolean; fareSettings: FareSettings }, void>({
      query: () => '/api/delivery-admin/fare-settings',
      providesTags: ['FareSettings'],
    }),

    getAdminPanelFareSettings: builder.query<{ success: boolean; fareSettings: FareSettings }, void>({
      query: () => '/api/delivery-admin/fare-settings',
      providesTags: ['FareSettings'],
    }),

    updateFareSettings: builder.mutation<{ success: boolean; fareSettings: FareSettings }, Partial<FareSettings>>({
      query: (fareSettings) => ({
        url: '/api/delivery-admin/fare-settings',
        method: 'PUT',
        body: fareSettings,
      }),
      invalidatesTags: ['FareSettings'],
    }),

    updateAdminPanelFareSettings: builder.mutation<{ success: boolean; fareSettings: FareSettings }, Partial<FareSettings>>({
      query: (fareSettings) => ({
        url: '/api/delivery-admin/fare-settings',
        method: 'PUT',
        body: fareSettings,
      }),
      invalidatesTags: ['FareSettings'],
    }),
  }),
});

export const {
  useGetDeliveryDashboardStatsQuery,
  useGetDeliveryPersonsQuery,
  useGetAvailableDeliveryPersonsQuery,
  useGetPendingDeliveryPersonsQuery,
  useGetDeliveryPersonByIdQuery,
  useGetDeliveryPersonDocumentsQuery,
  useGetPendingDocumentsQuery,
  useApproveDocumentMutation,
  useApproveAdminPanelDocumentMutation,
  useRejectDocumentMutation,
  useRejectAdminPanelDocumentMutation,
  useRequestDocumentReuploadMutation,
  useRequestAdminPanelDocumentReuploadMutation,
  useGetDeliveryOrdersQuery,
  useGetOrdersPendingAssignmentQuery,
  useAssignOrderMutation,
  useGenerateDeliveryOtpMutation,
  useGetFareSettingsQuery,
  useGetAdminPanelFareSettingsQuery,
  useUpdateFareSettingsMutation,
  useUpdateAdminPanelFareSettingsMutation,
  useApproveDeliveryPersonMutation,
  useRejectDeliveryPersonMutation,
  useUpdateDeliveryPersonStatusMutation,
  useApproveProfilePhotoMutation,
  useRejectProfilePhotoMutation,
  useRequestProfilePhotoReuploadMutation,
} = deliveryApi;

export const useGetPersonnelDocumentsQuery = useGetDeliveryPersonDocumentsQuery;
