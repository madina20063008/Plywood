import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Customer } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { UserPlus, Edit, Trash2, Users, Search } from 'lucide-react';
import { toast } from 'sonner';

export const CustomersPage: React.FC = () => {
  const { 
    customers, 
    fetchCustomers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    language, 
    getCustomerBalance,
    isFetchingCustomers,
    user
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: '',
  });

  const t = (key: string) => getTranslation(language, key as any);

  // Search customers with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        fetchCustomers(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const filteredCustomers = customers;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'uz' ? 'uz-UZ' : 'ru-RU').format(amount);
  };

  const handleAddClick = () => {
    setFormData({ name: '', phone: '', address: '', email: '', notes: '' });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      email: customer.email || '',
      notes: customer.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.phone) {
      toast.error(language === 'uz' ? 'Ism va telefon raqami talab qilinadi' : 'Имя и телефон обязательны');
      return;
    }

    setIsAdding(true);
    try {
      await addCustomer({
        name: formData.name,
        phone: formData.phone,
        address: formData.address || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      });

      toast.success(t('customerAdded'));
      setIsAddDialogOpen(false);
      setFormData({ name: '', phone: '', address: '', email: '', notes: '' });
    } catch (error) {
      // Error is already handled in context
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCustomer) return;

    if (!formData.name || !formData.phone) {
      toast.error(language === 'uz' ? 'Ism va telefon raqami talab qilinadi' : 'Имя и телефон обязательны');
      return;
    }

    setIsUpdating(true);
    try {
      await updateCustomer(selectedCustomer.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      });

      toast.success(t('customerUpdated'));
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      // Error is already handled in context
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (confirm(language === 'uz' 
      ? `${customer.name} mijozini o'chirmoqchimisiz?` 
      : `Удалить клиента ${customer.name}?`)) {
      
      setIsDeleting(customer.id);
      try {
        await deleteCustomer(customer.id);
        toast.success(t('customerDeleted'));
      } catch (error) {
        // Error is already handled in context
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('customers')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {language === 'uz' 
              ? 'Doimiy mijozlarni boshqarish' 
              : 'Управление постоянными клиентами'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAddClick} 
            disabled={isAdding || isUpdating || isDeleting}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t('addCustomer')}
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{language === 'uz' ? 'Statistika' : 'Статистика'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'uz' ? 'Jami mijozlar' : 'Всего клиентов'}
              </p>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'uz' ? 'Qarzdor mijozlar' : 'Клиенты с долгом'}
              </p>
              <p className="text-2xl font-bold">
                {customers.filter(c => {
                  const balance = getCustomerBalance(c.id);
                  return balance.balance > 0;
                }).length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'uz' ? 'Aktiv mijozlar' : 'Активные клиенты'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => {
                  const balance = getCustomerBalance(c.id);
                  return balance.balance === 0;
                }).length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'uz' ? 'Umumiy qarz' : 'Общий долг'}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(customers.reduce((sum, c) => {
                  const balance = getCustomerBalance(c.id);
                  return sum + balance.balance;
                }, 0))} {language === 'uz' ? "so'm" : "сум"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      {/* Search */}
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-lg">{t('search')}</CardTitle>
    <CardDescription>
      {language === 'uz' 
        ? 'Ism yoki telefon raqami bo\'yicha qidirish' 
        : 'Поиск по имени или номеру телефона'}
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        type="search"
        placeholder={language === 'uz' 
          ? "Ism yoki telefon raqamini kiriting..." 
          : "Введите имя или номер телефона..."}
        value={searchTerm}
        onChange={handleSearchChange}
        className="pl-10"
        disabled={isFetchingCustomers}
      />
      {searchTerm && (
        <button
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      )}
    </div>
  </CardContent>
</Card>

      {/* Customers Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{language === 'uz' ? 'Mijozlar ro\'yxati' : 'Список клиентов'}</CardTitle>
              <CardDescription>
                {customers.length} {language === 'uz' ? 'ta mijoz' : 'клиентов'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isFetchingCustomers && customers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? (language === 'uz' ? 'Hech narsa topilmadi' : 'Ничего не найдено')
                  : (language === 'uz' ? 'Hozircha mijozlar yo\'q' : 'Нет клиентов')}
              </p>
              {searchTerm && (
                <Button 
                  variant="link" 
                  onClick={handleClearSearch}
                  className="mt-2"
                  disabled={isFetchingCustomers}
                >
                  {language === 'uz' ? 'Tozalash' : 'Очистить'}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">{t('customerName')}</TableHead>
                    <TableHead className="w-[150px]">{t('phone')}</TableHead>
                    <TableHead className="w-[200px]">{t('address')}</TableHead>
                    <TableHead className="w-[150px] text-right">{t('outstandingDebt')}</TableHead>
                    <TableHead className="w-[100px] text-right">
                      {language === 'uz' ? 'Amallar' : 'Действия'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const balance = getCustomerBalance(customer.id);
                    const isDeletingThis = isDeleting === customer.id;
                    
                    return (
                      <TableRow 
                        key={customer.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {customer.address || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={
                            balance.balance > 0 
                              ? 'font-semibold text-red-600' 
                              : 'text-green-600'
                          }>
                            {formatCurrency(balance.balance)} {language === 'uz' ? "so'm" : "сум"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(customer)}
                              disabled={isUpdating || isDeleting === customer.id}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer)}
                              disabled={isUpdating || isDeleting === customer.id}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {isDeletingThis ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!isAdding) {
          setIsAddDialogOpen(open);
          if (!open) {
            setFormData({ name: '', phone: '', address: '', email: '', notes: '' });
          }
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('addCustomer')}</DialogTitle>
            <DialogDescription>
              {language === 'uz' 
                ? 'Yangi mijoz ma\'lumotlarini kiriting' 
                : 'Введите информацию о новом клиенте'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('customerName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'uz' ? 'Masalan: Anvar Aliyev' : 'Например: Анвар Алиев'}
                disabled={isAdding}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('phone')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998901234567"
                disabled={isAdding}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={language === 'uz' ? 'Manzil' : 'Адрес'}
                disabled={isAdding}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@mail.com"
                disabled={isAdding}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={language === 'uz' ? 'Qo\'shimcha ma\'lumotlar' : 'Дополнительная информация'}
                rows={3}
                disabled={isAdding}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isAdding}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={isAdding || !formData.name || !formData.phone}
            >
              {isAdding ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {language === 'uz' ? 'Qo\'shilmoqda...' : 'Добавление...'}
                </>
              ) : (
                t('add')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        if (!isUpdating) {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedCustomer(null);
            setFormData({ name: '', phone: '', address: '', email: '', notes: '' });
          }
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{language === 'uz' ? 'Mijozni tahrirlash' : 'Редактировать клиента'}</DialogTitle>
            <DialogDescription>
              {language === 'uz' 
                ? 'Mijoz ma\'lumotlarini o\'zgartiring' 
                : 'Измените информацию о клиенте'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                {t('customerName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isUpdating}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">
                {t('phone')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">{t('address')}</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@mail.com"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">{t('notes')}</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleEdit} 
              disabled={isUpdating || !formData.name || !formData.phone}
            >
              {isUpdating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...'}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};