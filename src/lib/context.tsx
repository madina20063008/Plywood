// context.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';
import { User, UserRole, Product, Customer, CartItem, Sale, ProductArrival, CustomerTransaction } from '../lib/types';
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
  addUser: (user: User) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'uz' | 'ru'>(() => {
    return (localStorage.getItem('language') as 'uz' | 'ru') || 'uz';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Initialize users
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'sales1',
      password: 'sales123',
      role: 'salesperson',
      name: 'Алишер Каримов',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Фарход Ахмедов',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      username: 'manager',
      password: 'manager123',
      role: 'manager',
      name: 'Дилшод Юсупов',
      createdAt: new Date().toISOString(),
    },
  ]);

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

  // Initialize customers
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Иван Иванов',
      phone: '+998901234567',
      email: 'ivan@example.com',
      address: 'ул. Ленина, 123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Мария Петрова',
      phone: '+998907654321',
      email: 'maria@example.com',
      address: 'ул. Мира, 456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

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
      arrivalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
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
      arrivalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
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

  const mapApiUserToUser = (apiUser: any): User => {
    console.log('Mapping API user from /user/me/:', apiUser);
    
    const mapApiRole = (role: string): UserRole => {
      switch (role?.toLowerCase()) {
        case 's': // SALER
          return 'salesperson';
        case 'a': // ADMIN
          return 'admin';
        case 'm': // MANAGER
          return 'manager';
        default:
          console.warn('Unknown role:', role, 'defaulting to salesperson');
          return 'salesperson';
      }
    };

    return {
      id: apiUser.id?.toString() || Date.now().toString(),
      username: apiUser.username || '',
      password: '', // Never store password
      role: mapApiRole(apiUser.role),
      name: apiUser.full_name || apiUser.username || '',
      createdAt: new Date().toISOString(),
    };
  };

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

  // User management functions
  const addUser = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id ? { ...user, ...userData } : user
      )
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
  };

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
    
    // Update product stock quantities
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
    
    // Update product stock quantity
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
      
      // Clear any existing tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Get access token
      const loginResponse = await authApi.login({ username, password });
      console.log('Login response:', loginResponse);
      
      const { access } = loginResponse;
      
      if (!access) {
        console.error('No access token in loginResponse');
        throw new Error('No access token received');
      }
      
      console.log('Access token received:', access.substring(0, 50) + '...');
      
      // Save token to localStorage
      localStorage.setItem('accessToken', access);
      console.log('Token saved to localStorage');
      
      // Get user data
      const userData = await authApi.getCurrentUser();
      console.log('User data from /user/me/:', userData);
      
      // Map to your User type
      const mappedUser = mapApiUserToUser(userData);
      console.log('Mapped user:', mappedUser);
      
      // Set user state and store
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      
      console.log('Login successful!');
      return true;
      
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error message:', error.message);
      
      // Clear storage on error
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