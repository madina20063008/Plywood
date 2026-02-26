import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Product, CartItem } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, ShoppingCart, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

// Local storage key
const CART_STORAGE_KEY = 'app_cart';

// Map quality name to API quality value
const mapQualityToApiValue = (qualityName: string): 'standard' | 'economic' | 'premium' | undefined => {
  const lowerName = qualityName.toLowerCase();
  if (lowerName.includes('premium')) return 'premium';
  if (lowerName.includes('economic') || lowerName.includes('эконом')) return 'economic';
  if (lowerName.includes('standard') || lowerName.includes('стандарт')) return 'standard';
  return undefined;
};

export const ProductsPage: React.FC = () => {
  const { 
    products = [], 
    addToCart, 
    language, 
    cart = [],
    fetchProducts,
    isFetchingProducts,
    user,
    fetchBasket,
    categories = [],
    fetchCategories,
    isFetchingCategories,
    qualities = [],
    fetchQualities,
    isFetchingQualities
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedQualityId, setSelectedQualityId] = useState<string>('all');
  const [isAddingToCart, setIsAddingToCart] = useState<Record<number, boolean>>({});
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  const t = (key: string) => getTranslation(language, key as any);

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
    if (cart.length > 0) {
      setLocalCart(cart);
    }
  }, [cart]);

  // Fetch categories, qualities and products when component mounts
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchQualities();
      fetchProducts();
      fetchBasket();
    }
  }, [user]);

  // Apply filters when search or filters change
  useEffect(() => {
    if (user) {
      const filters: any = {};
      
      if (searchQuery) filters.search = searchQuery;
      
      if (selectedCategoryId !== 'all') {
        filters.category = parseInt(selectedCategoryId);
      }
      
      if (selectedQualityId !== 'all') {
        // Find the quality name by ID
        const selectedQuality = qualities.find(q => q.id.toString() === selectedQualityId);
        if (selectedQuality) {
          const qualityValue = mapQualityToApiValue(selectedQuality.name);
          if (qualityValue) {
            filters.quality = qualityValue;
          }
        }
      }
      
      // Debounce search
      const timeoutId = setTimeout(() => {
        fetchProducts(filters);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, selectedCategoryId, selectedQualityId, user, qualities]);

  const handleAddToCart = async (product: Product) => {
    setIsAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    try {
      // Check if product already exists in cart (from context)
      const existingItem = cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Product already in cart - show message and optionally navigate to cart
        toast.info(language === 'uz' 
          ? 'Bu mahsulot allaqachon savatda' 
          : 'Этот продукт уже в корзине');
        
        // Option: Navigate to cart
        // navigate('/cart');
        return;
      }
      
      // Add new item to cart via context (API only supports one per product)
      await addToCart(product);
      
      // Update local storage for offline support
      const newLocalItem: CartItem = {
        id: `${Date.now()}-${product.id}`,
        product,
        quantity: 1, // API doesn't support quantity, so always 1
      };
      
      const updatedLocalCart = [...localCart, newLocalItem];
      setLocalCart(updatedLocalCart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedLocalCart));
      
      toast.success(t('addedToCart'));
    } catch (error) {
      toast.error(language === 'uz' 
        ? 'Savatchaga qo\'shishda xatolik yuz berdi' 
        : 'Ошибка при добавлении в корзину');
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const getQualityTranslation = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'premium':
        return language === 'uz' ? 'Premium' : 'Премиум';
      case 'economic':
        return language === 'uz' ? 'Economic' : 'Эконом';
      default:
        return language === 'uz' ? 'Standart' : 'Стандарт';
    }
  };

  // Get quality name by ID
  const getQualityNameById = (qualityId: number): string => {
    const quality = qualities.find(q => q.id === qualityId);
    return quality?.name || '';
  };

  // Merge context cart with local cart for display
  const displayCart = cart.length > 0 ? cart : localCart;

  // Loading state
  const isLoading = isFetchingProducts || isFetchingCategories || isFetchingQualities;

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">
          {language === 'uz' 
            ? 'Mahsulotlarni ko\'rish uchun tizimga kiring' 
            : 'Войдите в систему чтобы просмотреть продукты'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('products')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' ? 'Mahsulotlarni tanlang va savatchaga qo\'shing' : 'Выберите продукты и добавьте в корзину'}
          </p>
        </div>
        <Button size="lg" onClick={() => navigate('/cart')} className="relative">
          <ShoppingCart className="mr-2 h-5 w-5" />
          {t('cart')}
          {displayCart.length > 0 && (
            <Badge className="ml-2 rounded-full px-2 py-0.5 bg-blue-600 text-white">
              {displayCart.length}
            </Badge>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={language === 'uz' ? 'Mahsulot nomi bo\'yicha qidirish...' : 'Поиск по названию...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Category Select - From API */}
            <Select 
              value={selectedCategoryId} 
              onValueChange={setSelectedCategoryId}
              disabled={isFetchingCategories}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'uz' ? 'Kategoriya' : 'Категория'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'uz' ? 'Barcha kategoriyalar' : 'Все категории'}
                </SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Quality Select - From API */}
            <Select 
              value={selectedQualityId} 
              onValueChange={setSelectedQualityId}
              disabled={isFetchingQualities}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'uz' ? 'Sifat' : 'Качество'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'uz' ? 'Barcha sifatlar' : 'Все качества'}
                </SelectItem>
                {qualities.map(quality => (
                  <SelectItem key={quality.id} value={quality.id.toString()}>
                    {quality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">
                {language === 'uz' ? 'Ma\'lumotlar yuklanmoqda...' : 'Загрузка данных...'}
              </span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                {language === 'uz' ? 'Mahsulotlar topilmadi' : 'Продукты не найдены'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const isInCart = displayCart.some((item: CartItem) => item.product?.id === product.id);
                const isAdding = isAddingToCart[product.id];
                const qualityName = getQualityNameById(product.quality as any);
                
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-[150px] relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <div 
                        className="h-[100%] w-[100%] object-cover"
                        style={{ backgroundColor: product.color }}
                      />
                    </div>
                    <CardHeader className="">
                      <div className="">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                        <div className=" text-sm text-gray-600 dark:text-gray-400">
                          <p>{product.width} × {product.height} mm</p>
                          <p>{t('thickness')}: {product.thickness} mm</p>
                          <p>{t('quality')}: {qualityName || getQualityTranslation(product.quality)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-3 pt-0">
                      <div className="flex w-full items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {product.unitPrice?.toLocaleString() || '0'}
                          </p>
                          <p className="text-xs text-gray-500">UZS</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('stock')}</p>
                          <Badge variant={(product.stockQuantity || 0) < 20 ? 'destructive' : 'default'}>
                            {product.stockQuantity || 0}
                          </Badge>
                        </div>
                      </div>
                      
                      {isInCart ? (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => navigate('/cart')}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {language === 'uz' ? 'Savatda' : 'В корзине'}
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => handleAddToCart(product)}
                          disabled={(product.stockQuantity || 0) === 0 || isAdding}
                        >
                          {isAdding ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="mr-2 h-4 w-4" />
                          )}
                          {(product.stockQuantity || 0) === 0 ? t('outOfStock') : 
                           isAdding ? (language === 'uz' ? 'Qo\'shilmoqda...' : 'Добавление...') : 
                           t('addToCart')}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};