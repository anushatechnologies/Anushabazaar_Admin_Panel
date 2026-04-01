import { baseApiWithAuth } from '@api/baseApi';
import { SubCategory } from '../../types/index';

export interface SubCategoryRequest {
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  discount: number;
  categoryId: number;
}

export const subCategoryApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    // 4.1 Get Subcategories by Category
    getSubCategoriesByCategory: builder.query<SubCategory[], number>({
      query: (categoryId) => ({
        url: `/api/subcategories/${categoryId}`,
      }),
      providesTags: (result, error, categoryId) => [{ type: 'SubCategory' as any, id: `cat-${categoryId}` }],
    }),

    // 4.2 Get Subcategory by ID
    getSubCategoryById: builder.query<SubCategory, number>({
      query: (id) => ({
        url: `/api/subcategories/detail/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'SubCategory' as any, id }],
    }),

    // 4.3 Get All Subcategories
    getAllSubCategories: builder.query<SubCategory[], void>({
      query: () => ({
        url: '/api/subcategories',
      }),
      providesTags: ['SubCategory' as any],
    }),

    // 4.4 & 4.6 Create Subcategory (Supports JSON or Multipart)
    createSubCategory: builder.mutation<SubCategory, { subCategory: SubCategoryRequest; image?: File; video?: File }>({
      query: ({ subCategory, image, video }) => {
        if (!image && !video) {
          return {
            url: '/api/subcategories',
            method: 'POST',
            body: subCategory,
          };
        }
        const formData = new FormData();
        formData.append('subCategory', new Blob([JSON.stringify(subCategory)], { type: 'application/json' }));
        if (image) formData.append('image', image);
        if (video) formData.append('video', video);
        return {
          url: '/api/subcategories',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['SubCategory' as any],
    }),

    // 4.5 & 4.7 Update Subcategory (Supports JSON or Multipart)
    updateSubCategory: builder.mutation<SubCategory, { id: number; subCategory: SubCategoryRequest; image?: File; video?: File }>({
      query: ({ id, subCategory, image, video }) => {
        if (!image && !video) {
          return {
            url: `/api/subcategories/${id}`,
            method: 'PUT',
            body: subCategory,
          };
        }
        const formData = new FormData();
        formData.append('subCategory', new Blob([JSON.stringify(subCategory)], { type: 'application/json' }));
        if (image) formData.append('image', image);
        if (video) formData.append('video', video);
        return {
          url: `/api/subcategories/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => ['SubCategory' as any, { type: 'SubCategory' as any, id }],
    }),

    // 4.8 Soft Delete
    deleteSubCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/subcategories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubCategory' as any],
    }),

    // 4.9 Hard Delete
    hardDeleteSubCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/subcategories/${id}/hard`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubCategory' as any],
    }),
  }),
});

export const {
  useGetSubCategoriesByCategoryQuery,
  useGetSubCategoryByIdQuery,
  useGetAllSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useHardDeleteSubCategoryMutation,
} = subCategoryApi;
