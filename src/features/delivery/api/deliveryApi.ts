import { baseApiWithAuth } from '@api/baseApi';

export type VehicleType = 'BIKE' | 'SCOOTY' | 'EV' | 'AUTO' | 'HEAVY';

export interface DeliveryPerson {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  vehicleType: VehicleType;
  isOnline: boolean;
  isApprovedByAdmin: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  profilePhotoUrl?: string;
  profilePhotoStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REUPLOAD';
  vehicleModel?: string;
  registrationNumber?: string;
  rating?: number;
  verified: boolean;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  createdAt?: string;
  onboardingStatus?: DeliveryOnboardingStatus;
}

export interface DeliveryDocument {
  id: number;
  documentType:
    | 'AADHAAR_CARD'
    | 'AADHAAR_FRONT'
    | 'AADHAAR_BACK'
    | 'PAN_CARD'
    | 'DRIVING_LICENSE'
    | 'RC_BOOK'
    | 'INSURANCE';
  documentUrl: string;
  documentNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REUPLOAD';
  adminRemarks?: string;
  uploadedAt: string;
}

export interface DeliveryChecklistItem {
  code: string;
  label: string;
  required: boolean;
  uploaded: boolean;
  approved: boolean;
  status: string;
  remarks?: string;
  documentUrl?: string;
  documentNumber?: string;
}

export interface DeliveryOnboardingStatus {
  currentStep: string;
  phoneVerified: boolean;
  personalInfoCompleted: boolean;
  vehicleCompleted: boolean;
  bankCompleted: boolean;
  profilePhotoUploaded: boolean;
  profilePhotoApproved: boolean;
  profilePhotoStatus: string;
  profilePhotoRemarks?: string;
  requiredDocumentsUploaded: boolean;
  requiredDocumentsApproved: boolean;
  requiredDocuments: string[];
  optionalDocuments: string[];
  missingRequiredDocuments: string[];
  missingApprovedDocuments: string[];
  documentChecklist: DeliveryChecklistItem[];
  readyForFinalApproval: boolean;
  loginAllowed: boolean;
  canGoOnline: boolean;
  completionPercent: number;
  requiredDocumentCount: number;
  approvedRequiredDocumentCount: number;
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
  orderStatus:
    | 'PENDING'
    | 'ASSIGNED'
    | 'PICKED_UP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED';
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

export interface FareRule {
  id: number;
  vehicleType: VehicleType;
  /** Flat fare for 0 → baseKm distance (e.g. ₹25 for 0-2km) */
  baseFare: number;
  /** Distance covered by baseFare (default 2.0 km) */
  baseKm: number;
  /** Rate per full km beyond baseKm (e.g. ₹7/km) */
  perKmRate: number;
  /** Admin-set rain surcharge amount (e.g. ₹30) */
  rainSurcharge: number;
  /** Whether rain surcharge is currently ON */
  rainActive: boolean;
  /** Loading charge — only AUTO and HEAVY */
  loadingCharge: number;
  /** Unloading charge — only AUTO and HEAVY */
  unloadingCharge: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FareBreakdown {
  vehicleType: string;
  distanceKm: number;
  baseFare: number;
  baseKm: number;
  extraKm: number;
  perKmRate: number;
  extraCharge: number;
  rainActive: boolean;
  rainSurcharge: number;
  loadingCharge: number;
  unloadingCharge: number;
  totalFare: number;
}

export const deliveryApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    // ── Dashboard ──────────────────────────────────────────────────────
    getDeliveryDashboardStats: builder.query<
      { success: boolean; statistics: DeliveryDashboardStats },
      void
    >({
      query: () => '/api/delivery-admin/dashboard',
      providesTags: ['Dashboard'],
    }),

    // ── Delivery Persons ───────────────────────────────────────────────
    getDeliveryPersons: builder.query<
      { success: boolean; deliveryPersons: DeliveryPerson[] },
      void
    >({
      query: () => '/api/delivery-admin/delivery-persons',
      providesTags: ['User'],
    }),

    getAvailableDeliveryPersons: builder.query<
      { success: boolean; availableDeliveryPersons: DeliveryPerson[] },
      void
    >({
      query: () => '/api/delivery-admin/delivery-persons/available',
      providesTags: ['User'],
    }),

    getPendingDeliveryPersons: builder.query<
      { success: boolean; pendingDeliveryPersons: DeliveryPerson[] },
      void
    >({
      query: () => '/api/delivery-admin/delivery-persons/pending-approval',
      providesTags: ['User'],
    }),

    getDeliveryPersonById: builder.query<
      {
        success: boolean;
        deliveryPerson: DeliveryPerson;
        documents: DeliveryDocument[];
        onboardingStatus?: DeliveryOnboardingStatus;
      },
      number
    >({
      query: (id) => `/api/delivery-admin/delivery-persons/${id}`,
      providesTags: ['User'],
    }),

    getDeliveryPersonDocuments: builder.query<
      { success: boolean; documents: DeliveryDocument[] },
      number
    >({
      query: (id) => `/api/delivery-admin/delivery-persons/${id}/documents`,
      providesTags: ['Documents'],
    }),

    // ── Documents ──────────────────────────────────────────────────────
    getPendingDocuments: builder.query<
      { success: boolean; pendingDocuments: DeliveryDocument[] },
      void
    >({
      query: () => '/api/delivery-admin/documents/pending-review',
      providesTags: ['Documents'],
    }),

    approveDocument: builder.mutation<
      { success: boolean; message: string; document: DeliveryDocument },
      { documentId: number; adminId: number }
    >({
      query: ({ documentId, adminId }) => ({
        url: `/api/delivery-admin/documents/${documentId}/approve`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    rejectDocument: builder.mutation<
      { success: boolean; message: string; document: DeliveryDocument },
      { documentId: number; adminId: number; remarks: string }
    >({
      query: ({ documentId, adminId, remarks }) => ({
        url: `/api/delivery-admin/documents/${documentId}/reject`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    requestDocumentReupload: builder.mutation<
      { success: boolean; message: string },
      { documentId: number; adminId: number; remarks: string }
    >({
      query: ({ documentId, adminId, remarks }) => ({
        url: `/api/delivery-admin/documents/${documentId}/request-reupload`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User', 'Documents'],
    }),

    // ── Profile Photo Actions (AdminController /api/admin/...) ─────────
    approveProfilePhoto: builder.mutation<
      { success: boolean; message: string },
      { personId: number; adminId: number }
    >({
      query: ({ personId, adminId }) => ({
        url: `/api/delivery-admin/delivery-persons/${personId}/approve-photo`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User'],
    }),

    rejectProfilePhoto: builder.mutation<
      { success: boolean; message: string },
      { personId: number; adminId: number; remarks: string }
    >({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/delivery-admin/delivery-persons/${personId}/reject-photo`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),

    requestProfilePhotoReupload: builder.mutation<
      { success: boolean; message: string },
      { personId: number; adminId: number; remarks: string }
    >({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/delivery-admin/delivery-persons/${personId}/request-photo-reupload`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),

    // ── Admin Edit: personal + bank details ────────────────────────────
    updateDeliveryPersonDetails: builder.mutation<
      { success: boolean; message: string; deliveryPerson: DeliveryPerson },
      {
        personId: number;
        vehicleType?: string;
        vehicleModel?: string;
        registrationNumber?: string;
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        ifscCode?: string;
      }
    >({
      query: ({ personId, ...body }) => ({
        url: `/api/delivery-admin/delivery-persons/${personId}/details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // ── Person Status / Approval ────────────────────────────────────────
    updateDeliveryPersonStatus: builder.mutation<
      { success: boolean; message: string },
      { personId: number; isActive: boolean }
    >({
      query: ({ personId, isActive }) => ({
        url: `/api/delivery-admin/delivery-persons/${personId}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),

    approveDeliveryPerson: builder.mutation<
      { success: boolean; message: string; deliveryPerson: DeliveryPerson },
      { personId: number; adminId: number }
    >({
      query: ({ personId, adminId }) => ({
        url: `/api/delivery-admin/delivery-persons/${personId}/approve`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['User'],
    }),

    rejectDeliveryPerson: builder.mutation<
      { success: boolean; message: string },
      { personId: number; adminId: number; remarks: string }
    >({
      query: ({ personId, adminId, remarks }) => ({
        url: `/api/delivery-admin/delivery-persons/${personId}/reject`,
        method: 'POST',
        body: { adminId, remarks },
      }),
      invalidatesTags: ['User'],
    }),

    // ── Delivery Orders — correct path: /api/delivery-admin/orders ─────
    getDeliveryOrders: builder.query<{ success: boolean; orders: DeliveryOrder[] }, string | void>({
      query: (status) =>
        status ? `/api/delivery-admin/orders?status=${status}` : '/api/delivery-admin/orders',
      providesTags: ['AdminOrders'],
    }),

    getOrdersPendingAssignment: builder.query<{ success: boolean; orders: DeliveryOrder[] }, void>({
      query: () => '/api/admin/orders/pending-assignment',
      providesTags: ['AdminOrders'],
    }),

    assignOrder: builder.mutation<
      { success: boolean; message: string; order: any },
      { orderId: number; deliveryPersonId: number }
    >({
      query: ({ orderId, deliveryPersonId }) => ({
        url: `/api/admin/orders/${orderId}/assign`,
        method: 'POST',
        body: { deliveryPersonId },
      }),
      invalidatesTags: ['AdminOrders', 'Dashboard'],
    }),

    generateDeliveryOtp: builder.mutation<
      { success: boolean; message: string; deliveryOtp: string },
      number
    >({
      query: (orderId) => ({
        url: `/api/admin/orders/${orderId}/generate-delivery-otp`,
        method: 'POST',
      }),
    }),

    // ── Fare Settings — correct path: /api/admin/fare-settings ─────────
    getFareSettings: builder.query<{ success: boolean; fareSettings: FareSettings }, void>({
      query: () => '/api/admin/fare-settings',
      providesTags: ['FareSettings'],
    }),

    updateFareSettings: builder.mutation<
      { success: boolean; fareSettings: FareSettings },
      Partial<FareSettings>
    >({
      query: (fareSettings) => ({
        url: '/api/admin/fare-settings',
        method: 'PUT',
        body: fareSettings,
      }),
      invalidatesTags: ['FareSettings'],
    }),

    // ── Fare Rules per vehicle type — /api/delivery-admin/fare-rules ───
    getFareRules: builder.query<{ success: boolean; fareRules: FareRule[] }, void>({
      query: () => '/api/delivery-admin/fare-rules',
      providesTags: ['FareSettings'],
    }),

    updateFareRule: builder.mutation<
      { success: boolean; message: string; fareRule: FareRule },
      { id: number; rule: Partial<FareRule> }
    >({
      query: ({ id, rule }) => ({
        url: `/api/delivery-admin/fare-rules/${id}`,
        method: 'PUT',
        body: rule,
      }),
      invalidatesTags: ['FareSettings'],
    }),

    /** Toggle rain ON/OFF for a vehicle type (BIKE toggles all light vehicles) */
    toggleRain: builder.mutation<
      { success: boolean; vehicleType: string; rainActive: boolean; rowsUpdated: number },
      { vehicleType: VehicleType; rainActive: boolean }
    >({
      query: ({ vehicleType, rainActive }) => ({
        url: `/api/delivery-admin/fare-rules/${vehicleType}/rain-toggle`,
        method: 'POST',
        body: { rainActive },
      }),
      invalidatesTags: ['FareSettings'],
    }),

    /** Preview fare calculation for any vehicle + distance */
    calculateFare: builder.mutation<
      { success: boolean; fareBreakdown: FareBreakdown },
      { vehicleType: VehicleType; distanceKm: number }
    >({
      query: (body) => ({
        url: '/api/delivery-admin/fare-rules/calculate',
        method: 'POST',
        body,
      }),
    }),

    // ── Phase 3 — Nearby Riders (Haversine) ──────────────────────────────
    getNearbyRiders: builder.query<
      {
        success: boolean;
        storeId: number;
        radiusKm: number;
        count: number;
        riders: DeliveryPerson[];
      },
      { storeId: number; radiusKm?: number }
    >({
      query: ({ storeId, radiusKm = 5 }) =>
        `/api/delivery-admin/nearby-riders?storeId=${storeId}&radiusKm=${radiusKm}`,
      providesTags: ['User'],
    }),

    /** PUT /api/delivery-admin/stores/{id}/location — Set store GPS coords */
    updateStoreLocation: builder.mutation<
      { success: boolean; message: string },
      { storeId: number; latitude: number; longitude: number }
    >({
      query: ({ storeId, latitude, longitude }) => ({
        url: `/api/delivery-admin/stores/${storeId}/location`,
        method: 'PUT',
        body: { latitude, longitude },
      }),
      invalidatesTags: ['User'],
    }),

    /** GET /api/delivery-admin/orders — All delivery orders */
    getActiveDeliveryOrders: builder.query<{ success: boolean; orders: any[] }, void>({
      query: () => '/api/delivery-admin/orders',
      providesTags: ['AdminOrders'],
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
  useRejectDocumentMutation,
  useRequestDocumentReuploadMutation,
  useGetDeliveryOrdersQuery,
  useGetOrdersPendingAssignmentQuery,
  useAssignOrderMutation,
  useGenerateDeliveryOtpMutation,
  useGetFareSettingsQuery,
  useUpdateFareSettingsMutation,
  useGetFareRulesQuery,
  useUpdateFareRuleMutation,
  useToggleRainMutation,
  useCalculateFareMutation,
  useUpdateDeliveryPersonDetailsMutation,
  useApproveDeliveryPersonMutation,
  useRejectDeliveryPersonMutation,
  useUpdateDeliveryPersonStatusMutation,
  useApproveProfilePhotoMutation,
  useRejectProfilePhotoMutation,
  useRequestProfilePhotoReuploadMutation,
  useGetNearbyRidersQuery,
  useUpdateStoreLocationMutation,
  useGetActiveDeliveryOrdersQuery,
} = deliveryApi;

// Kept for backwards-compatibility with existing import sites
export const useGetPersonnelDocumentsQuery = useGetDeliveryPersonDocumentsQuery;
