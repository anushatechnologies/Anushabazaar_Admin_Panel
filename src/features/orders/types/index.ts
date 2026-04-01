// Enhanced order types with delivery info
export interface OrderItemDto {
  variantId: number;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerAddressDto {
  id: number;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  addressType: string;
}

export interface CustomerInfoDto {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: CustomerAddressDto;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  placedAt: string;
  items: OrderItemDto[];
  customer?: CustomerInfoDto;
  deliveryPersonId?: number;
  estimatedDeliveryTime?: string;
  paymentMethod: string;
}

export interface PlaceOrderRequest {
  addressId: number;
  paymentMethod: string; // "ONLINE" or "COD"
}

// Admin order types
export interface AdminOrderSummaryDto {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  placedAt: string;
}

export interface AdminOrderDetailDto {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: CustomerAddressDto;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  placedAt: string;
  items: OrderItemDto[];
  deliveryHistory?: DeliveryHistoryDto[];
}

export interface DeliveryHistoryDto {
  status: string;
  timestamp: string;
  remarks?: string;
  updatedBy: string;
}

export interface AcceptOrderRequest {
  orderId: number;
  remarks?: string;
}

export interface AcceptOrderResponse {
  success: boolean;
  message: string;
  order: OrderResponse;
}

export interface RejectOrderRequest {
  orderId: number;
  reason: string;
  remarks?: string;
}

export interface RejectOrderResponse {
  success: boolean;
  message: string;
  order: OrderResponse;
}

export interface AssignDeliveryRequest {
  orderId: number;
  deliveryPersonId: number;
  estimatedDeliveryTime?: string;
}

export interface AssignDeliveryResponse {
  success: boolean;
  message: string;
  order: OrderResponse;
}
