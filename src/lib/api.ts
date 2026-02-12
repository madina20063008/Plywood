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
  UpdateProductData
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

// Customer API
export const customerApi = {
  // Get all customers with optional search
  getAll: (search?: string): Promise<ApiCustomer[]> => {
    const endpoint = search 
      ? `/customer/customer/?search=${encodeURIComponent(search)}`
      : '/customer/customer/';
    return apiRequest<ApiCustomer[]>(endpoint);
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