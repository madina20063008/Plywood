// User roles
export type UserRole = 'salesperson' | 'admin' | 'manager';

// Language types
export type Language = 'uz' | 'ru';

// User type
export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: string;
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
  arrivalDate?: string; // Date of last arrival
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