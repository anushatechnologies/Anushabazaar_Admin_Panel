// Enhanced order types with delivery info
export interface OrderItemDto {
  id?: number;
  productId?: number;
  variantId: number;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  storeName?: string;
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
  subtotal?: number;
  deliveryCharge?: number;
  platformFee?: number;
  discount?: number;
  orderStatus: string;
  status?: string;
  paymentStatus: string;
  placedAt: string;
  createdAt?: string;
  items: OrderItemDto[];
  storeGroups?: StoreGroupDto[];
  customer?: CustomerInfoDto;
  deliveryPersonId?: number;
  estimatedDeliveryTime?: string;
  paymentMethod: string;
  address?: CustomerAddressDto;
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
  /** Populated when order spans multiple stores */
  storeNames?: string[];
  storeIds?: number[];
  subtotal?: number;
  deliveryCharge?: number;
  platformFee?: number;
  discount?: number;
  paymentMethod?: string;
}

export interface AdminOrderDetailDto {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: CustomerAddressDto;
  subtotal?: number;
  deliveryCharge?: number;
  platformFee?: number;
  discount?: number;
  grandTotal: number;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  placedAt: string;
  /** Assigned rider info — null until ASSIGNED */
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  deliveryPersonVehicle?: string;
  deliveryPersonRating?: number;
  estimatedDeliveryTime?: string;
  items: OrderItemDto[];
  storeGroups?: StoreGroupDto[];
  deliveryHistory?: DeliveryHistoryDto[];
}

export interface StoreGroupDto {
  storeId: number;
  storeName: string;
  storePhone?: string;
  /** Current sub-order status: PENDING | STORE_NOTIFIED | PICKED_UP | DELIVERED | etc. */
  status?: string;
  subtotal: number;
  items: OrderItemDto[];
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
  message: string;
  orderId: number;
}

export interface RejectOrderRequest {
  orderId: number;
  reason: string;
  remarks?: string;
}

export interface RejectOrderResponse {
  message: string;
  orderId: number;
}

export interface AssignDeliveryRequest {
  orderId: number;
  deliveryPersonId: number;
  estimatedDeliveryTime?: string;
}

export interface AssignDeliveryResponse {
  success: boolean;
  message: string;
  orderId: number;
  orderNumber: string;
}
