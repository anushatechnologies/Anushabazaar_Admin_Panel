import { baseApiWithAuth } from '@api/baseApi';
import { getStoredAccessToken } from '@features/auth/authCookies';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Notification API interfaces
export interface SendNotificationRequest {
  phoneNumber: string;
  title: string;
  message: string;
  type?: string;
  screen?: string;
  orderId?: string;
  orderNumber?: string;
  targetId?: string;
  imageUrl?: string;
}

export interface BroadcastNotificationRequest {
  title: string;
  message: string;
  type?: string;
  screen?: string;
  orderId?: string;
  orderNumber?: string;
  targetId?: string;
  imageUrl?: string;
}

export interface SendByTokenRequest {
  token: string;
  title: string;
  message: string;
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
}

export interface SaveTokenRequest {
  phone: string;
  fcmToken: string;
}

export interface SaveTokenResponse {
  success: boolean;
  message: string;
}

export interface WhatsAppCampaignStartResponse {
  campaignId: string;
  status: string;
  totalRows: number;
  message: string;
}

export interface WhatsAppCampaignRecipientResult {
  rowNumber: number;
  name: string;
  phoneNumber: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED' | string;
  message: string;
}

export interface WhatsAppCampaignStatusResponse {
  campaignId: string;
  templateName: string;
  sourceFileName: string;
  activeOnly: boolean;
  headerImageUrl: string;
  headerMediaUrl?: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | string;
  errorMessage?: string | null;
  totalRows: number;
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  createdAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  results: WhatsAppCampaignRecipientResult[];
}

export interface MetaTemplate {
  id: string;
  name: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED' | string;
  category: string;
  language: string;
  components?: Array<{
    type: string;
    text?: string;
    format?: string;
    buttons?: any[];
  }>;
}

// RTK Query endpoints for notifications
export const notificationsApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    // Send notification to specific user
    sendNotification: builder.mutation<SendNotificationResponse, SendNotificationRequest>({
      query: (data) => ({
        url: '/api/admin/notifications/send',
        method: 'POST',
        body: data,
      }),
    }),

    sendNotificationByToken: builder.mutation<SendNotificationResponse, SendByTokenRequest>({
      query: (data) => ({
        url: '/api/admin/notifications/send-by-token',
        method: 'POST',
        body: data,
      }),
    }),

    // Broadcast to all customers
    broadcastToCustomers: builder.mutation<SendNotificationResponse, BroadcastNotificationRequest>({
      query: (data) => ({
        url: '/api/admin/notifications/send-to-customers',
        method: 'POST',
        body: data,
      }),
    }),

    // Broadcast to all delivery partners
    broadcastToDelivery: builder.mutation<SendNotificationResponse, BroadcastNotificationRequest>({
      query: (data) => ({
        url: '/api/admin/notifications/send-to-delivery',
        method: 'POST',
        body: data,
      }),
    }),

    // Save FCM token (public endpoint)
    saveToken: builder.mutation<SaveTokenResponse, SaveTokenRequest>({
      query: (data) => ({
        url: '/api/save-token',
        method: 'POST',
        body: data,
      }),
    }),

    startWhatsAppCampaign: builder.mutation<WhatsAppCampaignStartResponse, FormData>({
      query: (data) => ({
        url: '/api/admin/notifications/whatsapp-campaigns',
        method: 'POST',
        body: data,
      }),
    }),

    startWhatsAppAppVideoCampaign: builder.mutation<WhatsAppCampaignStartResponse, FormData>({
      query: (data) => ({
        url: '/api/admin/notifications/whatsapp-campaigns/app-video-v1',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Refer & earn blast — `refer_and_earn_invite` Meta template.
     * CSV needs only Phone Number + Name; backend looks up each customer's
     * referral code and injects https://app.anushatechnologies.com/r/{CODE}
     * as the {{1}} body variable per recipient.
     */
    startReferAndEarnCampaign: builder.mutation<WhatsAppCampaignStartResponse, FormData>({
      query: (data) => ({
        url: '/api/admin/notifications/whatsapp-campaigns/refer-and-earn-v1',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Generic referral-link blast for any approved Meta template whose body has
     * one {{1}} variable = referral link. Supports image OR video OR no header.
     * Used by the "lucky" template (image header).
     *
     * FormData fields:
     *   - file:            recipients CSV/XLSX (Phone Number + Name)
     *   - templateName:    Meta-approved template name (e.g. "lucky")
     *   - headerType:      "image" | "video" | "none"
     *   - headerMediaUrl:  public URL (image or video) — OR
     *   - headerMediaFile: inline image/video file
     *   - activeOnly:      "true" | "false"
     */
    startReferralTemplateCampaign: builder.mutation<WhatsAppCampaignStartResponse, FormData>({
      query: (data) => ({
        url: '/api/admin/notifications/whatsapp-campaigns/referral-template',
        method: 'POST',
        body: data,
      }),
    }),

    startGlobalHiringCampaign: builder.mutation<WhatsAppCampaignStartResponse, FormData>({
      query: (data) => ({
        url: '/api/admin/notifications/whatsapp-campaigns/global-hiring-v1',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Diagnostic — sends ONE template to ONE phone, returns Meta's full
     * response (including any error subcode). Use to debug 131049 etc.
     */
    sendWhatsAppSingleTest: builder.mutation<
      any,
      { phone: string; templateName?: string; headerMediaUrl?: string }
    >({
      query: (body) => ({
        url: '/api/admin/notifications/whatsapp-campaigns/test-single',
        method: 'POST',
        body,
      }),
    }),

    uploadImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/api/admin/upload/image',
        method: 'POST',
        body: formData,
      }),
    }),

    getWhatsAppCampaignStatus: builder.query<WhatsAppCampaignStatusResponse, string>({
      query: (campaignId) => ({
        url: `/api/admin/notifications/whatsapp-campaigns/${campaignId}`,
        method: 'GET',
      }),
    }),

    /**
     * Lists all message templates from Meta Business Suite for this WABA.
     * Requires WHATSAPP_WABA_ID to be configured as an env var on the server.
     * Returns Meta's raw response: { data: MetaTemplate[] }
     */
    getMetaTemplates: builder.query<{ data: MetaTemplate[] }, void>({
      query: () => ({
        url: '/api/admin/whatsapp-templates/meta-templates',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useSendNotificationMutation,
  useSendNotificationByTokenMutation,
  useBroadcastToCustomersMutation,
  useBroadcastToDeliveryMutation,
  useSaveTokenMutation,
  useStartWhatsAppCampaignMutation,
  useStartWhatsAppAppVideoCampaignMutation,
  useStartReferAndEarnCampaignMutation,
  useStartReferralTemplateCampaignMutation,
  useStartGlobalHiringCampaignMutation,
  useSendWhatsAppSingleTestMutation,
  useGetWhatsAppCampaignStatusQuery,
  useUploadImageMutation,
  useGetMetaTemplatesQuery,
} = notificationsApi;

// Manual fetch functions for components
const getAuthHeaders = () => {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const sendNotificationToUser = async (
  data: SendNotificationRequest,
): Promise<SendNotificationResponse> => {
  const response = await fetch(`${BASE_URL}/api/admin/notifications/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send notification');
  }
  return response.json();
};

export const broadcastToCustomers = async (
  data: BroadcastNotificationRequest,
): Promise<SendNotificationResponse> => {
  const response = await fetch(`${BASE_URL}/api/admin/notifications/send-to-customers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to broadcast to customers');
  }
  return response.json();
};

export const broadcastToDelivery = async (
  data: BroadcastNotificationRequest,
): Promise<SendNotificationResponse> => {
  const response = await fetch(`${BASE_URL}/api/admin/notifications/send-to-delivery`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to broadcast to delivery partners');
  }
  return response.json();
};

export const saveFCMToken = async (data: SaveTokenRequest): Promise<SaveTokenResponse> => {
  const response = await fetch(`${BASE_URL}/api/save-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save token');
  }
  return response.json();
};
