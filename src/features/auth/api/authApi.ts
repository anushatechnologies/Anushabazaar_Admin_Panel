// @features/auth/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser } from '@features/auth/authSlice';

const BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'https://api.anushatechnologies.com';

// Base query for auth endpoints (root level)
const baseAuthQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    // Remove any existing authorization headers for login
    headers.delete('Authorization');
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseAuthQuery,
  endpoints: (builder) => ({
    // Register
    register: builder.mutation<any, { email: string; password: string; role?: string }>({
      query: (body) => ({
        url: '/api/auth/adminpanel/register',
        method: 'POST',
        body: {
          ...body,
          role: body.role || 'ADMIN' // Default to ADMIN
        },
      }),
    }),

    // Login
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: '/api/auth/adminpanel/login',
        method: 'POST',
        body,
      }),
    }),

    // Send OTP (Forgot Password)
    sendOtp: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: '/api/auth/adminpanel/send-otp',
        method: 'POST',
        body,
      }),
    }),

    // Verify OTP
    verifyOtp: builder.mutation<any, { email: string; otp: string; newPassword: string }>({
      query: (body) => ({
        url: '/api/auth/adminpanel/verify-otp',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useSendOtpMutation, useVerifyOtpMutation } = authApi;
