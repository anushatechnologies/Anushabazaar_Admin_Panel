import { baseApiWithAuth } from '@api/baseApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Notification API interfaces
export interface SendNotificationRequest {
  phoneNumber: string;
  title: string;
  message: string;
}

export interface BroadcastNotificationRequest {
  title: string;
  message: string;
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
  }),
});

export const {
  useSendNotificationMutation,
  useSendNotificationByTokenMutation,
  useBroadcastToCustomersMutation,
  useBroadcastToDeliveryMutation,
  useSaveTokenMutation,
} = notificationsApi;

// Manual fetch functions for components
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const sendNotificationToUser = async (data: SendNotificationRequest): Promise<SendNotificationResponse> => {
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

export const broadcastToCustomers = async (data: BroadcastNotificationRequest): Promise<SendNotificationResponse> => {
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

export const broadcastToDelivery = async (data: BroadcastNotificationRequest): Promise<SendNotificationResponse> => {
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
