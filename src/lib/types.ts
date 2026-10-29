export interface ProductVariantData {
  id?: string;
  name: string;
  sku: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  inventoryQty: number;
  isDefault?: boolean;
}

export interface ProductImageData {
  id?: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductWithRelations {
  id: string;
  slug: string;
  name: string;
  sku: string;
  barcode?: string | null;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: string | null;
  tags?: string | null;
  regularPricePaise: number;
  sellingPricePaise: number;
  compareAtPricePaise?: number | null;
  inventoryQty: number;
  lowStockThreshold: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  availability: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PREORDER' | 'DISCONTINUED' | string;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isSale: boolean;
  
  // Provenance & Regulated data
  farmOrigin?: string | null;
  harvestInfo?: string | null;
  grade?: string | null;
  netWeight?: string | null;
  batchNumber?: string | null;
  fssaiNumber?: string | null;
  mfgDate?: string | null;
  expiryDate?: string | null;
  storageInstructions?: string | null;
  shelfLife?: string | null;
  ingredients?: string | null;
  
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  
  createdAt: Date | string;
  updatedAt: Date | string;
  
  images: ProductImageData[];
  variants: ProductVariantData[];
  reviews?: Array<{
    id: string;
    customerName: string;
    rating: number;
    title?: string | null;
    comment: string;
    createdAt: Date | string;
  }>;
}

export interface CartItem {
  productId: string;
  variantId?: string | null;
  name: string;
  variantName?: string | null;
  slug: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  image: string;
  quantity: number;
  maxInventory: number;
  sku: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface StoreSettingsData {
  storeName: string;
  tagline: string;
  logoUrl?: string | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
  fssaiLicence: string;
  freeShippingThresholdPaise: number;
  standardShippingFeePaise: number;
  taxRatePercent: number;
  codEnabled: boolean;
  razorpayKeyId: string;
  announcementText: string;
  announcementActive: boolean;
  currency: string;
  currencySymbol: string;
}
