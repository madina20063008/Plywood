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

const categories = ['LDSP', 'MDF', 'DVP', 'DSP', 'OTHER'];
const defaultImage = 'https://images.unsplash.com/photo-1644925757334-d0397c01518c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHl3b29kJTIwd29vZCUyMHBhbmVsJTIwdGV4dHVyZXxlbnwxfHx8fDE3NzAzNzcyMTR8MA&ixlib=rb-4.1.0&q=80&w=1080';

export const ProductsPage: React.FC = () => {
  const { 
    products = [], 
    addToCart, 
    language, 
    cart = [],
    fetchProducts,
    isFetchingProducts,
    user
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const navigate = useNavigate();

  const t = (key: string) => getTranslation(language, key as any);

  // Fetch products when component mounts and when user is authenticated
  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  // Apply filters when search or category changes
  useEffect(() => {
    if (user) {
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedCategory !== 'all') {
        // Map category name to ID
        const categoryMap: Record<string, number> = {
          'LDSP': 1,
          'MDF': 2,
          'DVP': 3,
          'DSP': 4,
          'OTHER': 5
        };
        filters.category = categoryMap[selectedCategory];
      }
      if (selectedQuality !== 'all') {
        filters.quality = selectedQuality === 'premium' ? 'premium' : 
                          selectedQuality === 'economy' ? 'economy' : 'standard';
      }
      
      // Debounce search
      const timeoutId = setTimeout(() => {
        fetchProducts(filters);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, selectedCategory, selectedQuality, user]);

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      id: `${Date.now()}-${product.id}`,
      product,
      quantity: 1,
    };
    addToCart(cartItem);
    toast.success(t('addedToCart'));
  };

  const getQualityTranslation = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'premium':
        return language === 'uz' ? 'Premium' : 'Премиум';
      case 'economy':
        return language === 'uz' ? 'Econom' : 'Эконом';
      default:
        return language === 'uz' ? 'Standart' : 'Стандарт';
    }
  };

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
          {(cart || []).length > 0 && (
            <Badge className="ml-2 rounded-full px-2">{(cart || []).length}</Badge>
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'uz' ? 'Kategoriya' : 'Категория'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'uz' ? 'Barcha kategoriyalar' : 'Все категории'}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedQuality} onValueChange={setSelectedQuality}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'uz' ? 'Sifat' : 'Качество'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'uz' ? 'Barcha sifatlar' : 'Все качества'}</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="standard">{language === 'uz' ? 'Standart' : 'Стандарт'}</SelectItem>
                <SelectItem value="economy">{language === 'uz' ? 'Econom' : 'Эконом'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isFetchingProducts ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">
                {language === 'uz' ? 'Mahsulotlar yuklanmoqda...' : 'Загрузка продуктов...'}
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
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={product.imageUrl || defaultImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    <div 
                      className="absolute top-3 right-3 h-10 w-10 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: product.color }}
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                        <Badge variant="secondary">{t(product.category)}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>{product.width} × {product.height} mm</p>
                        <p>{t('thickness')}: {product.thickness} mm</p>
                        <p>{t('quality')}: {getQualityTranslation(product.quality)}</p>
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
                    <Button 
                      className="w-full" 
                      onClick={() => handleAddToCart(product)}
                      disabled={(product.stockQuantity || 0) === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {(product.stockQuantity || 0) === 0 ? t('outOfStock') : t('addToCart')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};