import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { CartItem, EdgeBandingPrice, CuttingService, EdgeBandingService } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Trash2, Plus, Scissors, Ruler, ShoppingBag, Receipt as ReceiptIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const edgeBandingPrices: EdgeBandingPrice[] = [
  { thickness: 0.4, label: '0.4 cm', price: 2800 },
  { thickness: 1, label: '1 cm', price: 3200 },
  { thickness: 2, label: '2 cm', price: 3500 },
  { thickness: 0.32, label: '0.32 cm (Premium)', price: 6000 },
];

export const CartPage: React.FC = () => {
  const { cart, updateCartItem, removeFromCart, completeSale, currentUser, language, clearCart, customers } = useApp();
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [isCuttingDialogOpen, setIsCuttingDialogOpen] = useState(false);
  const [isEdgeBandingDialogOpen, setIsEdgeBandingDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('anonymous');
  const navigate = useNavigate();

  const t = (key: string) => getTranslation(language, key as any);

  // Cutting service form
  const [cuttingForm, setCuttingForm] = useState({
    numberOfBoards: 1,
    pricePerCut: 20000,
  });

  // Edge banding form
  const [edgeBandingForm, setEdgeBandingForm] = useState({
    thickness: 0.4,
    width: 0,
    height: 0,
    pricePerMeter: 2800,
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed' | 'credit'>('cash');
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  const handleAddCutting = () => {
    if (!selectedItem) return;

    const cuttingService: CuttingService = {
      id: Date.now().toString(),
      numberOfBoards: cuttingForm.numberOfBoards,
      pricePerCut: cuttingForm.pricePerCut,
      total: cuttingForm.numberOfBoards * cuttingForm.pricePerCut,
    };

    updateCartItem(selectedItem.id, { cuttingService });
    setIsCuttingDialogOpen(false);
    toast.success(language === 'uz' ? 'Kesish xizmati qo\'shildi' : 'Услуга распила добавлена');
  };

  const handleAddEdgeBanding = () => {
    if (!selectedItem) return;

    const perimeter = 2 * (edgeBandingForm.width + edgeBandingForm.height);
    const linearMeters = perimeter / 1000; // Convert mm to meters

    const edgeBandingService: EdgeBandingService = {
      id: Date.now().toString(),
      thickness: edgeBandingForm.thickness,
      width: edgeBandingForm.width,
      height: edgeBandingForm.height,
      pricePerMeter: edgeBandingForm.pricePerMeter,
      linearMeters,
      total: linearMeters * edgeBandingForm.pricePerMeter,
    };

    updateCartItem(selectedItem.id, { edgeBandingService });
    setIsEdgeBandingDialogOpen(false);
    toast.success(language === 'uz' ? 'Kromkalash xizmati qo\'shildi' : 'Услуга кромкования добавлена');
  };

  const calculateItemTotal = (item: CartItem): number => {
    let total = item.product.unitPrice * item.quantity;
    if (item.cuttingService) total += item.cuttingService.total;
    if (item.edgeBandingService) total += item.edgeBandingService.total;
    return total;
  };

  const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const total = subtotal - discount;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    
    const saleData: any = {
      salespersonId: currentUser!.id,
      salespersonName: currentUser!.name,
      items: cart,
      subtotal,
      discount,
      total,
      paymentMethod,
    };

    // If payment method is credit, add payment tracking
    if (paymentMethod === 'credit') {
      saleData.amountPaid = amountPaid;
      saleData.amountDue = total - amountPaid;
    }

    // If a regular customer is selected, add customer info
    if (selectedCustomer) {
      saleData.customerId = selectedCustomer.id;
      saleData.customerName = selectedCustomer.name;
    }

    const receiptNum = completeSale(saleData);

    setReceiptNumber(receiptNum);
    setSelectedCustomerId('anonymous'); // Reset to anonymous
    setPaymentMethod('cash'); // Reset to cash
    setAmountPaid(0); // Reset amount paid
    toast.success(t('saleCompleted'));
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (receiptNumber) {
    return (
      <div className="space-y-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center bg-green-50 dark:bg-green-900/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <ReceiptIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">
              {language === 'uz' ? 'Sotuv muvaffaqiyatli yakunlandi!' : 'Продажа успешно завершена!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('receiptNumber')}</p>
                <p className="text-2xl font-bold">{receiptNumber}</p>
              </div>
              <Separator />
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('total')}</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{total.toLocaleString()} UZS</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" size="lg" onClick={handlePrintReceipt}>
              {t('print')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setReceiptNumber(null);
                navigate('/products');
              }}
            >
              {language === 'uz' ? 'Yangi sotuv' : 'Новая продажа'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('cart')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' ? 'Savatchadagi mahsulotlar va xizmatlar' : 'Продукты и услуги в корзине'}
          </p>
        </div>
        {cart.length > 0 && (
          <Button variant="outline" onClick={() => clearCart()}>
            {language === 'uz' ? 'Savatchani tozalash' : 'Очистить корзину'}
          </Button>
        )}
      </div>

      {cart.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">{t('emptyCart')}</p>
              <Button className="mt-6" onClick={() => navigate('/products')}>
                {language === 'uz' ? 'Mahsulotlarni ko\'rish' : 'Посмотреть продукты'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div 
                      className="h-24 w-24 rounded-lg border-2 flex-shrink-0"
                      style={{ backgroundColor: item.product.color }}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{item.product.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.product.width} × {item.product.height} × {item.product.thickness} mm
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label>{t('quantity')}:</Label>
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stockQuantity}
                            value={item.quantity}
                            onChange={(e) => updateCartItem(item.id, { quantity: Number(e.target.value) })}
                            className="w-20"
                          />
                        </div>
                        <p className="font-semibold">{item.product.unitPrice.toLocaleString()} UZS</p>
                      </div>

                      {/* Services */}
                      <div className="flex flex-wrap gap-2">
                        <Dialog open={isCuttingDialogOpen && selectedItem?.id === item.id} onOpenChange={(open) => {
                          setIsCuttingDialogOpen(open);
                          if (open) setSelectedItem(item);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Scissors className="mr-2 h-4 w-4" />
                              {item.cuttingService ? language === 'uz' ? 'Kesishni tahrirlash' : 'Изменить распил' : t('addCutting')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('cuttingService')}</DialogTitle>
                              <DialogDescription>
                                {language === 'uz' 
                                  ? 'Kesish xizmati parametrlarini kiriting' 
                                  : 'Введите параметры услуги резки'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>{t('numberOfBoards')}</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={cuttingForm.numberOfBoards}
                                  onChange={(e) => setCuttingForm({ ...cuttingForm, numberOfBoards: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>{t('pricePerCut')} (UZS)</Label>
                                <Input
                                  type="number"
                                  value={cuttingForm.pricePerCut}
                                  onChange={(e) => setCuttingForm({ ...cuttingForm, pricePerCut: Number(e.target.value) })}
                                />
                              </div>
                              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('total')}</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {(cuttingForm.numberOfBoards * cuttingForm.pricePerCut).toLocaleString()} UZS
                                </p>
                              </div>
                              <Button className="w-full" onClick={handleAddCutting}>
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
                            <Button variant="outline" size="sm">
                              <Ruler className="mr-2 h-4 w-4" />
                              {item.edgeBandingService ? language === 'uz' ? 'Kromkani tahrirlash' : 'Изменить кромку' : t('addEdgeBanding')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('edgeBandingService')}</DialogTitle>
                              <DialogDescription>
                                {language === 'uz' 
                                  ? 'Kromkalash xizmati parametrlarini kiriting' 
                                  : 'Введите параметры услуги кромкования'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>{t('thickness')}</Label>
                                <Select 
                                  value={edgeBandingForm.thickness.toString()} 
                                  onValueChange={(value) => {
                                    const selected = edgeBandingPrices.find(p => p.thickness === Number(value));
                                    if (selected) {
                                      setEdgeBandingForm({
                                        ...edgeBandingForm,
                                        thickness: selected.thickness,
                                        pricePerMeter: selected.price,
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {edgeBandingPrices.map((price) => (
                                      <SelectItem key={price.thickness} value={price.thickness.toString()}>
                                        {price.label} - {price.price.toLocaleString()} UZS/{language === 'uz' ? 'м' : 'м'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>{t('width')} (mm)</Label>
                                  <Input
                                    type="number"
                                    value={edgeBandingForm.width}
                                    onChange={(e) => setEdgeBandingForm({ ...edgeBandingForm, width: Number(e.target.value) })}
                                  />
                                </div>
                                <div>
                                  <Label>{t('height')} (mm)</Label>
                                  <Input
                                    type="number"
                                    value={edgeBandingForm.height}
                                    onChange={(e) => setEdgeBandingForm({ ...edgeBandingForm, height: Number(e.target.value) })}
                                  />
                                </div>
                              </div>
                              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">{t('linearMeters')}</span>
                                  <span className="font-medium">
                                    {((2 * (edgeBandingForm.width + edgeBandingForm.height)) / 1000).toFixed(2)} {language === 'uz' ? 'м' : 'м'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{t('total')}</span>
                                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {(((2 * (edgeBandingForm.width + edgeBandingForm.height)) / 1000) * edgeBandingForm.pricePerMeter).toLocaleString()} UZS
                                  </span>
                                </div>
                              </div>
                              <Button className="w-full" onClick={handleAddEdgeBanding}>
                                {t('add')}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Service summaries */}
                      {(item.cuttingService || item.edgeBandingService) && (
                        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
                          {item.cuttingService && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('cuttingService')} ({item.cuttingService.numberOfBoards}×)
                              </span>
                              <span className="font-medium">{item.cuttingService.total.toLocaleString()} UZS</span>
                            </div>
                          )}
                          {item.edgeBandingService && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('edgeBandingService')} ({item.edgeBandingService.linearMeters.toFixed(2)}{language === 'uz' ? 'м' : 'м'})
                              </span>
                              <span className="font-medium">{item.edgeBandingService.total.toLocaleString()} UZS</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium">{language === 'uz' ? 'Jami:' : 'Итого:'}</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {calculateItemTotal(item).toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>{language === 'uz' ? 'To\'lov ma\'lumotlari' : 'Информация об оплате'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                    <span className="font-medium">{subtotal.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="flex-shrink-0">{t('discount')}:</Label>
                    <Input
                      type="number"
                      min="0"
                      max={subtotal}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {total.toLocaleString()} UZS
                  </span>
                </div>
                <div>
                  <Label>{t('paymentMethod')}</Label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t('cash')}</SelectItem>
                      <SelectItem value="card">{t('card')}</SelectItem>
                      <SelectItem value="mixed">{t('mixed')}</SelectItem>
                      <SelectItem value="credit">{t('credit')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentMethod === 'credit' && (
                  <div className="space-y-2">
                    <Label>{t('amountPaid')} (UZS)</Label>
                    <Input
                      type="number"
                      min="0"
                      max={total}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="flex-1"
                      placeholder={language === 'uz' ? '0 = To\'liq nasiya' : '0 = Полный кредит'}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language === 'uz' 
                        ? `${t('remainingDebt')}: ${(total - amountPaid).toLocaleString()} UZS` 
                        : `${t('remainingDebt')}: ${(total - amountPaid).toLocaleString()} UZS`}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <ReceiptIcon className="mr-2 h-5 w-5" />
                      {t('checkout')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{language === 'uz' ? 'Sotuvni tasdiqlash' : 'Подтвердить продажу'}</DialogTitle>
                      <DialogDescription>
                        {language === 'uz' 
                          ? 'Sotuv ma\'lumotlarini tekshiring va tasdiqlang' 
                          : 'Проверьте и подтвердите информацию о продаже'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>{language === 'uz' ? 'Mijoz tanlash' : 'Выбрать клиента'}</Label>
                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="anonymous">
                              {language === 'uz' ? 'Anonim mijoz (bir martalik)' : 'Анонимный клиент (разовый)'}
                            </SelectItem>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} ({customer.phone})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {language === 'uz' 
                            ? 'Doimiy mijozlar uchun ismini tanlang' 
                            : 'Выберите имя для постоянных клиентов'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{language === 'uz' ? 'Mahsulotlar' : 'Продукты'}</span>
                          <span className="font-medium">{cart.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                          <span className="font-medium">{subtotal.toLocaleString()} UZS</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('discount')}</span>
                          <span className="font-medium">-{discount.toLocaleString()} UZS</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">{t('total')}</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{total.toLocaleString()} UZS</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => {
                          handleCheckout();
                          setIsCheckoutDialogOpen(false);
                        }}
                      >
                        {language === 'uz' ? 'Tasdiqlash va yakunlash' : 'Подтвердить и завершить'}
                      </Button>
                    </div>
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