import { baseApiWithAuth } from '@api/baseApi';
import {
  OrderResponse,
  AdminOrderSummaryDto,
  AdminOrderDetailDto,
  AcceptOrderResponse,
  RejectOrderResponse,
  RejectOrderRequest,
  AssignDeliveryResponse,
  AssignDeliveryRequest,
  PlaceOrderRequest,
} from '../types/index';

export const orderApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    // Customer endpoints
    getMyOrders: builder.query<OrderResponse[], void>({
      query: () => '/api/orders',
      providesTags: ['Orders'],
    }),

    getOrderById: builder.query<OrderResponse, number>({
      query: (orderId) => `/api/orders/${orderId}`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),

    placeOrder: builder.mutation<OrderResponse, PlaceOrderRequest>({
      query: (orderData) => ({
        url: '/api/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),

    // Admin endpoints
    getAdminOrders: builder.query<AdminOrderSummaryDto[], void>({
      query: () => '/api/admin/orders',
      providesTags: ['AdminOrders'],
    }),

    getAdminOrderById: builder.query<AdminOrderDetailDto, number>({
      query: (orderId) => `/api/admin/orders/${orderId}`,
      providesTags: (result, error, id) => [{ type: 'AdminOrders', id }],
    }),

    acceptOrder: builder.mutation<AcceptOrderResponse, number>({
      query: (orderId) => ({
        url: `/api/admin/orders/${orderId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    rejectOrder: builder.mutation<RejectOrderResponse, RejectOrderRequest>({
      query: (requestData) => ({
        url: `/api/admin/orders/${requestData.orderId}/reject`,
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    assignDelivery: builder.mutation<AssignDeliveryResponse, AssignDeliveryRequest>({
      query: (requestData) => ({
        // Docs: POST /api/admin/orders/{orderId}/assign
        url: `/api/admin/orders/${requestData.orderId}/assign`,
        method: 'POST',
        // Backend expects `{ "deliveryPersonId": number }` (estimatedDeliveryTime is optional).
        body: {
          deliveryPersonId: requestData.deliveryPersonId,
          ...(requestData.estimatedDeliveryTime
            ? { estimatedDeliveryTime: requestData.estimatedDeliveryTime }
            : {}),
        },
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    // Override store acceptance on behalf of store (admin panel override)
    // POST /api/delivery-admin/orders/{orderNumber}/store-accept
    adminStoreAccept: builder.mutation<
      { success: boolean; message: string },
      { orderNumber: string; remarks?: string }
    >({
      query: ({ orderNumber, remarks }) => ({
        url: `/api/delivery-admin/orders/${orderNumber}/store-accept`,
        method: 'POST',
        body: { remarks: remarks ?? 'Manual Admin Acceptance' },
      }),
      invalidatesTags: ['AdminOrders'],
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

    // Send pickup OTP to store via WhatsApp (admin-triggered)
    sendStorePickupOtp: builder.mutation<{ success: boolean; message: string }, number>({
      query: (orderId) => ({
        url: `/api/admin/orders/${orderId}/send-store-otp`,
        method: 'POST',
      }),
    }),

    // Notify store via WhatsApp BEFORE admin formally accepts — store can ACCEPT/REJECT
    // POST /api/admin/orders/{orderId}/notify-store
    notifyStore: builder.mutation<{ success: boolean; message: string }, number>({
      query: (orderId) => ({
        url: `/api/admin/orders/${orderId}/notify-store`,
        method: 'POST',
      }),
    }),

    // Broadcast order to all riders of a vehicle type (first-come-first-serve)
    broadcastOrder: builder.mutation<
      {
        success: boolean;
        broadcastId: number;
        vehicleType: string;
        expiresAt: string;
        message: string;
      },
      { orderId: number; vehicleType: string }
    >({
      query: ({ orderId, vehicleType }) => ({
        url: `/api/admin/orders/${orderId}/broadcast`,
        method: 'POST',
        body: { vehicleType },
      }),
      invalidatesTags: ['AdminOrders'],
    }),
  }),
  overrideExisting: false,
});

export const {
  // Customer hooks
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  usePlaceOrderMutation,
  // Admin hooks
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useAssignDeliveryMutation,
  useAdminStoreAcceptMutation,
  useGenerateDeliveryOtpMutation,
  useSendStorePickupOtpMutation,
  useNotifyStoreMutation,
  useBroadcastOrderMutation,
} = orderApi;
