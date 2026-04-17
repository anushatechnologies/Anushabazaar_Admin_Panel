import { baseApiWithAuth } from '@api/baseApi';

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  enabled: boolean;
  mustChangePassword: boolean;
  hasAdminAccessCode: boolean;
  createdById: number | null;
  createdAt: string | null;
  lastLoginAt: string | null;
}

export interface CreateAdminRequest {
  email: string;
  name: string;
}

export interface SetAdminAccessCodeRequest {
  id: number;
  code: string;
}

export const adminManagementApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    listAdmins: builder.query<AdminUser[], void>({
      query: () => '/api/super-admin/admin-users',
      providesTags: ['AdminUsers'],
    }),

    createAdmin: builder.mutation<AdminUser, CreateAdminRequest>({
      query: (body) => ({
        url: '/api/super-admin/admin-users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    toggleAdminStatus: builder.mutation<AdminUser, number>({
      query: (id) => ({
        url: `/api/super-admin/admin-users/${id}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    resetAdminPassword: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/api/super-admin/admin-users/${id}/reset-password`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    setAdminAccessCode: builder.mutation<AdminUser, SetAdminAccessCodeRequest>({
      query: ({ id, code }) => ({
        url: `/api/super-admin/admin-users/${id}/access-code`,
        method: 'POST',
        body: { code },
      }),
      invalidatesTags: ['AdminUsers'],
    }),
  }),
});

export const {
  useListAdminsQuery,
  useCreateAdminMutation,
  useToggleAdminStatusMutation,
  useResetAdminPasswordMutation,
  useSetAdminAccessCodeMutation,
} = adminManagementApi;
