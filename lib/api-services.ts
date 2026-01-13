import apiClient from './api-client';

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
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
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

export interface CartItem {
  product: Product;
  quantity: number;
}

// Auth Service
export const authService = {
  register: async (data: {
    name: string;
    email: string;
    gstNo?: string;
    shopName: string;
    address: string;
    phone?: string;
  }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  getUser: async (userId: string) => {
    const response = await apiClient.get(`/auth/user/${userId}`);
    return response.data;
  },
};

// KYC Service
export const kycService = {
  uploadDocument: async (userId: string, documentType: string, file: any) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('documentType', documentType);
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || `document-${Date.now()}.jpg`,
    } as any);

    const response = await apiClient.post('/kyc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
};

// Product Service
export const productService = {
  getAllProducts: async (categoryId?: string) => {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
};

// Order Service
export const orderService = {
  getUserOrders: async (userId: string, status?: string) => {
    const params = status ? { userId, status } : { userId };
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (userId: string, items: { productId: string; quantity: number }[]) => {
    const response = await apiClient.post('/orders', { userId, items });
    return response.data;
  },
};