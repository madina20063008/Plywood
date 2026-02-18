import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { CartItem, EdgeBandingPrice, CuttingService, EdgeBandingService, CreateOrderData, ApiOrder, Customer } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Trash2, Plus, Scissors, Ruler, ShoppingBag, Receipt as ReceiptIcon, Loader2, Minus, History, User, UserCheck, CreditCard, Banknote, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const CART_STORAGE_KEY = 'app_cart';

// Helper function to handle numeric input values
const parseNumericInput = (value: string): number => {
  if (value === '' || value === '-' || value === '0') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const CartPage: React.FC = () => {
  const { 
    cart: contextCart, 
    updateCartItem, 
    removeFromCart, 
    createOrder,
    user, 
    language, 
    clearCart, 
    customers, 
    fetchBasket,
    isFetchingBasket,
    addCuttingService,
    addEdgeBandingService,
    thicknesses,
    fetchThicknesses,
    isCreatingOrder,
    orders,
    fetchOrders,
    isFetchingOrders
  } = useApp();
  
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [isCuttingDialogOpen, setIsCuttingDialogOpen] = useState(false);
  const [isEdgeBandingDialogOpen, setIsEdgeBandingDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<ApiOrder | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('anonymous');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>({});
  const [updatingQuantities, setUpdatingQuantities] = useState<Record<string, boolean>>({});
  const [isAddingService, setIsAddingService] = useState<Record<string, boolean>>({});
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const navigate = useNavigate();

  const t = (key: string) => getTranslation(language, key as any);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setLocalCart(parsedCart);
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (localCart.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [localCart]);

  // Sync localCart with context cart
  useEffect(() => {
    if (contextCart.length > 0) {
      setLocalCart(contextCart);
    }
  }, [contextCart]);

  // Fetch basket and thicknesses on component mount
  useEffect(() => {
    if (user) {
      fetchBasket();
      fetchThicknesses();
      fetchOrders();
    }
  }, [user]);

  // Update selected customer when ID changes
  useEffect(() => {
    if (selectedCustomerId === 'anonymous') {
      setSelectedCustomer(null);
    } else {
      const customer = customers.find(c => c.id === selectedCustomerId);
      setSelectedCustomer(customer || null);
    }
  }, [selectedCustomerId, customers]);

  // Use localCart for display, fallback to contextCart
  const displayCart = localCart.length > 0 ? localCart : contextCart;

  // Cutting service form with improved numeric handling
  const [cuttingForm, setCuttingForm] = useState({
    numberOfBoards: 1,
    pricePerCut: 20000,
  });

  // Edge banding form with improved numeric handling
  const [edgeBandingForm, setEdgeBandingForm] = useState({
    thicknessId: 0,
    width: 0,
    height: 0,
    pricePerMeter: 2800,
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed' | 'nasiya'>('cash');
  const [discount, setDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState('0');
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountPaidInput, setAmountPaidInput] = useState('0');
  const [discountType, setDiscountType] = useState<'p' | 'c'>('c');

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

  const handleAddCutting = async () => {
    if (!selectedItem) return;

    if (cuttingForm.numberOfBoards <= 0) {
      toast.error(language === 'uz' 
        ? 'Kesish soni 0 dan katta bo\'lishi kerak' 
        : 'Количество резки должно быть больше 0');
      return;
    }

    if (cuttingForm.pricePerCut <= 0) {
      toast.error(language === 'uz' 
        ? 'Narx 0 dan katta bo\'lishi kerak' 
        : 'Цена должна быть больше 0');
      return;
    }

    const cuttingService: CuttingService = {
      id: Date.now().toString(),
      numberOfBoards: cuttingForm.numberOfBoards,
      pricePerCut: cuttingForm.pricePerCut,
      total: cuttingForm.numberOfBoards * cuttingForm.pricePerCut,
    };
    
    setIsAddingService(prev => ({ ...prev, [selectedItem.id]: true }));
    
    try {
      await addCuttingService(selectedItem.id, cuttingService);
      
      const updatedCart = localCart.map(item => 
        item.id === selectedItem.id 
          ? { ...item, cuttingService } 
          : item
      );
      setLocalCart(updatedCart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      
      setIsCuttingDialogOpen(false);
      toast.success(language === 'uz' 
        ? 'Kesish xizmati qo\'shildi' 
        : 'Услуга распила добавлена');
    } catch (error: any) {
      console.error('Failed to add cutting service:', error);
      toast.error(language === 'uz' 
        ? `Kesish xizmati qo\'shishda xatolik: ${error.message}` 
        : `Ошибка при добавлении услуги распила: ${error.message}`);
    } finally {
      setIsAddingService(prev => ({ ...prev, [selectedItem.id]: false }));
    }
  };

  const handleAddEdgeBanding = async () => {
    if (!selectedItem) return;

    const selectedThickness = thicknesses.find(t => t.id === edgeBandingForm.thicknessId);
    if (!selectedThickness) {
      toast.error(language === 'uz' ? 'Qalinlik tanlang' : 'Выберите толщину');
      return;
    }

    if (edgeBandingForm.width <= 0 || edgeBandingForm.height <= 0) {
      toast.error(language === 'uz' 
        ? 'O\'lchamlar 0 dan katta bo\'lishi kerak' 
        : 'Размеры должны быть больше 0');
      return;
    }

    const perimeter = 2 * (edgeBandingForm.width + edgeBandingForm.height);
    const linearMeters = perimeter / 1000;
    const pricePerMeter = parseFloat(selectedThickness.price);
    const total = linearMeters * pricePerMeter;

    const edgeBandingService: EdgeBandingService = {
      id: Date.now().toString(),
      thickness: parseFloat(selectedThickness.size),
      thicknessId: selectedThickness.id,
      width: edgeBandingForm.width,
      height: edgeBandingForm.height,
      pricePerMeter: pricePerMeter,
      linearMeters,
      total,
    };
    
    setIsAddingService(prev => ({ ...prev, [selectedItem.id]: true }));
    
    try {
      await addEdgeBandingService(selectedItem.id, edgeBandingService);
      
      const updatedCart = localCart.map(item => 
        item.id === selectedItem.id 
          ? { ...item, edgeBandingService } 
          : item
      );
      setLocalCart(updatedCart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      
      setIsEdgeBandingDialogOpen(false);
      toast.success(language === 'uz' 
        ? 'Kromkalash xizmati qo\'shildi' 
        : 'Услуга кромкования добавлена');
    } catch (error: any) {
      console.error('Failed to add edge banding service:', error);
      toast.error(language === 'uz' 
        ? `Kromkalash xizmati qo\'shishda xatolik: ${error.message}` 
        : `Ошибка при добавлении услуги кромкования: ${error.message}`);
    } finally {
      setIsAddingService(prev => ({ ...prev, [selectedItem.id]: false }));
    }
  };

  const calculateItemTotal = (item: CartItem): number => {
    let total = item.product.unitPrice * item.quantity;
    if (item.cuttingService) total += item.cuttingService.total;
    if (item.edgeBandingService) total += item.edgeBandingService.total;
    return total;
  };

  const subtotal = displayCart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  
  const calculateDiscount = () => {
    if (discountType === 'p') {
      return (subtotal * discount) / 100;
    } else {
      return Math.min(discount, subtotal);
    }
  };
  
  const discountAmount = calculateDiscount();
  const total = subtotal - discountAmount;
  const remainingDebt = paymentMethod === 'nasiya' ? Math.max(0, total - amountPaid) : 0;

  const handleCheckout = async () => {
    if (displayCart.length === 0) return;

    setIsLoading(true);
    try {
      const items = displayCart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const cuttingItem = displayCart.find(item => item.cuttingService);
      const cutting = cuttingItem?.cuttingService ? {
        count: cuttingItem.cuttingService.numberOfBoards,
        price: cuttingItem.cuttingService.pricePerCut.toString(),
      } : undefined;

      const bandingItem = displayCart.find(item => item.edgeBandingService);
      const banding = bandingItem?.edgeBandingService ? {
        thickness: bandingItem.edgeBandingService.thicknessId || 0,
        width: bandingItem.edgeBandingService.width.toString(),
        height: bandingItem.edgeBandingService.height.toString(),
      } : undefined;

      let coveredAmount: string;
      if (paymentMethod === 'nasiya') {
        coveredAmount = amountPaid.toString();
      } else {
        coveredAmount = total.toString();
      }

      const orderData: CreateOrderData = {
        items,
        payment_method: paymentMethod,
        discount: discountAmount.toString(),
        discount_type: discountType,
        covered_amount: coveredAmount,
        ...(selectedCustomerId !== 'anonymous' && { customer_id: parseInt(selectedCustomerId) }),
        ...(cutting && { cutting }),
        ...(banding && { banding }),
      };

      console.log('Creating order with data:', orderData);

      const newOrder = await createOrder(orderData);

      localStorage.removeItem(CART_STORAGE_KEY);
      setLocalCart([]);
      
      try {
        await clearCart();
      } catch (clearError) {
        console.warn('Error clearing cart after order:', clearError);
      }

      setOrderSuccess(newOrder);
      setSelectedCustomerId('anonymous');
      setPaymentMethod('cash');
      setDiscount(0);
      setDiscountInput('0');
      setAmountPaid(0);
      setAmountPaidInput('0');
      
      await fetchOrders();
      
      toast.success(language === 'uz' 
        ? 'Buyurtma muvaffaqiyatli yaratildi' 
        : 'Заказ успешно создан');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(language === 'uz' 
        ? `Buyurtma yaratishda xatolik: ${error.message}` 
        : `Ошибка при создании заказа: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsCheckoutDialogOpen(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => ({ ...prev, [itemId]: true }));
    try {
      await removeFromCart(itemId);
      
      const updatedCart = localCart.filter(item => item.id !== itemId);
      setLocalCart(updatedCart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      
      toast.success(language === 'uz' 
        ? 'Mahsulot savatchadan o\'chirildi' 
        : 'Товар удален из корзины');
    } catch (error) {
      toast.error(language === 'uz' 
        ? 'O\'chirishda xatolik yuz berdi' 
        : 'Ошибка при удалении');
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingQuantities(prev => ({ ...prev, [itemId]: true }));
    try {
      await updateCartItem(itemId, newQuantity);
      
      const updatedCart = localCart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setLocalCart(updatedCart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      
    } catch (error) {
      toast.error(language === 'uz' 
        ? 'Miqdorni yangilashda xatolik yuz berdi' 
        : 'Ошибка при обновлении количества');
    } finally {
      setUpdatingQuantities(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm(language === 'uz' 
      ? 'Savatchani tozalashni istaysizmi?' 
      : 'Вы уверены, что хотите очистить корзину?')) {
      try {
        await clearCart();
        
        localStorage.removeItem(CART_STORAGE_KEY);
        setLocalCart([]);
        
        toast.success(language === 'uz' 
          ? 'Savatcha tozalandi' 
          : 'Корзина очищена');
      } catch (error) {
        toast.error(language === 'uz' 
          ? 'Tozalashda xatolik yuz berdi' 
          : 'Ошибка при очистке');
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'uz' ? 'uz-UZ' : 'ru-RU');
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

  if (orderSuccess) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center bg-green-50 dark:bg-green-900/20 px-4 sm:px-6">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <ReceiptIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-green-700 dark:text-green-400">
              {language === 'uz' ? 'Buyurtma muvaffaqiyatli yaratildi!' : 'Заказ успешно создан!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderNumber')}</p>
                <p className="text-xl sm:text-2xl font-bold">#{orderSuccess.id}</p>
              </div>
              
              {orderSuccess.is_anonymous === false && orderSuccess.customer && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="truncate max-w-[200px] sm:max-w-none">
                    {language === 'uz' ? 'Mijoz' : 'Клиент'}: {orderSuccess.customer.full_name}
                  </span>
                </div>
              )}
              
              {orderSuccess.is_anonymous && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">
                    {language === 'uz' ? 'Anonim mijoz' : 'Анонимный клиент'}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('paymentMethod')}:</span>
                  <span className="flex items-center gap-1">
                    {getPaymentMethodIcon(orderSuccess.payment_method)}
                    {getPaymentMethodLabel(orderSuccess.payment_method)}
                  </span>
                </div>
                
                {orderSuccess.payment_method === 'nasiya' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{language === 'uz' ? 'To\'langan' : 'Оплачено'}:</span>
                    <span>{parseFloat(orderSuccess.covered_amount).toLocaleString()} UZS</span>
                  </div>
                )}
                
                {orderSuccess.payment_method === 'nasiya' && parseFloat(orderSuccess.covered_amount) < parseFloat(orderSuccess.total_price) && (
                  <div className="flex justify-between text-sm text-yellow-600 font-semibold">
                    <span>{language === 'uz' ? 'Qarz' : 'Долг'}:</span>
                    <span>{(parseFloat(orderSuccess.total_price) - parseFloat(orderSuccess.covered_amount)).toLocaleString()} UZS</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('total')}</p>
                <p className="text-2xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 break-all">
                  {parseFloat(orderSuccess.total_price).toLocaleString()} UZS
                </p>
              </div>
              
              <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(orderSuccess.created_at)}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 px-4 sm:px-6">
            <Button className="w-full sm:w-auto sm:flex-1" size={isMobile ? "default" : "lg"} onClick={handlePrintReceipt}>
              {t('print')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto sm:flex-1" 
              size={isMobile ? "default" : "lg"}
              onClick={() => {
                setOrderSuccess(null);
                navigate('/products');
              }}
            >
              {language === 'uz' ? 'Yangi buyurtma' : 'Новый заказ'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isFetchingBasket) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-sm sm:text-base text-gray-500">
          {language === 'uz' ? 'Savatcha yuklanmoqda...' : 'Загрузка корзины...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('cart')}</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' ? 'Savatchadagi mahsulotlar va xizmatlar' : 'Продукты и услуги в корзине'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={() => setShowOrders(!showOrders)}
            className="flex-1 sm:flex-none"
          >
            <History className="mr-2 h-4 w-4" />
            <span className="truncate">
              {showOrders ? (language === 'uz' ? 'Savatcha' : 'Корзина') : (language === 'uz' ? 'Tarix' : 'История')}
            </span>
          </Button>
          {displayCart.length > 0 && !showOrders && (
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={handleClearCart}
              className="flex-1 sm:flex-none"
            >
              {language === 'uz' ? 'Tozalash' : 'Очистить'}
            </Button>
          )}
        </div>
      </div>

      {showOrders ? (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <History className="h-5 w-5" />
              {language === 'uz' ? 'Buyurtmalar tarixi' : 'История заказов'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {isFetchingOrders ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-sm sm:text-base text-gray-500">
                  {language === 'uz' ? 'Buyurtmalar yuklanmoqda...' : 'Загрузка заказов...'}
                </span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ReceiptIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <p className="mt-4 text-sm sm:text-base text-gray-500">
                  {language === 'uz' ? 'Hozircha buyurtmalar yo\'q' : 'Нет заказов'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm text-gray-500">#{order.id}</span>
                            <Badge variant={order.is_anonymous ? "secondary" : "default"} className="text-xs">
                              {order.is_anonymous ? (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">
                                    {language === 'uz' ? 'Anonim' : 'Аноним'}
                                  </span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">
                                    {order.customer?.full_name || 'Mijoz'}
                                  </span>
                                </span>
                              )}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            {getPaymentMethodIcon(order.payment_method)}
                            <span>{getPaymentMethodLabel(order.payment_method)}</span>
                            {order.payment_method === 'nasiya' && (
                              <>
                                <span className="text-gray-400">|</span>
                                <span className="text-yellow-600">
                                  {language === 'uz' ? 'Qarz' : 'Долг'}: {(parseFloat(order.total_price) - parseFloat(order.covered_amount)).toLocaleString()} UZS
                                </span>
                              </>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            {formatDateTime(order.created_at)}
                          </p>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-gray-500">{t('total')}</p>
                          <p className="text-base sm:text-xl font-bold text-blue-600 break-all">
                            {parseFloat(order.total_price).toLocaleString()} UZS
                          </p>
                          {order.payment_method === 'nasiya' && (
                            <p className="text-xs text-gray-500">
                              {language === 'uz' ? 'To\'langan' : 'Оплачено'}: {parseFloat(order.covered_amount).toLocaleString()} UZS
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="text-xs sm:text-sm">
                        <p className="font-medium mb-2">
                          {language === 'uz' ? 'Mahsulotlar' : 'Товары'}:
                        </p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-gray-600 dark:text-gray-400">
                              <span className="truncate max-w-[150px] sm:max-w-none">{item.product_id} x {item.quantity}</span>
                              <span className="whitespace-nowrap ml-2">{parseFloat(item.price).toLocaleString()} UZS</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : displayCart.length === 0 ? (
        <Card>
          <CardContent className="py-12 sm:py-16 px-4">
            <div className="text-center">
              <ShoppingBag className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
              <p className="mt-4 text-base sm:text-xl text-gray-500 dark:text-gray-400">{t('emptyCart')}</p>
              <Button className="mt-6" size={isMobile ? "default" : "lg"} onClick={() => navigate('/products')}>
                {language === 'uz' ? 'Mahsulotlarni ko\'rish' : 'Посмотреть продукты'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {displayCart.map((item) => {
              const isRemoving = removingItems[item.id];
              const isUpdating = updatingQuantities[item.id];
              const isAdding = isAddingService[item.id];
              
              return (
                <Card key={item.id} className={isRemoving ? 'opacity-50' : ''}>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div 
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg border-2 flex-shrink-0 mx-auto sm:mx-0"
                        style={{ backgroundColor: item.product.color }}
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg">{item.product.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {item.product.width} × {item.product.height} × {item.product.thickness} mm
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isRemoving}
                            className="text-red-600 hover:text-red-700 self-end sm:self-start"
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">{t('quantity')}:</Label>
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-l-lg"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdating}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-10 text-center text-sm">
                                {isUpdating ? (
                                  <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-r-lg"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.product.stockQuantity || 0) || isUpdating}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="font-semibold text-sm sm:text-base">{item.product.unitPrice.toLocaleString()} UZS</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Dialog open={isCuttingDialogOpen && selectedItem?.id === item.id} onOpenChange={(open) => {
                            setIsCuttingDialogOpen(open);
                            if (open) setSelectedItem(item);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isRemoving || isAdding} className="text-xs sm:text-sm">
                                <Scissors className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate max-w-[80px] sm:max-w-none">
                                  {item.cuttingService ? (
                                    language === 'uz' ? 'Kesish' : 'Распил'
                                  ) : (
                                    t('addCutting')
                                  )}
                                </span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-md mx-auto">
                              <DialogHeader>
                                <DialogTitle className="text-lg">{t('cuttingService')}</DialogTitle>
                                <DialogDescription className="text-sm">
                                  {language === 'uz' 
                                    ? 'Kesish xizmati parametrlarini kiriting' 
                                    : 'Введите параметры услуги резки'}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm">{t('numberOfBoards')}</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={cuttingForm.numberOfBoards || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setCuttingForm({ 
                                        ...cuttingForm, 
                                        numberOfBoards: val === '' ? 0 : Math.max(1, parseNumericInput(val))
                                      });
                                    }}
                                    onBlur={() => {
                                      if (cuttingForm.numberOfBoards < 1) {
                                        setCuttingForm({ ...cuttingForm, numberOfBoards: 1 });
                                      }
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">{t('pricePerCut')} (UZS)</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={cuttingForm.pricePerCut || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setCuttingForm({ 
                                        ...cuttingForm, 
                                        pricePerCut: val === '' ? 0 : Math.max(1, parseNumericInput(val))
                                      });
                                    }}
                                    onBlur={() => {
                                      if (cuttingForm.pricePerCut < 1) {
                                        setCuttingForm({ ...cuttingForm, pricePerCut: 20000 });
                                      }
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('total')}</p>
                                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 break-all">
                                    {(cuttingForm.numberOfBoards * cuttingForm.pricePerCut).toLocaleString()} UZS
                                  </p>
                                </div>
                                <Button 
                                  className="w-full" 
                                  onClick={handleAddCutting}
                                  disabled={isAdding}
                                >
                                  {isAdding ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  {t('add')}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isEdgeBandingDialogOpen && selectedItem?.id === item.id} onOpenChange={(open) => {
                            setIsEdgeBandingDialogOpen(open);
                            if (open) {
                              setSelectedItem(item);
                              setEdgeBandingForm({
                                ...edgeBandingForm,
                                width: item.product.width,
                                height: item.product.height,
                              });
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isRemoving || isAdding} className="text-xs sm:text-sm">
                                <Ruler className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate max-w-[80px] sm:max-w-none">
                                  {item.edgeBandingService ? (
                                    language === 'uz' ? 'Kromka' : 'Кромка'
                                  ) : (
                                    t('addEdgeBanding')
                                  )}
                                </span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-md mx-auto">
                              <DialogHeader>
                                <DialogTitle className="text-lg">{t('edgeBandingService')}</DialogTitle>
                                <DialogDescription className="text-sm">
                                  {language === 'uz' 
                                    ? 'Kromkalash xizmati parametrlarini kiriting' 
                                    : 'Введите параметры услуги кромкования'}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm">{t('thickness')}</Label>
                                  <Select 
                                    value={edgeBandingForm.thicknessId.toString()} 
                                    onValueChange={(value) => {
                                      const selected = thicknesses.find(t => t.id === parseInt(value));
                                      if (selected) {
                                        setEdgeBandingForm({
                                          ...edgeBandingForm,
                                          thicknessId: selected.id,
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue placeholder={language === 'uz' ? 'Qalinlik tanlang' : 'Выберите толщину'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {thicknesses.map((thickness) => (
                                        <SelectItem key={thickness.id} value={thickness.id.toString()} className="text-sm">
                                          {thickness.size} mm - {parseFloat(thickness.price).toLocaleString()} UZS/{language === 'uz' ? 'м' : 'м'}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm">{t('width')} (mm)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={edgeBandingForm.width || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setEdgeBandingForm({ 
                                          ...edgeBandingForm, 
                                          width: val === '' ? 0 : Math.max(1, parseNumericInput(val))
                                        });
                                      }}
                                      onBlur={() => {
                                        if (edgeBandingForm.width < 1) {
                                          setEdgeBandingForm({ ...edgeBandingForm, width: item.product.width });
                                        }
                                      }}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">{t('height')} (mm)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={edgeBandingForm.height || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setEdgeBandingForm({ 
                                          ...edgeBandingForm, 
                                          height: val === '' ? 0 : Math.max(1, parseNumericInput(val))
                                        });
                                      }}
                                      onBlur={() => {
                                        if (edgeBandingForm.height < 1) {
                                          setEdgeBandingForm({ ...edgeBandingForm, height: item.product.height });
                                        }
                                      }}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                                {edgeBandingForm.thicknessId !== 0 && (
                                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm">
                                      <span className="text-gray-600 dark:text-gray-400">{t('linearMeters')}</span>
                                      <span className="font-medium">
                                        {((2 * (edgeBandingForm.width + edgeBandingForm.height)) / 1000).toFixed(2)} {language === 'uz' ? 'м' : 'м'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">{t('total')}</span>
                                      <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 break-all">
                                        {((2 * (edgeBandingForm.width + edgeBandingForm.height) / 1000) * 
                                          (thicknesses.find(t => t.id === edgeBandingForm.thicknessId)?.price 
                                            ? parseFloat(thicknesses.find(t => t.id === edgeBandingForm.thicknessId)!.price) 
                                            : 0)).toLocaleString()} UZS
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <Button 
                                  className="w-full" 
                                  onClick={handleAddEdgeBanding}
                                  disabled={isAdding || edgeBandingForm.thicknessId === 0}
                                >
                                  {isAdding ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  {t('add')}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {(item.cuttingService || item.edgeBandingService) && (
                          <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-xs sm:text-sm">
                            {item.cuttingService && (
                              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t('cuttingService')} ({item.cuttingService.numberOfBoards}×)
                                </span>
                                <span className="font-medium">{item.cuttingService.total.toLocaleString()} UZS</span>
                              </div>
                            )}
                            {item.edgeBandingService && (
                              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t('edgeBandingService')} ({item.edgeBandingService.linearMeters.toFixed(2)}{language === 'uz' ? 'м' : 'м'})
                                </span>
                                <span className="font-medium">{item.edgeBandingService.total.toLocaleString()} UZS</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="font-medium text-sm">{language === 'uz' ? 'Jami:' : 'Итого:'}</span>
                          <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 break-all">
                            {calculateItemTotal(item).toLocaleString()} UZS
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  {language === 'uz' ? 'To\'lov ma\'lumotlari' : 'Информация об оплате'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                    <span className="font-medium">{subtotal.toLocaleString()} UZS</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <Label className="text-sm flex-shrink-0">{t('discountType')}:</Label>
                    <Select value={discountType} onValueChange={(value: 'p' | 'c') => setDiscountType(value)}>
                      <SelectTrigger className="w-full sm:w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="c">{language === 'uz' ? 'UZS' : 'UZS'}</SelectItem>
                        <SelectItem value="p">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Label className="text-sm flex-shrink-0">{t('discount')}:</Label>
                    <Input
                      type="number"
                      min="0"
                      max={discountType === 'p' ? 100 : subtotal}
                      value={discountInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || val === '-' || val === '0') {
                          setDiscountInput('');
                        } else {
                          const parsed = parseFloat(val);
                          if (!isNaN(parsed)) {
                            setDiscountInput(val);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (discountType === 'p') {
                          if (discount > 100) {
                            setDiscount(100);
                            setDiscountInput('100');
                          }
                        } else {
                          if (discount > subtotal) {
                            setDiscount(subtotal);
                            setDiscountInput(subtotal.toString());
                          }
                        }
                      }}
                      className="w-full text-sm"
                    />
                  </div>
                  
                  {discount > 0 && (
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right">
                      {language === 'uz' ? 'Chegirma' : 'Скидка'}: -{discountAmount.toLocaleString()} UZS
                    </div>
                  )}
                </div>
                
                <Separator />
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 break-all">
                    {total.toLocaleString()} UZS
                  </span>
                </div>
                
                <div>
                  <Label className="text-sm">{t('paymentMethod')}</Label>
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
                
                {paymentMethod === 'nasiya' && (
                  <div className="space-y-2">
                    <Label className="text-sm">{language === 'uz' ? 'To\'langan summa' : 'Оплаченная сумма'} (UZS)</Label>
                    <Input
                      type="number"
                      min="0"
                      max={total}
                      value={amountPaidInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || val === '-' || val === '0') {
                          setAmountPaidInput('0');
                        } else {
                          const parsed = parseFloat(val);
                          if (!isNaN(parsed)) {
                            setAmountPaidInput(val);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (amountPaid > total) {
                          setAmountPaid(total);
                          setAmountPaidInput(total.toString());
                        }
                      }}
                      className="w-full text-sm"
                      placeholder={language === 'uz' ? '0 = To\'liq nasiya' : '0 = Полный кредит'}
                    />
                    <p className="text-xs text-yellow-600 font-semibold break-all">
                      {language === 'uz' 
                        ? `Qolgan qarz: ${remainingDebt.toLocaleString()} UZS` 
                        : `Остаток долга: ${remainingDebt.toLocaleString()} UZS`}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 px-4 sm:px-6">
                <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      size={isMobile ? "default" : "lg"}
                      disabled={displayCart.length === 0 || isLoading || isCreatingOrder}
                    >
                      {isLoading || isCreatingOrder ? (
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      ) : (
                        <ReceiptIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                      {t('checkout')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {language === 'uz' ? 'Buyurtmani tasdiqlash' : 'Подтверждение заказа'}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        {language === 'uz' 
                          ? 'Buyurtma ma\'lumotlarini tekshiring va tasdiqlang' 
                          : 'Проверьте и подтвердите информацию о заказе'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <Label className="text-sm">{language === 'uz' ? 'Mijoz' : 'Клиент'}</Label>
                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder={language === 'uz' ? 'Mijozni tanlang' : 'Выберите клиента'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="anonymous">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {language === 'uz' ? 'Anonim mijoz' : 'Анонимный клиент'}
                                </span>
                              </div>
                            </SelectItem>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{customer.name}</span>
                                  <span className="text-xs text-gray-500 truncate">({customer.phone})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCustomer && (
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                          <p className="text-sm font-medium break-all">{selectedCustomer.name}</p>
                          <p className="text-xs text-gray-500 break-all">{selectedCustomer.phone}</p>
                          {selectedCustomer.address && (
                            <p className="text-xs text-gray-500 mt-1 break-all">{selectedCustomer.address}</p>
                          )}
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{t('subtotal')}</span>
                          <span className="break-all">{subtotal.toLocaleString()} UZS</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t('discount')}</span>
                            <span className="text-green-600 break-all">-{discountAmount.toLocaleString()} UZS</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold">
                          <span>{t('total')}</span>
                          <span className="text-base sm:text-lg text-blue-600 break-all">{total.toLocaleString()} UZS</span>
                        </div>
                        
                        {paymentMethod === 'nasiya' && (
                          <>
                            <div className="flex justify-between text-sm pt-2">
                              <span className="text-gray-500">{language === 'uz' ? 'To\'langan' : 'Оплачено'}</span>
                              <span className="break-all">{amountPaid.toLocaleString()} UZS</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-yellow-600">
                              <span>{language === 'uz' ? 'Qarz' : 'Долг'}</span>
                              <span className="break-all">{remainingDebt.toLocaleString()} UZS</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{t('paymentMethod')}</span>
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(paymentMethod)}
                          {getPaymentMethodLabel(paymentMethod)}
                        </span>
                      </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)} className="w-full sm:w-auto">
                        {t('cancel')}
                      </Button>
                      <Button onClick={handleCheckout} disabled={isLoading || isCreatingOrder} className="w-full sm:w-auto">
                        {isLoading || isCreatingOrder ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {language === 'uz' ? 'Tasdiqlash' : 'Подтвердить'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};