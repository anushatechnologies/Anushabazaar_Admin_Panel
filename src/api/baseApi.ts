import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser } from '@features/auth/authSlice';

// -------------------- BASE QUERY FACTORY --------------------
// IMPORTANT: Do NOT set Content-Type globally. RTK Query handles it:
// - JSON bodies get application/json.
// - FormData bodies get multipart/form-data with the correct boundary.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { arg }) => {
    const method = (typeof arg === 'string' ? 'GET' : (arg as any).method) || 'GET';
    const body = typeof arg === 'string' ? undefined : (arg as any).body;
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    
    // Standardize Accept header
    headers.set('Accept', 'application/json');
    
    // 💡 AVOID Content-Type on GET requests (RFC non-standard/problematic for some backends)
    if (isFormData) {
      headers.delete('Content-Type');
    } else if (method.toUpperCase() !== 'GET' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      const authHeader = `Bearer ${token}`;
      headers.set('Authorization', authHeader);
      // 🔥 DEBUG: Log if we are sending a token
      console.log(`[API Header] Authorization: Bearer ${token.substring(0, 10)}... (length: ${token.length})`);
    }
    
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const fullUrl = typeof args === 'string' ? args : args.url;
  const method = (typeof args === 'string' ? 'GET' : args.method) || 'GET';
  
  // 🔍 DEBUG: Log full request details
  console.log(`[API Request] ${method} ${fullUrl}`);

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const errorData = result.error as any;
    
    // 🔍 DEBUG: Log full error for troubleshooting
    console.group(`[API Error] ${method} ${fullUrl}`);
    console.error('Status:', result.error.status);
    console.error('Data:', errorData.data);
    console.error('Message:', errorData.message || errorData.error);
    console.groupEnd();

    // ⛔ HANDLE 401 UNAUTHORIZED
    if (result.error.status === 401) {
      console.warn('Session unauthorized (401) for:', fullUrl);
      // api.dispatch(logoutUser());
      // window.location.replace('/login?expired=true');
    }
  }

  return result;
};

// 1. baseApi WITHOUT AUTH (for simple public endpoints if needed)
export const baseApi = createApi({
  reducerPath: 'baseApiWithoutAuth',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  endpoints: () => ({}),
});

// 2. baseApi WITH AUTH AND REAUTH HANDLING
export const baseApiWithAuth = createApi({
  reducerPath: 'baseApiWithAuth',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Dashboard', 'Orders', 'AdminOrders', 'User', 'Stores', 'StoreTypes', 'Category',
    'CategoryList', 'SubCategory', 'Product', 'ProductList', 'Notification', 'Banner', 'Banners', 'Delivery',
    'FareSetting', 'FareSettings', 'Payouts', 'Coupons', 'Documents', 'Customers'
  ],
  endpoints: () => ({}),
});
