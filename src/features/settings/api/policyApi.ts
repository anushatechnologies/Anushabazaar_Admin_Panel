import { baseApiWithAuth } from '../../../api/baseApi';

export interface AppPolicy {
  id: number;
  type: string;
  content: string;
  updatedAt: string;
}

export const policyApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getPolicy: builder.query<{ success: boolean; policy: AppPolicy }, string>({
      query: (type) => `/api/policies/${type}`,
      providesTags: (result, error, type) => [{ type: 'Policies' as const, id: type }],
    }),
    updatePolicy: builder.mutation<{ success: boolean; policy: AppPolicy }, { type: string; content: string }>({
      query: ({ type, content }) => ({
        url: `/api/admin/policies/${type}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (result, error, { type }) => [{ type: 'Policies' as const, id: type }],
    }),
  }),
});

export const {
  useGetPolicyQuery,
  useUpdatePolicyMutation,
} = policyApi;
