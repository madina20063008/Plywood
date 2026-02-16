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
export interface LoginCredentials {
  username: string;
  password: string;
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
  createdAt: string;
  phone_number: string
}

// Product types
export interface Product {
  id: string;
  name: string;
  category: string;
  color: string;
  width: number;
  height: number;
  thickness: number;
  quality: string;
  purchasePrice?: number; // Purchase/arrival price
  unitPrice: number;
  stockQuantity: number;
  enabled: boolean;
  imageUrl?: string;
  arrival_date: string;
  description: string;
  notes?: string; // Additional notes
  createdAt: string;
  updatedAt: string;
}

// Service types
export interface CuttingService {
  id: string;
  numberOfBoards: number;
  pricePerCut: number;
  total: number;
}

export interface EdgeBandingService {
  id: string;
  thickness: number;
  width: number;
  height: number;
  pricePerMeter: number;
  linearMeters: number;
  total: number;
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
  paymentMethod: 'cash' | 'card' | 'mixed' | 'credit';
  customerId?: string; // Optional customer ID for credit sales
  customerName?: string; // Optional customer name for credit sales
  amountPaid?: number; // Amount paid if partial payment
  amountDue?: number; // Outstanding amount for credit sales
  createdAt: string;
}

// Edge banding pricing
export interface EdgeBandingPrice {
  thickness: number;
  label: string;
  price: number;
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

// Product Arrival Record
export interface ProductArrival {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  totalInvestment: number;
  arrivalDate: string;
  notes?: string;
  receivedBy: string; // Manager name
  createdAt: string;
}

// Customer Management
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
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

// Customer API
export interface ApiCustomer {
  id: number;
  full_name: string;
  phone_number: string;
  location: string;
  about: string;
  description: string;
}

export interface CreateCustomerData {
  full_name: string;
  phone_number: string;
  location: string;
  about: string;
  description: string;
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

// Add these to your existing types.ts file
// Add these to your existing types.ts file

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

// Add these types to your existing types file

// Acceptance (Product Receiving) API Types
export interface ApiAcceptance {
  id: number;
  product: number;
  arrival_price: string;
  sale_price: string;
  count: number;
  arrival_date: string;
  description: string;
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
  arrival_price: string;
  sale_price: string;
  count: number;
  arrival_date: string;
  description: string;
  created_at: string;
}

// Update your existing ProductArrival type to match API
export interface ProductArrival {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  totalInvestment: number;
  arrivalDate: string;
  notes: string;
  receivedBy: string;
  createdAt: string;
  // API fields
  apiId?: number;
  acceptanceId?: number;
}
// Add to your types.ts file

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

// types.ts

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  full_name: string;
  phone_number: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  color: string;
  width: number;
  height: number;
  thickness: number;
  quality: string;
  purchasePrice: number;
  unitPrice: number;
  stockQuantity: number;
  enabled: boolean;
  arrival_date: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  basketItemId?: number;
  cuttingService?: CuttingService;
  edgeBandingService?: EdgeBandingService;
}

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

export interface Sale {
  id: string;
  salespersonId: string;
  salespersonName: string;
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mixed' | 'credit';
  amountPaid?: number;
  amountDue?: number;
  createdAt: string;
}

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
  totalInvestment: number;
  arrivalDate: string;
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  type: 'purchase' | 'payment';
  amount: number;
  description?: string;
  saleId?: string;
  createdAt: string;
}

// API Types
export interface ApiUser {
  id: number;
  username: string;
  full_name: string;
  phone_number: string;
  role: 's' | 'a' | 'm';
  is_active: boolean;
}

export interface CreateUserData {
  full_name: string;
  username: string;
  phone_number: string;
  password: string;
  role: 's' | 'a' | 'm';
}

export interface ApiCustomer {
  id: number;
  full_name: string;
  phone_number: string;
  location: string;
  about: string;
  description: string;
}

export interface CreateCustomerData {
  full_name: string;
  phone_number: string;
  location: string;
  about: string;
  description: string;
}

export interface ApiCategory {
  id: number;
  name: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  color: string;
  quality: 'standard' | 'economic' | 'premium';
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
  quality: 'standard' | 'economic' | 'premium';
  width: string;
  height: string;
  thick: string;
  arrival_date: string;
  description: string;
  category: number;
}


export interface ProductFilters {
  category?: number;
  quality?: string;
  search?: string;
}

export interface CreateAcceptanceData {
  product: number;
  arrival_price: string;
  sale_price: string;
  count: number;
  arrival_date: string;
  description: string;
}

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
}

export interface ApiAcceptanceHistory {
  id: number;
  acceptance: number;
  product: number;
  product_name: string;
  arrival_price: string;
  sale_price: string;
  count: number;
  arrival_date: string;
  description: string;
  created_at: string;
}

// Cutting Service API Types
export interface ApiCutting {
  id: number;
  count: number;
  price: string;
  total_price?: string;
}

export interface CreateCuttingData {
  count: number;
  price: string;
  total_price?: string;
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

// Edge Banding API Types
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

// Add to your existing types.ts

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
  payment_method: 'cash' | 'card' | 'mixed' | 'credit';
  covered_amount: string;
  banding?: ApiOrderBanding;
  cutting?: ApiOrderCutting;
  total_price: string;
  items: ApiOrderItem[];
  created_at: string;
}

export interface CreateOrderData {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  payment_method: 'cash' | 'card' | 'mixed' | 'credit';
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