import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  getStoredAccessToken,
  getStoredAuthUser,
  getStoredRefreshToken,
} from '@features/auth/authCookies';
import { logoutUser, setCredentials } from '@features/auth/authSlice';

// ── Token refresh scheduler ──────────────────────────────────────────────────
// Reads the exp claim from the stored JWT and schedules a refresh 30 min before
// expiry.  Called once on app startup and again after every successful refresh.
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;
let _refreshPromise: Promise<boolean> | null = null;

async function performAdminRefresh(dispatch: (action: any) => void) {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const storedRefreshToken = getStoredRefreshToken();
    if (!storedRefreshToken) {
      return false;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/adminpanel/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!res.ok) {
        throw new Error('refresh failed');
      }

      const data = await res.json();
      const newToken: string | null = data.accessToken || data.token || null;
      const newRefreshToken: string | null = data.refreshToken || storedRefreshToken;
      const user = getStoredAuthUser();

      if (!newToken) {
        return false;
      }

      dispatch(setCredentials({ token: newToken, refreshToken: newRefreshToken, user }));
      scheduleTokenRefresh(newToken, dispatch);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

function scheduleTokenRefresh(token: string, dispatch: (action: any) => void) {
  if (_refreshTimer) clearTimeout(_refreshTimer);

  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64));
    if (!payload?.exp) return;

    const expiresAt = payload.exp * 1000; // convert to ms
    const refreshAt = expiresAt - 60 * 1000; // 60 seconds before expiry
    const delay = Math.max(refreshAt - Date.now(), 0);

    _refreshTimer = setTimeout(async () => {
      await performAdminRefresh(dispatch);
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

    const token = getStoredAccessToken();
    if (token) {
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
  const token = getStoredAccessToken();
  if (token) {
    scheduleTokenRefresh(token, api.dispatch);
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    console.group(`[API Error] ${method} ${fullUrl}`);
    console.error('Status:', result.error.status);
    console.error('Data:', (result.error as any).data);
    console.groupEnd();

    if (result.error.status === 401) {
      const refreshed = await performAdminRefresh(api.dispatch);

      if (refreshed) {
        result = await rawBaseQuery(args, api, extraOptions);
      }

      if (result.error?.status === 401) {
        console.warn('Session unauthorized (401) for:', fullUrl);
        api.dispatch(logoutUser());
        window.location.replace('/login?expired=true');
      }
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
    'CheckoutSettings',
  ],
  endpoints: () => ({}),
});
