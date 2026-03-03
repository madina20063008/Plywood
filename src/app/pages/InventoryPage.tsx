import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, AlertTriangle, PlusCircle, Loader2, Edit, RefreshCw, Upload, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Switch } from '../components/ui/switch';

export const InventoryPage: React.FC = () => {
  const { 
    products = [], 
    totalProducts = 0,
    language,
    categories = [],
    fetchCategories,
    isFetchingCategories,
    user,
    updateProduct,
    deleteProduct,
    isUpdatingProduct,
    isDeletingProduct,
    fetchProducts,
    isFetchingProducts
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination state - 30 products per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(30);

  // Add a ref to track initial mount
  const isInitialMount = useRef(true);
  
  // Add a ref to track if data is currently being fetched
  const isFetchingRef = useRef(false);

  // Edit form state - matching API schema
  const [editFormData, setEditFormData] = useState({
    name: '',
    color: '',
    quality: 'standard' as 'standard' | 'economic' | 'premium',
    width: '',
    height: '',
    thickness: '',
    arrival_date: '',
    description: '',
    is_active: true,
    category: 0,
    image: null as File | null,
    imagePreview: null as string | null,
    currentImage: null as string | null,
  });

  const t = (key: string) => getTranslation(language, key as any);

  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / limit);

  // Memoized low stock products - this prevents unnecessary recalculations
  const lowStockProducts = useMemo(() => 
    products.filter(p => p.stockQuantity < 20), 
    [products]
  );

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Memoized fetch products function to prevent unnecessary re-renders
  const loadProducts = useCallback(async (page: number, category?: string, search?: string) => {
    // Prevent multiple simultaneous fetch requests
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    try {
      await fetchProducts({ 
        page, 
        limit,
        search: search || undefined,
        category: category && category !== 'all' ? parseInt(category) : undefined
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulotlarni yuklashda xatolik yuz berdi' 
        : 'Ошибка при загрузке продуктов');
    } finally {
      isFetchingRef.current = false;
    }
  }, [fetchProducts, limit, language]);

  // Fetch categories on mount
  useEffect(() => {
    if (user && isInitialMount.current) {
      isInitialMount.current = false;
      fetchCategories();
    }
  }, [user, fetchCategories]);

  // Load products when dependencies change
  useEffect(() => {
    if (!user) return;

    // Reset to page 1 when search or category changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadProducts(1, selectedCategoryId, debouncedSearchQuery);
    }
  }, [user, debouncedSearchQuery, selectedCategoryId]);

  // Load products when page changes
  useEffect(() => {
    if (!user) return;
    
    loadProducts(currentPage, selectedCategoryId, debouncedSearchQuery);
  }, [user, currentPage, loadProducts]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchCategories(),
        loadProducts(currentPage, selectedCategoryId, debouncedSearchQuery)
      ]);
      toast.success(language === 'uz' 
        ? 'Ma\'lumotlar yangilandi' 
        : 'Данные обновлены');
    } catch (error) {
      toast.error(language === 'uz' 
        ? 'Yangilashda xatolik yuz berdi' 
        : 'Ошибка при обновлении');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || isFetchingRef.current) return;
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

  // Get category name by ID
  const getCategoryNameById = useCallback((categoryId: number | string): string => {
    if (!categoryId) return 'OTHER';
    const id = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    const category = categories.find(c => c.id === id);
    return category?.name || 'OTHER';
  }, [categories]);

  // Get category ID by name
  const getCategoryIdByName = useCallback((categoryName: string): number | undefined => {
    if (!categoryName) return undefined;
    
    const category = categories.find(c => 
      c.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    return category?.id;
  }, [categories]);

  // Map API product to form data
  const mapProductToFormData = useCallback((product: any) => {
    let categoryId = 0;
    
    if (product.category) {
      if (typeof product.category === 'string') {
        const foundId = getCategoryIdByName(product.category);
        if (foundId) {
          categoryId = foundId;
        } else {
          const parsedId = parseInt(product.category);
          if (!isNaN(parsedId)) {
            const categoryExists = categories.some(c => c.id === parsedId);
            if (categoryExists) {
              categoryId = parsedId;
            }
          }
        }
      } else if (typeof product.category === 'number') {
        const categoryExists = categories.some(c => c.id === product.category);
        if (categoryExists) {
          categoryId = product.category;
        }
      }
    }

    if (categoryId === 0 && categories.length > 0) {
      categoryId = categories[0].id;
    }

    return {
      name: product.name || '',
      color: product.color || '#CCCCCC',
      quality: (product.quality?.toLowerCase() as 'standard' | 'economic' | 'premium') || 'standard',
      width: product.width?.toString() || '0',
      height: product.height?.toString() || '0',
      thickness: product.thickness?.toString() || '0',
      arrival_date: product.arrival_date || new Date().toISOString().split('T')[0],
      description: product.description || '',
      is_active: product.enabled !== undefined ? product.enabled : true,
      category: categoryId,
      currentImage: product.image || null,
      imagePreview: product.image || null,
    };
  }, [categories, getCategoryIdByName]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'uz' 
          ? 'Rasm hajmi 5MB dan kichik bo\'lishi kerak'
          : 'Размер изображения должен быть меньше 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(language === 'uz' 
          ? 'Faqat rasm fayllari qabul qilinadi'
          : 'Принимаются только файлы изображений');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setEditFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  };

  const navigate = useNavigate();

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setEditFormData(mapProductToFormData(product));
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      if (!editFormData.name.trim()) {
        toast.error(language === 'uz' 
          ? 'Mahsulot nomi bo\'sh bo\'lishi mumkin emas'
          : 'Название продукта не может быть пустым');
        return;
      }

      const categoryExists = categories.some(c => c.id === editFormData.category);
      if (!categoryExists) {
        toast.error(language === 'uz' 
          ? 'Kategoriya topilmadi. Iltimos, to\'g\'ri kategoriya tanlang.' 
          : 'Категория не найдена. Пожалуйста, выберите правильную категорию.');
        return;
      }

      const formData = new FormData();
      
      formData.append('name', editFormData.name.trim());
      formData.append('color', editFormData.color);
      formData.append('quality', editFormData.quality);
      formData.append('width', editFormData.width || '0');
      formData.append('height', editFormData.height || '0');
      formData.append('thick', editFormData.thickness || '0');
      formData.append('arrival_date', editFormData.arrival_date || new Date().toISOString().split('T')[0]);
      formData.append('description', editFormData.description || '');
      formData.append('is_active', editFormData.is_active.toString());
      formData.append('category', editFormData.category.toString());
      
      if (editFormData.image) {
        formData.append('image', editFormData.image);
      }

      await updateProduct(selectedProduct.id.toString(), formData as any);
      
      // Refresh products after update
      await loadProducts(currentPage, selectedCategoryId, debouncedSearchQuery);
      
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      
      toast.success(language === 'uz' 
        ? 'Mahsulot muvaffaqiyatli yangilandi' 
        : 'Продукт успешно обновлен');
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulotni yangilashda xatolik yuz berdi' 
        : 'Ошибка при обновлении продукта');
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      await deleteProduct(selectedProduct.id.toString());
      
      // Refresh products after delete
      await loadProducts(currentPage, selectedCategoryId, debouncedSearchQuery);
      
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      
      toast.success(language === 'uz' 
        ? 'Mahsulot muvaffaqiyatli o\'chirildi' 
        : 'Продукт успешно удален');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error(language === 'uz' 
        ? 'Mahsulotni o\'chirishda xatolik yuz berdi' 
        : 'Ошибка при удалении продукта');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate displayed range
  const startItem = totalProducts > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalProducts);

  // Show loading state
  if (isFetchingProducts && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {language === 'uz'
              ? "Mahsulotlar yuklanmoqda..."
              : "Загрузка продуктов..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('inventory')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' 
              ? `Mahsulotlarni boshqarish va ombor nazorati (Jami: ${totalProducts} ta mahsulot)` 
              : `Управление продуктами и контроль склада (Всего: ${totalProducts} продуктов)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || isFetchingProducts}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {language === 'uz' ? 'Yangilash' : 'Обновить'}
          </Button>
          <Button
            onClick={() => navigate('/product-creation')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            {language === 'uz' ? 'Mahsulot yaratish' : 'Создать продукт'}
          </Button>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center text-orange-900 dark:text-orange-200 text-sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              {language === 'uz' 
                ? 'Kam qolgan mahsulotlar haqida ogohlantirish' 
                : 'Предупреждение о малоимущих продуктах'}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map(product => (
                <Badge 
                  key={product.id} 
                  variant="outline" 
                  className="border-orange-400 text-orange-900 dark:text-orange-200 bg-orange-100 dark:bg-orange-900/40"
                >
                  {product.name} ({product.stockQuantity})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
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
          </div>
          
          {isFetchingCategories && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              {language === 'uz' ? 'Kategoriyalar yuklanmoqda...' : 'Загрузка категорий...'}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {language === 'uz' ? 'Mahsulotlar mavjud emas' : 'Нет продуктов'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{t('productName')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('color')}</TableHead>
                      <TableHead>{t('dimensions')}</TableHead>
                      <TableHead>{t('thickness')}</TableHead>
                      <TableHead>{t('quality')}</TableHead>
                      <TableHead>{t('purchasePrice')}</TableHead>
                      <TableHead>{t('price')}</TableHead>
                      <TableHead>{t('stock')}</TableHead>
                      <TableHead>{t('arrivalDate')}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const categoryName = typeof product.category === 'string' 
                        ? product.category 
                        : getCategoryNameById(product.category);
                      
                      const arrivalDate = product.arrival_date 
                        ? new Date(product.arrival_date).toLocaleDateString()
                        : '-';
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="text-xs text-gray-500">{product.id}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {product.image && (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="h-8 w-8 rounded object-cover border border-gray-200 dark:border-gray-700"
                                />
                              )}
                              <span>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{t(categoryName)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: product.color }}
                              />
                              <span className="text-xs text-gray-500">{product.color}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.width} × {product.height} mm</TableCell>
                          <TableCell>{product.thickness} mm</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.quality}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {product.purchasePrice 
                              ? `${product.purchasePrice.toLocaleString()} UZS` 
                              : '-'}
                          </TableCell>
                          <TableCell>{product.unitPrice.toLocaleString()} UZS</TableCell>
                          <TableCell>
                            <Badge variant={product.stockQuantity < 20 ? 'destructive' : 'default'}>
                              {product.stockQuantity}
                            </Badge>
                          </TableCell>
                          <TableCell>{arrivalDate}</TableCell>
                          <TableCell>
                            <Badge variant={product.enabled ? 'default' : 'secondary'}>
                              {product.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(product)}
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                title={language === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(product)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                title={language === 'uz' ? 'O\'chirish' : 'Удалить'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t">
                  {/* Page info */}
                  <div className="text-sm text-gray-500">
                    {language === 'uz' 
                      ? `${startItem} - ${endItem} / ${totalProducts} ta mahsulot`
                      : `${startItem} - ${endItem} из ${totalProducts} продуктов`}
                  </div>
                  
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
                  
                  {/* Loading indicator */}
                  {isFetchingProducts && products.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...'}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'uz' ? 'Mahsulotni tahrirlash' : 'Редактировать продукт'}
            </DialogTitle>
            <DialogDescription>
              {language === 'uz' 
                ? 'Mahsulot ma\'lumotlarini o\'zgartiring' 
                : 'Измените информацию о продукте'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{language === 'uz' ? 'Nomi *' : 'Название *'}</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">{language === 'uz' ? 'Rangi' : 'Цвет'}</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    className="w-12 p-1 h-10"
                  />
                  <Input
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    placeholder="#RRGGBB"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload in Edit Dialog */}
            <div className="grid gap-2">
              <Label htmlFor="edit-image">
                {language === 'uz' ? 'Mahsulot rasmi' : 'Изображение продукта'}
              </Label>
              <div className="mt-2">
                {editFormData.imagePreview ? (
                  <div className="relative w-full max-w-md">
                    <img 
                      src={editFormData.imagePreview} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="edit-image-upload"
                      className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-4 pb-5">
                        <Upload className="h-6 w-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'uz' 
                            ? 'Rasm yuklash uchun bosing'
                            : 'Нажмите для загрузки изображения'}
                        </p>
                      </div>
                      <input
                        id="edit-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="width">{language === 'uz' ? 'Eni (mm) *' : 'Ширина (мм) *'}</Label>
                <Input
                  id="width"
                  type="number"
                  value={editFormData.width}
                  onChange={(e) => setEditFormData({ ...editFormData, width: e.target.value })}
                  step="0.1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">{language === 'uz' ? 'Bo\'yi (mm) *' : 'Высота (мм) *'}</Label>
                <Input
                  id="height"
                  type="number"
                  value={editFormData.height}
                  onChange={(e) => setEditFormData({ ...editFormData, height: e.target.value })}
                  step="0.1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="thickness">{language === 'uz' ? 'Qalinligi (mm) *' : 'Толщина (мм) *'}</Label>
                <Input
                  id="thickness"
                  type="number"
                  value={editFormData.thickness}
                  onChange={(e) => setEditFormData({ ...editFormData, thickness: e.target.value })}
                  step="0.1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quality">{language === 'uz' ? 'Sifati *' : 'Качество *'}</Label>
                <Select 
                  value={editFormData.quality} 
                  onValueChange={(value: 'standard' | 'economic' | 'premium') => 
                    setEditFormData({ ...editFormData, quality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="economic">Economic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">{language === 'uz' ? 'Kategoriya *' : 'Категория *'}</Label>
                <Select 
                  value={editFormData.category.toString()} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, category: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0" disabled>
                        {language === 'uz' ? 'Kategoriyalar yuklanmoqda...' : 'Загрузка категорий...'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="arrival_date">{language === 'uz' ? 'Kelish sanasi' : 'Дата прибытия'}</Label>
              <Input
                id="arrival_date"
                type="date"
                value={editFormData.arrival_date}
                onChange={(e) => setEditFormData({ ...editFormData, arrival_date: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{language === 'uz' ? 'Tavsif' : 'Описание'}</Label>
              <Input
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder={language === 'uz' ? 'Mahsulot tavsifi...' : 'Описание продукта...'}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={editFormData.is_active}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, is_active: checked })}
              />
              <Label htmlFor="is_active">{language === 'uz' ? 'Faol' : 'Активный'}</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
            </Button>
            <Button onClick={handleUpdateProduct} disabled={isUpdatingProduct}>
              {isUpdatingProduct ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...'}
                </>
              ) : (
                language === 'uz' ? 'Saqlash' : 'Сохранить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {language === 'uz' ? 'Mahsulotni o\'chirish' : 'Удаление продукта'}
            </DialogTitle>
            <DialogDescription>
              {language === 'uz' 
                ? 'Bu amalni ortiga qaytarib bo\'lmaydi. Mahsulot butunlay o\'chiriladi.'
                : 'Это действие нельзя отменить. Продукт будет полностью удален.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'uz' 
                ? `"${selectedProduct?.name}" mahsulotini o\'chirishni tasdiqlaysizmi?`
                : `Вы уверены, что хотите удалить продукт "${selectedProduct?.name}"?`}
            </p>
            {selectedProduct && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">ID:</span> {selectedProduct.id}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">{language === 'uz' ? 'Kategoriya:' : 'Категория:'}</span> {getCategoryNameById(selectedProduct.category)}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">{language === 'uz' ? 'Soni:' : 'Количество:'}</span> {selectedProduct.stockQuantity}
                </p>
                {selectedProduct.image && (
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="mt-2 h-16 w-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct} 
              disabled={isDeleting || isDeletingProduct}
            >
              {isDeleting || isDeletingProduct ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'uz' ? 'O\'chirilmoqda...' : 'Удаление...'}
                </>
              ) : (
                language === 'uz' ? 'O\'chirish' : 'Удалить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};