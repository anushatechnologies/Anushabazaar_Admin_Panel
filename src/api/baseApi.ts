import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser, setCredentials } from '@features/auth/authSlice';

// ── Token refresh scheduler ──────────────────────────────────────────────────
// Reads the exp claim from the stored JWT and schedules a refresh 30 min before
// expiry.  Called once on app startup and again after every successful refresh.
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleTokenRefresh(token: string, dispatch: (action: any) => void) {
  if (_refreshTimer) clearTimeout(_refreshTimer);

  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64));
    if (!payload?.exp) return;

    const expiresAt = payload.exp * 1000; // convert to ms
    const refreshAt = expiresAt - 30 * 60 * 1000; // 30 min before expiry
    const delay = refreshAt - Date.now();

    if (delay <= 0) return; // already within 30-min window — refresh immediately handled by reauth

    _refreshTimer = setTimeout(async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/adminpanel/refresh`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        if (!res.ok) throw new Error('refresh failed');
        const data = await res.json();
        const newToken: string = data.token;
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        dispatch(setCredentials({ token: newToken, user }));
        scheduleTokenRefresh(newToken, dispatch); // schedule next refresh
      } catch {
        // Silent — if refresh fails, user will be logged out on the next 401
      }
    }, delay);
  } catch {
    // Malformed token — ignore
  }
}

// ── Raw base query (no auth) ─────────────────────────────────────────────────
// IMPORTANT: Do NOT set Content-Type globally. RTK Query handles it:
// - JSON bodies → application/json
// - FormData bodies → multipart/form-data with the correct boundary
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { arg }) => {
    const body = typeof arg === 'string' ? undefined : (arg as any).body;
    const method = (typeof arg === 'string' ? 'GET' : (arg as any).method) || 'GET';
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    headers.set('Accept', 'application/json');

    if (isFormData) {
      headers.delete('Content-Type');
    } else if (method.toUpperCase() !== 'GET' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

// ── Authenticated base query with 401 handler ────────────────────────────────
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const fullUrl = typeof args === 'string' ? args : args.url;
  const method = (typeof args === 'string' ? 'GET' : args.method) || 'GET';

  // Kick off token refresh schedule on every request so the timer survives
  // across page reloads (schedule is re-derived from current token on startup).
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined' && token !== 'null') {
    scheduleTokenRefresh(token, api.dispatch);
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    console.group(`[API Error] ${method} ${fullUrl}`);
    console.error('Status:', result.error.status);
    console.error('Data:', (result.error as any).data);
    console.groupEnd();

    if (result.error.status === 401) {
      console.warn('Session unauthorized (401) for:', fullUrl);
      api.dispatch(logoutUser());
      window.location.replace('/login?expired=true');
    }
  }

  return result;
};

// ── Public API (no auth) ─────────────────────────────────────────────────────
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

// ── Authenticated API ────────────────────────────────────────────────────────
export const baseApiWithAuth = createApi({
  reducerPath: 'baseApiWithAuth',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Dashboard',
    'Orders',
    'AdminOrders',
    'User',
    'Stores',
    'StoreTypes',
    'Category',
    'CategoryList',
    'SubCategory',
    'Product',
    'ProductList',
    'Notification',
    'Banner',
    'Banners',
    'Delivery',
    'FareSetting',
    'FareSettings',
    'Payouts',
    'Coupons',
    'Documents',
    'Customers',
    'Policies',
  ],
  endpoints: () => ({}),
});
