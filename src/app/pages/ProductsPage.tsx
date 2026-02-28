import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Product, CartItem } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, ShoppingCart, Package, Loader2, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const CART_STORAGE_KEY = 'app_cart';

const mapQualityToApiValue = (qualityName: string): 'standard' | 'economic' | 'premium' | undefined => {
  const lowerName = qualityName.toLowerCase();
  if (lowerName.includes('premium')) return 'premium';
  if (lowerName.includes('economic') || lowerName.includes('эконом')) return 'economic';
  if (lowerName.includes('standard') || lowerName.includes('стандарт')) return 'standard';
  return undefined;
};

const getContrastColor = (hexColor: string) => {
  if (!hexColor || hexColor === '#CCCCCC') return '#000000';
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

export const ProductsPage: React.FC = () => {
  const { 
    products = [], 
    totalProducts = 0,
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
  
  // Pagination state - ALWAYS 28 products per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(28); // Force 28 products per page

  const [isAddingToCart, setIsAddingToCart] = useState<Record<number, boolean>>({});
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  const initialLoadDone = useRef(false);
  const filtersRef = useRef({ 
    search: '', 
    category: 'all', 
    quality: 'all', 
    page: 1, 
    limit: 28 // Always 28
  });

  // Use a ref to track the last known totalProducts
  const lastTotalProducts = useRef(totalProducts);

  // Update ref when totalProducts changes
  useEffect(() => {
    if (totalProducts > 0) {
      lastTotalProducts.current = totalProducts;
      console.log("📊 totalProducts updated to:", totalProducts);
    }
  }, [totalProducts]);

  const t = (key: string) => getTranslation(language, key as any);

  // Calculate effective total - use current totalProducts, or fallback to last known
  const effectiveTotalProducts = totalProducts > 0 ? totalProducts : lastTotalProducts.current;
  const totalPages = Math.ceil(effectiveTotalProducts / limit);

  // Debug logs
  console.log('📊 totalProducts from context:', totalProducts);
  console.log('📦 products.length:', products.length);
  console.log('📄 currentPage:', currentPage);
  console.log('💾 lastTotalProducts:', lastTotalProducts.current);
  console.log('🔢 effectiveTotalProducts:', effectiveTotalProducts);
  console.log('🔢 totalPages:', totalPages);
  console.log('🎯 showPagination:', totalPages > 1);

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

  // Save cart to localStorage
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

  // Initial data fetch - IMPORTANT: Always use limit 28
  useEffect(() => {
    if (user && !initialLoadDone.current) {
      initialLoadDone.current = true;
      const fetchInitialData = async () => {
        try {
          await Promise.all([
            fetchCategories(),
            fetchQualities(),
            // CRITICAL: Always fetch with page=1 and limit=28, never rely on default
            fetchProducts({ page: 1, limit: 28 }),
            fetchBasket()
          ]);
        } catch (error) {
          console.error('Error fetching initial data:', error);
        }
      };
      fetchInitialData();
    }
  }, [user, fetchProducts, fetchCategories, fetchQualities, fetchBasket]);

  // Handle filters and pagination - ALWAYS include limit
  useEffect(() => {
    if (!user || !initialLoadDone.current) return;

    const currentFilters = {
      search: searchQuery,
      category: selectedCategoryId,
      quality: selectedQualityId,
      page: currentPage,
      limit: limit // Always include limit
    };

    // Check if filters actually changed
    if (
      filtersRef.current.search === currentFilters.search &&
      filtersRef.current.category === currentFilters.category &&
      filtersRef.current.quality === currentFilters.quality &&
      filtersRef.current.page === currentFilters.page &&
      filtersRef.current.limit === currentFilters.limit
    ) {
      return;
    }

    // If search, category, or quality filters change, reset to page 1
    if (
      filtersRef.current.search !== currentFilters.search ||
      filtersRef.current.category !== currentFilters.category ||
      filtersRef.current.quality !== currentFilters.quality
    ) {
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }

    filtersRef.current = currentFilters;

    // Build filters object - ALWAYS include page and limit
    const filters: any = { 
      page: currentPage,
      limit: limit // CRITICAL: Always send limit
    };
    
    if (searchQuery) filters.search = searchQuery;
    if (selectedCategoryId !== 'all') {
      filters.category = parseInt(selectedCategoryId);
    }
    if (selectedQualityId !== 'all') {
      const selectedQuality = qualities.find(q => q.id.toString() === selectedQualityId);
      if (selectedQuality) {
        const qualityValue = mapQualityToApiValue(selectedQuality.name);
        if (qualityValue) {
          filters.quality = qualityValue;
        }
      }
    }
    
    const timeoutId = setTimeout(() => {
      console.log('🔍 Fetching with filters:', filters);
      fetchProducts(filters);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategoryId, selectedQualityId, currentPage, limit, user, qualities, fetchProducts]);

  // Add this effect to detect when products change and log the count
  useEffect(() => {
    console.log(`📦 Page ${currentPage} loaded with ${products.length} products`);
  }, [products, currentPage]);

  const handleAddToCart = async (product: Product) => {
    setIsAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    try {
      const existingItem = cart.find(item => item.product.id === product.id);
      if (existingItem) {
        toast.info(language === 'uz' ? 'Bu mahsulot allaqachon savatda' : 'Этот продукт уже в корзине');
        return;
      }
      
      await addToCart(product);
      
      const newLocalItem: CartItem = {
        id: `${Date.now()}-${product.id}`,
        product,
        quantity: 1,
      };
      
      const updatedLocalCart = [...localCart, newLocalItem];
      setLocalCart(updatedLocalCart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedLocalCart));
      
      toast.success(t('addedToCart'));
    } catch (error) {
      toast.error(language === 'uz' ? 'Savatchaga qo\'shishda xatolik yuz berdi' : 'Ошибка при добавлении в корзину');
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const getQualityTranslation = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'premium': return language === 'uz' ? 'Premium' : 'Премиум';
      case 'economic': return language === 'uz' ? 'Economic' : 'Эконом';
      default: return language === 'uz' ? 'Standart' : 'Стандарт';
    }
  };

  const getQualityNameById = (qualityId: number): string => {
    const quality = qualities.find(q => q.id === qualityId);
    return quality?.name || '';
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const displayCart = cart.length > 0 ? cart : localCart;
  
  const isLoading = isFetchingProducts || isFetchingCategories || isFetchingQualities;

  // Calculate displayed range
  const startItem = effectiveTotalProducts > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, effectiveTotalProducts);

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">
          {language === 'uz' ? 'Mahsulotlarni ko\'rish uchun tizimga kiring' : 'Войдите в систему чтобы просмотреть продукты'}
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
            {language === 'uz' 
              ? `Mahsulotlarni tanlang va savatchaga qo'shing (Jami: ${effectiveTotalProducts} ta mahsulot)` 
              : `Выберите продукты и добавьте в корзину (Всего: ${effectiveTotalProducts} продуктов)`}
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
            
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={isFetchingCategories}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'uz' ? 'Kategoriya' : 'Категория'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'uz' ? 'Barcha kategoriyalar' : 'Все категории'}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedQualityId} onValueChange={setSelectedQualityId} disabled={isFetchingQualities}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'uz' ? 'Sifat' : 'Качество'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'uz' ? 'Barcha sifatlar' : 'Все качества'}</SelectItem>
                {qualities.map(quality => (
                  <SelectItem key={quality.id} value={quality.id.toString()}>{quality.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading && products.length === 0 ? (
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
            <>
              {/* Products Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => {
                  const isInCart = displayCart.some((item: CartItem) => item.product?.id === product.id);
                  const isAdding = isAddingToCart[product.id];
                  const qualityName = getQualityNameById(product.quality as any);
                  
                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                    
                      
                      {/* Image Container */}
                      <div className="h-[150px] relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'w-full h-full';
                                fallbackDiv.style.backgroundColor = product.color || '#e5e7eb';
                                parent.appendChild(fallbackDiv);
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="w-full h-full"
                            style={{ backgroundColor: product.color || '#e5e7eb' }}
                          />
                        )}
                      </div>
                      
                      <CardHeader>
                        <div>
                            <h3 className="w-[220px] font-semibold text-lg leading-tight truncate" title={product.name}>
                              {product.name}
                            </h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <p>{product.width} × {product.height} mm</p>
                            <p>{t('thickness')}: {product.thickness} mm</p>
                            <p>{t('quality')}: {qualityName || getQualityTranslation(product.quality as string)}</p>
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
                          <Button className="w-full" variant="outline" onClick={() => navigate('/cart')}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {language === 'uz' ? 'Savatda' : 'В корзине'}
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            onClick={() => handleAddToCart(product)}
                            disabled={(product.stockQuantity || 0) === 0 || isAdding}
                          >
                            {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                            {(product.stockQuantity || 0) === 0 ? t('outOfStock') : 
                             isAdding ? (language === 'uz' ? 'Qo\'shilmoqda...' : 'Добавление...') : t('addToCart')}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t">
                
                  
                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || isFetchingProducts}
                      className="min-w-[100px]"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {language === 'uz' ? 'Oldingi' : 'Назад'}
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isFetchingProducts}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || isFetchingProducts}
                      className="min-w-[100px]"
                    >
                      {language === 'uz' ? 'Keyingi' : 'Вперед'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};