import React, {createContext,useContext,useState,useEffect,ReactNode,useCallback,useRef,} from "react";
import {authApi,customerApi,userApi,productApi,categoryApi,acceptanceApi,basketApi,cuttingApi,bandingApi,thicknessApi,orderApi,notificationsApi,dashboardApi,orderStatsApi,qualityApi,supplierApi} from "../lib/api";
import {User,UserRole,Product,Customer,CartItem,Sale,ProductArrival,CustomerTransaction,ApiCustomer,CreateCustomerData,ApiUser,CreateUserData,ApiProduct,CreateProductData,ProductFilters,ApiCategory,ApiAcceptanceHistory,CuttingService,EdgeBandingService,CreateCuttingData,CreateBandingData,ApiThickness,CreateThicknessData,ApiOrder,CreateOrderData,LowStockNotification,DashboardStats,OrderStats,DebtStats,ApiQuality,ApiSupplier,CreateSupplierData,SupplierPaymentData,SupplierTransaction,Supplier,PaymentHistoryResponse,} from "../lib/types";
import { toast } from "sonner";
interface AppContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  language: "uz" | "ru";
  theme: "light" | "dark";
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  sales: Sale[];
  productArrivals: ProductArrival[];
  customerTransactions: CustomerTransaction[];
  categories: ApiCategory[];
  acceptanceHistory: ApiAcceptanceHistory[];
  totalProducts: number; 
  thicknesses: ApiThickness[];
  orders: ApiOrder[];
  suppliers: Supplier[];
  customerStats: {
    total_customers: number;
    debtor_customers: number;
    total_debt: number;
  };
  isFetchingCustomerStats: boolean;
  fetchCustomerStats: () => Promise<void>;
  debtStats: DebtStats | null;
  isFetchingDebtStats: boolean;
  fetchDebtStats: () => Promise<void>;
  dashboardStats: DashboardStats | null;
  isFetchingDashboardStats: boolean;
  fetchDashboardStats: () => Promise<void>;
  orderStats: OrderStats | null;
  isFetchingOrderStats: boolean;
  fetchOrderStats: () => Promise<void>;
  lowStockNotifications: LowStockNotification | null;
  isFetchingNotifications: boolean;
  fetchLowStockNotifications: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setLanguage: (language: "uz" | "ru") => void;
  toggleTheme: () => void;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchBasket: () => Promise<void>;
  addCuttingService: (
    itemId: string,
    cuttingService: CuttingService,
  ) => Promise<void>;
  addEdgeBandingService: (
    itemId: string,
    edgeBandingService: EdgeBandingService,
  ) => Promise<void>;
  fetchThicknesses: () => Promise<void>;
  addThickness: (data: CreateThicknessData) => Promise<void>;
  deleteThickness: (id: number) => Promise<void>;
  createOrder: (orderData: CreateOrderData) => Promise<ApiOrder>;
  fetchOrders: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  addUser: (userData: Omit<User, "id" | "createdAt">) => Promise<void>;
  updateUser: (
    id: string,
    userData: Partial<Omit<User, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  userStats: {
    total_users: number;
    total_salers: number;
    total_admins: number;
  };
  isFetchingUserStats: boolean;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  addProduct: (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateProduct: (
    id: string,
    productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchCategories: (search?: string) => Promise<void>;
  fetchAcceptanceHistory: () => Promise<void>;
  addProductArrival: (
    arrival: Omit<
      ProductArrival,
      "id" | "createdAt" | "apiId" | "acceptanceId"
    >,
  ) => Promise<void>;
  addCustomerTransaction: (
    transaction: Omit<CustomerTransaction, "id" | "createdAt">,
  ) => void;
  updateCustomerTransaction: (
    id: string,
    transaction: Partial<CustomerTransaction>,
  ) => void;
  deleteCustomerTransaction: (id: string) => void;
  getCustomerBalance: (customerId: string) => {
    totalPurchases: number;
    totalPayments: number;
    balance: number;
  };
  fetchCustomers: (search?: string) => Promise<void>;
  addCustomer: (
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateCustomer: (
    id: string,
    customerData: Partial<Omit<Customer, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: number) => Promise<Customer | null>;
  fetchSuppliers: (search?: string) => Promise<void>;
  addSupplier: (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateSupplier: (
    id: string,
    supplierData: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: number) => Promise<Supplier | null>;
coverCustomerDebt: (id: number, amount: string) => Promise<void>;
  getCustomerPaymentHistory: (id: number) => Promise<PaymentHistoryResponse | null>;
  addSupplierPayment: (
    supplierId: string,
    amount: number,
    description?: string,
  ) => Promise<void>;
  fetchSupplierTransactions: (
    supplierId: string,
  ) => Promise<SupplierTransaction[]>;
  getSupplierBalance: (supplierId: string) => {
    totalPurchases: number;
    totalPayments: number;
    balance: number;
  };
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
  isFetchingSuppliers: boolean;
  isAddingSupplier: boolean;
  isUpdatingSupplier: boolean;
  isDeletingSupplier: boolean;
  isAddingSupplierPayment: boolean;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCustomers, setIsFetchingCustomers] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isFetchingUserStats, setIsFetchingUserStats] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [qualities, setQualities] = useState<ApiQuality[]>([]);
  const [isFetchingQualities, setIsFetchingQualities] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isFetchingSuppliers, setIsFetchingSuppliers] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isUpdatingSupplier, setIsUpdatingSupplier] = useState(false);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);
  const [isAddingSupplierPayment, setIsAddingSupplierPayment] = useState(false);
  const [isFetchingAcceptanceHistory, setIsFetchingAcceptanceHistory] =
    useState(false);
  const [isFetchingBasket, setIsFetchingBasket] = useState(false);
  const [isFetchingThicknesses, setIsFetchingThicknesses] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    total_customers: 0,
    debtor_customers: 0,
    total_debt: 0,
  });
  const [supplierStats, setSupplierStats] = useState({
  total_suppliers: 0,
  total_debt: 0,
});
const [isFetchingSupplierStats, setIsFetchingSupplierStats] = useState(false);
  const [isFetchingCustomerStats, setIsFetchingCustomerStats] = useState(false);
  const [debtStats, setDebtStats] = useState<DebtStats | null>(null);
  const [isFetchingDebtStats, setIsFetchingDebtStats] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [isFetchingDashboardStats, setIsFetchingDashboardStats] =
    useState(false);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [isFetchingOrderStats, setIsFetchingOrderStats] = useState(false);
  const [lowStockNotifications, setLowStockNotifications] =
    useState<LowStockNotification | null>(null);
  const [isFetchingNotifications, setIsFetchingNotifications] = useState(false);
  const [language, setLanguage] = useState<"uz" | "ru">(() => {
    return (localStorage.getItem("language") as "uz" | "ru") || "uz";
  });
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState({
    total_users: 0,
    total_salers: 0,
    total_admins: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0); // SHUNI QO'SHING
  const [productArrivals, setProductArrivals] = useState<ProductArrival[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<
    CustomerTransaction[]
  >([]);
  const [supplierTransactions, setSupplierTransactions] = useState<
    Record<string, SupplierTransaction[]>
  >({});
  const [acceptanceHistory, setAcceptanceHistory] = useState<
    ApiAcceptanceHistory[]
  >([]);
  const [thicknesses, setThicknesses] = useState<ApiThickness[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
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
  const hasFetchedDebtStats = useRef(false);
  const hasFetchedDashboardStats = useRef(false);
  const hasFetchedOrderStats = useRef(false);
  const hasFetchedNotifications = useRef(false);
  const hasFetchedQualities = useRef(false);
  const hasFetchedSupplierStats = useRef(false);
  const hasFetchedSuppliers = useRef(false);
  const checkTokenValidity = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      await authApi.getCurrentUser();
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      const toastMessage =
        language === "uz"
          ? "Sessiya muddati tugadi. Iltimos, qaytadan kiring."
          : "Сессия истекла. Пожалуйста, войдите снова.";
      toast.error(toastMessage);
      window.location.href = "/login";
    }
  }, [language]);
  useEffect(() => {
    if (user) {
      checkTokenValidity();
      const intervalId = setInterval(checkTokenValidity, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [user, checkTokenValidity]);
  const mapApiUserToUser = (apiUser: ApiUser): User => {
    const mapApiRole = (role: string): UserRole => {
      switch (role?.toLowerCase()) {
        case "s":
          return "salesperson";
        case "a":
          return "admin";
        case "m":
          return "manager";
        default:
          console.warn("Unknown role:", role, "defaulting to salesperson");
          return "salesperson";
      }
    };
    return {
      id: apiUser.id?.toString() || Date.now().toString(),
      username: apiUser.username || "",
      password: "",
      role: mapApiRole(apiUser.role),
      full_name: apiUser.full_name || apiUser.username || "",
      phone_number: apiUser.phone_number || "",
      createdAt: new Date().toISOString(),
    };
  };
const coverCustomerDebt = async (id: number, amount: string): Promise<void> => {
  if (!user) {
    toast.error(
      language === "uz"
        ? "Avval tizimga kiring"
        : "Сначала войдите в систему",
    );
    return;
  }
  try {
    await customerApi.coverDebt(id, { amount });
    await fetchCustomers();
    await fetchCustomerStats();
    await fetchDebtStats();
    toast.success(
      language === "uz"
        ? "To'lov muvaffaqiyatli amalga oshirildi"
        : "Платеж успешно выполнен",
    );
  } catch (error) {
    console.error("Failed to cover debt:", error);
    toast.error(
      language === "uz"
        ? "To'lovni amalga oshirishda xatolik yuz berdi"
        : "Ошибка при выполнении платежа",
    );
    throw error;
  }
};
const fetchSupplierStats = useCallback(async () => {
  if (!user) return;
  setIsFetchingSupplierStats(true);
  try {
    const stats = await supplierApi.getStats();
    setSupplierStats(stats);
    hasFetchedSupplierStats.current = true;
  } catch (error) {
    console.error("Failed to fetch supplier stats:", error);
    toast.error(
      language === "uz"
        ? "Ta'minotchi statistikasini yuklashda xatolik yuz berdi"
        : "Ошибка при загрузке статистики поставщиков",
    );
  } finally {
    setIsFetchingSupplierStats(false);
  }
}, [user, language]);
const getCustomerPaymentHistory = async (id: number): Promise<PaymentHistoryResponse | null> => {
  if (!user) {
    toast.error(
      language === "uz"
        ? "Avval tizimga kiring"
        : "Сначала войдите в систему",
    );
    return null;
  }
  try {
    const history = await customerApi.getPaymentHistory(id);
    return history;
  } catch (error) {
    console.error("Failed to fetch payment history:", error);
    toast.error(
      language === "uz"
        ? "To'lov tarixini yuklashda xatolik yuz berdi"
        : "Ошибка при загрузке истории платежей",
    );
    return null;
  }
};
  const fetchQualities = useCallback(async () => {
    if (!user) return;
    setIsFetchingQualities(true);
    try {
      const data = await qualityApi.getAll();
      setQualities(data || []);
      hasFetchedQualities.current = true;
    } catch (error) {
      console.error("Failed to fetch qualities:", error);
      toast.error(
        language === "uz"
          ? "Sifatlarni yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке качеств",
      );
    } finally {
      setIsFetchingQualities(false);
    }
  }, [user, language]);
  useEffect(() => {
    if (user && !hasFetchedQualities.current) {
      fetchQualities();
    }
  }, [user]);
  const mapUserToApiData = (
    userData: Omit<User, "id" | "createdAt">,
  ): CreateUserData => {
    const mapAppRole = (role: UserRole): "s" | "a" | "m" => {
      switch (role) {
        case "salesperson":
          return "s";
        case "admin":
          return "a";
        case "manager":
          return "m";
        default:
          return "s";
      }
    };
    return {
      full_name: userData.full_name,
      username: userData.username,
      phone_number: userData.phone_number || "",
      password: userData.password || "",
      role: mapAppRole(userData.role),
    };
  };
  const mapApiCustomerToCustomer = (apiCustomer: ApiCustomer): Customer => {
    return {
      id: apiCustomer.id?.toString() || Date.now().toString(),
      name: apiCustomer.full_name || "",
      phone: apiCustomer.phone_number || "",
      address: apiCustomer.location || "",
      email: apiCustomer.about || "",
      notes: apiCustomer.description || "",
      debt: apiCustomer.debt ? parseFloat(apiCustomer.debt) : 0, // Parse debt from API
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };
  const mapCustomerToApiData = (
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ): CreateCustomerData => {
    return {
      full_name: customerData.name || "",
      phone_number: customerData.phone || "",
      location: customerData.address || "",
      about: customerData.email || "",
      description: customerData.notes || "",
    };
  };
const mapApiSupplierToSupplier = (apiSupplier: ApiSupplier): Supplier => {
  return {
    id: apiSupplier.id?.toString() || Date.now().toString(),
    name: apiSupplier.full_name || '',
    phone: apiSupplier.phone_number || '',
    company: apiSupplier.company || '',  // Add this
    debt: apiSupplier.debt ? parseFloat(apiSupplier.debt) : 0,
    isActive: apiSupplier.is_active ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
const mapSupplierToApiData = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'debt' | 'isActive'>): CreateSupplierData => {
  return {
    full_name: supplierData.name || '',
    phone_number: supplierData.phone || '',
    company: supplierData.company || '',  // Add this
  };
};
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    const parseNumber = (value: string): number => {
      if (!value) return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };
    const category = categories.find((c) => c.id === apiProduct.category);
    const categoryName = category?.name || "OTHER";
    return {
      id: apiProduct.id,
      name: apiProduct.name || "",
      category: categoryName,
      color: apiProduct.color || "#CCCCCC",
      width: parseNumber(apiProduct.width),
      height: parseNumber(apiProduct.height),
      thickness: parseNumber(apiProduct.thick),
      quality: apiProduct.quality || "standard",
      purchasePrice: parseNumber(apiProduct.arrival_price),
      unitPrice: parseNumber(apiProduct.sale_price),
      stockQuantity: apiProduct.count || 0,
      enabled: apiProduct.is_active,
      arrival_date: apiProduct.arrival_date,
      description: apiProduct.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };
  const getCustomerById = useCallback(
    async (id: number): Promise<Customer | null> => {
      if (!user) return null;
      try {
        const apiCustomer = await customerApi.getById(id);
        return mapApiCustomerToCustomer(apiCustomer);
      } catch (error) {
        console.error("Failed to fetch customer by ID:", error);
        toast.error(
          language === "uz"
            ? "Mijoz ma'lumotlarini yuklashda xatolik"
            : "Ошибка при загрузке данных клиента",
        );
        return null;
      }
    },
    [user, language],
  );
  const mapProductToApiData = (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): CreateProductData => {
    const category = categories.find((c) => c.name === productData.category);
    const categoryId = category?.id;
    const mapQuality = (
      quality: string,
    ): "standard" | "economic" | "premium" => {
      switch (quality?.toLowerCase()) {
        case "premium":
        case "премиум":
          return "premium";
        case "economic":
        case "экономик":
        case "эконом":
          return "economic";
        case "standard":
        case "стандарт":
        default:
          return "standard";
      }
    };
    return {
      name: productData.name || "",
      color: productData.color || "#CCCCCC",
      quality: mapQuality(productData.quality),
      width: productData.width?.toString() || "0",
      height: productData.height?.toString() || "0",
      thick: productData.thickness?.toString() || "0",
      arrival_date:
        productData.arrival_date || new Date().toISOString().split("T")[0],
      description: productData.description || "",
      category: categoryId,
    };
  };
  const mapCurrentUser = (apiUser: any): User => {
    const mapApiRole = (role: string): UserRole => {
      switch (role?.toLowerCase()) {
        case "s":
          return "salesperson";
        case "a":
          return "admin";
        case "m":
          return "manager";
        default:
          return "salesperson";
      }
    };
    return {
      id: apiUser.id?.toString() || Date.now().toString(),
      username: apiUser.username || "",
      password: "",
      role: mapApiRole(apiUser.role),
      full_name: apiUser.full_name || apiUser.username || "",
      phone_number: apiUser.phone_number || "",
      createdAt: new Date().toISOString(),
    };
  };
  const mapApiBasketToCart = (apiBasket: any): CartItem[] => {
    if (!apiBasket || !apiBasket.items || !Array.isArray(apiBasket.items)) {
      return [];
    }
    return apiBasket.items
      .map((item: any) => {
        if (
          !item ||
          !item.product ||
          !Array.isArray(item.product) ||
          item.product.length === 0
        ) {
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
          console.error("Error mapping product:", error, productData);
          return null;
        }
      })
      .filter(Boolean); // Remove any null items
  };
  const getCategoryNameFromProductId = (productId: string): string => {
    const product = products.find((p) => p.id.toString() === productId);
    return product?.category || "OTHER";
  };
  const fetchCustomerStats = useCallback(async () => {
    if (!user) return;
    setIsFetchingCustomerStats(true);
    try {
      const stats = await customerApi.getStats();
      setCustomerStats(stats);
      hasFetchedCustomerStats.current = true;
    } catch (error) {
      console.error("Failed to fetch customer stats:", error);
      toast.error(
        language === "uz"
          ? "Mijoz statistikasini yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке статистики клиентов",
      );
    } finally {
      setIsFetchingCustomerStats(false);
    }
  }, [user, language]);
  const fetchDebtStats = useCallback(async () => {
    if (!user) return;

    setIsFetchingDebtStats(true);
    try {
      const stats = await customerApi.getDebtStats();
      setDebtStats(stats);
      hasFetchedDebtStats.current = true;
    } catch (error) {
      console.error("Failed to fetch debt stats:", error);
      toast.error(
        language === "uz"
          ? "Qarz statistikasini yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке статистики долгов",
      );
    } finally {
      setIsFetchingDebtStats(false);
    }
  }, [user, language]);
  const fetchDashboardStats = useCallback(async () => {
    if (!user) return;

    setIsFetchingDashboardStats(true);
    try {
      const stats = await dashboardApi.getStats();
      setDashboardStats(stats);
      hasFetchedDashboardStats.current = true;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      toast.error(
        language === "uz"
          ? "Dashboard statistikasini yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке статистики дашборда",
      );
    } finally {
      setIsFetchingDashboardStats(false);
    }
  }, [user, language]);
  const fetchOrderStats = useCallback(async () => {
    if (!user) return;
    setIsFetchingOrderStats(true);
    try {
      const stats = await orderStatsApi.getStats();
      setOrderStats(stats);
      hasFetchedOrderStats.current = true;
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
      toast.error(
        language === "uz"
          ? "Buyurtma statistikasini yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке статистики заказов",
      );
    } finally {
      setIsFetchingOrderStats(false);
    }
  }, [user, language]);
  const fetchSuppliers = useCallback(
    async (search?: string) => {
      if (!user) return;
      setIsFetchingSuppliers(true);
      try {
        const apiSuppliers = await supplierApi.getAll(search);
        const suppliersArray = Array.isArray(apiSuppliers) ? apiSuppliers : [];
        const mappedSuppliers = suppliersArray.map(mapApiSupplierToSupplier);
        setSuppliers(mappedSuppliers);
        hasFetchedSuppliers.current = true;
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
        toast.error(
          language === "uz"
            ? "Yetkazib beruvchilarni yuklashda xatolik yuz berdi"
            : "Ошибка при загрузке поставщиков",
        );
      } finally {
        setIsFetchingSuppliers(false);
      }
    },
    [user, language],
  );
  const getSupplierById = useCallback(
    async (id: number): Promise<Supplier | null> => {
      if (!user) return null;
      try {
        const apiSupplier = await supplierApi.getById(id);
        return mapApiSupplierToSupplier(apiSupplier);
      } catch (error) {
        console.error("Failed to fetch supplier by ID:", error);
        toast.error(
          language === "uz"
            ? "Yetkazib beruvchi ma'lumotlarini yuklashda xatolik"
            : "Ошибка при загрузке данных поставщика",
        );
        return null;
      }
    },
    [user, language],
  );
  const addSupplier = async (
    supplierData: Omit<
      Supplier,
      "id" | "createdAt" | "updatedAt" | "debt" | "isActive"
    >,
  ) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    setIsAddingSupplier(true);
    try {
      const apiData = mapSupplierToApiData(supplierData);
      const newApiSupplier = await supplierApi.create(apiData);
      const newSupplier = mapApiSupplierToSupplier(newApiSupplier);
      setSuppliers((prev) => [...prev, newSupplier]);
      toast.success(
        language === "uz"
          ? "Yetkazib beruvchi qo'shildi"
          : "Поставщик добавлен",
      );
    } catch (error) {
      console.error("Failed to add supplier:", error);
      toast.error(
        language === "uz"
          ? "Yetkazib beruvchi qo'shishda xatolik yuz berdi"
          : "Ошибка при добавлении поставщика",
      );
      throw error;
    } finally {
      setIsAddingSupplier(false);
    }
  };
  const updateSupplier = async (id: string, supplierData: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'debt' | 'isActive'>>) => {
  if (!user) {
    toast.error(language === 'uz' ? 'Avval tizimga kiring' : 'Сначала войдите в систему');
    return;
  }
  setIsUpdatingSupplier(true);
  try {
    const apiData: Partial<CreateSupplierData> = {};
    if (supplierData.name) apiData.full_name = supplierData.name;
    if (supplierData.phone) apiData.phone_number = supplierData.phone;
    if (supplierData.company) apiData.company = supplierData.company;  // Add this line
    const updatedApiSupplier = await supplierApi.update(parseInt(id), apiData);
    const updatedSupplier = mapApiSupplierToSupplier(updatedApiSupplier);
    setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
    toast.success(language === 'uz' ? 'Yetkazib beruvchi yangilandi' : 'Поставщик обновлен');
  } catch (error) {
    console.error('Failed to update supplier:', error);
    toast.error(language === 'uz' 
      ? 'Yetkazib beruvchi yangilashda xatolik yuz berdi' 
      : 'Ошибка при обновлении поставщика');
    throw error;
  } finally {
    setIsUpdatingSupplier(false);
  }
};
  const deleteSupplier = async (id: string) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    setIsDeletingSupplier(true);
    try {
      await supplierApi.delete(parseInt(id));
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success(
        language === "uz" ? "Yetkazib beruvchi o'chirildi" : "Поставщик удален",
      );
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      toast.error(
        language === "uz"
          ? "Yetkazib beruvchi o'chirishda xatolik yuz berdi"
          : "Ошибка при удалении поставщика",
      );
      throw error;
    } finally {
      setIsDeletingSupplier(false);
    }
  };
  const addSupplierPayment = async (
    supplierId: string,
    amount: number,
  ) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    setIsAddingSupplierPayment(true);
    try {
      const paymentData: SupplierPaymentData = {
        supplier_id: parseInt(supplierId),
        amount: amount.toString(),
      };
      await supplierApi.addPayment(paymentData);
      await fetchSuppliers();
      await fetchSupplierTransactions(supplierId);
      toast.success(
        language === "uz" ? "To'lov qabul qilindi" : "Платеж принят",
      );
    } catch (error) {
      console.error("Failed to add supplier payment:", error);
      toast.error(
        language === "uz"
          ? "To'lov qabul qilishda xatolik yuz berdi"
          : "Ошибка при приеме платежа",
      );
      throw error;
    } finally {
      setIsAddingSupplierPayment(false);
    }
  };
  // Update the fetchSupplierTransactions function
const fetchSupplierTransactions = async (
  supplierId: string,
): Promise<SupplierTransaction[]> => {
  if (!user) return [];
  try {
    const response = await supplierApi.getTransactions(parseInt(supplierId));
    
    // Check if response has stats property (new API format)
    let transactions: SupplierTransaction[] = [];
    
    if (Array.isArray(response)) {
      // If response is directly an array
      transactions = response;
    } else if (response && typeof response === 'object') {
      // If response has transactions/results property
      transactions = response.transactions || response.results || [];
      
      // Log the stats if they exist (for debugging)
      if (response.stats) {
        console.log(`📊 Stats for supplier ${supplierId}:`, response.stats);
      }
    }
    
    // Ensure transactions is an array
    if (!Array.isArray(transactions)) {
      console.error('Transactions is not an array:', transactions);
      transactions = [];
    }
    
    setSupplierTransactions((prev) => ({
      ...prev,
      [supplierId]: transactions,
    }));
    
    return transactions;
  } catch (error) {
    console.error("Failed to fetch supplier transactions:", error);
    toast.error(
      language === "uz"
        ? "Tranzaksiyalarni yuklashda xatolik yuz berdi"
        : "Ошибка при загрузке транзакций",
    );
    return [];
  }
};

// Fix getSupplierBalance function - Add safe array check
const getSupplierBalance = (supplierId: string) => {
  const supplier = suppliers.find((s) => s.id === supplierId);
  const currentDebt = supplier?.debt || 0;
  
  // SAFETY: Ensure we always have an array
  const transactions = supplierTransactions[supplierId] || [];
  
  // Double-check that transactions is an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  const totalPurchases = safeTransactions
    .filter((t) => t && t.transaction_type === "purchase")
    .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);
    
  const totalPayments = safeTransactions
    .filter((t) => t && t.transaction_type === "payment")
    .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);
    
  const calculatedBalance = totalPurchases - totalPayments;
  const balance = currentDebt !== 0 ? currentDebt : calculatedBalance;
  
  return {
    totalPurchases,
    totalPayments,
    balance,
  };
};

  const fetchLowStockNotifications = useCallback(async () => {
    if (!user) return;
    setIsFetchingNotifications(true);
    try {
      const notifications = await notificationsApi.getLowStock();
      setLowStockNotifications(notifications);
      hasFetchedNotifications.current = true;
      if (notifications.low_stock_products > 0) {
        toast.warning(
          language === "uz"
            ? `${notifications.low_stock_products} ta mahsulot zaxirasi kam`
            : `${notifications.low_stock_products} товаров с низким запасом`,
          {
            duration: 5000,
          },
        );
      }
    } catch (error) {
      console.error("Failed to fetch low stock notifications:", error);
    } finally {
      setIsFetchingNotifications(false);
    }
  }, [user, language]);
  const fetchCategories = useCallback(
    async (search?: string) => {
      if (!user) return;
      setIsFetchingCategories(true);
      try {
        const apiCategories = await categoryApi.getAll(search);
        setCategories(apiCategories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error(
          language === "uz"
            ? "Kategoriyalarni yuklashda xatolik yuz berdi"
            : "Ошибка при загрузке категорий",
        );
      } finally {
        setIsFetchingCategories(false);
      }
    },
    [user, language],
  );
  const fetchThicknesses = useCallback(async () => {
    if (!user) return;
    setIsFetchingThicknesses(true);
    try {
      const apiThicknesses = await thicknessApi.getAll();
      setThicknesses(apiThicknesses || []);
    } catch (error) {
      console.error("Failed to fetch thicknesses:", error);
      toast.error(
        language === "uz"
          ? "Qalinliklarni yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке толщин",
      );
    } finally {
      setIsFetchingThicknesses(false);
    }
  }, [user, language]);
  const addThickness = async (data: CreateThicknessData) => {
    if (!user) return;
    try {
      const newThickness = await thicknessApi.create(data);
      setThicknesses((prev) => [...prev, newThickness]);
      toast.success(
        language === "uz" ? "Qalinlik qo'shildi" : "Толщина добавлена",
      );
    } catch (error) {
      console.error("Failed to add thickness:", error);
      toast.error(
        language === "uz"
          ? "Qalinlik qo'shishda xatolik yuz berdi"
          : "Ошибка при добавлении толщины",
      );
      throw error;
    }
  };
  const deleteThickness = async (id: number) => {
    if (!user) return;
    try {
      await thicknessApi.delete(id);
      setThicknesses((prev) => prev.filter((t) => t.id !== id));
      toast.success(
        language === "uz" ? "Qalinlik o'chirildi" : "Толщина удалена",
      );
    } catch (error) {
      console.error("Failed to delete thickness:", error);
      toast.error(
        language === "uz"
          ? "Qalinlik o'chirishda xatolik yuz berdi"
          : "Ошибка при удалении толщины",
      );
      throw error;
    }
  };
  const createOrder = async (orderData: CreateOrderData): Promise<ApiOrder> => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      throw new Error("User not authenticated");
    }
    setIsCreatingOrder(true);
    try {
      const newOrder = await orderApi.create(orderData);
      setOrders((prev) => [newOrder, ...prev]);
      await clearCart();
      fetchDashboardStats();
      fetchOrderStats();
      fetchDebtStats();
      fetchLowStockNotifications();
      toast.success(
        language === "uz"
          ? "Buyurtma muvaffaqiyatli yaratildi"
          : "Заказ успешно создан",
      );
      return newOrder;
    } catch (error: any) {
      console.error("Failed to create order:", error);
      toast.error(
        language === "uz"
          ? `Buyurtma yaratishda xatolik: ${error.message}`
          : `Ошибка при создании заказа: ${error.message}`,
      );
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
      console.error("Failed to fetch orders:", error);
      toast.error(
        language === "uz"
          ? "Buyurtmalarni yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке заказов",
      );
    } finally {
      setIsFetchingOrders(false);
    }
  }, [user, language]);
const fetchProducts = useCallback(async (filters?: ProductFilters) => {
  if (!user) return;
  setIsFetchingProducts(true);
  try {
    console.log("🔍 Fetching products with filters:", filters);
    const response = await productApi.getAll(filters);
    
    console.log("🔍 API Response:", response);

    let productsList = [];
    let totalCount = 0;

    if (Array.isArray(response)) {
      // Agar array kelsa (pagination yo'q)
      productsList = response;
      totalCount = response.length;
      console.log("📊 Response is ARRAY, totalCount set to:", totalCount);
    } else if (response && typeof response === 'object') {
      console.log("📊 Response is OBJECT, keys:", Object.keys(response));
      
      // Pagination bo'lsa: { total: 100, data: [...] } yoki { count: 100, results: [...] }
      productsList = response.data || response.results || [];
      totalCount = response.total || response.count || 0;
      
      console.log("📊 Response details:");
      console.log("   - response.total:", response.total);
      console.log("   - response.count:", response.count);
      console.log("   - productsList length:", productsList.length);
      console.log("   - totalCount set to:", totalCount);
    }

    const mappedProducts = productsList.map((p: any) => ({
      id: p.id,
      name: p.name || '',
      category: p.category_name || p.category || '',
      width: p.width || 0,
      height: p.height || 0,
      thickness: p.thick || p.thickness || 0,
      quality: p.quality || '',
      unitPrice: parseFloat(p.sale_price) || 0,
      stockQuantity: p.count || 0,
      color: p.color || '',
      image: p.image || null,
    }));

    console.log("📊 Setting products with:", mappedProducts.length, "items");
    setProducts(mappedProducts);
    
    console.log("📊 Setting totalProducts to:", totalCount);
    setTotalProducts(totalCount);
    
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    setIsFetchingProducts(false);
  }
}, [user]);
  const addProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt"> | FormData,
) => {
  if (!user) {
    toast.error(
      language === "uz"
        ? "Avval tizimga kiring"
        : "Сначала войдите в систему",
    );
    return;
  }
  setIsAddingProduct(true);
  try {
    let apiData: CreateProductData | FormData;
    
    if (productData instanceof FormData) {
      // If it's FormData, use it directly
      apiData = productData;
    } else {
      // Otherwise map to API format
      apiData = mapProductToApiData(productData);
    }
    
    const newApiProduct = await productApi.create(apiData);
    const newProduct = mapApiProductToProduct(newApiProduct);
    setProducts((prev) => [...prev, newProduct]);
    fetchLowStockNotifications();
    fetchDashboardStats();
    toast.success(
      language === "uz" ? "Mahsulot qo'shildi" : "Продукт добавлен",
    );
  } catch (error) {
    console.error("Failed to add product:", error);
    toast.error(
      language === "uz"
        ? "Mahsulot qo'shishda xatolik yuz berdi"
        : "Ошибка при добавлении продукта",
    );
    throw error;
  } finally {
    setIsAddingProduct(false);
  }
};
  const updateProduct = async (
  id: string,
  productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">> | FormData,
) => {
  if (!user) {
    toast.error(
      language === "uz"
        ? "Avval tizimga kiring"
        : "Сначала войдите в систему",
    );
    return;
  }
  setIsUpdatingProduct(true);
  try {
    let apiData: Partial<CreateProductData> | FormData;
    
    if (productData instanceof FormData) {
      // If it's FormData, use it directly
      apiData = productData;
    } else {
      // Otherwise map to API format
      apiData = {};
      if (productData.name) apiData.name = productData.name;
      if (productData.color) apiData.color = productData.color;
      if (productData.quality) {
        switch (productData.quality?.toLowerCase()) {
          case "premium":
            apiData.quality = "premium";
            break;
          case "economic":
            apiData.quality = "economic";
            break;
          default:
            apiData.quality = "standard";
        }
      }
      if (productData.width) apiData.width = productData.width.toString();
      if (productData.height) apiData.height = productData.height.toString();
      if (productData.thickness)
        apiData.thick = productData.thickness.toString();
      if (productData.arrival_date)
        apiData.arrival_date = productData.arrival_date;
      if (productData.description)
        apiData.description = productData.description;
      if (productData.category) {
        const category = categories.find(
          (c) => c.name === productData.category,
        );
        apiData.category = category?.id;
      }
    }
    
    const updatedApiProduct = await productApi.update(parseInt(id), apiData);
    const updatedProduct = mapApiProductToProduct(updatedApiProduct);
    setProducts((prev) =>
      prev.map((p) => (p.id.toString() === id ? updatedProduct : p)),
    );
    fetchLowStockNotifications();
    toast.success(
      language === "uz" ? "Mahsulot yangilandi" : "Продукт обновлен",
    );
  } catch (error) {
    console.error("Failed to update product:", error);
    toast.error(
      language === "uz"
        ? "Mahsulot yangilashda xatolik yuz berdi"
        : "Ошибка при обновлении продукта",
    );
    throw error;
  } finally {
    setIsUpdatingProduct(false);
  }
};
  const deleteProduct = async (id: string) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    setIsDeletingProduct(true);
    try {
      await productApi.delete(parseInt(id));
      setProducts((prev) => prev.filter((p) => p.id.toString() !== id));
      fetchLowStockNotifications();
      fetchDashboardStats();
      toast.success(
        language === "uz" ? "Mahsulot o'chirildi" : "Продукт удален",
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(
        language === "uz"
          ? "Mahsulot o'chirishda xatolik yuz berdi"
          : "Ошибка при удалении продукта",
      );
      throw error;
    } finally {
      setIsDeletingProduct(false);
    }
  };
  const fetchCustomers = useCallback(
    async (search?: string) => {
      if (!user) return;
      setIsFetchingCustomers(true);
      try {
        const apiCustomers = await customerApi.getAll(search);
        const customersArray = Array.isArray(apiCustomers) ? apiCustomers : [];
        const mappedCustomers = customersArray.map(mapApiCustomerToCustomer);
        setCustomers(mappedCustomers);
        hasFetchedCustomers.current = true;
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast.error(
          language === "uz"
            ? "Mijozlarni yuklashda xatolik yuz berdi"
            : "Ошибка при загрузке клиентов",
        );
      } finally {
        setIsFetchingCustomers(false);
      }
    },
    [user, language],
  );
  const addCustomer = async (
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    setIsAddingCustomer(true);
    try {
      const apiData = mapCustomerToApiData(customerData);
      const newApiCustomer = await customerApi.create(apiData);
      const newCustomer = mapApiCustomerToCustomer(newApiCustomer);
      setCustomers((prev) => [...prev, newCustomer]);
      fetchCustomerStats();
      fetchDebtStats();
      toast.success(language === "uz" ? "Mijoz qo'shildi" : "Клиент добавлен");
    } catch (error) {
      console.error("Failed to add customer:", error);
      toast.error(
        language === "uz"
          ? "Mijoz qo'shishda xatolik yuz berdi"
          : "Ошибка при добавлении клиента",
      );
      throw error;
    } finally {
      setIsAddingCustomer(false);
    }
  };
  const updateCustomer = async (
    id: string,
    customerData: Partial<Omit<Customer, "id" | "createdAt" | "updatedAt">>,
  ) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
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
      const updatedApiCustomer = await customerApi.update(
        parseInt(id),
        apiData,
      );
      const updatedCustomer = mapApiCustomerToCustomer(updatedApiCustomer);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? updatedCustomer : c)),
      );
      fetchCustomerStats();
      fetchDebtStats();
      toast.success(language === "uz" ? "Mijoz yangilandi" : "Клиент обновлен");
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error(
        language === "uz"
          ? "Mijoz yangilashda xatolik yuz berdi"
          : "Ошибка при обновлении клиента",
      );
      throw error;
    } finally {
      setIsUpdatingCustomer(false);
    }
  };
  const deleteCustomer = async (id: string) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    setIsDeletingCustomer(true);
    try {
      await customerApi.delete(parseInt(id));
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      fetchCustomerStats();
      fetchDebtStats();
      toast.success(language === "uz" ? "Mijoz o'chirildi" : "Клиент удален");
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error(
        language === "uz"
          ? "Mijoz o'chirishda xatolik yuz berdi"
          : "Ошибка при удалении клиента",
      );
      throw error;
    } finally {
      setIsDeletingCustomer(false);
    }
  };
  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setIsFetchingUsers(true);
    try {
      const apiUsers = await userApi.getAll();
      const mappedUsers = (apiUsers || []).map(mapApiUserToUser);
      setUsers(mappedUsers);
      hasFetchedUsers.current = true;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(
        language === "uz"
          ? "Foydalanuvchilarni yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке пользователей",
      );
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
      console.error("Failed to fetch user stats:", error);
      toast.error(
        language === "uz"
          ? "Foydalanuvchi statistikasini yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке статистики пользователей",
      );
    } finally {
      setIsFetchingUserStats(false);
    }
  }, [user, language]);
  const addUser = async (userData: Omit<User, "id" | "createdAt">) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    setIsAddingUser(true);
    try {
      const apiData = mapUserToApiData(userData);
      const newApiUser = await userApi.create(apiData);
      const newUser = mapApiUserToUser(newApiUser);
      setUsers((prev) => [...prev, newUser]);
      await fetchUserStats();
      toast.success(
        language === "uz" ? "Foydalanuvchi qo'shildi" : "Пользователь добавлен",
      );
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error(
        language === "uz"
          ? "Foydalanuvchi qo'shishda xatolik yuz berdi"
          : "Ошибка при добавлении пользователя",
      );
      throw error;
    } finally {
      setIsAddingUser(false);
    }
  };
  const updateUser = async (
    id: string,
    userData: Partial<Omit<User, "id" | "createdAt">>,
  ) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
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
          case "salesperson":
            apiData.role = "s";
            break;
          case "admin":
            apiData.role = "a";
            break;
          case "manager":
            apiData.role = "m";
            break;
        }
      }
      const updatedApiUser = await userApi.update(parseInt(id), apiData);
      const updatedUser = mapApiUserToUser(updatedApiUser);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      if (user.id === id) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      await fetchUserStats();
      toast.success(
        language === "uz"
          ? "Foydalanuvchi yangilandi"
          : "Пользователь обновлен",
      );
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(
        language === "uz"
          ? "Foydalanuvchi yangilashda xatolik yuz berdi"
          : "Ошибка при обновлении пользователя",
      );
      throw error;
    } finally {
      setIsUpdatingUser(false);
    }
  };
  const deleteUser = async (id: string) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    if (user.id === id) {
      toast.error(
        language === "uz"
          ? "O'zingizni o'chira olmaysiz"
          : "Вы не можете удалить себя",
      );
      return;
    }
    setIsDeletingUser(true);
    try {
      await userApi.delete(parseInt(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      await fetchUserStats();
      toast.success(
        language === "uz" ? "Foydalanuvchi o'chirildi" : "Пользователь удален",
      );
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(
        language === "uz"
          ? "Foydalanuvchi o'chirishda xatolik yuz berdi"
          : "Ошибка при удалении пользователя",
      );
      throw error;
    } finally {
      setIsDeletingUser(false);
    }
  };
  const fetchBasket = useCallback(async () => {
    if (!user) return;
    setIsFetchingBasket(true);
    try {
      const apiBasket = await basketApi.getBasket();
      if (apiBasket && apiBasket.items) {
        const mappedCart = mapApiBasketToCart(apiBasket);
        setCart(mappedCart);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Failed to fetch basket:", error);
      toast.error(
        language === "uz"
          ? "Savatchani yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке корзины",
      );
      setCart([]);
    } finally {
      setIsFetchingBasket(false);
    }
  }, [user, language]);
  const addToCart = async (item: CartItem | Product, quantity: number = 1) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    try {
      let productId: number;
      let currentQuantity = quantity;
      if ("product" in item) {
        productId = item.product.id;
        const existingItem = cart.find(
          (cartItem) => cartItem.product.id === productId,
        );
        if (existingItem) {
          currentQuantity = existingItem.quantity + quantity;
        }
      } else {
        productId = item.id;
        const existingItem = cart.find(
          (cartItem) => cartItem.product.id === productId,
        );
        if (existingItem) {
          currentQuantity = existingItem.quantity + quantity;
        }
      }
      await basketApi.addToBasket(productId, currentQuantity);
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (cartItem) => cartItem.product.id === productId,
        );
        if (existingItemIndex >= 0) {
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + quantity,
          };
          return updatedCart;
        } else {
          const newItem: CartItem = {
            id: Date.now().toString(),
            basketItemId: Date.now(),
            product: "product" in item ? item.product : item,
            quantity: quantity,
          };
          return [...prevCart, newItem];
        }
      });
      await fetchBasket();
    } catch (error) {
      console.error("Failed to add to basket:", error);
      toast.error(
        language === "uz"
          ? "Savatchaga qo'shishda xatolik yuz berdi"
          : "Ошибка при добавлении в корзину",
      );
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      const item = cart.find((i) => i.id === itemId);
      if (item?.basketItemId) {
        await basketApi.removeFromBasket(item.basketItemId);
      }
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
      toast.success(
        language === "uz"
          ? "Mahsulot savatchadan o'chirildi"
          : "Товар удален из корзины",
      );
    } catch (error) {
      console.error("Failed to remove from basket:", error);
      toast.error(
        language === "uz"
          ? "Savatchadan o'chirishda xatolik yuz berdi"
          : "Ошибка при удалении из корзины",
      );
      throw error;
    }
  };
  const updateCartItem = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    try {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update cart item:", error);
      toast.error(
        language === "uz"
          ? "Savatchani yangilashda xatolik yuz berdi"
          : "Ошибка при обновлении корзины",
      );
      throw error;
    }
  };
  const clearCart = async (): Promise<void> => {
    if (!user) return;
    try {
      await basketApi.clearBasket();
      setCart([]);
      toast.success(
        language === "uz" ? "Savatcha tozalandi" : "Корзина очищена",
      );
    } catch (error) {
      console.error("Failed to clear basket:", error);
      setCart([]);
      toast.warning(
        language === "uz"
          ? "Savatcha lokal tozalandi, lekin serverda xatolik yuz berdi"
          : "Корзина очищена локально, но произошла ошибка на сервере",
      );
    }
  };
  const addCuttingService = async (
    itemId: string,
    cuttingService: CuttingService,
  ) => {
    if (!user) return;
    try {
      const cuttingData: CreateCuttingData = {
        count: cuttingService.numberOfBoards,
        price: cuttingService.pricePerCut.toString(),
        total_price: cuttingService.total.toString(),
      };
      const apiCutting = await cuttingApi.create(cuttingData);
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId
            ? {
                ...item,
                cuttingService: {
                  ...cuttingService,
                  id: apiCutting.id.toString(),
                  apiId: apiCutting.id,
                },
              }
            : item,
        ),
      );
      toast.success(
        language === "uz"
          ? "Kesish xizmati qo'shildi"
          : "Услуга распила добавлена",
      );
    } catch (error) {
      console.error("Failed to add cutting service:", error);
      toast.error(
        language === "uz"
          ? "Kesish xizmati qo'shishda xatolik yuz berdi"
          : "Ошибка при добавлении услуги распила",
      );
      throw error;
    }
  };
  const addEdgeBandingService = async (
    itemId: string,
    edgeBandingService: EdgeBandingService,
  ) => {
    if (!user) return;
    try {
      const bandingData: CreateBandingData = {
        thickness: edgeBandingService.thicknessId || 0,
        width: edgeBandingService.width.toString(),
        height: edgeBandingService.height.toString(),
      };
      const apiBanding = await bandingApi.create(bandingData);
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId
            ? {
                ...item,
                edgeBandingService: {
                  ...edgeBandingService,
                  id: apiBanding.id.toString(),
                  apiId: apiBanding.id,
                },
              }
            : item,
        ),
      );
      toast.success(
        language === "uz"
          ? "Kromkalash xizmati qo'shildi"
          : "Услуга кромкования добавлена",
      );
    } catch (error) {
      console.error("Failed to add edge banding service:", error);
      toast.error(
        language === "uz"
          ? "Kromkalash xizmati qo'shishda xatolik yuz berdi"
          : "Ошибка при добавлении услуги кромкования",
      );
      throw error;
    }
  };
  const fetchAcceptanceHistory = useCallback(async () => {
    if (!user) return;
    setIsFetchingAcceptanceHistory(true);
    try {
      const history = await acceptanceApi.getHistory();
      setAcceptanceHistory(history || []);
      const mappedArrivals: ProductArrival[] = (history || []).map((item) => ({
        id: item.id.toString(),
        apiId: item.id,
        acceptanceId: item.acceptance,
        productId: item.product.toString(),
        productName: item.product_name,
        category:
          getCategoryNameFromProductId(item.product.toString()) || "OTHER",
        quantity: item.count,
        purchasePrice: parseFloat(item.arrival_price) || 0,
        sellingPrice: parseFloat(item.sale_price) || 0,
        priceType: item.price_type, // Add price type from API
        exchangeRate: item.exchange_rate, // Add exchange rate from API
        totalInvestment: (parseFloat(item.arrival_price) || 0) * item.count,
        arrivalDate: item.arrival_date,
        notes: item.description || "",
        receivedBy: user?.full_name || "Unknown",
        createdAt: item.created_at,
      }));
      setProductArrivals(mappedArrivals);
    } catch (error) {
      console.error("Failed to fetch acceptance history:", error);
      toast.error(
        language === "uz"
          ? "Qabul qilish tarixini yuklashda xatolik yuz berdi"
          : "Ошибка при загрузке истории приема",
      );
    } finally {
      setIsFetchingAcceptanceHistory(false);
    }
  }, [user, language, products]);
  const addProductArrival = async (
    arrival: Omit<
      ProductArrival,
      "id" | "createdAt" | "apiId" | "acceptanceId"
    >,
  ) => {
    if (!user) {
      toast.error(
        language === "uz"
          ? "Avval tizimga kiring"
          : "Сначала войдите в систему",
      );
      return;
    }
    try {
      console.log("🟢 addProductArrival called with:", {
        productId: arrival.productId,
        priceType: arrival.priceType,
        purchasePrice: arrival.purchasePrice,
        sellingPrice: arrival.sellingPrice,
      });
      const product = products.find(
        (p) => p.id.toString() === arrival.productId,
      );
      if (!product) {
        throw new Error("Product not found");
      }
      const quantity = Number(arrival.quantity);
      const acceptanceData: any = {
        product: product.id,
        arrival_price: arrival.purchasePrice.toString(),
        sale_price: arrival.sellingPrice.toString(),
        count: quantity,
        arrival_date: arrival.arrivalDate,
        description: arrival.notes || "",
        price_type: arrival.priceType, // BU 'dollar' YOKI 'sum' BO'LISHI KERAK
      };
      if (arrival.priceType === "dollar") {
        acceptanceData.exchange_rate =
          arrival.exchangeRate?.toString() || "12500"; // Default yoki formadan olingan
      }
      const newAcceptance = await acceptanceApi.create(acceptanceData);
      const newArrival: ProductArrival = {
        ...arrival,
        id: newAcceptance.id.toString(),
        apiId: newAcceptance.id,
        acceptanceId: newAcceptance.id,
        productName: product.name,
        category: product.category,
        receivedBy: user.full_name,
        exchangeRate: newAcceptance.exchange_rate, // API dan kelgan exchange_rate ni saqlaymiz
        totalInvestment: arrival.purchasePrice * arrival.quantity,
        createdAt: new Date().toISOString(),
      };
      setProductArrivals((prev) => [newArrival, ...prev]);
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id.toString() === arrival.productId
            ? {
                ...p,
                stockQuantity: p.stockQuantity + quantity,
                ...(arrival.priceType === "dollar"
                  ? {
                      purchasePriceDollar: arrival.purchasePrice,
                      unitPriceDollar: arrival.sellingPrice,
                      lastPriceType: "dollar",
                    }
                  : {
                      purchasePrice: arrival.purchasePrice,
                      unitPrice: arrival.sellingPrice,
                      lastPriceType: "sum",
                    }),
                arrival_date: arrival.arrivalDate,
              }
            : p,
        ),
      );
      await fetchAcceptanceHistory();
      toast.success(
        language === "uz"
          ? `${quantity} dona mahsulot qabul qilindi`
          : `Принято ${quantity} единиц товара`,
      );
    } catch (error) {
      console.error("❌ Failed to add product arrival:", error);
      toast.error(
        language === "uz"
          ? "Mahsulot qabul qilishda xatolik yuz berdi"
          : "Ошибка при приеме товара",
      );
      throw error;
    }
  };
  const addCustomerTransaction = (
    transaction: Omit<CustomerTransaction, "id" | "createdAt">,
  ) => {
    const newTransaction: CustomerTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCustomerTransactions((prev) => [newTransaction, ...prev]);
    toast.success(
      language === "uz" ? "Tranzaksiya qo'shildi" : "Транзакция добавлена",
    );
  };
  const updateCustomerTransaction = (
    id: string,
    transactionData: Partial<CustomerTransaction>,
  ) => {
    setCustomerTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...transactionData }
          : transaction,
      ),
    );
  };
  const deleteCustomerTransaction = (id: string) => {
    setCustomerTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );
  };
  const getCustomerBalance = (customerId: string) => {
    const transactions = customerTransactions.filter(
      (t) => t.customerId === customerId,
    );
    const totalPurchases = transactions
      .filter((t) => t.type === "purchase")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = transactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalPurchases - totalPayments;
    return {
      totalPurchases,
      totalPayments,
      balance,
    };
  };
  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      const loginResponse = await authApi.login({ username, password });
      const { access } = loginResponse;
      if (!access) {
        console.error("No access token in loginResponse");
        throw new Error("No access token received");
      }
      localStorage.setItem("accessToken", access);
      const userData = await authApi.getCurrentUser();
      const mappedUser = mapCurrentUser(userData);
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
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
      hasFetchedDebtStats.current = false;
      hasFetchedDashboardStats.current = false;
      hasFetchedOrderStats.current = false;
      hasFetchedNotifications.current = false;
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      console.error("Error message:", error.message);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
     
      if (refreshToken) {
        await authApi.logout(refreshToken);
      } else {
        console.log("2. No refresh token, skipping API call");
      }
    } catch (error) {
      console.error("3. API logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      setUsers([]);
      setUserStats({
        total_users: 0,
        total_salers: 0,
        total_admins: 0,
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
        total_debt: 0,
      });
      setDebtStats(null);
      setDashboardStats(null);
      setOrderStats(null);
      setLowStockNotifications(null);
      setSuppliers([]);
      setSupplierTransactions({});
      hasFetchedSuppliers.current = false;
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
      hasFetchedDebtStats.current = false;
      hasFetchedDashboardStats.current = false;
      hasFetchedOrderStats.current = false;
      hasFetchedNotifications.current = false;
      window.location.href = "/login";
    }
  };
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
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
      if (!hasFetchedDebtStats.current) {
        fetchDebtStats();
        hasFetchedDebtStats.current = true;
      }
      if (!hasFetchedDashboardStats.current) {
        fetchDashboardStats();
        hasFetchedDashboardStats.current = true;
      }
      if (!hasFetchedOrderStats.current) {
        fetchOrderStats();
        hasFetchedOrderStats.current = true;
      }
      if (!hasFetchedNotifications.current) {
        fetchLowStockNotifications();
        hasFetchedNotifications.current = true;
      }
      if (!hasFetchedSuppliers.current) {
        fetchSuppliers();
        hasFetchedSuppliers.current = true;
      }
      if (!hasFetchedSupplierStats.current) {
      fetchSupplierStats();
      hasFetchedSupplierStats.current = true;
      }
    }
  }, [user, fetchSuppliers, fetchSupplierStats]);
  useEffect(() => {
    if (user) {
      if (!hasFetchedProducts.current) {
        fetchProducts().then(() => {
          hasFetchedProducts.current = true;
        });
      }
      if (!hasFetchedCustomers.current) {
        fetchCustomers().then(() => {
          hasFetchedCustomers.current = true;
        });
      }
      if (!hasFetchedUsers.current) {
        fetchUsers().then(() => {
          hasFetchedUsers.current = true;
        });
      }
    }
  }, [user, fetchProducts, fetchCustomers, fetchUsers]);
  useEffect(() => {
    if (user && categories.length > 0 && hasFetchedProducts.current) {
      fetchProducts();
    }
  }, [categories, user]);
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);
  const value: AppContextType = {
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
    coverCustomerDebt,
    getCustomerPaymentHistory,
    qualities,
    isFetchingQualities,
    fetchQualities,
    customerStats,
    isFetchingCustomerStats,
    fetchCustomerStats,
    getCustomerById,
    debtStats,
    isFetchingDebtStats,
    fetchDebtStats,
    dashboardStats,
    totalProducts,
    isFetchingDashboardStats,
    fetchDashboardStats,
    orderStats,
    isFetchingOrderStats,
    fetchOrderStats,
    lowStockNotifications,
    isFetchingNotifications,
    fetchLowStockNotifications,
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
    suppliers,
  supplierStats,
  isFetchingSupplierStats,
  fetchSupplierStats,
    login,
    logout,
    setLanguage,
    toggleTheme,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    fetchBasket,
    addCuttingService,
    addEdgeBandingService,
    fetchThicknesses,
    addThickness,
    deleteThickness,
    createOrder,
    fetchOrders,
    fetchUsers,
    fetchUserStats,
    addUser,
    updateUser,
    deleteUser,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    fetchAcceptanceHistory,
    addProductArrival,
    addCustomerTransaction,
    updateCustomerTransaction,
    deleteCustomerTransaction,
    getCustomerBalance,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    suppliers,
    isFetchingSuppliers,
    isAddingSupplier,
    isUpdatingSupplier,
    isDeletingSupplier,
    isAddingSupplierPayment,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    addSupplierPayment,
    fetchSupplierTransactions,
    getSupplierBalance,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
