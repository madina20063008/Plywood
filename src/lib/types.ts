// User roles
export type UserRole = 'salesperson' | 'admin' | 'manager';

// Language types
export type Language = 'uz' | 'ru';

export interface LoginCredentials {
  username: string;
  password: string;
}

// In your types.ts, update LoginResponse:
export interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    access: string;
    refresh: string;
    user: ApiUser;
  };
  // Keep these for backward compatibility
  access?: string;
  refresh?: string;
  user?: ApiUser;
}

export interface ApiError {
  detail?: string;
  non_field_errors?: string[];
  username?: string[];
  password?: string[];
  [key: string]: any;
}

// Token refresh
export interface TokenRefresh {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

// User type
export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  full_name: string;
  phone_number: string;
  createdAt: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  category: string;
  color: string;
  width: number;
  height: number;
  thickness: number;
  quality: string;
  purchasePrice?: number; 
  unitPrice: number;
  stockQuantity: number;
  enabled: boolean;
  imageUrl?: string;
  arrival_date: string;
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  unitPriceDollar?: any;
  purchasePriceDollar?: any
}

// Service types
export interface CuttingService {
  id: string;
  numberOfBoards: number;
  pricePerCut: number;
  total: number;
  apiId?: number;
}

export interface EdgeBandingService {
  id: string;
  thickness: number;
  thicknessId?: number;
  width: number;
  height: number;
  pricePerMeter: number;
  linearMeters: number;
  total: number;
  apiId?: number;
}

export interface EdgeBandingPrice {
  thickness: number;
  label: string;
  price: number;
}

// Cart item
export interface CartItem {
  id: string;
  basketItemId: number;
  product: Product;
  quantity: number;
  customWidth?: number;
  customHeight?: number;
  cuttingService?: CuttingService;
  edgeBandingService?: EdgeBandingService;
}

// Sale/Transaction
export interface Sale {
  id: string;
  receiptNumber: string;
  salespersonId: string;
  salespersonName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mixed' | 'nasiya';
  customerId?: string; // Optional customer ID for credit sales
  customerName?: string; // Optional customer name for credit sales
  amountPaid?: number; // Amount paid if partial payment
  amountDue?: number; // Outstanding amount for credit sales
  createdAt: string;
}

// Analytics data
export interface AnalyticsData {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  lowStockProducts: number;
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { productName: string; quantity: number; revenue: number }[];
  revenueByCategory: { category: string; revenue: number }[];
  serviceRevenue: { cutting: number; edgeBanding: number };
}
// types.ts - Update ProductArrival interface
export interface ProductArrival {
  id: string;
  apiId?: number;
  acceptanceId?: number;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  priceType?: 'dollar' | 'sum';  // Add this
  exchangeRate?: string | null;   // Add this
  totalInvestment: number;
  arrivalDate: string;
  notes: string;
  receivedBy: string;
  createdAt: string;
}

// Customer Management - UPDATED with debt field
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
  debt?: number; // New debt field
  createdAt: string;
  updatedAt: string;
}

// Customer Transaction (Purchase or Payment)
export interface CustomerTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'purchase' | 'payment'; // purchase = debt increase, payment = debt decrease
  amount: number;
  saleId?: string; // Link to sale if it's a purchase
  receiptNumber?: string;
  description?: string;
  processedBy: string; // User who processed the transaction
  createdAt: string;
}

// Customer API - UPDATED with debt field
export interface ApiCustomer {
  id: number;
  full_name: string;
  phone_number: string;
  location: string;
  debt?: string; // New debt field (string from API)
  about: string;
  description: string;
}

export interface CreateCustomerData {
  full_name: string;
  phone_number: string;
  location: string;
  about: string;
  description: string;
  // Note: debt is typically not set during creation, it accumulates from purchases
}

// User API types
export interface ApiUser {
  id: number;
  full_name: string;
  username: string;
  phone_number: string;
  role: 's' | 'a' | 'm'; // s = salesperson, a = admin, m = manager
}

export interface CreateUserData {
  full_name: string;
  username: string;
  phone_number: string;
  password: string;
  role: 's' | 'a' | 'm';
}

export type UpdateUserData = Partial<CreateUserData>;

// Category API types
export interface ApiCategory {
  id: number;
  name: string;
}

// Product API types
export interface ApiProduct {
  id: number;
  name: string;
  color: string;
  quality: 'standard' | 'economic' | 'premium'; // Fixed quality values
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
}

export interface CreateProductData {
  name: string;
  color: string;
  quality: 'standard' | 'economic' | 'premium'; // Fixed quality values
  width: string;
  height: string;
  thick: string;
  arrival_date: string;
  description: string;
  category: number;
}

export type UpdateProductData = Partial<CreateProductData>;

export interface ProductFilters {
  category?: number;
  quality?: string;
  search?: string;
}

// Acceptance (Product Receiving) API Types
export interface ApiAcceptance {
  id: number;
  product: number;
  arrival_price: string;
  sale_price: string;
  count: number;
  arrival_date: string;
  description: string;
  created_at: string;
  updated_at: string;
  exchange_rate?: string;
}

export interface CreateAcceptanceData {
  product: number;
  arrival_price: string;
  sale_price: string;
  count: number;
  arrival_date: string;
  description: string;
}

export interface ApiAcceptanceHistory {
  id: number;
  acceptance: number;
  product: number;
  product_name: string;
  exchange_rate: string | null;  // Add this
  price_type: 'dollar' | 'sum';  // Add this
  arrival_price: string;
  sale_price: string;
  count: number;
  arrival_date: string;
  description: string;
  created_at: string;
}

// Basket API types
export interface ApiBasketItem {
  id: number;
  product: ApiProduct[];
}

export interface ApiBasket {
  id: number;
  items: ApiBasketItem[];
}

export interface BasketItem {
  id: string;
  product: Product;
  quantity: number;
  basketItemId?: number; // API ID for the basket item
}

// Thickness API Types
export interface ApiThickness {
  id: number;
  size: string;
  price: string;
}

export interface CreateThicknessData {
  size: string;
  price: string;
}

// Update ApiBanding interface
export interface ApiBanding {
  id: number;
  thickness: ApiThickness; 
  width: string;
  height: string;
  linear_meter?: number;
  total_price?: number;
  created_at?: string;
}

export interface CreateBandingData {
  thickness: number;
  width: string;
  height: string;
}

// Order API Types
export interface ApiOrderItem {
  id: number;
  product_id: number;
  price: string;
  quantity: number;
}

export interface ApiOrderBanding {
  id: number;
  thickness: ApiThickness;
  width: string;
  height: string;
  linear_meter: string;
  total_price: string;
}

export interface ApiOrderCutting {
  count: number;
  price: string;
  total_price: string;
}

export interface ApiOrder {
  id: number;
  user: number;
  discount_type: 'p' | 'c';
  discount: string;
  payment_method: 'cash' | 'card' | 'mixed' | 'nasiya';
  covered_amount: string;
  banding?: ApiOrderBanding;
  cutting?: ApiOrderCutting;
  total_price: string;
  items: ApiOrderItem[];
  created_at: string;
  is_anonymous: string;
  customer: any
}

export interface CreateOrderData {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  payment_method: 'cash' | 'card' | 'mixed' | 'nasiya';
  discount: string;
  discount_type: 'p' | 'c';
  covered_amount: string;
  banding?: {
    thickness: number;
    width: string;
    height: string;
  };
  cutting?: {
    count: number;
    price: string;
  };
}

export interface Order extends ApiOrder {
  // Extended with mapped fields if needed
}
export interface LowStockProduct {
  id: number;
  name: string;
  count: number;
}

export interface LowStockNotification {
  low_stock_products: number;
  products: LowStockProduct[];
}

export interface LowStockProduct {
  id: number;
  name: string;
  count: number;
}

export interface LowStockNotification {
  low_stock_products: number;
  products: LowStockProduct[];
}

export interface DashboardStats {
  today_income: number;
  total_income: number;
  total_products: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  count: number;
}

export interface LowStockNotification {
  low_stock_products: number;
  products: LowStockProduct[];
}

export interface DashboardStats {
  today_income: number;
  total_income: number;
  total_products: number;
  total_sales: number;
  total_discount: number;
}

export interface OrderStats {
  total_sales: number;
  today_income: number;
  total_income: number;
}

export interface DebtStats {
  total_debt: number;
  debtor_customers: number;
  nasiya_sales: number;
}

// Update your types.ts file with these interfaces

export interface ApiCutting {
  id: number;
  count: number;
  price: string;
  total_price: string;
  created_at?: string;
}

export interface CreateCuttingData {
  count: number;
  price: string;
  total_price: string;
}

export interface ApiThickness {
  id: number;
  size: string;
  price: string;
}

export interface CreateThicknessData {
  size: string;
  price: string;
}

export interface ApiBanding {
  id: number;
  thickness: ApiThickness[];
  width: string;
  height: string;
  linear_meter?: string;
  total_price?: string;
}

export interface CreateBandingData {
  thickness: number;
  width: string;
  height: string;
}

export interface IncomeStats {
  total_cutting_income: number;
  today_cutting_income: number;
  total_banding_income: number;
  today_banding_income: number;
  total_income: number;
  today_income: number;
}

export interface ApiQuality {
  id: number;
  name: string;
}

// In your types file
export interface BasketItem {
  id: number;
  product: Product;
}

export interface Basket {
  id: number;
  items: BasketItem[];
}

// For your local cart state
export interface LocalCartItem {
  id: string; // local unique ID
  product: Product;
  quantity: number; // local only, not sent to API
}

// Add these to your existing types.ts file

export interface ApiSupplier {
  id: number;
  full_name: string;
  phone_number: string;
  debt: string;
  is_active: boolean;
  company: string;
}

export interface CreateSupplierData {
  full_name: string;
  phone_number: string;
  company: string;
}

export interface SupplierPaymentData {
  supplier_id: number;
  amount: string;
}

export interface SupplierTransaction {
  id: number;
  transaction_type: 'purchase' | 'payment';
  amount: string;
  description: string;
  created_at: string;
}

// App Supplier type
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  debt: number;
  isActive: boolean;
  company: string;
  createdAt: string;
  updatedAt: string;
}

// Add these types to your types.ts file

export interface PaymentHistoryItem {
  id: number;
  type: "DEBT_ADD" | "PAYMENT";
  amount: string;
  created_at: string;
}

export interface PaymentHistoryResponse {
  history: PaymentHistoryItem[];
  stats: {
    total_orders: number;
    total_paid: number;
    remaining_debt: number;
  };
}

export interface CoverDebtRequest {
  amount: string;
}