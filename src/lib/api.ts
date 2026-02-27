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
  ApiAcceptance,
  ApiAcceptanceHistory,
  CreateCuttingData,
  ApiCutting,
  CreateBandingData,
  ApiBanding,
  CreateThicknessData,
  ApiThickness,
  ApiOrder,
  CreateOrderData,
  ApiSupplier,
  CreateSupplierData,
  SupplierPaymentData,
  SupplierTransaction,
  CoverDebtRequest,
  PaymentHistoryResponse
} from "./types";

// api.ts
const API_BASE_URL = 'https://plywood.pythonanywhere.com';

// api.ts - Update the apiRequest function with token expiration handling

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Get token from localStorage
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - Token expired or invalid
    if (response.status === 401) {
      console.error('Token expired or invalid - logging out');
      
      // Clear auth data from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Show toast notification
      const toastMessage = window.navigator.language.includes('uz') 
        ? 'Sessiya muddati tugadi. Iltimos, qaytadan kiring.'
        : 'Сессия истекла. Пожалуйста, войдите снова.';
      
      // You can use toast here if you want
      // toast.error(toastMessage);
      
      // Redirect to login page
      window.location.href = '/login';
      
      throw new Error('Token expired');
    }

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
  } catch (error) {
    // Handle network errors or other fetch errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error - unable to connect to API');
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
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

// Customer API - Updated with stats and debt endpoints
export const customerApi = {
  // Get all customers with optional search
  getAll: (search?: string): Promise<ApiCustomer[]> => {
    const endpoint = search 
      ? `/customer/customer/?search=${encodeURIComponent(search)}`
      : '/customer/customer/';
    return apiRequest<ApiCustomer[]>(endpoint);
  },

  // Get single customer by ID
  getById: (id: number): Promise<ApiCustomer> => {
    return apiRequest<ApiCustomer>(`/customer/customer/${id}/`);
  },
coverDebt: (id: number, data: CoverDebtRequest): Promise<any> => {
    return apiRequest<any>(`/customer/cover-debt/${id}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get customer payment history
  getPaymentHistory: (id: number): Promise<PaymentHistoryResponse> => {
    return apiRequest<PaymentHistoryResponse>(`/customer/payment-history/${id}/`);
  },
  // Get customer statistics
  getStats: (): Promise<{
    total_customers: number;
    debtor_customers: number;
    total_debt: number;
  }> => {
    return apiRequest('/customer/stats/customers/');
  },

  // Get debt statistics for financial page
  getDebtStats: (): Promise<{
    total_debt: number;
    debtor_customers: number;
    nasiya_sales: number;
  }> => {
    return apiRequest('/customer/stats/debt/');
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

// In api.ts - acceptanceApi
export const acceptanceApi = {
  // Create new acceptance
  create: (data: any): Promise<ApiAcceptance> => {
    console.log('Acceptance API called with data:', data);
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

// Notifications API
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

// Dashboard Stats API
export const dashboardApi = {
  // Get dashboard statistics
  getStats: (): Promise<{
    today_income: number;
    total_income: number;
    total_products: number;
    total_sales: number;
    total_discount: number;
  }> => {
    return apiRequest('/utils/dashboard/stats/');
  },
};

// Order Stats API - For Sold Products page
export const orderStatsApi = {
  // Get order statistics
  getStats: (): Promise<{
    total_sales: number;
    today_income: number;
    total_income: number;
  }> => {
    return apiRequest('/order/stats/order/');
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
  getAll: (): Promise<ApiCutting[]> => {
    return apiRequest('/order/cutting/');
  },

  create: (data: CreateCuttingData): Promise<ApiCutting> => {
    return apiRequest('/order/cutting/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number, data: Partial<CreateCuttingData>): Promise<ApiCutting> => {
    return apiRequest(`/order/cutting/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: number): Promise<void> => {
    return apiRequest(`/order/cutting/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Thickness API
export const thicknessApi = {
  getAll: (): Promise<ApiThickness[]> => {
    return apiRequest('/order/thickness/');
  },

  create: (data: CreateThicknessData): Promise<ApiThickness> => {
    return apiRequest('/order/thickness/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number, data: Partial<CreateThicknessData>): Promise<ApiThickness> => {
    return apiRequest(`/order/thickness/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: number): Promise<void> => {
    return apiRequest(`/order/thickness/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Banding Service API
export const bandingApi = {
  getAll: (): Promise<ApiBanding[]> => {
    return apiRequest('/order/banding/');
  },

  create: (data: CreateBandingData): Promise<ApiBanding> => {
    return apiRequest('/order/banding/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number, data: Partial<CreateBandingData>): Promise<ApiBanding> => {
    return apiRequest(`/order/banding/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

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

  // Get single order by ID
  getById: (id: number): Promise<ApiOrder> => {
    return apiRequest(`/order/order/${id}/`);
  },

  // Update order
  update: (id: number, data: Partial<CreateOrderData>): Promise<ApiOrder> => {
    return apiRequest(`/order/order/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete order
  delete: (id: number): Promise<void> => {
    return apiRequest(`/order/order/${id}/`, {
      method: 'DELETE',
    });
  },
};

// api.ts ga qo'shamiz

// Quality API
export const qualityApi = {
  // Get all qualities
  getAll: (): Promise<Array<{ id: number; name: string }>> => {
    return apiRequest('/product/quality/');
  },

  // Get quality by ID
  getById: (id: number): Promise<{ id: number; name: string }> => {
    return apiRequest(`/product/quality/${id}/`);
  },

  // Create new quality
  create: (data: { name: string }): Promise<{ id: number; name: string }> => {
    return apiRequest('/product/quality/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update quality
  update: (id: number, data: { name: string }): Promise<{ id: number; name: string }> => {
    return apiRequest(`/product/quality/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete quality
  delete: (id: number): Promise<void> => {
    return apiRequest(`/product/quality/${id}/`, {
      method: 'DELETE',
    });
  },
};


// Supplier API
export const supplierApi = {
  // Get all suppliers with optional search
  getAll: (search?: string): Promise<ApiSupplier[]> => {
    const endpoint = search 
      ? `/supplier/supplier/?search=${encodeURIComponent(search)}`
      : '/supplier/supplier/';
    return apiRequest<ApiSupplier[]>(endpoint);
  },

  // Get single supplier by ID
  getById: (id: number): Promise<ApiSupplier> => {
    return apiRequest<ApiSupplier>(`/supplier/supplier/${id}/`);
  },

  // Create new supplier
  create: (data: CreateSupplierData): Promise<ApiSupplier> => {
    return apiRequest<ApiSupplier>('/supplier/supplier/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update supplier
  update: (id: number, data: Partial<CreateSupplierData>): Promise<ApiSupplier> => {
    return apiRequest<ApiSupplier>(`/supplier/supplier/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete supplier
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/supplier/supplier/${id}/`, {
      method: 'DELETE',
    });
  },

  // Add supplier payment
  addPayment: (data: SupplierPaymentData): Promise<any> => {
    return apiRequest('/supplier/payment/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get supplier transactions
  getTransactions: (supplierId: number): Promise<SupplierTransaction[]> => {
    return apiRequest<SupplierTransaction[]>(`/supplier/${supplierId}/transactions/`);
  },
};