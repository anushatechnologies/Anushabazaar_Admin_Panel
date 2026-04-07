import { baseApiWithAuth } from '@api/baseApi';
import { Category } from '../../types/index';
export type { Category };

export type CategoryRequest = Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl'>;

export const categoryApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    // 3.1 Get All Categories
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: '/api/categories',
      }),
      providesTags: ['Category'],
    }),

    // 3.2 Get Category by ID
    getCategoryById: builder.query<Category, number>({
      query: (id) => `/api/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),

    // 3.3 Create Category
    createCategory: builder.mutation<Category, { data: any; image?: File }>({
      query: ({ data, image }) => {
        const formData = new FormData();
        formData.append(
          'category',
          new Blob(
            [
              JSON.stringify({
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                displayOrder: data.displayOrder,
                discount: data.discount,
              }),
            ],
            { type: 'application/json' },
          ),
        );
        if (image && image instanceof File) {
          formData.append('image', image);
        }
        return {
          url: '/api/categories',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Category'],
    }),

    // 3.4 Update Category
    updateCategory: builder.mutation<Category, { id: number; data: any; image?: File }>({
      query: ({ id, data, image }) => {
        const formData = new FormData();
        formData.append(
          'category',
          new Blob(
            [
              JSON.stringify({
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                displayOrder: data.displayOrder,
                discount: data.discount,
                // Send existing imageUrl so backend preserves it when no new file is uploaded
                imageUrl: data.imageUrl || null,
                videoUrl: data.videoUrl || null,
              }),
            ],
            { type: 'application/json' },
          ),
        );

        if (image && image instanceof File) {
          formData.append('image', image);
        }

        return {
          url: `/api/categories/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),

    // 3.5 Soft Delete
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // 3.6 Hard Delete
    hardDeleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/categories/${id}/hard`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // 3.7 Search Categories
    searchCategories: builder.query<Category[], string>({
      query: (keyword) => `/api/categories/search?keyword=${encodeURIComponent(keyword)}`,
      providesTags: ['Category'],
    }),

    // 3.8 Filter by Discount
    filterByDiscount: builder.query<Category[], number>({
      query: (minDiscount) => `/api/categories/filter/discount?minDiscount=${minDiscount}`,
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useHardDeleteCategoryMutation,
  useSearchCategoriesQuery,
  useFilterByDiscountQuery,
} = categoryApi;
