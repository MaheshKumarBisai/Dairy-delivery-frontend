/** Catalog types — exact response shapes from
 *  GET /products, GET /products/:productId, GET /categories, GET /merchants/public */

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ProductImage {
  imageId: string;
  imageUrl: string;
}

export interface Product {
  productId: string;
  merchantId: string;
  name: string;
  description: string;
  category: { categoryId: string; name: string };
  image: ProductImage;
  pricing: { price: number; currency: string; unit: string };
  availability: { isAvailable: boolean; stockStatus: StockStatus };
  delivery: { subscriptionAllowed: boolean; availableSchedules: string[] };
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  merchantId?: string;
  search?: string;
  subscriptionAllowed?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface Category {
  categoryId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

/** GET /merchants/public — public projection only (no coordinates are exposed). */
export interface PublicMerchant {
  merchantId: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}
