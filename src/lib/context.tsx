import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Language, Product, CartItem, Sale, ProductArrival, Customer, CustomerTransaction } from './types';

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItem: (id: string, item: Partial<CartItem>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  
  // Sales
  sales: Sale[];
  completeSale: (sale: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'>) => string;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  
  // Product Arrivals
  productArrivals: ProductArrival[];
  addProductArrival: (arrival: Omit<ProductArrival, 'id' | 'createdAt'>) => void;
  updateProductArrival: (id: string, arrival: Partial<ProductArrival>) => void;
  deleteProductArrival: (id: string) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Customer Transactions
  customerTransactions: CustomerTransaction[];
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

// Mock initial data
const initialUsers: User[] = [
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
];

// Initial mock products
const initialProducts: Product[] = [
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
];

// Initial mock customers
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Иван Иванов',
    phone: '+998901234567',
    email: 'ivan@example.com',
    address: 'ул. Ленина, 123',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Мария Петрова',
    phone: '+998907654321',
    email: 'maria@example.com',
    address: 'ул. Мира, 456',
    createdAt: new Date().toISOString(),
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('uz');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [productArrivals, setProductArrivals] = useState<ProductArrival[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([]);
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedLanguage = localStorage.getItem('language');
    const savedTheme = localStorage.getItem('theme');
    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    const savedProductArrivals = localStorage.getItem('productArrivals');
    const savedUsers = localStorage.getItem('users');
    const savedCustomers = localStorage.getItem('customers');
    const savedCustomerTransactions = localStorage.getItem('customerTransactions');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedLanguage) setLanguage(savedLanguage as Language);
    if (savedTheme) setTheme(savedTheme as 'light' | 'dark');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedProductArrivals) setProductArrivals(JSON.parse(savedProductArrivals));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedCustomerTransactions) setCustomerTransactions(JSON.parse(savedCustomerTransactions));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('productArrivals', JSON.stringify(productArrivals));
  }, [productArrivals]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('customerTransactions', JSON.stringify(customerTransactions));
  }, [customerTransactions]);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...product, updatedAt: new Date().toISOString() } : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const updateCartItem = (id: string, item: Partial<CartItem>) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const completeSale = (sale: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'>): string => {
    const receiptNumber = `RC${Date.now()}`;
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      receiptNumber,
      createdAt: new Date().toISOString(),
    };
    
    setSales(prev => [...prev, newSale]);
    
    // If this is a credit sale with a customer, create a transaction
    if (sale.paymentMethod === 'credit' && sale.customerId && sale.customerName) {
      const amountDue = sale.amountDue || sale.total;
      addCustomerTransaction({
        customerId: sale.customerId,
        customerName: sale.customerName,
        type: 'purchase',
        amount: amountDue,
        saleId: newSale.id,
        receiptNumber: receiptNumber,
        description: `${sale.items.length} ${language === 'uz' ? 'ta mahsulot' : 'товаров'}`,
        processedBy: sale.salespersonName,
      });
    }
    
    // Update stock quantities
    sale.items.forEach(item => {
      updateProduct(item.product.id, {
        stockQuantity: item.product.stockQuantity - item.quantity
      });
    });
    
    clearCart();
    return receiptNumber;
  };

  const updateSale = (id: string, sale: Partial<Sale>) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...sale } : s));
  };

  const addProductArrival = (arrival: Omit<ProductArrival, 'id' | 'createdAt'>) => {
    const newArrival: ProductArrival = {
      ...arrival,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProductArrivals(prev => [...prev, newArrival]);
  };

  const updateProductArrival = (id: string, arrival: Partial<ProductArrival>) => {
    setProductArrivals(prev => prev.map(a => a.id === id ? { ...a, ...arrival } : a));
  };

  const deleteProductArrival = (id: string) => {
    setProductArrivals(prev => prev.filter(a => a.id !== id));
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, user: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...user } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addCustomerTransaction = (transaction: Omit<CustomerTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: CustomerTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCustomerTransactions(prev => [...prev, newTransaction]);
  };

  const updateCustomerTransaction = (id: string, transaction: Partial<CustomerTransaction>) => {
    setCustomerTransactions(prev => prev.map(t => t.id === id ? { ...t, ...transaction } : t));
  };

  const deleteCustomerTransaction = (id: string) => {
    setCustomerTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getCustomerBalance = (customerId: string) => {
    const transactions = customerTransactions.filter(t => t.customerId === customerId);
    const totalPurchases = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalPurchases,
      totalPayments,
      balance: totalPurchases - totalPayments,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        language,
        setLanguage,
        theme,
        toggleTheme,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        sales,
        completeSale,
        updateSale,
        productArrivals,
        addProductArrival,
        updateProductArrival,
        deleteProductArrival,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        customerTransactions,
        addCustomerTransaction,
        updateCustomerTransaction,
        deleteCustomerTransaction,
        getCustomerBalance,
        users,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};