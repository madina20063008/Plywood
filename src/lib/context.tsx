import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, customerApi, userApi } from '../lib/api';
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
  CreateUserData 
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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setLanguage: (language: 'uz' | 'ru') => void;
  toggleTheme: () => void;
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
  addProductArrival: (arrival: Omit<ProductArrival, 'id' | 'createdAt'>) => void;
  updateProductArrival: (id: string, arrival: Partial<ProductArrival>) => void;
  deleteProductArrival: (id: string) => void;
  addCustomerTransaction: (transaction: Omit<CustomerTransaction, 'id' | 'createdAt'>) => void;
  updateCustomerTransaction: (id: string, transaction: Partial<CustomerTransaction>) => void;
  deleteCustomerTransaction: (id: string) => void;
  getCustomerBalance: (customerId: string) => {
    totalPurchases: number;
    totalPayments: number;
    balance: number;
  };
  // Customer API functions with separate loading states
  fetchCustomers: (search?: string) => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  // Separate loading states
  isFetchingCustomers: boolean;
  isAddingCustomer: boolean;
  isUpdatingCustomer: boolean;
  isDeletingCustomer: boolean;
  isFetchingUsers: boolean;
  isAddingUser: boolean;
  isUpdatingUser: boolean;
  isDeletingUser: boolean;
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
  
  const [language, setLanguage] = useState<'uz' | 'ru'>(() => {
    return (localStorage.getItem('language') as 'uz' | 'ru') || 'uz';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Initialize users as empty array - will be fetched from API
  const [users, setUsers] = useState<User[]>([]);

  // Initialize products
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'LDSP Черный',
      category: 'LDSP',
      color: '#000000',
      width: 2700,
      height: 1000,
      thickness: 16,
      quality: 'Премиум',
      purchasePrice: 70000,
      unitPrice: 85000,
      stockQuantity: 45,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'LDSP Белый',
      category: 'LDSP',
      color: '#FFFFFF',
      width: 2700,
      height: 1000,
      thickness: 16,
      quality: 'Премиум',
      purchasePrice: 68000,
      unitPrice: 82000,
      stockQuantity: 38,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'MDF Серый',
      category: 'MDF',
      color: '#808080',
      width: 2440,
      height: 1220,
      thickness: 18,
      quality: 'Стандарт',
      purchasePrice: 62000,
      unitPrice: 75000,
      stockQuantity: 22,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'DVP Коричневый',
      category: 'DVP',
      color: '#8B4513',
      width: 2750,
      height: 1700,
      thickness: 3,
      quality: 'Эконом',
      purchasePrice: 28000,
      unitPrice: 35000,
      stockQuantity: 67,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'DSP Бежевый',
      category: 'DSP',
      color: '#F5F5DC',
      width: 2800,
      height: 2070,
      thickness: 22,
      quality: 'Стандарт',
      purchasePrice: 78000,
      unitPrice: 95000,
      stockQuantity: 18,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'LDSP Синий',
      category: 'LDSP',
      color: '#1E40AF',
      width: 2700,
      height: 1000,
      thickness: 16,
      quality: 'Премиум',
      purchasePrice: 72000,
      unitPrice: 87000,
      stockQuantity: 30,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '7',
      name: 'MDF Зеленый',
      category: 'MDF',
      color: '#059669',
      width: 2440,
      height: 1220,
      thickness: 18,
      quality: 'Пемиум',
      purchasePrice: 64000,
      unitPrice: 78000,
      stockQuantity: 15,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '8',
      name: 'LDSP Красный',
      category: 'LDSP',
      color: '#DC2626',
      width: 2700,
      height: 1000,
      thickness: 16,
      quality: 'Стандарт',
      purchasePrice: 68000,
      unitPrice: 83000,
      stockQuantity: 12,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Initialize customers (empty array - will be fetched from API)
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Initialize cart
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Initialize sales
  const [sales, setSales] = useState<Sale[]>([]);

  // Initialize product arrivals
  const [productArrivals, setProductArrivals] = useState<ProductArrival[]>([
    {
      id: '1',
      productId: '1',
      productName: 'LDSP Черный',
      category: 'LDSP',
      quantity: 50,
      purchasePrice: 70000,
      sellingPrice: 85000,
      totalInvestment: 3500000,
      arrivalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Первая партия',
      receivedBy: 'Дилшод Юсупов',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      productId: '2',
      productName: 'LDSP Белый',
      category: 'LDSP',
      quantity: 40,
      purchasePrice: 68000,
      sellingPrice: 82000,
      totalInvestment: 2720000,
      arrivalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Качество премиум',
      receivedBy: 'Дилшод Юсупов',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // Initialize customer transactions
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([
    {
      id: '1',
      customerId: '1',
      customerName: 'Иван Иванов',
      type: 'purchase',
      amount: 850000,
      saleId: 'sale-001',
      receiptNumber: 'R-001',
      description: 'Покупка LDSP Черный 10 шт',
      processedBy: 'Алишер Каримов',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      customerId: '1',
      customerName: 'Иван Иванов',
      type: 'payment',
      amount: 400000,
      description: 'Частичная оплата',
      processedBy: 'Алишер Каримов',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      customerId: '2',
      customerName: 'Мария Петрова',
      type: 'purchase',
      amount: 1200000,
      saleId: 'sale-002',
      receiptNumber: 'R-002',
      description: 'Покупка MDF Серый 16 шт',
      processedBy: 'Алишер Каримов',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

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

  // Fetch customers from API
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

  // Add customer via API
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

  // Update customer via API
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

  // Delete customer via API
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

  // Fetch users from API
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

  // Add user via API
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

  // Update user via API
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
      
      // If updating current user, update the user state
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

  // Delete user via API
  const deleteUser = async (id: string) => {
    if (!user) {
      toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
      return;
    }

    // Don't allow deleting yourself
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

  // Map API user from /user/me/ endpoint
  const mapCurrentUser = (apiUser: any): User => {
    console.log('Mapping API user from /user/me/:', apiUser);
    
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

  // Fetch customers when user is authenticated
  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchUsers();
    }
  }, [user]);

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

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Cart functions
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

  // Product arrival functions
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

  // Customer transaction functions
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

  // Calculate customer balance
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
      
      console.log('6. Redirecting to login');
      window.location.href = '/login';
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: AppContextType = {
    user,
    users,
    isAuthenticated: !!user,
    isLoading,
    isFetchingCustomers,
    isAddingCustomer,
    isUpdatingCustomer,
    isDeletingCustomer,
    isFetchingUsers,
    isAddingUser,
    isUpdatingUser,
    isDeletingUser,
    language,
    theme,
    products,
    customers,
    cart,
    sales,
    productArrivals,
    customerTransactions,
    login,
    logout,
    setLanguage,
    toggleTheme,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    addSale,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    addProductArrival,
    updateProductArrival,
    deleteProductArrival,
    addCustomerTransaction,
    updateCustomerTransaction,
    deleteCustomerTransaction,
    getCustomerBalance,
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