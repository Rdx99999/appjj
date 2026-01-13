import apiClient from './client';

// Types
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
  pending_docs?: number;
  approved_docs?: number;
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
  category_name?: string;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: 'gst' | 'shop_license' | 'aadhaar' | 'pan' | 'other';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  name?: string;
  email?: string;
  shop_name?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
  user_name?: string;
  shop_name?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
  image_url?: string;
}

export interface DashboardStats {
  totalSellers: number;
  pendingSellers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
};

// Seller Service
export const sellerService = {
  getAllSellers: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/admin/sellers', { params });
    return response.data;
  },
  getPendingSellers: async () => {
    const response = await apiClient.get('/admin/pending-sellers');
    return response.data;
  },
  verifySeller: async (userId: string, status: 'verified' | 'rejected', rejectionReason?: string) => {
    const response = await apiClient.post('/admin/verify-seller', { userId, status, rejectionReason });
    return response.data;
  },
};

// KYC Service
export const kycService = {
  getPendingDocuments: async () => {
    const response = await apiClient.get('/kyc/pending');
    return response.data;
  },
  verifyDocument: async (documentId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    const response = await apiClient.post('/kyc/verify', { documentId, status, rejectionReason });
    return response.data;
  },
  getUserDocuments: async (userId: string) => {
    const response = await apiClient.get(`/kyc/user/${userId}`);
    return response.data;
  },
};

// Category Service
export const categoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },
  getCategory: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },
  createCategory: async (name: string, imageUrl: string) => {
    const response = await apiClient.post('/categories', { name, image_url: imageUrl });
    return response.data;
  },
  updateCategory: async (id: string, name: string, imageUrl: string) => {
    const response = await apiClient.put(`/categories/${id}`, { name, image_url: imageUrl });
    return response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};

// Product Service
export const productService = {
  getAllProducts: async (categoryId?: string, sellerId?: string) => {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    if (sellerId) params.sellerId = sellerId;
    const response = await apiClient.get('/products', { params });
    return response.data;
  },
  getProduct: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'category_name'>) => {
    const response = await apiClient.post('/products', product);
    return response.data;
  },
  updateProduct: async (id: string, product: Partial<Product>) => {
    const response = await apiClient.put(`/products/${id}`, product);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Order Service
export const orderService = {
  getAllOrders: async (userId?: string, status?: string) => {
    const params: any = {};
    if (userId) params.userId = userId;
    if (status) params.status = status;
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },
  getOrder: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (orderId: string, status: 'pending' | 'shipped' | 'delivered' | 'cancelled') => {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

// Dashboard Service
export const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
};