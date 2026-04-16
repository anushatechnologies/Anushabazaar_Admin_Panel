import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'https://api.anushatechnologies.com';

const baseAuthQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    headers.delete('Authorization');
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseAuthQuery,
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: '/api/auth/adminpanel/login',
        method: 'POST',
        body,
      }),
    }),

    preparePasswordReset: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: '/api/auth/adminpanel/prepare-password-reset',
        method: 'POST',
        body,
      }),
    }),

    syncFirebasePassword: builder.mutation<any, { idToken: string; newPassword: string }>({
      query: (body) => ({
        url: '/api/auth/adminpanel/sync-firebase-password',
        method: 'POST',
        body,
      }),
    }),

    changePassword: builder.mutation<
      any,
      { email: string; currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/api/auth/adminpanel/change-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  usePreparePasswordResetMutation,
  useSyncFirebasePasswordMutation,
  useChangePasswordMutation,
} = authApi;
