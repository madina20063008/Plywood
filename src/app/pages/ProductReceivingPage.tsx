import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ArrowLeft, PackagePlus, Package, Calendar, History } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const ProductReceivingPage: React.FC = () => {
  const { products, updateProduct, productArrivals, addProductArrival, currentUser, language } = useApp();
  const navigate = useNavigate();
  
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [formData, setFormData] = useState({
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    arrivalDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    notes: '',
  });

  const t = (key: string) => getTranslation(language, key as any);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const resetForm = () => {
    setSelectedProductId('');
    setFormData({
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      arrivalDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !selectedProduct) {
      toast.error(language === 'uz' 
        ? 'Iltimos, mahsulotni tanlang' 
        : 'Пожалуйста, выберите продукт'
      );
      return;
    }

    if (formData.quantity <= 0) {
      toast.error(language === 'uz' 
        ? 'Miqdor 0 dan katta bo\'lishi kerak' 
        : 'Количество должно быть больше 0'
      );
      return;
    }

    if (formData.purchasePrice <= 0 || formData.sellingPrice <= 0) {
      toast.error(language === 'uz' 
        ? 'Narxlar 0 dan katta bo\'lishi kerak' 
        : 'Цены должны быть больше 0'
      );
      return;
    }

    // Add to product arrival history
    addProductArrival({
      productId: selectedProductId,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: formData.quantity,
      purchasePrice: formData.purchasePrice,
      sellingPrice: formData.sellingPrice,
      totalInvestment: formData.purchasePrice * formData.quantity,
      arrivalDate: formData.arrivalDate,
      notes: formData.notes,
      receivedBy: currentUser?.name || 'Unknown',
    });

    // Update product with new stock and prices
    updateProduct(selectedProductId, {
      stockQuantity: selectedProduct.stockQuantity + formData.quantity,
      purchasePrice: formData.purchasePrice,
      unitPrice: formData.sellingPrice,
      arrivalDate: formData.arrivalDate,
    });

    toast.success(language === 'uz' 
      ? `${formData.quantity} dona mahsulot qabul qilindi` 
      : `Принято ${formData.quantity} единиц товара`
    );
    
    resetForm();
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    
    // Pre-fill with existing prices if available
    if (product) {
      setFormData({
        purchasePrice: product.purchasePrice || 0,
        sellingPrice: product.unitPrice || 0,
        quantity: 0,
        arrivalDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  };

  // Sort arrivals by date (newest first)
  const sortedArrivals = [...productArrivals].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/inventory')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'uz' ? 'Orqaga' : 'Назад'}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {language === 'uz' ? 'Mahsulot qabul qilish' : 'Приём товара'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' 
              ? 'Kelgan mahsulotning narxi va miqdorini kiriting' 
              : 'Введите цену и количество поступившего товара'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {language === 'uz' ? 'Qabul qilish ma\'lumotlari' : 'Информация о приёме'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Selection */}
              <div>
                <Label htmlFor="product">
                  {language === 'uz' ? 'Mahsulotni tanlang' : 'Выберите продукт'} *
                </Label>
                <Select 
                  value={selectedProductId} 
                  onValueChange={handleProductSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'uz' ? 'Mahsulot tanlang' : 'Выберите продукт'} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {language === 'uz' 
                          ? 'Mahsulotlar mavjud emas' 
                          : 'Нет доступных продуктов'}
                      </div>
                    ) : (
                      products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-4 w-4 rounded border"
                              style={{ backgroundColor: product.color }}
                            />
                            <span>{product.name}</span>
                            <span className="text-xs text-gray-500">
                              ({product.width}×{product.height}×{product.thickness}mm)
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {products.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'uz' 
                      ? 'Avval mahsulot yarating' 
                      : 'Сначала создайте продукт'}
                    {' '}
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => navigate('/product-creation')}
                    >
                      {language === 'uz' ? 'Mahsulot yaratish' : 'Создать продукт'}
                    </Button>
                  </p>
                )}
              </div>

              {/* Arrival Date */}
              <div>
                <Label htmlFor="arrivalDate">
                  {language === 'uz' ? 'Kelish sanasi' : 'Дата поступления'} *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="arrivalDate"
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                    className="pl-10"
                    required
                    disabled={!selectedProductId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Price */}
                <div>
                  <Label htmlFor="purchasePrice">
                    {language === 'uz' ? 'Kelish narxi' : 'Цена закупки'} (UZS) *
                  </Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    placeholder="0"
                    required
                    min="0"
                    step="0.01"
                    disabled={!selectedProductId}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'uz' 
                      ? 'Mahsulotning sotib olingan narxi' 
                      : 'Цена, по которой товар был закуплен'}
                  </p>
                </div>

                {/* Selling Price */}
                <div>
                  <Label htmlFor="sellingPrice">
                    {language === 'uz' ? 'Sotish narxi' : 'Цена продажи'} (UZS) *
                  </Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={formData.sellingPrice || ''}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    placeholder="0"
                    required
                    min="0"
                    step="0.01"
                    disabled={!selectedProductId}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'uz' 
                      ? 'Mahsulotning sotilish narxi' 
                      : 'Цена, по которой товар будет продаваться'}
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity">
                  {language === 'uz' ? 'Miqdor' : 'Количество'} *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="0"
                  required
                  min="1"
                  disabled={!selectedProductId}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {language === 'uz' 
                    ? 'Qabul qilinayotgan mahsulot soni' 
                    : 'Количество принимаемого товара'}
                </p>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">
                  {language === 'uz' ? 'Izohlar' : 'Примечания'}
                </Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={language === 'uz' ? 'Qo\'shimcha ma\'lumot...' : 'Дополнительная информация...'}
                  disabled={!selectedProductId}
                />
              </div>

              {/* Profit Margin Display */}
              {formData.purchasePrice > 0 && formData.sellingPrice > 0 && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {language === 'uz' ? 'Foyda (dona)' : 'Прибыль (за шт.)'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {(formData.sellingPrice - formData.purchasePrice).toLocaleString()} UZS
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {language === 'uz' ? 'Foyda foizi' : 'Процент прибыли'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {((formData.sellingPrice - formData.purchasePrice) / formData.purchasePrice * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {language === 'uz' ? 'Jami investitsiya' : 'Общие инвестиции'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {(formData.purchasePrice * formData.quantity).toLocaleString()} UZS
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  {language === 'uz' ? 'Tozalash' : 'Очистить'}
                </Button>
                <Button type="submit" disabled={!selectedProductId}>
                  <PackagePlus className="mr-2 h-4 w-4" />
                  {language === 'uz' ? 'Qabul qilish' : 'Принять товар'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Product Preview */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'uz' ? 'Mahsulot ma\'lumoti' : 'Информация о продукте'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-16 w-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: selectedProduct.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {selectedProduct.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(selectedProduct.category)} • {selectedProduct.quality}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('dimensions')}:
                    </span>
                    <span className="font-medium">
                      {selectedProduct.width}×{selectedProduct.height}×{selectedProduct.thickness}mm
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === 'uz' ? 'Joriy zaxira' : 'Текущий запас'}:
                    </span>
                    <span className="font-medium">
                      {selectedProduct.stockQuantity} {language === 'uz' ? 'dona' : 'шт.'}
                    </span>
                  </div>
                  {selectedProduct.purchasePrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'uz' ? 'Joriy kelish narxi' : 'Текущая цена закупки'}:
                      </span>
                      <span className="font-medium">
                        {selectedProduct.purchasePrice.toLocaleString()} UZS
                      </span>
                    </div>
                  )}
                  {selectedProduct.unitPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'uz' ? 'Joriy sotish narxi' : 'Текущая цена продажи'}:
                      </span>
                      <span className="font-medium">
                        {selectedProduct.unitPrice.toLocaleString()} UZS
                      </span>
                    </div>
                  )}
                </div>

                {formData.quantity > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {language === 'uz' ? 'Qabul qilingandan keyin' : 'После приёма'}:
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'uz' ? 'Yangi zaxira' : 'Новый запас'}:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {selectedProduct.stockQuantity + formData.quantity} {language === 'uz' ? 'dona' : 'шт.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'uz' 
                    ? 'Mahsulotni tanlang' 
                    : 'Выберите продукт'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receiving History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {language === 'uz' ? 'Qabul qilish tarixi' : 'История приёма товаров'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedArrivals.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'uz' 
                  ? 'Hozircha qabul qilish tarixi yo\'q' 
                  : 'Пока нет истории приёма товаров'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'uz' ? 'Sana' : 'Дата'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Mahsulot' : 'Продукт'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Kategoriya' : 'Категория'}</TableHead>
                    <TableHead className="text-right">{language === 'uz' ? 'Miqdor' : 'Количество'}</TableHead>
                    <TableHead className="text-right">{language === 'uz' ? 'Kelish narxi' : 'Цена закупки'}</TableHead>
                    <TableHead className="text-right">{language === 'uz' ? 'Sotish narxi' : 'Цена продажи'}</TableHead>
                    <TableHead className="text-right">{language === 'uz' ? 'Investitsiya' : 'Инвестиции'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Qabul qildi' : 'Принял'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Izohlar' : 'Примечания'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedArrivals.map((arrival) => (
                    <TableRow key={arrival.id}>
                      <TableCell className="font-medium">
                        {format(new Date(arrival.arrivalDate), 'dd.MM.yyyy')}
                      </TableCell>
                      <TableCell>{arrival.productName}</TableCell>
                      <TableCell>{t(arrival.category)}</TableCell>
                      <TableCell className="text-right">
                        {arrival.quantity} {language === 'uz' ? 'dona' : 'шт.'}
                      </TableCell>
                      <TableCell className="text-right">
                        {arrival.purchasePrice.toLocaleString()} UZS
                      </TableCell>
                      <TableCell className="text-right">
                        {arrival.sellingPrice.toLocaleString()} UZS
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {arrival.totalInvestment.toLocaleString()} UZS
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {arrival.receivedBy}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {arrival.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
