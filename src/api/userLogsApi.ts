import { baseApiWithAuth } from './baseApi';

export interface UserLog {
  id: number;
  userId: number;
  userRole: string;
  action: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export const userLogsApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getUserLogs: builder.query<UserLog[], void>({
      query: () => '/api/user-logs',
      providesTags: ['User'], 
    }),

    getUserLogsByUserId: builder.query<UserLog[], number>({
      query: (userId) => `/api/user-logs/user/${userId}`,
      providesTags: ['User'],
    }),

    getUserLogsByRole: builder.query<UserLog[], string>({
      query: (role) => `/api/user-logs/role/${encodeURIComponent(role)}`,
      providesTags: ['User'],
    }),

    getUserLogsByAction: builder.query<UserLog[], string>({
      query: (action) => `/api/user-logs/action/${encodeURIComponent(action)}`,
      providesTags: ['User'],
    }),

    createUserLog: builder.mutation<UserLog, { userId: number; userRole: string; action: string; details?: string; ipAddress?: string }>({
      query: (body) => ({
        url: '/api/user-logs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserLogsQuery,
  useGetUserLogsByUserIdQuery,
  useGetUserLogsByRoleQuery,
  useGetUserLogsByActionQuery,
  useCreateUserLogMutation,
} = userLogsApi;
