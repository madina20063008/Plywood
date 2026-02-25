import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Sale, ApiOrder, Customer } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search, Edit, Eye, ShoppingBag, DollarSign, Calendar, User, TrendingUp, 
  Loader2, CreditCard, Banknote, Landmark, FileText, UserCheck, History, 
  Receipt as ReceiptIcon, Package, Ruler, Scissors, Layers, Tag, Phone, 
  MapPin, Mail, Clock, Hash, ChevronRight, AlertCircle, CheckCircle2, XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { orderApi, customerApi } from '../../lib/api';

export const SoldProductsPage: React.FC = () => {
  const { 
    sales, 
    updateSale, 
    language,
    orderStats,
    fetchOrderStats,
    isFetchingOrderStats,
    customers,
    fetchOrders,
    orders,
    isFetchingOrders
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false);
  const [isEditOrderDialogOpen, setIsEditOrderDialogOpen] = useState(false);
  const [editedDiscount, setEditedDiscount] = useState(0);
  const [editedPaymentMethod, setEditedPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
  const [isDeletingOrder, setIsDeletingOrder] = useState<Record<number, boolean>>({});
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('anonymous');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState('0');
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountPaidInput, setAmountPaidInput] = useState('0');
  const [discountType, setDiscountType] = useState<'p' | 'c'>('c');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed' | 'nasiya'>('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrderStats();
    fetchOrders();
  }, []);

  const t = (key: string) => getTranslation(language, key as any);

  // Filter sales based on search term
  const filteredSales = sales.filter(sale => 
    sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.salespersonName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by date (newest first)
  const sortedSales = [...filteredSales].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'uz' ? 'uz-UZ' : 'ru-RU');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(language === 'uz' ? 'uz-UZ' : 'ru-RU').format(numAmount);
  };

  // Helper function to handle numeric input values
  const parseNumericInput = (value: string): number => {
    if (value === '' || value === '-' || value === '0') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update discount when input changes
  useEffect(() => {
    const parsed = parseNumericInput(discountInput);
    setDiscount(parsed);
  }, [discountInput]);

  // Update amount paid when input changes
  useEffect(() => {
    const parsed = parseNumericInput(amountPaidInput);
    setAmountPaid(parsed);
  }, [amountPaidInput]);

  // Update selected customer when ID changes
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (selectedCustomerId === 'anonymous') {
        setSelectedCustomer(null);
      } else {
        const existingCustomer = customers.find(c => c.id === selectedCustomerId);
        
        if (existingCustomer) {
          setSelectedCustomer(existingCustomer);
        } else {
          try {
            setIsLoading(true);
            const allCustomers = await customerApi.getAll();
            const foundCustomer = allCustomers.find(c => c.id === parseInt(selectedCustomerId));
            
            if (foundCustomer) {
              const customer: Customer = {
                id: foundCustomer.id.toString(),
                name: foundCustomer.full_name,
                phone: foundCustomer.phone_number || '',
                address: foundCustomer.location || '',
                debt: foundCustomer.debt ? parseFloat(foundCustomer.debt) : 0
              };
              setSelectedCustomer(customer);
            }
          } catch (error) {
            console.error('Failed to fetch customer details:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    fetchCustomerDetails();
  }, [selectedCustomerId, customers]);

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setEditedDiscount(sale.discount);
    setEditedPaymentMethod(sale.paymentMethod);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSale) return;

    const newTotal = selectedSale.subtotal - editedDiscount;
    
    updateSale(selectedSale.id, {
      discount: editedDiscount,
      total: newTotal,
      paymentMethod: editedPaymentMethod,
    });

    // Refresh order stats after update
    fetchOrderStats();

    toast.success(t('saleUpdated'));
    setIsEditDialogOpen(false);
    setSelectedSale(null);
  };

  const handleViewOrderDetails = async (orderId: number) => {
    try {
      setIsLoading(true);
      const order = await orderApi.getById(orderId);
      setSelectedOrder(order);
      setIsOrderDetailsDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch order details:', error);
      toast.error(language === 'uz' 
        ? 'Buyurtma ma\'lumotlarini yuklashda xatolik' 
        : 'Ошибка при загрузке информации о заказе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOrder = (order: ApiOrder) => {
    setSelectedOrder(order);
    
    if (order.is_anonymous) {
      setSelectedCustomerId('anonymous');
    } else if (order.customer_fullname) {
      // If we have customer_fullname but need to find the customer ID
      const foundCustomer = customers.find(c => c.name === order.customer_fullname);
      setSelectedCustomerId(foundCustomer?.id || 'anonymous');
    } else if (order.customer) {
      const customerId = order.customer.id?.toString();
      setSelectedCustomerId(customerId || 'anonymous');
    } else {
      setSelectedCustomerId('anonymous');
    }
    
    setPaymentMethod(order.payment_method as 'cash' | 'card' | 'mixed' | 'nasiya');
    setDiscount(parseFloat(order.discount));
    setDiscountInput(parseFloat(order.discount).toString());
    setDiscountType(order.discount_type as 'p' | 'c');
    setAmountPaid(parseFloat(order.covered_amount));
    setAmountPaidInput(parseFloat(order.covered_amount).toString());
    setIsEditOrderDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setIsEditingOrder(true);
    try {
      const items = selectedOrder.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const updatedOrderData: Partial<any> = {
        items,
        payment_method: paymentMethod,
        discount: discount.toString(),
        discount_type: discountType,
        covered_amount: amountPaid.toString(),
        ...(selectedCustomerId !== 'anonymous' && { customer_id: parseInt(selectedCustomerId) }),
      };

      const updatedOrder = await orderApi.update(selectedOrder.id, updatedOrderData);
      
      // Refresh orders list
      await fetchOrders();
      await fetchOrderStats();
      
      setIsEditOrderDialogOpen(false);
      setSelectedOrder(null);
      
      toast.success(language === 'uz' 
        ? 'Buyurtma muvaffaqiyatli yangilandi' 
        : 'Заказ успешно обновлен');
    } catch (error: any) {
      console.error('Failed to update order:', error);
      toast.error(language === 'uz' 
        ? `Buyurtmani yangilashda xatolik: ${error.message}` 
        : `Ошибка при обновлении заказа: ${error.message}`);
    } finally {
      setIsEditingOrder(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm(language === 'uz' 
      ? 'Buyurtmani o\'chirishni istaysizmi?' 
      : 'Вы уверены, что хотите удалить заказ?')) {
      return;
    }

    setIsDeletingOrder(prev => ({ ...prev, [orderId]: true }));
    try {
      await orderApi.delete(orderId);
      
      // Refresh orders list
      await fetchOrders();
      await fetchOrderStats();
      
      toast.success(language === 'uz' 
        ? 'Buyurtma o\'chirildi' 
        : 'Заказ удален');
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      toast.error(language === 'uz' 
        ? `Buyurtmani o\'chirishda xatolik: ${error.message}` 
        : `Ошибка при удалении заказа: ${error.message}`);
    } finally {
      setIsDeletingOrder(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch(method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'mixed':
        return <Landmark className="h-4 w-4" />;
      case 'nasiya':
        return <CreditCard className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch(method) {
      case 'cash':
        return language === 'uz' ? 'Naqd' : 'Наличные';
      case 'card':
        return language === 'uz' ? 'Karta' : 'Карта';
      case 'mixed':
        return language === 'uz' ? 'Aralash' : 'Смешанный';
      case 'nasiya':
        return language === 'uz' ? 'Nasiya' : 'Кредит';
      default:
        return method;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      cash: 'default',
      card: 'secondary',
      mixed: 'outline',
      nasiya: 'destructive',
    };
    
    return (
      <Badge variant={variants[method] || 'default'} className="flex items-center gap-1">
        {getPaymentMethodIcon(method)}
        {getPaymentMethodLabel(method)}
      </Badge>
    );
  };

  // Function to get customer display name
  const getCustomerDisplayName = (order: ApiOrder): string => {
    // First check if we have customer_fullname (from your API response)
    if (order.customer_fullname) {
      return order.customer_fullname;
    }
    
    // Then check if we have customer object
    if (order.customer && order.customer.full_name) {
      return order.customer.full_name;
    }
    
    // Default to anonymous
    return language === 'uz' ? 'Anonim mijoz' : 'Анонимный клиент';
  };

  // Function to render product details from the items array
  const renderProductDetails = (item: any) => {
    const product = item.product || {};
    const productName = product.name || `Mahsulot #${item.product_id}`;
    const productColor = product.color || '#CCCCCC';
    
    return (
      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div 
          className="h-10 w-10 rounded-md border-2 flex-shrink-0"
          style={{ backgroundColor: productColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-medium text-sm truncate max-w-[200px]">{productName}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  ID: {item.product_id}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {language === 'uz' ? 'Soni' : 'Кол-во'}: {item.quantity}
                </span>
                {product.width && product.height && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    {product.width}×{product.height}×{product.thick || '?'}mm
                  </span>
                )}
                {product.quality && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {product.quality}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm whitespace-nowrap">
                {formatCurrency(item.price)} UZS
              </p>
              <p className="text-xs text-gray-500">
                {language === 'uz' ? 'Jami' : 'Итого'}: {formatCurrency(parseFloat(item.price) * item.quantity)} UZS
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to render cutting service details
  const renderCuttingDetails = (cutting: any) => {
    if (!cutting) return null;
    
    return (
      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
          <Scissors className="h-3 w-3" />
          {language === 'uz' ? 'Kesish xizmati' : 'Услуга распила'}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">{language === 'uz' ? 'Soni' : 'Кол-во'}:</span>
            <span className="ml-1 font-medium">{cutting.count}</span>
          </div>
          <div>
            <span className="text-gray-500">{language === 'uz' ? 'Narxi' : 'Цена'}:</span>
            <span className="ml-1 font-medium">{formatCurrency(cutting.price)} UZS</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">{language === 'uz' ? 'Jami' : 'Итого'}:</span>
            <span className="ml-1 font-medium">{formatCurrency(cutting.total_price)} UZS</span>
          </div>
        </div>
      </div>
    );
  };

  // Function to render banding service details
  const renderBandingDetails = (banding: any) => {
    if (!banding) return null;
    
    const thickness = banding.thickness || {};
    
    return (
      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300 mb-1">
          <Layers className="h-3 w-3" />
          {language === 'uz' ? 'Kromkalash xizmati' : 'Услуга кромкования'}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">{language === 'uz' ? 'Qalinlik' : 'Толщина'}:</span>
            <span className="ml-1 font-medium">{thickness.size || '?'} mm</span>
          </div>
          <div>
            <span className="text-gray-500">{language === 'uz' ? 'Narxi' : 'Цена'}:</span>
            <span className="ml-1 font-medium">{thickness.price ? formatCurrency(thickness.price) : '0'} UZS</span>
          </div>
          <div>
            <span className="text-gray-500">{language === 'uz' ? 'Eni' : 'Ширина'}:</span>
            <span className="ml-1 font-medium">{banding.width} mm</span>
          </div>
          <div>
            <span className="text-gray-500">{language === 'uz' ? 'Bo\'yi' : 'Высота'}:</span>
            <span className="ml-1 font-medium">{banding.height} mm</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('soldProducts')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {language === 'uz' 
              ? 'Barcha sotilgan mahsulotlar va buyurtmalar' 
              : 'Просмотр всех проданных товаров и заказов'}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            fetchOrders();
            fetchOrderStats();
          }}
          disabled={isFetchingOrders || isFetchingOrderStats}
          className="self-start sm:self-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingOrders || isFetchingOrderStats ? 'animate-spin' : ''}`} />
          {language === 'uz' ? 'Yangilash' : 'Обновить'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('total')}</CardTitle>
            <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {isFetchingOrderStats ? (
              <div className="h-6 sm:h-8 w-12 sm:w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold">{orderStats?.total_sales || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? 'Jami sotuvlar' : 'Всего продаж'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('todayRevenue')}</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {isFetchingOrderStats ? (
              <div className="h-6 sm:h-8 w-20 sm:w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-lg sm:text-2xl font-bold">
                  {formatCurrency(orderStats?.today_income || 0)} UZS
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? 'Bugungi daromad' : 'Доход за сегодня'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('totalRevenue')}</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {isFetchingOrderStats ? (
              <div className="h-6 sm:h-8 w-20 sm:w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-lg sm:text-2xl font-bold">
                  {formatCurrency(orderStats?.total_income || 0)} UZS
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? 'Umumiy daromad' : 'Общий доход'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader className="px-3 sm:px-4 py-2 sm:py-3">
          <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            {language === 'uz' ? 'Buyurtmalar tarixi' : 'История заказов'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'uz' 
              ? 'Barcha buyurtmalar ro\'yxati' 
              : 'Список всех заказов'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-3 sm:pb-4">
          {isFetchingOrders ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-xs sm:text-sm text-gray-500">
                {language === 'uz' ? 'Buyurtmalar yuklanmoqda...' : 'Загрузка заказов...'}
              </span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ReceiptIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500">
                {language === 'uz' ? 'Hozircha buyurtmalar yo\'q' : 'Нет заказов'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {orders.map((order) => {
                const customerName = getCustomerDisplayName(order);
                const isAnonymous = order.is_anonymous || !customerName || customerName === (language === 'uz' ? 'Anonim mijoz' : 'Анонимный клиент');
                
                return (
                  <Card key={order.id} className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Order Header - Always Visible */}
                    <div 
                      className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => toggleOrderExpand(order.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              #{order.id}
                            </Badge>
                            
                            {/* Customer Info - FIXED: Show customer_fullname if available */}
                            {isAnonymous ? (
                              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                <User className="h-3 w-3" />
                                {language === 'uz' ? 'Anonim mijoz' : 'Анонимный клиент'}
                              </Badge>
                            ) : (
                              <Badge variant="default" className="flex items-center gap-1 text-xs max-w-[200px]">
                                <UserCheck className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{customerName}</span>
                              </Badge>
                            )}
                            
                            {/* Payment Method Badge */}
                            {getPaymentMethodBadge(order.payment_method)}
                          </div>
                          
                          {/* Date and Time */}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(order.created_at)}</span>
                            <Clock className="h-3 w-3 ml-1" />
                            <span>{formatTime(order.created_at)}</span>
                          </div>
                          
                          {/* Items Count */}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Package className="h-3 w-3" />
                            <span>
                              {order.items.length} {language === 'uz' ? 'mahsulot' : 'товаров'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-500">{t('total')}</p>
                            <p className="text-base sm:text-lg font-bold text-blue-600 break-all">
                              {formatCurrency(order.total_price)} UZS
                            </p>
                            {order.payment_method === 'nasiya' && (
                              <div className="text-xs">
                                <span className="text-gray-500">
                                  {language === 'uz' ? 'To\'langan' : 'Оплачено'}: 
                                </span>
                                <span className="ml-1 font-medium text-green-600">
                                  {formatCurrency(order.covered_amount)} UZS
                                </span>
                                <br />
                                <span className="text-gray-500">
                                  {language === 'uz' ? 'Qarz' : 'Долг'}: 
                                </span>
                                <span className="ml-1 font-medium text-red-600">
                                  {(parseFloat(order.total_price) - parseFloat(order.covered_amount)).toLocaleString()} UZS
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-1 mt-2 sm:mt-0 self-end sm:self-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOrderDetails(order.id);
                              }}
                              title={language === 'uz' ? 'Ko\'rish' : 'Просмотр'}
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOrder(order);
                              }}
                              title={language === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Order Details - Shows when clicked */}
                    {expandedOrderId === order.id && (
                      <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="space-y-3">
                          {/* Customer Details (if not anonymous and has customer data) */}
                          {!isAnonymous && (
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                {language === 'uz' ? 'Mijoz ma\'lumotlari' : 'Информация о клиенте'}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-600 dark:text-gray-400">{customerName}</span>
                                </div>
                                {order.customer?.phone_number && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">{order.customer.phone_number}</span>
                                  </div>
                                )}
                                {order.customer?.location && (
                                  <div className="flex items-center gap-1 sm:col-span-2">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">{order.customer.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Products List */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {language === 'uz' ? 'Mahsulotlar' : 'Товары'}
                            </h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="space-y-2">
                                  {renderProductDetails(item)}
                                  
                                  {/* Cutting Service */}
                                  {item.cutting && renderCuttingDetails(item.cutting)}
                                  
                                  {/* Banding Service */}
                                  {item.banding && renderBandingDetails(item.banding)}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Order Summary */}
                          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              {language === 'uz' ? 'Buyurtma summasi' : 'Сумма заказа'}
                            </h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">{t('subtotal')}</span>
                                <span>{(parseFloat(order.total_price) + parseFloat(order.discount)).toLocaleString()} UZS</span>
                              </div>
                              {parseFloat(order.discount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>{t('discount')}</span>
                                  <span>-{parseFloat(order.discount).toLocaleString()} UZS</span>
                                </div>
                              )}
                              <Separator className="my-1" />
                              <div className="flex justify-between font-bold">
                                <span>{t('total')}</span>
                                <span className="text-blue-600">{parseFloat(order.total_price).toLocaleString()} UZS</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Nasiya Payment Details */}
                          {order.payment_method === 'nasiya' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                              <h4 className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {language === 'uz' ? 'To\'lov ma\'lumotlari' : 'Информация об оплате'}
                              </h4>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {language === 'uz' ? 'To\'langan summa' : 'Оплаченная сумма'}
                                  </span>
                                  <span className="font-medium text-green-600">
                                    {parseFloat(order.covered_amount).toLocaleString()} UZS
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {language === 'uz' ? 'Qolgan qarz' : 'Оставшийся долг'}
                                  </span>
                                  <span className="font-medium text-red-600">
                                    {(parseFloat(order.total_price) - parseFloat(order.covered_amount)).toLocaleString()} UZS
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{t('editSale')}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {language === 'uz' 
                ? 'Sotuv ma\'lumotlarini o\'zgartiring' 
                : 'Измените информацию о продаже'}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{t('receiptNumber')}</Label>
                <Input value={selectedSale.receiptNumber} disabled className="text-sm" />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{t('subtotal')}</Label>
                <Input 
                  value={`${formatCurrency(selectedSale.subtotal)} UZS`} 
                  disabled 
                  className="text-sm"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="discount" className="text-xs sm:text-sm">{t('discount')}</Label>
                <Input
                  id="discount"
                  type="number"
                  value={editedDiscount}
                  onChange={(e) => setEditedDiscount(Number(e.target.value))}
                  min={0}
                  max={selectedSale.subtotal}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="paymentMethod" className="text-xs sm:text-sm">{t('paymentMethod')}</Label>
                <Select value={editedPaymentMethod} onValueChange={(value: any) => setEditedPaymentMethod(value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-sm">{t('cash')}</SelectItem>
                    <SelectItem value="card" className="text-sm">{t('card')}</SelectItem>
                    <SelectItem value="mixed" className="text-sm">{t('mixed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{t('total')}</Label>
                <Input 
                  value={`${formatCurrency(selectedSale.subtotal - editedDiscount)} UZS`} 
                  disabled 
                  className="text-sm font-semibold"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto text-sm">
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveEdit} className="w-full sm:w-auto text-sm">
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{t('viewDetails')}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {language === 'uz' 
                ? 'Sotuv to\'liq ma\'lumotlari' 
                : 'Полная информация о продаже'}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('receiptNumber')}</p>
                  <p className="text-sm font-semibold">{selectedSale.receiptNumber}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('salesperson')}</p>
                  <p className="text-sm font-semibold">{selectedSale.salespersonName}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('date')}</p>
                  <p className="text-sm font-semibold">{formatDate(selectedSale.createdAt)}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('time')}</p>
                  <p className="text-sm font-semibold">{formatTime(selectedSale.createdAt)}</p>
                </div>
              </div>

              <div className="border-t pt-3 sm:pt-4">
                <h4 className="text-sm font-semibold mb-2 sm:mb-3">{language === 'uz' ? 'Mahsulotlar' : 'Продукты'}</h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate max-w-[200px]">{item.product.name}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                          <p>{t('quantity')}: {item.quantity}</p>
                          {item.customWidth && item.customHeight && (
                            <p>{t('dimensions')}: {item.customWidth}x{item.customHeight} mm</p>
                          )}
                          {item.cuttingService && (
                            <p>{t('cuttingService')}: {formatCurrency(item.cuttingService.total)} UZS</p>
                          )}
                          {item.edgeBandingService && (
                            <p>{t('edgeBandingService')}: {formatCurrency(item.edgeBandingService.total)} UZS</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-semibold whitespace-nowrap">
                          {formatCurrency(item.product.unitPrice * item.quantity)} UZS
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 sm:pt-4 space-y-1 sm:space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('subtotal')}</span>
                  <span className="font-semibold">{formatCurrency(selectedSale.subtotal)} UZS</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('discount')}</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(selectedSale.discount)} UZS</span>
                  </div>
                )}
                <div className="flex justify-between text-base sm:text-lg pt-1">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(selectedSale.total)} UZS</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('paymentMethod')}</span>
                  {getPaymentMethodBadge(selectedSale.paymentMethod)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)} className="text-sm">
              {language === 'uz' ? 'Yopish' : 'Закрыть'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsDialogOpen} onOpenChange={setIsOrderDetailsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              {language === 'uz' ? 'Buyurtma tafsilotlari' : 'Детали заказа'} #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-gray-500">{language === 'uz' ? 'Sana' : 'Дата'}</p>
                  <p className="text-sm font-medium">{formatDateTime(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('paymentMethod')}</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    {getPaymentMethodIcon(selectedOrder.payment_method)}
                    {getPaymentMethodLabel(selectedOrder.payment_method)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{language === 'uz' ? 'Mijoz' : 'Клиент'}</p>
                  <p className="text-sm font-medium">
                    {selectedOrder.is_anonymous 
                      ? (language === 'uz' ? 'Anonim mijoz' : 'Анонимный клиент')
                      : selectedOrder.customer_fullname || selectedOrder.customer?.full_name || '-'
                    }
                  </p>
                </div>
                {!selectedOrder.is_anonymous && selectedOrder.customer && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">{language === 'uz' ? 'Telefon' : 'Телефон'}</p>
                      <p className="text-sm font-medium">{selectedOrder.customer.phone_number || '-'}</p>
                    </div>
                    {selectedOrder.customer.location && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-500">{language === 'uz' ? 'Manzil' : 'Адрес'}</p>
                        <p className="text-sm font-medium">{selectedOrder.customer.location}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">{language === 'uz' ? 'Mahsulotlar' : 'Товары'}</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="space-y-2">
                      {renderProductDetails(item)}
                      
                      {/* Cutting Service */}
                      {item.cutting && renderCuttingDetails(item.cutting)}
                      
                      {/* Banding Service */}
                      {item.banding && renderBandingDetails(item.banding)}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('subtotal')}</span>
                  <span>{(parseFloat(selectedOrder.total_price) + parseFloat(selectedOrder.discount)).toLocaleString()} UZS</span>
                </div>
                {parseFloat(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('discount')}</span>
                    <span className="text-green-600">-{parseFloat(selectedOrder.discount).toLocaleString()} UZS</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>{t('total')}</span>
                  <span className="text-blue-600">{parseFloat(selectedOrder.total_price).toLocaleString()} UZS</span>
                </div>
                
                {selectedOrder.payment_method === 'nasiya' && (
                  <>
                    <div className="flex justify-between pt-2 text-sm">
                      <span className="text-gray-500">{language === 'uz' ? 'To\'langan' : 'Оплачено'}</span>
                      <span className="text-green-600">{parseFloat(selectedOrder.covered_amount).toLocaleString()} UZS</span>
                    </div>
                    <div className="flex justify-between font-medium text-sm text-yellow-600">
                      <span>{language === 'uz' ? 'Qarz' : 'Долг'}</span>
                      <span>{(parseFloat(selectedOrder.total_price) - parseFloat(selectedOrder.covered_amount)).toLocaleString()} UZS</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsOrderDetailsDialogOpen(false)} className="text-sm">
              {language === 'uz' ? 'Yopish' : 'Закрыть'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditOrderDialogOpen} onOpenChange={setIsEditOrderDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {language === 'uz' ? 'Buyurtmani tahrirlash' : 'Редактирование заказа'} #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
              <div>
                <Label className="text-xs sm:text-sm">{language === 'uz' ? 'Mijoz' : 'Клиент'}</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder={language === 'uz' ? 'Mijozni tanlang' : 'Выберите клиента'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonymous">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{language === 'uz' ? 'Anonim mijoz' : 'Анонимный клиент'}</span>
                      </div>
                    </SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span className="text-sm truncate max-w-[150px]">{customer.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 sm:p-3">
                  <p className="text-sm font-medium break-all">{selectedCustomer.name}</p>
                  <p className="text-xs text-gray-500 break-all">{selectedCustomer.phone}</p>
                  {selectedCustomer.address && (
                    <p className="text-xs text-gray-500 mt-1 break-all">{selectedCustomer.address}</p>
                  )}
                  {selectedCustomer.debt !== undefined && selectedCustomer.debt > 0 && (
                    <p className="text-xs text-yellow-600 font-medium mt-1">
                      {language === 'uz' ? 'Qarz' : 'Долг'}: {selectedCustomer.debt.toLocaleString()} UZS
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label className="text-xs sm:text-sm">{t('paymentMethod')}</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-sm">{t('cash')}</SelectItem>
                    <SelectItem value="card" className="text-sm">{t('card')}</SelectItem>
                    <SelectItem value="mixed" className="text-sm">{t('mixed')}</SelectItem>
                    <SelectItem value="nasiya" className="text-sm">{t('credit')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{t('discount')}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={discountInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDiscountInput(val);
                      setDiscount(parseNumericInput(val));
                    }}
                    className="text-sm flex-1"
                  />
                  <Select value={discountType} onValueChange={(value: 'p' | 'c') => setDiscountType(value)}>
                    <SelectTrigger className="w-16 sm:w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c">UZS</SelectItem>
                      <SelectItem value="p">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {paymentMethod === 'nasiya' && (
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">{language === 'uz' ? 'To\'langan summa' : 'Оплаченная сумма'}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={amountPaidInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAmountPaidInput(val);
                      setAmountPaid(parseNumericInput(val));
                    }}
                    className="text-sm"
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('total')}</span>
                  <span className="font-bold">{parseFloat(selectedOrder.total_price).toLocaleString()} UZS</span>
                </div>
                {paymentMethod === 'nasiya' && (
                  <div className="flex justify-between text-sm text-yellow-600">
                    <span>{language === 'uz' ? 'Qarz' : 'Долг'}</span>
                    <span>{Math.max(0, parseFloat(selectedOrder.total_price) - amountPaid).toLocaleString()} UZS</span>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsEditOrderDialogOpen(false)} className="w-full sm:w-auto text-sm">
                  {t('cancel')}
                </Button>
                <Button onClick={handleUpdateOrder} disabled={isEditingOrder} className="w-full sm:w-auto text-sm">
                  {isEditingOrder ? (
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : null}
                  {language === 'uz' ? 'Saqlash' : 'Сохранить'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};