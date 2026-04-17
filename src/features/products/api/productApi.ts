import { baseApiWithAuth } from '@api/baseApi';
import { Product } from '../../category/types/index';

export interface ProductVariantRequest {
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  isActive: boolean;
  displayOrder: number;
}
export type VariantRequest = ProductVariantRequest;

export interface ProductRequest {
  name: string;
  description: string;
  isActive: boolean;
  isTrending?: boolean;
  bestSeller?: boolean;
  displayOrder: number;
  categoryId: number;
  subCategoryId: number;
  storeId?: number;
  variants: ProductVariantRequest[];
}

export interface ProductGalleryImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

const normalizeProductRequest = (product: ProductRequest) => ({
  name: product.name.trim(),
  description: product.description.trim(),
  isActive: product.isActive,
  isTrending: product.isTrending ?? false,
  bestSeller: product.bestSeller ?? false,
  displayOrder: Number(product.displayOrder || 0),
  categoryId: Number(product.categoryId),
  subCategoryId: Number(product.subCategoryId),
  ...(product.storeId ? { storeId: Number(product.storeId) } : {}),
  variants: product.variants.map((variant) => ({
    name: variant.name.trim(),
    ...(variant.sku?.trim() ? { sku: variant.sku.trim() } : {}),
    price: Number(variant.price),
    ...(variant.discountPrice !== undefined && variant.discountPrice !== null
      ? { discountPrice: Number(variant.discountPrice) }
      : {}),
    stock: Number(variant.stock),
    isActive: variant.isActive,
    displayOrder: Number(variant.displayOrder || 0),
  })),
});

const minimalVariantPayload = (product: ReturnType<typeof normalizeProductRequest>) => ({
  name: product.name,
  description: product.description,
  isActive: product.isActive,
  isTrending: product.isTrending,
  bestSeller: product.bestSeller,
  displayOrder: product.displayOrder,
  categoryId: product.categoryId,
  subCategoryId: product.subCategoryId,
  ...(product.storeId ? { storeId: product.storeId } : {}),
  variants: product.variants.map((variant) => ({
    name: variant.name,
    ...(variant.sku ? { sku: variant.sku } : {}),
    price: variant.price,
    stock: variant.stock,
  })),
});

const buildProductFormData = (product: unknown, image?: File, video?: File) => {
  const formData = new FormData();
  formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));
  if (image) {
    formData.append('image', image);
  }
  if (video) {
    formData.append('video', video);
  }
  return formData;
};

export const productApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], { storeId?: number }>({
      query: (params) => ({
        url: '/api/products',
        params,
      }),
      providesTags: ['Product' as any],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => `/api/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product' as any, id }],
    }),

    createProduct: builder.mutation<
      Product,
      { product: ProductRequest; image?: File; video?: File }
    >({
      query: ({ product, image, video }) => {
        const normalizedProduct = normalizeProductRequest(product);
        return {
          url: '/api/products',
          method: 'POST',
          body: buildProductFormData(normalizedProduct, image, video),
        };
      },
      invalidatesTags: ['Product' as any],
    }),

    updateProduct: builder.mutation<
      Product,
      { id: number; product: ProductRequest; image?: File; video?: File }
    >({
      async queryFn({ id, product, image, video }, _api, _extraOptions, fetchWithBQ) {
        const normalizedProduct = normalizeProductRequest(product);
        const candidatePayloads = [normalizedProduct, minimalVariantPayload(normalizedProduct)];

        let lastError: any = null;

        for (const candidate of candidatePayloads) {
          const result = await fetchWithBQ({
            url: `/api/products/${id}`,
            method: 'PUT',
            body: buildProductFormData(candidate, image, video),
          });

          if (!result.error) {
            return { data: result.data as Product };
          }

          lastError = result.error;
        }

        return { error: lastError };
      },
      invalidatesTags: (result, error, { id }) => [
        'Product' as any,
        { type: 'Product' as any, id },
      ],
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product' as any],
    }),

    addProductGalleryImage: builder.mutation<
      any,
      { productId: number; image: File; displayOrder: number }
    >({
      query: ({ productId, image, displayOrder }) => {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('displayOrder', String(displayOrder));
        return {
          url: `/api/products/${productId}/images`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Product' as any],
    }),

    updateProductGalleryImage: builder.mutation<
      any,
      { imageId: number; image?: File; displayOrder?: number }
    >({
      query: ({ imageId, image, displayOrder }) => {
        const formData = new FormData();
        if (image) formData.append('image', image);
        if (displayOrder !== undefined) formData.append('displayOrder', String(displayOrder));
        return {
          url: `/api/products/images/${imageId}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Product' as any],
    }),

    deleteProductGalleryImage: builder.mutation<void, number>({
      query: (imageId) => ({
        url: `/api/products/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product' as any],
    }),

    searchProducts: builder.query<Product[], string>({
      query: (keyword) => `/api/products/search?keyword=${encodeURIComponent(keyword)}`,
      providesTags: ['Product' as any],
    }),

    getTrendingProducts: builder.query<Product[], void>({
      query: () => '/api/products/trending',
      providesTags: ['Product' as any],
    }),

    filterProducts: builder.query<
      Product[],
      {
        categoryId?: number;
        subCategoryId?: number;
        storeId?: number;
        minPrice?: number;
        maxPrice?: number;
        trending?: boolean;
        keyword?: string;
      }
    >({
      query: (params) => ({
        url: '/api/products/filter',
        params,
      }),
      providesTags: ['Product' as any],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductGalleryImageMutation,
  useUpdateProductGalleryImageMutation,
  useDeleteProductGalleryImageMutation,
  useSearchProductsQuery,
  useGetTrendingProductsQuery,
  useFilterProductsQuery,
} = productApi;
