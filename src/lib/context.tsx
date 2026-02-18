import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { 
  authApi, 
  customerApi, 
  userApi, 
  productApi, 
  categoryApi,
  acceptanceApi,
  basketApi,
  cuttingApi,
  bandingApi,
  thicknessApi,
  orderApi,
  notificationsApi,
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
  ApiCategory,
  ApiAcceptanceHistory,
  CreateAcceptanceData,
  ApiBasket,
  CuttingService,
  EdgeBandingService,
  ApiCutting,
  CreateCuttingData,
  ApiBanding,
  CreateBandingData,
  ApiThickness,
  CreateThicknessData,
  ApiOrder,
  CreateOrderData,
  LowStockNotification,
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
  acceptanceHistory: ApiAcceptanceHistory[];
  thicknesses: ApiThickness[];
  orders: ApiOrder[];
  
  // Customer stats
  customerStats: {
    total_customers: number;
    debtor_customers: number;
    total_debt: number;
  };
  isFetchingCustomerStats: boolean;
  fetchCustomerStats: () => Promise<void>;
  
  // Notifications
  lowStockNotifications: LowStockNotification | null;
  isFetchingNotifications: boolean;
  fetchLowStockNotifications: () => Promise<void>;
  
  // Auth functions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setLanguage: (language: 'uz' | 'ru') => void;
  toggleTheme: () => void;
  
  // Cart functions
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchBasket: () => Promise<void>;
  
  // Service functions
  addCuttingService: (itemId: string, cuttingService: CuttingService) => Promise<void>;
  addEdgeBandingService: (itemId: string, edgeBandingService: EdgeBandingService) => Promise<void>;
  
  // Thickness API functions
  fetchThicknesses: () => Promise<void>;
  addThickness: (data: CreateThicknessData) => Promise<void>;
  deleteThickness: (id: number) => Promise<void>;
  
  // Order API functions
  createOrder: (orderData: CreateOrderData) => Promise<ApiOrder>;
  fetchOrders: () => Promise<void>;
  
  // User API functions
  fetchUsers: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // User stats
  userStats: {
    total_users: number;
    total_salers: number;
    total_admins: number;
  };
  isFetchingUserStats: boolean;
  
  // Product API functions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Category API functions
  fetchCategories: (search?: string) => Promise<void>;
  
  // Acceptance API functions
  fetchAcceptanceHistory: () => Promise<void>;
  addProductArrival: (arrival: Omit<ProductArrival, 'id' | 'createdAt' | 'apiId' | 'acceptanceId'>) => Promise<void>;
  
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
  isFetchingAcceptanceHistory: boolean;
  isFetchingBasket: boolean;
  isFetchingThicknesses: boolean;
  isCreatingOrder: boolean;
  isFetchingOrders: boolean;
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
  const [isFetchingUserStats, setIsFetchingUserStats] = useState(false);
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
  
  // Separate loading state for acceptance history
  const [isFetchingAcceptanceHistory, setIsFetchingAcceptanceHistory] = useState(false);
  
  // Separate loading state for basket
  const [isFetchingBasket, setIsFetchingBasket] = useState(false);
  
  // Separate loading state for thicknesses
  const [isFetchingThicknesses, setIsFetchingThicknesses] = useState(false);
  
  // Separate loading states for orders
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  
  // Customer stats state
  const [customerStats, setCustomerStats] = useState({
    total_customers: 0,
    debtor_customers: 0,
    total_debt: 0
  });
  const [isFetchingCustomerStats, setIsFetchingCustomerStats] = useState(false);
  
  // Notifications state
  const [lowStockNotifications, setLowStockNotifications] = useState<LowStockNotification | null>(null);
  const [isFetchingNotifications, setIsFetchingNotifications] = useState(false);
  
  const [language, setLanguage] = useState<'uz' | 'ru'>(() => {
    return (localStorage.getItem('language') as 'uz' | 'ru') || 'uz';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState({
    total_users: 0,
    total_salers: 0,
    total_admins: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [productArrivals, setProductArrivals] = useState<ProductArrival[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([]);
  const [acceptanceHistory, setAcceptanceHistory] = useState<ApiAcceptanceHistory[]>([]);
  const [thicknesses, setThicknesses] = useState<ApiThickness[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);

  // Refs to track if data has been fetched
  const hasFetchedCategories = useRef(false);
  const hasFetchedProducts = useRef(false);
  const hasFetchedCustomers = useRef(false);
  const hasFetchedUsers = useRef(false);
  const hasFetchedUserStats = useRef(false);
  const hasFetchedAcceptanceHistory = useRef(false);
  const hasFetchedBasket = useRef(false);
  const hasFetchedThicknesses = useRef(false);
  const hasFetchedOrders = useRef(false);
  const hasFetchedCustomerStats = useRef(false);
  const hasFetchedNotifications = useRef(false);

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
      id: apiUser.id?.toString() || Date.now().toString(),
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

  // Map API customer to app Customer type - UPDATED with proper null checks
  const mapApiCustomerToCustomer = (apiCustomer: ApiCustomer): Customer => {
    // Safely access all properties with fallbacks
    return {
      id: apiCustomer.id?.toString() || Date.now().toString(),
      name: apiCustomer.full_name || '',
      phone: apiCustomer.phone_number || '',
      address: apiCustomer.location || '',
      email: apiCustomer.about || '',
      notes: apiCustomer.description || '',
      debt: apiCustomer.debt ? parseFloat(apiCustomer.debt) : 0, // Parse debt from API
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Map app Customer to API customer data
  const mapCustomerToApiData = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): CreateCustomerData => {
    return {
      full_name: customerData.name || '',
      phone_number: customerData.phone || '',
      location: customerData.address || '',
      about: customerData.email || '',
      description: customerData.notes || '',
      // Note: debt is not sent during creation/update as it's calculated from transactions
    };
  };

  // Map API product to app Product type
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    const parseNumber = (value: string): number => {
      if (!value) return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    const category = categories.find(c => c.id === apiProduct.category);
    const categoryName = category?.name || 'OTHER';

    return {
      id: apiProduct.id,
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
      enabled: apiProduct.is_active,
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
      name: productData.name || '',
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

  // Map API basket item to CartItem
  const mapApiBasketToCart = (apiBasket: any): CartItem[] => {
    if (!apiBasket || !apiBasket.items || !Array.isArray(apiBasket.items)) {
      return [];
    }
    
    return apiBasket.items.map((item: any) => {
      // Safely access product data
      if (!item || !item.product || !Array.isArray(item.product) || item.product.length === 0) {
        return null;
      }
      
      const productData = item.product[0];
      if (!productData) {
        return null;
      }
      
      try {
        const product = mapApiProductToProduct(productData);
        
        return {
          id: item.id?.toString() || Date.now().toString(),
          product,
          quantity: 1, // Default to 1 since API doesn't store quantity
          basketItemId: item.id, // Store API ID for removal
        };
      } catch (error) {
        console.error('Error mapping product:', error, productData);
        return null;
      }
    }).filter(Boolean); // Remove any null items
  };

  // ============== Helper Functions ==============

  const getCategoryNameFromProductId = (productId: string): string => {
    const product = products.find(p => p.id.toString() === productId);
    return product?.category || 'OTHER';
  };

  // ============== Customer Stats Functions ==============

  const fetchCustomerStats = useCallback(async () => {
    if (!user) return;
    
    setIsFetchingCustomerStats(true);
    try {
      const stats = await customerApi.getStats();
      setCustomerStats(stats);
      hasFetchedCustomerStats.current = true;
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
      toast.error(language === 'uz' 
        ? 'Mijoz statistikasini yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке статистики клиентов');
    } finally {
      setIsFetchingCustomerStats(false);
    }
  }, [user, language]);

  // ============== Notifications Functions ==============

  const fetchLowStockNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsFetchingNotifications(true);
    try {
      const notifications = await notificationsApi.getLowStock();
      setLowStockNotifications(notifications);
      hasFetchedNotifications.current = true;
      
      // Show toast if there are low stock products
      if (notifications.low_stock_products > 0) {
        toast.warning(
          language === 'uz' 
            ? `${notifications.low_stock_products} ta mahsulot zaxirasi kam` 
            : `${notifications.low_stock_products} товаров с низким запасом`,
          {
            duration: 5000,
          }
        );
      }
    } catch (error) {
      console.error('Failed to fetch low stock notifications:', error);
    } finally {
      setIsFetchingNotifications(false);
    }
  }, [user, language]);

  // ============== Category API Functions ==============

  const fetchCategories = useCallback(async (search?: string) => {
    if (!user) return;
    
    setIsFetchingCategories(true);
    try {
      const apiCategories = await categoryApi.getAll(search);
      setCategories(apiCategories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error(language === 'uz' 
        ? 'Kategoriyalarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке категорий');
    } finally {
      setIsFetchingCategories(false);
    }
  }, [user, language]);

  // ============== Thickness API Functions ==============

  const fetchThicknesses = useCallback(async () => {
    if (!user) return;
    
    setIsFetchingThicknesses(true);
    try {
      const apiThicknesses = await thicknessApi.getAll();
      setThicknesses(apiThicknesses || []);
    } catch (error) {
      console.error('Failed to fetch thicknesses:', error);
      toast.error(language === 'uz' 
        ? 'Qalinliklarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке толщин');
    } finally {
      setIsFetchingThicknesses(false);
    }
  }, [user, language]);

  const addThickness = async (data: CreateThicknessData) => {
    if (!user) return;

    try {
      const newThickness = await thicknessApi.create(data);
      setThicknesses(prev => [...prev, newThickness]);
      toast.success(language === 'uz' 
        ? 'Qalinlik qo\'shildi' 
        : 'Толщина добавлена');
    } catch (error) {
      console.error('Failed to add thickness:', error);
      toast.error(language === 'uz' 
        ? 'Qalinlik qo\'shishda xatolik yuz berdi' 
        : 'Ошибка при добавлении толщины');
      throw error;
    }
  };

  const deleteThickness = async (id: number) => {
    if (!user) return;

    try {
      await thicknessApi.delete(id);
      setThicknesses(prev => prev.filter(t => t.id !== id));
      toast.success(language === 'uz' 
        ? 'Qalinlik o\'chirildi' 
        : 'Толщина удалена');
    } catch (error) {
      console.error('Failed to delete thickness:', error);
      toast.error(language === 'uz' 
        ? 'Qalinlik o\'chirishda xatolik yuz berdi' 
        : 'Ошибка при удалении толщины');
      throw error;
    }
  };

  // ============== Order API Functions ==============

  const createOrder = async (orderData: CreateOrderData): Promise<ApiOrder> => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      throw new Error('User not authenticated');
    }

    setIsCreatingOrder(true);
    try {
      const newOrder = await orderApi.create(orderData);
      setOrders(prev => [newOrder, ...prev]);
      
      // Clear cart after successful order
      await clearCart();
      
      toast.success(language === 'uz' 
        ? 'Buyurtma muvaffaqiyatli yaratildi' 
        : 'Заказ успешно создан');
      return newOrder;
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(language === 'uz' 
        ? `Buyurtma yaratishda xatolik: ${error.message}` 
        : `Ошибка при создании заказа: ${error.message}`);
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    setIsFetchingOrders(true);
    try {
      const apiOrders = await orderApi.getAll();
      setOrders(apiOrders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error(language === 'uz' 
        ? 'Buyurtmalarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке заказов');
    } finally {
      setIsFetchingOrders(false);
    }
  }, [user, language]);

  // ============== Product API Functions ==============

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    if (!user) return;
    
    setIsFetchingProducts(true);
    try {
      const apiProducts = await productApi.getAll(filters);
      const mappedProducts = (apiProducts || []).map(mapApiProductToProduct);
      setProducts(mappedProducts);
      hasFetchedProducts.current = true;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulotlarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке продуктов');
    } finally {
      setIsFetchingProducts(false);
    }
  }, [user, language, categories]);

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
      
      setProducts(prev => prev.map(p => p.id.toString() === id ? updatedProduct : p));
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
      setProducts(prev => prev.filter(p => p.id.toString() !== id));
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

  const fetchCustomers = useCallback(async (search?: string) => {
    if (!user) return;
    
    setIsFetchingCustomers(true);
    try {
      const apiCustomers = await customerApi.getAll(search);
      console.log('API Customers response:', apiCustomers); // Debug log
      
      // Ensure apiCustomers is an array before mapping
      const customersArray = Array.isArray(apiCustomers) ? apiCustomers : [];
      const mappedCustomers = customersArray.map(mapApiCustomerToCustomer);
      setCustomers(mappedCustomers);
      hasFetchedCustomers.current = true;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error(language === 'uz' 
        ? 'Mijozlarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке клиентов');
    } finally {
      setIsFetchingCustomers(false);
    }
  }, [user, language]);

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
      // Note: debt is not updated directly via API, it's calculated from transactions

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

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    
    setIsFetchingUsers(true);
    try {
      const apiUsers = await userApi.getAll();
      const mappedUsers = (apiUsers || []).map(mapApiUserToUser);
      setUsers(mappedUsers);
      hasFetchedUsers.current = true;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(language === 'uz' 
        ? 'Foydalanuvchilarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке пользователей');
    } finally {
      setIsFetchingUsers(false);
    }
  }, [user, language]);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    
    setIsFetchingUserStats(true);
    try {
      const stats = await userApi.getStats();
      setUserStats(stats);
      hasFetchedUserStats.current = true;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      toast.error(language === 'uz' 
        ? 'Foydalanuvchi statistikasini yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке статистики пользователей');
    } finally {
      setIsFetchingUserStats(false);
    }
  }, [user, language]);

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
      // Refresh stats after adding user
      await fetchUserStats();
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
      
      // Refresh stats after updating user
      await fetchUserStats();
      
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
      // Refresh stats after deleting user
      await fetchUserStats();
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

  // ============== Basket API Functions ==============

  const fetchBasket = useCallback(async () => {
    if (!user) return;
    
    setIsFetchingBasket(true);
    try {
      const apiBasket = await basketApi.getBasket();
      console.log('API Basket response:', apiBasket);
      
      if (apiBasket && apiBasket.items) {
        const mappedCart = mapApiBasketToCart(apiBasket);
        setCart(mappedCart);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('Failed to fetch basket:', error);
      toast.error(language === 'uz' 
        ? 'Savatchani yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке корзины');
      setCart([]);
    } finally {
      setIsFetchingBasket(false);
    }
  }, [user, language]);

  const addToCart = async (item: CartItem) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    try {
      const productId = item.product.id;
      await basketApi.addToBasket(productId);
      
      setCart(prevCart => {
        const existingItem = prevCart.find(cartItem => cartItem.product.id === item.product.id);
        
        if (existingItem) {
          return prevCart;
        } else {
          const newItem = {
            ...item,
            id: Date.now().toString(),
            basketItemId: Date.now(),
          };
          return [...prevCart, newItem];
        }
      });
      
      await fetchBasket();
    } catch (error) {
      console.error('Failed to add to basket:', error);
      toast.error(language === 'uz' 
        ? 'Savatchaga qo\'shishda xatolik yuz berdi' 
        : 'Ошибка при добавлении в корзину');
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      const item = cart.find(i => i.id === itemId);
      if (item?.basketItemId) {
        await basketApi.removeFromBasket(item.basketItemId);
      }
      
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
      
      toast.success(language === 'uz' 
        ? 'Mahsulot savatchadan o\'chirildi' 
        : 'Товар удален из корзины');
    } catch (error) {
      console.error('Failed to remove from basket:', error);
      toast.error(language === 'uz' 
        ? 'Savatchadan o\'chirishda xatolik yuz berdi' 
        : 'Ошибка при удалении из корзины');
      throw error;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Failed to update cart item:', error);
      toast.error(language === 'uz' 
        ? 'Savatchani yangilashda xatolik yuz berdi' 
        : 'Ошибка при обновлении корзины');
      throw error;
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!user) return;

    try {
      // Try to clear via API first
      await basketApi.clearBasket();
      
      // Clear local state regardless of API result
      setCart([]);
      
      toast.success(language === 'uz' 
        ? 'Savatcha tozalandi' 
        : 'Корзина очищена');
    } catch (error) {
      console.error('Failed to clear basket:', error);
      
      // Even if API fails, clear local cart
      setCart([]);
      
      toast.warning(language === 'uz' 
        ? 'Savatcha lokal tozalandi, lekin serverda xatolik yuz berdi' 
        : 'Корзина очищена локально, но произошла ошибка на сервере');
      
      // Don't throw error to prevent blocking the order completion
    }
  };

  // ============== Service Functions ==============

  const addCuttingService = async (itemId: string, cuttingService: CuttingService) => {
    if (!user) return;

    try {
      // Create cutting service in API
      const cuttingData: CreateCuttingData = {
        count: cuttingService.numberOfBoards,
        price: cuttingService.pricePerCut.toString(),
        total_price: cuttingService.total.toString(),
      };
      
      const apiCutting = await cuttingApi.create(cuttingData);
      
      // Update local cart item with cutting service
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId 
            ? { 
                ...item, 
                cuttingService: {
                  ...cuttingService,
                  id: apiCutting.id.toString(),
                  apiId: apiCutting.id,
                }
              } 
            : item
        )
      );
      
      toast.success(language === 'uz' 
        ? 'Kesish xizmati qo\'shildi' 
        : 'Услуга распила добавлена');
    } catch (error) {
      console.error('Failed to add cutting service:', error);
      toast.error(language === 'uz' 
        ? 'Kesish xizmati qo\'shishda xatolik yuz berdi' 
        : 'Ошибка при добавлении услуги распила');
      throw error;
    }
  };

  const addEdgeBandingService = async (itemId: string, edgeBandingService: EdgeBandingService) => {
    if (!user) return;

    try {
      // Create banding service in API
      const bandingData: CreateBandingData = {
        thickness: edgeBandingService.thicknessId || 0,
        width: edgeBandingService.width.toString(),
        height: edgeBandingService.height.toString(),
      };
      
      const apiBanding = await bandingApi.create(bandingData);
      
      // Update local cart item with edge banding service
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId 
            ? { 
                ...item, 
                edgeBandingService: {
                  ...edgeBandingService,
                  id: apiBanding.id.toString(),
                  apiId: apiBanding.id,
                }
              } 
            : item
        )
      );
      
      toast.success(language === 'uz' 
        ? 'Kromkalash xizmati qo\'shildi' 
        : 'Услуга кромкования добавлена');
    } catch (error) {
      console.error('Failed to add edge banding service:', error);
      toast.error(language === 'uz' 
        ? 'Kromkalash xizmati qo\'shishda xatolik yuz berdi' 
        : 'Ошибка при добавлении услуги кромкования');
      throw error;
    }
  };

  // ============== Acceptance API Functions ==============

  const fetchAcceptanceHistory = useCallback(async () => {
    if (!user) return;
    
    setIsFetchingAcceptanceHistory(true);
    try {
      const history = await acceptanceApi.getHistory();
      setAcceptanceHistory(history || []);
      
      // Also update productArrivals state with API data
      const mappedArrivals: ProductArrival[] = (history || []).map(item => ({
        id: item.id.toString(),
        apiId: item.id,
        acceptanceId: item.acceptance,
        productId: item.product.toString(),
        productName: item.product_name,
        category: getCategoryNameFromProductId(item.product.toString()) || 'OTHER',
        quantity: item.count,
        purchasePrice: parseFloat(item.arrival_price) || 0,
        sellingPrice: parseFloat(item.sale_price) || 0,
        totalInvestment: (parseFloat(item.arrival_price) || 0) * item.count,
        arrivalDate: item.arrival_date,
        notes: item.description || '',
        receivedBy: user?.full_name || 'Unknown',
        createdAt: item.created_at,
      }));
      
      setProductArrivals(mappedArrivals);
    } catch (error) {
      console.error('Failed to fetch acceptance history:', error);
      toast.error(language === 'uz' 
        ? 'Qabul qilish tarixini yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке истории приема');
    } finally {
      setIsFetchingAcceptanceHistory(false);
    }
  }, [user, language, products]);

  const addProductArrival = async (arrival: Omit<ProductArrival, 'id' | 'createdAt' | 'apiId' | 'acceptanceId'>) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    try {
      // Find the product to get its API ID
      const product = products.find(p => p.id.toString() === arrival.productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Get the API product ID
      const productApiId = product.id;
      
      const acceptanceData: CreateAcceptanceData = {
        product: productApiId,
        arrival_price: arrival.purchasePrice.toString(),
        sale_price: arrival.sellingPrice.toString(),
        count: arrival.quantity,
        arrival_date: arrival.arrivalDate,
        description: arrival.notes || '',
      };

      // Create acceptance via API
      const newAcceptance = await acceptanceApi.create(acceptanceData);
      
      // Create local arrival record
      const newArrival: ProductArrival = {
        ...arrival,
        id: newAcceptance.id.toString(),
        apiId: newAcceptance.id,
        acceptanceId: newAcceptance.id,
        productName: product.name,
        category: product.category,
        receivedBy: user.full_name,
        totalInvestment: arrival.purchasePrice * arrival.quantity,
        createdAt: new Date().toISOString(),
      };
      
      setProductArrivals(prev => [newArrival, ...prev]);
      
      // Update product stock and prices
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id.toString() === arrival.productId
            ? { 
                ...p, 
                stockQuantity: p.stockQuantity + arrival.quantity,
                purchasePrice: arrival.purchasePrice,
                unitPrice: arrival.sellingPrice,
                arrival_date: arrival.arrivalDate,
              }
            : p
        )
      );
      
      // Refresh notifications after product arrival (stock increased)
      fetchLowStockNotifications();
      
      toast.success(language === 'uz' 
        ? `${arrival.quantity} dona mahsulot qabul qilindi` 
        : `Принято ${arrival.quantity} единиц товара`);
        
    } catch (error) {
      console.error('Failed to add product arrival:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulot qabul qilishda xatolik yuz berdi' 
        : 'Ошибка при приеме товара');
      throw error;
    }
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
      
      // Reset fetch flags on login
      hasFetchedCategories.current = false;
      hasFetchedProducts.current = false;
      hasFetchedCustomers.current = false;
      hasFetchedUsers.current = false;
      hasFetchedUserStats.current = false;
      hasFetchedAcceptanceHistory.current = false;
      hasFetchedBasket.current = false;
      hasFetchedThicknesses.current = false;
      hasFetchedOrders.current = false;
      hasFetchedCustomerStats.current = false;
      hasFetchedNotifications.current = false;
      
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
      setUserStats({
        total_users: 0,
        total_salers: 0,
        total_admins: 0
      });
      setCustomers([]);
      setProducts([]);
      setCategories([]);
      setProductArrivals([]);
      setAcceptanceHistory([]);
      setCart([]);
      setThicknesses([]);
      setOrders([]);
      setCustomerStats({
        total_customers: 0,
        debtor_customers: 0,
        total_debt: 0
      });
      setLowStockNotifications(null);
      
      // Reset fetch flags
      hasFetchedCategories.current = false;
      hasFetchedProducts.current = false;
      hasFetchedCustomers.current = false;
      hasFetchedUsers.current = false;
      hasFetchedUserStats.current = false;
      hasFetchedAcceptanceHistory.current = false;
      hasFetchedBasket.current = false;
      hasFetchedThicknesses.current = false;
      hasFetchedOrders.current = false;
      hasFetchedCustomerStats.current = false;
      hasFetchedNotifications.current = false;
      
      console.log('6. Redirecting to login');
      window.location.href = '/login';
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ============== Effects ==============

  // Fetch initial data when user is authenticated - only once
  useEffect(() => {
    if (user) {
      if (!hasFetchedCategories.current) {
        fetchCategories();
        hasFetchedCategories.current = true;
      }
      if (!hasFetchedUserStats.current) {
        fetchUserStats();
        hasFetchedUserStats.current = true;
      }
      if (!hasFetchedAcceptanceHistory.current) {
        fetchAcceptanceHistory();
        hasFetchedAcceptanceHistory.current = true;
      }
      if (!hasFetchedBasket.current) {
        fetchBasket();
        hasFetchedBasket.current = true;
      }
      if (!hasFetchedThicknesses.current) {
        fetchThicknesses();
        hasFetchedThicknesses.current = true;
      }
      if (!hasFetchedOrders.current) {
        fetchOrders();
        hasFetchedOrders.current = true;
      }
      if (!hasFetchedCustomerStats.current) {
        fetchCustomerStats();
        hasFetchedCustomerStats.current = true;
      }
      if (!hasFetchedNotifications.current) {
        fetchLowStockNotifications();
        hasFetchedNotifications.current = true;
      }
    }
  }, [user]);

  // Fetch products, customers, users after categories are loaded - only once
  useEffect(() => {
    if (user && categories.length > 0) {
      if (!hasFetchedProducts.current) {
        fetchProducts();
      }
      if (!hasFetchedCustomers.current) {
        fetchCustomers();
      }
      if (!hasFetchedUsers.current) {
        fetchUsers();
      }
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
    userStats,
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
    acceptanceHistory,
    thicknesses,
    orders,
    
    // Customer stats
    customerStats,
    isFetchingCustomerStats,
    fetchCustomerStats,
    
    // Notifications
    lowStockNotifications,
    isFetchingNotifications,
    fetchLowStockNotifications,
    
    // Loading states
    isFetchingCustomers,
    isAddingCustomer,
    isUpdatingCustomer,
    isDeletingCustomer,
    isFetchingUsers,
    isFetchingUserStats,
    isAddingUser,
    isUpdatingUser,
    isDeletingUser,
    isFetchingProducts,
    isAddingProduct,
    isUpdatingProduct,
    isDeletingProduct,
    isFetchingCategories,
    isFetchingAcceptanceHistory,
    isFetchingBasket,
    isFetchingThicknesses,
    isCreatingOrder,
    isFetchingOrders,
    
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
    fetchBasket,
    
    // Service functions
    addCuttingService,
    addEdgeBandingService,
    
    // Thickness API functions
    fetchThicknesses,
    addThickness,
    deleteThickness,
    
    // Order API functions
    createOrder,
    fetchOrders,
    
    // User API functions
    fetchUsers,
    fetchUserStats,
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
    
    // Acceptance API functions
    fetchAcceptanceHistory,
    addProductArrival,
    
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