import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Sale } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Search, Edit, Eye, ShoppingBag, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const SoldProductsPage: React.FC = () => {
  const { 
    sales, 
    updateSale, 
    language,
    orderStats,
    fetchOrderStats,
    isFetchingOrderStats 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editedDiscount, setEditedDiscount] = useState(0);
  const [editedPaymentMethod, setEditedPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash');

  // Fetch order stats on component mount
  useEffect(() => {
    fetchOrderStats();
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'uz' ? 'uz-UZ' : 'ru-RU').format(amount);
  };

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

  const getPaymentMethodBadge = (method: string) => {
    const variants = {
      cash: 'default',
      card: 'secondary',
      mixed: 'outline',
    } as const;
    
    return (
      <Badge variant={variants[method as keyof typeof variants]}>
        {t(method)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('soldProducts')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {language === 'uz' 
              ? 'Barcha sotilgan mahsulotlarni ko\'rish va tahrirlash' 
              : 'Просмотр и редактирование всех проданных товаров'}
          </p>
        </div>
      </div>

      {/* Stats Cards - Using orderStats from API */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total')}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingOrderStats ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{orderStats?.total_sales || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? 'Jami sotuvlar' : 'Всего продаж'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('todayRevenue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingOrderStats ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(orderStats?.today_income || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? 'Bugungi daromad' : 'Доход за сегодня'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingOrderStats ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(orderStats?.total_income || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? 'Umumiy daromad' : 'Общий доход'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>{t('search')}</CardTitle>
          <CardDescription>
            {language === 'uz' 
              ? 'Kvitansiya raqami yoki sotuvchi nomi bo\'yicha qidiring' 
              : 'Поиск по номеру чека или имени продавца'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'uz' ? 'Sotilgan mahsulotlar' : 'Список продаж'}</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('noSoldProducts')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('receiptNumber')}</TableHead>
                    <TableHead>{t('salesperson')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('time')}</TableHead>
                    <TableHead>{t('paymentMethod')}</TableHead>
                    <TableHead className="text-right">{t('total')}</TableHead>
                    <TableHead className="text-right">{language === 'uz' ? 'Amallar' : 'Действия'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.receiptNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {sale.salespersonName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(sale.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>{formatTime(sale.createdAt)}</TableCell>
                      <TableCell>{getPaymentMethodBadge(sale.paymentMethod)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(sale.total)} {language === 'uz' ? "so'm" : "сум"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(sale)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(sale)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('editSale')}</DialogTitle>
            <DialogDescription>
              {language === 'uz' 
                ? 'Sotuv ma\'lumotlarini o\'zgartiring' 
                : 'Измените информацию о продаже'}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('receiptNumber')}</Label>
                <Input value={selectedSale.receiptNumber} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>{t('subtotal')}</Label>
                <Input 
                  value={`${formatCurrency(selectedSale.subtotal)} ${language === 'uz' ? "so'm" : "сум"}`} 
                  disabled 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">{t('discount')}</Label>
                <Input
                  id="discount"
                  type="number"
                  value={editedDiscount}
                  onChange={(e) => setEditedDiscount(Number(e.target.value))}
                  min={0}
                  max={selectedSale.subtotal}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">{t('paymentMethod')}</Label>
                <select
                  id="paymentMethod"
                  value={editedPaymentMethod}
                  onChange={(e) => setEditedPaymentMethod(e.target.value as 'cash' | 'card' | 'mixed')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="cash">{t('cash')}</option>
                  <option value="card">{t('card')}</option>
                  <option value="mixed">{t('mixed')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>{t('total')}</Label>
                <Input 
                  value={`${formatCurrency(selectedSale.subtotal - editedDiscount)} ${language === 'uz' ? "so'm" : "сум"}`} 
                  disabled 
                  className="font-semibold"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveEdit}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('viewDetails')}</DialogTitle>
            <DialogDescription>
              {language === 'uz' 
                ? 'Sotuv to\'liq ma\'lumotlari' 
                : 'Полная информация о продаже'}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('receiptNumber')}</p>
                  <p className="font-semibold">{selectedSale.receiptNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('salesperson')}</p>
                  <p className="font-semibold">{selectedSale.salespersonName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('date')}</p>
                  <p className="font-semibold">{formatDate(selectedSale.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('time')}</p>
                  <p className="font-semibold">{formatTime(selectedSale.createdAt)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">{language === 'uz' ? 'Mahsulotlar' : 'Продукты'}</h4>
                <div className="space-y-3">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                          <p>{t('quantity')}: {item.quantity}</p>
                          {item.customWidth && item.customHeight && (
                            <p>{t('dimensions')}: {item.customWidth}x{item.customHeight} mm</p>
                          )}
                          {item.cuttingService && (
                            <p>{t('cuttingService')}: {formatCurrency(item.cuttingService.total)} {language === 'uz' ? "so'm" : "сум"}</p>
                          )}
                          {item.edgeBandingService && (
                            <p>{t('edgeBandingService')}: {formatCurrency(item.edgeBandingService.total)} {language === 'uz' ? "so'm" : "сум"}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.product.unitPrice * item.quantity)} {language === 'uz' ? "so'm" : "сум"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('subtotal')}</span>
                  <span className="font-semibold">{formatCurrency(selectedSale.subtotal)} {language === 'uz' ? "so'm" : "сум"}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('discount')}</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(selectedSale.discount)} {language === 'uz' ? "so'm" : "сум"}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(selectedSale.total)} {language === 'uz' ? "so'm" : "сум"}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500 dark:text-gray-400">{t('paymentMethod')}</span>
                  {getPaymentMethodBadge(selectedSale.paymentMethod)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>
              {language === 'uz' ? 'Yopish' : 'Закрыть'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};