import { baseApiWithAuth } from '@api/baseApi';

export interface Customer {
  id: number;
  name: string | null;
  phoneNumber: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerApiResponse {
  customers: Customer[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface CustomerQueryParams {
  search?: string;
  active?: boolean | string;
  page?: number;
  size?: number;
}

export const customerApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomerApiResponse, CustomerQueryParams>({
      query: (params) => {
        const urlParams = new URLSearchParams();
        if (params.search) urlParams.append('search', params.search);
        if (params.active !== undefined && params.active !== 'all') {
          urlParams.append('active', String(params.active));
        }
        urlParams.append('page', String(params.page || 0));
        urlParams.append('size', String(params.size || 20));

        return `/api/admin/customers?${urlParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.customers.map(({ id }) => ({ type: 'User' as const, id })),
            { type: 'User', id: 'PARTIAL-LIST' }
          ]
          : [{ type: 'User', id: 'PARTIAL-LIST' }],
    }),

    getCustomerById: builder.query<Customer, number>({
      query: (id) => `/api/admin/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateCustomerStatus: builder.mutation<Customer, { id: number; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/api/admin/customers/${id}/status`,
        method: 'PUT',
        body: { active },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'PARTIAL-LIST' }],
    }),

    deleteCustomer: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/api/admin/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'PARTIAL-LIST' }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerStatusMutation,
  useDeleteCustomerMutation,
} = customerApi;
