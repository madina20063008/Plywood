import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Customer } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Calendar, User, CreditCard, Eye, Users, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerLedgerPage: React.FC = () => {
  const { 
    customers, 
    customerTransactions, 
    addCustomerTransaction, 
    getCustomerBalance, 
    currentUser,
    language,
    debtStats,
    fetchDebtStats,
    isFetchingDebtStats
  } = useApp();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');

  // Fetch debt stats on component mount
  useEffect(() => {
    fetchDebtStats();
  }, []);

  const t = (key: string) => getTranslation(language, key as any);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'uz' ? 'uz-UZ' : 'ru-RU').format(amount);
  };

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

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleAddPayment = () => {
    if (!selectedCustomer) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(language === 'uz' ? 'To\'g\'ri summa kiriting' : 'Введите корректную сумму');
      return;
    }

    addCustomerTransaction({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      type: 'payment',
      amount: amount,
      description: paymentDescription || undefined,
      processedBy: currentUser?.full_name || currentUser?.username || '',
    });

    // Refresh debt stats after adding payment
    fetchDebtStats();

    toast.success(t('paymentAdded'));
    setIsPaymentDialogOpen(false);
    setPaymentAmount('');
    setPaymentDescription('');
  };

  const getCustomerTransactions = (customerId: string) => {
    return customerTransactions
      .filter(t => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('customerLedger')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {language === 'uz' 
            ? 'Mijozlar bilan moliyaviy hisob-kitob' 
            : 'Финансовый учет с клиентами'}
        </p>
      </div>

      {/* Statistics Cards - Using debtStats from API */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalDebt')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingDebtStats ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(debtStats?.total_debt || 0)} {language === 'uz' ? "so'm" : "сум"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? 'Umumiy qarz' : 'Общая задолженность'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'uz' ? 'Qarzdor mijozlar' : 'Клиенты с долгом'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingDebtStats ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{debtStats?.debtor_customers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? `${customers.length} mijozdan` : `Из ${customers.length} клиентов`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('creditSales')}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingDebtStats ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{debtStats?.nasiya_sales || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' ? 'Nasiya sotuvlar soni' : 'Количество кредитных продаж'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'uz' ? 'Mijozlar ro\'yxati' : 'Список клиентов'}</CardTitle>
            <CardDescription>
              {language === 'uz' 
                ? 'Tafsilotlar uchun mijozni tanlang' 
                : 'Выберите клиента для подробной информации'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('noCustomers')}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {customers.map((customer) => {
                  const balance = getCustomerBalance(customer.id);
                  const isSelected = selectedCustomer?.id === customer.id;
                  
                  return (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {customer.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${balance.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(balance.balance)} {language === 'uz' ? "so'm" : "сум"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {balance.balance > 0 ? t('outstandingDebt') : (language === 'uz' ? 'Qarz yo\'q' : 'Нет долга')}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedCustomer ? selectedCustomer.name : t('selectCustomer')}
              </CardTitle>
              {selectedCustomer && (
                <Button onClick={() => setIsPaymentDialogOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('addPayment')}
                </Button>
              )}
            </div>
            <CardDescription>
              {selectedCustomer 
                ? (language === 'uz' ? 'Moliyaviy ma\'lumotlar' : 'Финансовая информация')
                : (language === 'uz' ? 'Mijoz tanlanmagan' : 'Клиент не выбран')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="space-y-6">
                {/* Financial Summary */}
                <div className="grid gap-4 sm:grid-cols-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalPurchases')}</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(getCustomerBalance(selectedCustomer.id).totalPurchases)} {language === 'uz' ? "so'm" : "сум"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalPaid')}</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(getCustomerBalance(selectedCustomer.id).totalPayments)} {language === 'uz' ? "so'm" : "сум"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('outstandingDebt')}</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(getCustomerBalance(selectedCustomer.id).balance)} {language === 'uz' ? "so'm" : "сум"}
                    </p>
                  </div>
                </div>

                {/* Transaction History */}
                <div>
                  <h4 className="font-semibold mb-3">
                    {language === 'uz' ? 'Operatsiyalar tarixi' : 'История операций'}
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {getCustomerTransactions(selectedCustomer.id).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {language === 'uz' ? 'Hozircha operatsiyalar yo\'q' : 'Операций пока нет'}
                        </p>
                      </div>
                    ) : (
                      getCustomerTransactions(selectedCustomer.id).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-start justify-between p-3 border rounded-lg dark:border-gray-700"
                        >
                          <div className="flex items-start gap-3">
                            {transaction.type === 'purchase' ? (
                              <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                            )}
                            <div>
                              <p className="font-medium">
                                {transaction.type === 'purchase' ? t('purchase') : t('payment')}
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {transaction.description}
                                </p>
                              )}
                              {transaction.receiptNumber && (
                                <p className="text-xs text-gray-400">
                                  {t('receiptNumber')}: {transaction.receiptNumber}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {transaction.processedBy}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {transaction.type === 'purchase' ? '+' : '-'}
                              {formatCurrency(transaction.amount)} {language === 'uz' ? "so'm" : "сум"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{language === 'uz' ? 'Ma\'lumot ko\'rish uchun mijoz tanlang' : 'Выберите клиента для просмотра информации'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{t('addPayment')}</DialogTitle>
            <DialogDescription>
              {selectedCustomer && `${selectedCustomer.name} — ${language === 'uz' ? 'To\'lov qabul qilish' : 'Прием оплаты'}`}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('outstandingDebt')}:
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(getCustomerBalance(selectedCustomer.id).balance)} {language === 'uz' ? "so'm" : "сум"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-amount">{t('paymentAmount')} *</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-description">
                  {language === 'uz' ? 'Izoh (ixtiyoriy)' : 'Примечание (необязательно)'}
                </Label>
                <Input
                  id="payment-description"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder={language === 'uz' ? 'Masalan: Qisman to\'lov' : 'Например: Частичная оплата'}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAddPayment}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};