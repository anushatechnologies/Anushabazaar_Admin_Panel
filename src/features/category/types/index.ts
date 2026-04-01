export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  discount: number;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  discount: number;
  imageUrl?: string;
  videoUrl?: string;
  category: Category; // Backend returns full category object
  products?: Product[];
  createdAt?: string;
  updatedAt?: string;
}
export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: number;
  discountPrice: number;
  stock: number;
  isActive: boolean;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  stock: number;
  isActive: boolean;
  isTrending: boolean;
  displayOrder: number;
  imageUrl?: string;
  videoUrl?: string;
  categoryId: number;
  categoryName?: string;
  subCategoryId: number;
  subCategoryName?: string;
  storeId?: number;
  storeName?: string;
  createdAt?: string;
  updatedAt?: string;
  bestSeller: boolean;
  variants?: ProductVariant[]; // Added variants
}

export interface Store {
  id: number;
  name: string;
}
