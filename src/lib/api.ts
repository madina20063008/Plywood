import { 
  ApiCustomer, 
  CreateCustomerData, 
  LoginCredentials, 
  ApiUser, 
  CreateUserData, 
  ApiProduct, 
  CreateProductData, 
  ProductFilters,
  ApiCategory, 
  UpdateProductData,
  CreateAcceptanceData,
  ApiAcceptance,
  ApiAcceptanceHistory,
  CreateCuttingData,
  ApiCutting,
  CreateBandingData,
  ApiBanding,
  CreateThicknessData,
  ApiThickness,
  ApiOrder,
  CreateOrderData
} from "./types";

// api.ts
const API_BASE_URL = 'https://plywood.pythonanywhere.com';

// api.ts - Update apiRequest function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // DEBUG: Check what's in localStorage
  console.log('LocalStorage check:', {
    accessToken: localStorage.getItem('accessToken'),
    allKeys: Object.keys(localStorage)
  });

  // Get token from localStorage
  const token = localStorage.getItem('accessToken');
  console.log('Token retrieved:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Authorization header set with token');
  } else {
    console.warn('No access token found in localStorage');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  console.log('Making request to:', url, 'with headers:', headers);

  const response = await fetch(url, config);

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error details:', { status: response.status, errorText });
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{access: string}> => {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: {
        access: string;
        refresh?: string;
        user?: any;
      };
    }>('/user/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('API login response structure:', response);
    
    if (response.data && response.data.access) {
      return { access: response.data.access };
    } else if (response.access) {
      return { access: response.access };
    } else {
      throw new Error('No access token found in response');
    }
  },

  getCurrentUser: (): Promise<any> => {
    return apiRequest<any>('/user/me/');
  },

  logout: (refreshToken: string) => {
    return apiRequest('/user/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },
};

// User API
export const userApi = {
  // Get all users
  getAll: (): Promise<ApiUser[]> => {
    return apiRequest<ApiUser[]>('/user/users/');
  },

  // Get user statistics
  getStats: (): Promise<{
    total_users: number;
    total_salers: number;
    total_admins: number;
  }> => {
    return apiRequest('/user/stats/users/');
  },

  // Create new user
  create: (data: CreateUserData): Promise<ApiUser> => {
    return apiRequest<ApiUser>('/user/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update user
  update: (id: number, data: Partial<CreateUserData>): Promise<ApiUser> => {
    return apiRequest<ApiUser>(`/user/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete user
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/user/users/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Customer API - Updated with stats endpoint
export const customerApi = {
  // Get all customers with optional search
  getAll: (search?: string): Promise<ApiCustomer[]> => {
    const endpoint = search 
      ? `/customer/customer/?search=${encodeURIComponent(search)}`
      : '/customer/customer/';
    return apiRequest<ApiCustomer[]>(endpoint);
  },

  // Get customer statistics
  getStats: (): Promise<{
    total_customers: number;
    debtor_customers: number;
    total_debt: number;
  }> => {
    return apiRequest('/customer/stats/customers/');
  },

  // Create new customer
  create: (data: CreateCustomerData): Promise<ApiCustomer> => {
    return apiRequest<ApiCustomer>('/customer/customer/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update customer
  update: (id: number, data: Partial<CreateCustomerData>): Promise<ApiCustomer> => {
    return apiRequest<ApiCustomer>(`/customer/customer/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete customer
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/customer/customer/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Category API
export const categoryApi = {
  // Get all categories with optional search
  getAll: (search?: string): Promise<ApiCategory[]> => {
    const endpoint = search 
      ? `/category/category/?search=${encodeURIComponent(search)}`
      : '/category/category/';
    return apiRequest<ApiCategory[]>(endpoint);
  },

  // Get single category
  getById: (id: number): Promise<ApiCategory> => {
    return apiRequest<ApiCategory>(`/category/category/${id}/`);
  },

  // Create new category
  create: (data: { name: string }): Promise<ApiCategory> => {
    return apiRequest<ApiCategory>('/category/category/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update category
  update: (id: number, data: { name: string }): Promise<ApiCategory> => {
    return apiRequest<ApiCategory>(`/category/category/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete category
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/category/category/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Product API
export const productApi = {
  // Get all products with filters
  getAll: (filters?: ProductFilters): Promise<ApiProduct[]> => {
    let endpoint = '/product/products/';
    
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category.toString());
    if (filters?.quality) params.append('quality', filters.quality);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    return apiRequest<ApiProduct[]>(endpoint);
  },

  // Create new product
  create: (data: CreateProductData): Promise<ApiProduct> => {
    return apiRequest<ApiProduct>('/product/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update product
  update: (id: number, data: UpdateProductData): Promise<ApiProduct> => {
    return apiRequest<ApiProduct>(`/product/products/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete product
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/product/products/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Acceptance (Product Receiving) API
export const acceptanceApi = {
  // Create new acceptance
  create: (data: CreateAcceptanceData): Promise<ApiAcceptance> => {
    return apiRequest<ApiAcceptance>('/acceptance/acceptances/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get acceptance history
  getHistory: (): Promise<ApiAcceptanceHistory[]> => {
    return apiRequest<ApiAcceptanceHistory[]>('/acceptance/history/');
  },
};

// Notifications API - NEW
export const notificationsApi = {
  // Get low stock notifications
  getLowStock: (): Promise<{
    low_stock_products: number;
    products: Array<{
      id: number;
      name: string;
      count: number;
    }>;
  }> => {
    return apiRequest('/utils/notifications/low-stock/');
  },
};

// Basket API
export const basketApi = {
  // Get basket items
  getBasket: (): Promise<{
    id: number;
    items: Array<{
      id: number;
      product: Array<{
        id: number;
        name: string;
        color: string;
        quality: string;
        width: string;
        height: string;
        thick: string;
        arrival_price: string;
        sale_price: string;
        count: number;
        arrival_date: string;
        description: string;
        is_active: boolean;
        category: number;
      }>;
    }>;
  }> => {
    return apiRequest('/order/basket/');
  },

  // Add item to basket
  addToBasket: (productId: number): Promise<any> => {
    return apiRequest('/order/basket/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  },

  // Remove specific item from basket
  removeFromBasket: (itemId: number): Promise<void> => {
    return apiRequest(`/order/basket/${itemId}/`, {
      method: 'DELETE',
    });
  },

  // Clear entire basket - change to POST with clear_all flag or remove all items individually
  clearBasket: async (): Promise<void> => {
    try {
      // First, get current basket to get all item IDs
      const basket = await basketApi.getBasket();
      
      if (basket && basket.items && basket.items.length > 0) {
        // Remove each item individually
        const removePromises = basket.items.map(item => 
          basketApi.removeFromBasket(item.id)
        );
        await Promise.all(removePromises);
      }
    } catch (error) {
      console.error('Failed to clear basket:', error);
      throw error;
    }
  },
};

// Cutting Service API
export const cuttingApi = {
  // Get all cutting services
  getAll: (): Promise<ApiCutting[]> => {
    return apiRequest('/order/cutting/');
  },

  // Create cutting service
  create: (data: CreateCuttingData): Promise<ApiCutting> => {
    return apiRequest('/order/cutting/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete cutting service
  delete: (id: number): Promise<void> => {
    return apiRequest(`/order/cutting/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Thickness API (for edge banding)
export const thicknessApi = {
  // Get all thicknesses
  getAll: (): Promise<ApiThickness[]> => {
    return apiRequest('/order/thickness/');
  },

  // Create thickness
  create: (data: CreateThicknessData): Promise<ApiThickness> => {
    return apiRequest('/order/thickness/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete thickness
  delete: (id: number): Promise<void> => {
    return apiRequest(`/order/thickness/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Edge Banding Service API
export const bandingApi = {
  // Get all banding services
  getAll: (): Promise<ApiBanding[]> => {
    return apiRequest('/order/banding/');
  },

  // Create banding service
  create: (data: CreateBandingData): Promise<ApiBanding> => {
    return apiRequest('/order/banding/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete banding service
  delete: (id: number): Promise<void> => {
    return apiRequest(`/order/banding/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Order API
export const orderApi = {
  // Create new order
  create: (data: CreateOrderData): Promise<ApiOrder> => {
    return apiRequest('/order/order/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all orders
  getAll: (): Promise<ApiOrder[]> => {
    return apiRequest('/order/order/');
  },

  // Get single order
  getById: (id: number): Promise<ApiOrder> => {
    return apiRequest(`/order/order/${id}/`);
  },
};