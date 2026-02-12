import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  authApi, 
  customerApi, 
  userApi, 
  productApi, 
  categoryApi 
} from '../lib/api';
import { 
  User, 
  UserRole, 
  Product, 
  Customer, 
  CartItem, 
  Sale, 
  ProductArrival, 
  CustomerTransaction, 
  ApiCustomer, 
  CreateCustomerData,
  ApiUser,
  CreateUserData,
  ApiProduct,
  CreateProductData,
  ProductFilters,
  ApiCategory
} from '../lib/types';
import { toast } from 'sonner';

interface AppContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  language: 'uz' | 'ru';
  theme: 'light' | 'dark';
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  sales: Sale[];
  productArrivals: ProductArrival[];
  customerTransactions: CustomerTransaction[];
  categories: ApiCategory[];
  
  // Auth functions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setLanguage: (language: 'uz' | 'ru') => void;
  toggleTheme: () => void;
  
  // Cart functions
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addSale: (sale: Sale) => void;
  
  // User API functions
  fetchUsers: () => Promise<void>;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Product API functions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Category API functions
  fetchCategories: (search?: string) => Promise<void>;
  
  // Product Arrival functions
  addProductArrival: (arrival: Omit<ProductArrival, 'id' | 'createdAt'>) => void;
  updateProductArrival: (id: string, arrival: Partial<ProductArrival>) => void;
  deleteProductArrival: (id: string) => void;
  
  // Customer Transaction functions
  addCustomerTransaction: (transaction: Omit<CustomerTransaction, 'id' | 'createdAt'>) => void;
  updateCustomerTransaction: (id: string, transaction: Partial<CustomerTransaction>) => void;
  deleteCustomerTransaction: (id: string) => void;
  getCustomerBalance: (customerId: string) => {
    totalPurchases: number;
    totalPayments: number;
    balance: number;
  };
  
  // Customer API functions
  fetchCustomers: (search?: string) => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Loading states
  isFetchingCustomers: boolean;
  isAddingCustomer: boolean;
  isUpdatingCustomer: boolean;
  isDeletingCustomer: boolean;
  isFetchingUsers: boolean;
  isAddingUser: boolean;
  isUpdatingUser: boolean;
  isDeletingUser: boolean;
  isFetchingProducts: boolean;
  isAddingProduct: boolean;
  isUpdatingProduct: boolean;
  isDeletingProduct: boolean;
  isFetchingCategories: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Separate loading states for customer operations
  const [isFetchingCustomers, setIsFetchingCustomers] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  
  // Separate loading states for user operations
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  
  // Separate loading states for product operations
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  
  // Separate loading states for category operations
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  
  const [language, setLanguage] = useState<'uz' | 'ru'>(() => {
    return (localStorage.getItem('language') as 'uz' | 'ru') || 'uz';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [productArrivals, setProductArrivals] = useState<ProductArrival[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([]);

  // ============== Mapping Functions ==============

  // Map API user to app User type
  const mapApiUserToUser = (apiUser: ApiUser): User => {
    const mapApiRole = (role: string): UserRole => {
      switch (role?.toLowerCase()) {
        case 's':
          return 'salesperson';
        case 'a':
          return 'admin';
        case 'm':
          return 'manager';
        default:
          console.warn('Unknown role:', role, 'defaulting to salesperson');
          return 'salesperson';
      }
    };

    return {
      id: apiUser.id.toString(),
      username: apiUser.username || '',
      password: '',
      role: mapApiRole(apiUser.role),
      full_name: apiUser.full_name || apiUser.username || '',
      phone_number: apiUser.phone_number || '',
      createdAt: new Date().toISOString(),
    };
  };

  // Map app User to API user data
  const mapUserToApiData = (userData: Omit<User, 'id' | 'createdAt'>): CreateUserData => {
    const mapAppRole = (role: UserRole): 's' | 'a' | 'm' => {
      switch (role) {
        case 'salesperson':
          return 's';
        case 'admin':
          return 'a';
        case 'manager':
          return 'm';
        default:
          return 's';
      }
    };

    return {
      full_name: userData.full_name,
      username: userData.username,
      phone_number: userData.phone_number || '',
      password: userData.password || '',
      role: mapAppRole(userData.role),
    };
  };

  // Map API customer to app Customer type
  const mapApiCustomerToCustomer = (apiCustomer: ApiCustomer): Customer => {
    return {
      id: apiCustomer.id.toString(),
      name: apiCustomer.full_name,
      phone: apiCustomer.phone_number,
      address: apiCustomer.location,
      email: apiCustomer.about,
      notes: apiCustomer.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Map app Customer to API customer data
  const mapCustomerToApiData = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): CreateCustomerData => {
    return {
      full_name: customerData.name,
      phone_number: customerData.phone,
      location: customerData.address || '',
      about: customerData.email || '',
      description: customerData.notes || '',
    };
  };

  // Map API product to app Product type
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    const parseNumber = (value: string): number => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    const category = categories.find(c => c.id === apiProduct.category);
    const categoryName = category?.name || 'OTHER';

    return {
      id: apiProduct.id.toString(),
      name: apiProduct.name || '',
      category: categoryName,
      color: apiProduct.color || '#CCCCCC',
      width: parseNumber(apiProduct.width),
      height: parseNumber(apiProduct.height),
      thickness: parseNumber(apiProduct.thick),
      quality: apiProduct.quality || 'standard',
      purchasePrice: parseNumber(apiProduct.arrival_price),
      unitPrice: parseNumber(apiProduct.sale_price),
      stockQuantity: apiProduct.count || 0,
      enabled: true,
      arrival_date: apiProduct.arrival_date,
      description: apiProduct.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Map app Product to API product data
  const mapProductToApiData = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): CreateProductData => {
    const category = categories.find(c => c.name === productData.category);
    const categoryId = category?.id || 5;

    const mapQuality = (quality: string): 'standard' | 'economic' | 'premium' => {
      switch (quality?.toLowerCase()) {
        case 'premium':
        case 'премиум':
          return 'premium';
        case 'economic':
        case 'экономик':
        case 'эконом':
          return 'economic';
        case 'standard':
        case 'стандарт':
        default:
          return 'standard';
      }
    };

    return {
      name: productData.name,
      color: productData.color || '#CCCCCC',
      quality: mapQuality(productData.quality),
      width: productData.width?.toString() || '0',
      height: productData.height?.toString() || '0',
      thick: productData.thickness?.toString() || '0',
      arrival_date: productData.arrival_date || new Date().toISOString().split('T')[0],
      description: productData.description || '',
      category: categoryId,
    };
  };

  // Map current user from /user/me/
  const mapCurrentUser = (apiUser: any): User => {
    const mapApiRole = (role: string): UserRole => {
      switch (role?.toLowerCase()) {
        case 's':
          return 'salesperson';
        case 'a':
          return 'admin';
        case 'm':
          return 'manager';
        default:
          return 'salesperson';
      }
    };

    return {
      id: apiUser.id?.toString() || Date.now().toString(),
      username: apiUser.username || '',
      password: '',
      role: mapApiRole(apiUser.role),
      full_name: apiUser.full_name || apiUser.username || '',
      phone_number: apiUser.phone_number || '',
      createdAt: new Date().toISOString(),
    };
  };

  // ============== Category API Functions ==============

  const fetchCategories = async (search?: string) => {
    if (!user) return;
    
    setIsFetchingCategories(true);
    try {
      const apiCategories = await categoryApi.getAll(search);
      setCategories(apiCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error(language === 'uz' 
        ? 'Kategoriyalarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке категорий');
    } finally {
      setIsFetchingCategories(false);
    }
  };

  // ============== Product API Functions ==============

  const fetchProducts = async (filters?: ProductFilters) => {
    if (!user) return;
    
    setIsFetchingProducts(true);
    try {
      const apiProducts = await productApi.getAll(filters);
      const mappedProducts = apiProducts.map(mapApiProductToProduct);
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulotlarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке продуктов');
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    setIsAddingProduct(true);
    try {
      const apiData = mapProductToApiData(productData);
      const newApiProduct = await productApi.create(apiData);
      const newProduct = mapApiProductToProduct(newApiProduct);
      
      setProducts(prev => [...prev, newProduct]);
      toast.success(language === 'uz' ? 'Mahsulot qo\'shildi' : 'Продукт добавлен');
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulot qo\'shishda xatolik yuz berdi' 
        : 'Ошибка при добавлении продукта');
      throw error;
    } finally {
      setIsAddingProduct(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    setIsUpdatingProduct(true);
    try {
      const apiData: Partial<CreateProductData> = {};
      if (productData.name) apiData.name = productData.name;
      if (productData.color) apiData.color = productData.color;
      if (productData.quality) {
        switch (productData.quality?.toLowerCase()) {
          case 'premium':
            apiData.quality = 'premium';
            break;
          case 'economic':
            apiData.quality = 'economic';
            break;
          default:
            apiData.quality = 'standard';
        }
      }
      if (productData.width) apiData.width = productData.width.toString();
      if (productData.height) apiData.height = productData.height.toString();
      if (productData.thickness) apiData.thick = productData.thickness.toString();
      if (productData.arrival_date) apiData.arrival_date = productData.arrival_date;
      if (productData.description) apiData.description = productData.description;
      if (productData.category) {
        const category = categories.find(c => c.name === productData.category);
        apiData.category = category?.id || 5;
      }

      const updatedApiProduct = await productApi.update(parseInt(id), apiData);
      const updatedProduct = mapApiProductToProduct(updatedApiProduct);
      
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success(language === 'uz' ? 'Mahsulot yangilandi' : 'Продукт обновлен');
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulot yangilashda xatolik yuz berdi' 
        : 'Ошибка при обновлении продукта');
      throw error;
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    setIsDeletingProduct(true);
    try {
      await productApi.delete(parseInt(id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success(language === 'uz' ? 'Mahsulot o\'chirildi' : 'Продукт удален');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulot o\'chirishda xatolik yuz berdi' 
        : 'Ошибка при удалении продукта');
      throw error;
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // ============== Customer API Functions ==============

  const fetchCustomers = async (search?: string) => {
    if (!user) return;
    
    setIsFetchingCustomers(true);
    try {
      const apiCustomers = await customerApi.getAll(search);
      const mappedCustomers = apiCustomers.map(mapApiCustomerToCustomer);
      setCustomers(mappedCustomers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error(language === 'uz' 
        ? 'Mijozlarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке клиентов');
    } finally {
      setIsFetchingCustomers(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    setIsAddingCustomer(true);
    try {
      const apiData = mapCustomerToApiData(customerData);
      const newApiCustomer = await customerApi.create(apiData);
      const newCustomer = mapApiCustomerToCustomer(newApiCustomer);
      
      setCustomers(prev => [...prev, newCustomer]);
      toast.success(language === 'uz' ? 'Mijoz qo\'shildi' : 'Клиент добавлен');
    } catch (error) {
      console.error('Failed to add customer:', error);
      toast.error(language === 'uz' 
        ? 'Mijoz qo\'shishda xatolik yuz berdi' 
        : 'Ошибка при добавлении клиента');
      throw error;
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    setIsUpdatingCustomer(true);
    try {
      const apiData: Partial<CreateCustomerData> = {};
      if (customerData.name) apiData.full_name = customerData.name;
      if (customerData.phone) apiData.phone_number = customerData.phone;
      if (customerData.address) apiData.location = customerData.address;
      if (customerData.email) apiData.about = customerData.email;
      if (customerData.notes) apiData.description = customerData.notes;

      const updatedApiCustomer = await customerApi.update(parseInt(id), apiData);
      const updatedCustomer = mapApiCustomerToCustomer(updatedApiCustomer);
      
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      toast.success(language === 'uz' ? 'Mijoz yangilandi' : 'Клиент обновлен');
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast.error(language === 'uz' 
        ? 'Mijoz yangilashda xatolik yuz berdi' 
        : 'Ошибка при обновлении клиента');
      throw error;
    } finally {
      setIsUpdatingCustomer(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    setIsDeletingCustomer(true);
    try {
      await customerApi.delete(parseInt(id));
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success(language === 'uz' ? 'Mijoz o\'chirildi' : 'Клиент удален');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error(language === 'uz' 
        ? 'Mijoz o\'chirishda xatolik yuz berdi' 
        : 'Ошибка при удалении клиента');
      throw error;
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  // ============== User API Functions ==============

  const fetchUsers = async () => {
    if (!user) return;
    
    setIsFetchingUsers(true);
    try {
      const apiUsers = await userApi.getAll();
      const mappedUsers = apiUsers.map(mapApiUserToUser);
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(language === 'uz' 
        ? 'Foydalanuvchilarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке пользователей');
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    setIsAddingUser(true);
    try {
      const apiData = mapUserToApiData(userData);
      const newApiUser = await userApi.create(apiData);
      const newUser = mapApiUserToUser(newApiUser);
      
      setUsers(prev => [...prev, newUser]);
      toast.success(language === 'uz' ? 'Foydalanuvchi qo\'shildi' : 'Пользователь добавлен');
    } catch (error) {
      console.error('Failed to add user:', error);
      toast.error(language === 'uz' 
        ? 'Foydalanuvchi qo\'shishda xatolik yuz berdi' 
        : 'Ошибка при добавлении пользователя');
      throw error;
    } finally {
      setIsAddingUser(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    setIsUpdatingUser(true);
    try {
      const apiData: Partial<CreateUserData> = {};
      if (userData.full_name) apiData.full_name = userData.full_name;
      if (userData.username) apiData.username = userData.username;
      if (userData.phone_number) apiData.phone_number = userData.phone_number;
      if (userData.password) apiData.password = userData.password;
      if (userData.role) {
        switch (userData.role) {
          case 'salesperson':
            apiData.role = 's';
            break;
          case 'admin':
            apiData.role = 'a';
            break;
          case 'manager':
            apiData.role = 'm';
            break;
        }
      }

      const updatedApiUser = await userApi.update(parseInt(id), apiData);
      const updatedUser = mapApiUserToUser(updatedApiUser);
      
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
      if (user.id === id) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      toast.success(language === 'uz' ? 'Foydalanuvchi yangilandi' : 'Пользователь обновлен');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(language === 'uz' 
        ? 'Foydalanuvchi yangilashda xatolik yuz berdi' 
        : 'Ошибка при обновлении пользователя');
      throw error;
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    if (user.id === id) {
      toast.error(language === 'uz' 
        ? 'O\'zingizni o\'chira olmaysiz' 
        : 'Вы не можете удалить себя');
      return;
    }

    setIsDeletingUser(true);
    try {
      await userApi.delete(parseInt(id));
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success(language === 'uz' ? 'Foydalanuvchi o\'chirildi' : 'Пользователь удален');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(language === 'uz' 
        ? 'Foydalanuvchi o\'chirishda xatolik yuz berdi' 
        : 'Ошибка при удалении пользователя');
      throw error;
    } finally {
      setIsDeletingUser(false);
    }
  };

  // ============== Cart Functions ==============

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.product.id === item.product.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.product.id === item.product.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        return [...prevCart, item];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateCartItem = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addSale = (sale: Sale) => {
    setSales(prevSales => [sale, ...prevSales]);
    
    setProducts(prevProducts =>
      prevProducts.map(product => {
        const saleItem = sale.items.find(item => item.product.id === product.id);
        if (saleItem) {
          return {
            ...product,
            stockQuantity: product.stockQuantity - saleItem.quantity,
          };
        }
        return product;
      })
    );
  };

  // ============== Product Arrival Functions ==============

  const addProductArrival = (arrival: Omit<ProductArrival, 'id' | 'createdAt'>) => {
    const newArrival: ProductArrival = {
      ...arrival,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setProductArrivals(prev => [newArrival, ...prev]);
    
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === arrival.productId
          ? { ...product, stockQuantity: product.stockQuantity + arrival.quantity }
          : product
      )
    );
    
    toast.success(language === 'uz' 
      ? 'Mahsulot qabul qilindi' 
      : 'Товар принят');
  };

  const updateProductArrival = (id: string, arrivalData: Partial<ProductArrival>) => {
    setProductArrivals(prev =>
      prev.map(arrival =>
        arrival.id === id ? { ...arrival, ...arrivalData } : arrival
      )
    );
  };

  const deleteProductArrival = (id: string) => {
    setProductArrivals(prev => prev.filter(arrival => arrival.id !== id));
  };

  // ============== Customer Transaction Functions ==============

  const addCustomerTransaction = (transaction: Omit<CustomerTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: CustomerTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setCustomerTransactions(prev => [newTransaction, ...prev]);
    
    toast.success(language === 'uz' 
      ? 'Tranzaksiya qo\'shildi' 
      : 'Транзакция добавлена');
  };

  const updateCustomerTransaction = (id: string, transactionData: Partial<CustomerTransaction>) => {
    setCustomerTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id ? { ...transaction, ...transactionData } : transaction
      )
    );
  };

  const deleteCustomerTransaction = (id: string) => {
    setCustomerTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const getCustomerBalance = (customerId: string) => {
    const transactions = customerTransactions.filter(t => t.customerId === customerId);
    
    const totalPurchases = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPayments = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalPurchases - totalPayments;
    
    return {
      totalPurchases,
      totalPayments,
      balance,
    };
  };

  // ============== Auth Functions ==============

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Starting login for:', username);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      const loginResponse = await authApi.login({ username, password });
      console.log('Login response:', loginResponse);
      
      const { access } = loginResponse;
      
      if (!access) {
        console.error('No access token in loginResponse');
        throw new Error('No access token received');
      }
      
      console.log('Access token received:', access.substring(0, 50) + '...');
      
      localStorage.setItem('accessToken', access);
      console.log('Token saved to localStorage');
      
      const userData = await authApi.getCurrentUser();
      console.log('User data from /user/me/:', userData);
      
      const mappedUser = mapCurrentUser(userData);
      console.log('Mapped user:', mappedUser);
      
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      
      console.log('Login successful!');
      return true;
      
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error message:', error.message);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('1. Starting logout, refreshToken:', refreshToken ? 'present' : 'missing');
      
      if (refreshToken) {
        console.log('2. Calling authApi.logout() with token');
        await authApi.logout(refreshToken);
        console.log('4. authApi.logout() completed');
      } else {
        console.log('2. No refresh token, skipping API call');
      }
    } catch (error) {
      console.error('3. API logout error:', error);
    } finally {
      console.log('5. Clearing localStorage');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setUser(null);
      setUsers([]);
      setCustomers([]);
      setProducts([]);
      setCategories([]);
      
      console.log('6. Redirecting to login');
      window.location.href = '/login';
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ============== Effects ==============

  // Fetch initial data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  // Fetch products after categories are loaded
  useEffect(() => {
    if (user && categories.length > 0) {
      fetchProducts();
      fetchCustomers();
      fetchUsers();
    }
  }, [user, categories]);

  // Set theme class on body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const value: AppContextType = {
    // State
    user,
    users,
    isAuthenticated: !!user,
    isLoading,
    language,
    theme,
    products,
    customers,
    cart,
    sales,
    productArrivals,
    customerTransactions,
    categories,
    
    // Loading states
    isFetchingCustomers,
    isAddingCustomer,
    isUpdatingCustomer,
    isDeletingCustomer,
    isFetchingUsers,
    isAddingUser,
    isUpdatingUser,
    isDeletingUser,
    isFetchingProducts,
    isAddingProduct,
    isUpdatingProduct,
    isDeletingProduct,
    isFetchingCategories,
    
    // Auth functions
    login,
    logout,
    setLanguage,
    toggleTheme,
    
    // Cart functions
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    addSale,
    
    // User API functions
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    
    // Product API functions
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Category API functions
    fetchCategories,
    
    // Product Arrival functions
    addProductArrival,
    updateProductArrival,
    deleteProductArrival,
    
    // Customer Transaction functions
    addCustomerTransaction,
    updateCustomerTransaction,
    deleteCustomerTransaction,
    getCustomerBalance,
    
    // Customer API functions
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};