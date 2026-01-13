export interface Env {
  DB: D1Database;
  R2: R2Bucket;
}

// Extend Cloudflare.Env to include our bindings
declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      R2: R2Bucket;
    }
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller';
  gst_no?: string;
  shop_name?: string;
  address?: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  image_url: string;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string;
  stock: number;
  discount: number;
  seller_id?: string;
  created_at?: string;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: 'gst' | 'shop_license' | 'aadhaar' | 'pan' | 'other';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  gstNo?: string;
  shopName: string;
  address: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface UploadDocumentRequest {
  userId: string;
  documentType: 'gst' | 'shop_license' | 'aadhaar' | 'pan' | 'other';
  file: File;
}

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  stock: number;
  discount: number;
  sellerId?: string;
}

export interface CreateOrderRequest {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface VerifySellerRequest {
  userId: string;
  status: 'verified' | 'rejected';
  rejectionReason?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}
