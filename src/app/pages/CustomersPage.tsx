import React, { useState } from 'react';
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
  const { customers, addCustomer, updateCustomer, deleteCustomer, language, getCustomerBalance } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: '',
  });

  const t = (key: string) => getTranslation(language, key as any);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

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

  const handleAdd = () => {
    if (!formData.name || !formData.phone) {
      toast.error(language === 'uz' ? 'Ism va telefon raqami talab qilinadi' : 'Имя и телефон обязательны');
      return;
    }

    addCustomer({
      name: formData.name,
      phone: formData.phone,
      address: formData.address || undefined,
      email: formData.email || undefined,
      notes: formData.notes || undefined,
    });

    toast.success(t('customerAdded'));
    setIsAddDialogOpen(false);
    setFormData({ name: '', phone: '', address: '', email: '', notes: '' });
  };

  const handleEdit = () => {
    if (!selectedCustomer) return;

    if (!formData.name || !formData.phone) {
      toast.error(language === 'uz' ? 'Ism va telefon raqami talab qilinadi' : 'Имя и телефон обязательны');
      return;
    }

    updateCustomer(selectedCustomer.id, {
      name: formData.name,
      phone: formData.phone,
      address: formData.address || undefined,
      email: formData.email || undefined,
      notes: formData.notes || undefined,
    });

    toast.success(t('customerUpdated'));
    setIsEditDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleDelete = (customer: Customer) => {
    if (confirm(language === 'uz' 
      ? `${customer.name} mijozini o'chirmoqchimisiz?` 
      : `Удалить клиента ${customer.name}?`)) {
      deleteCustomer(customer.id);
      toast.success(t('customerDeleted'));
    }
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
        <Button onClick={handleAddClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('addCustomer')}
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>{language === 'uz' ? 'Statistika' : 'Статистика'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'uz' ? 'Jami mijozlar' : 'Всего клиентов'}
              </p>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
            <div>
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
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t('search')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={language === 'uz' ? 'Ism yoki telefon...' : 'Имя или телефон...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'uz' ? 'Mijozlar ro\'yxati' : 'Список клиентов'}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('noCustomers')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('customerName')}</TableHead>
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead>{t('address')}</TableHead>
                    <TableHead className="text-right">{t('outstandingDebt')}</TableHead>
                    <TableHead className="text-right">
                      {language === 'uz' ? 'Amallar' : 'Действия'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const balance = getCustomerBalance(customer.id);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.address || '-'}</TableCell>
                        <TableCell className="text-right">
                          <span className={balance.balance > 0 ? 'font-semibold text-red-600' : 'text-green-600'}>
                            {formatCurrency(balance.balance)} {language === 'uz' ? 'so\'m' : 'сум'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              <Label htmlFor="name">{t('customerName')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'uz' ? 'Masalan: Anvar Aliyev' : 'Например: Анвар Алиев'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')} *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={language === 'uz' ? 'Manzil' : 'Адрес'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAdd}>{t('add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              <Label htmlFor="edit-name">{t('customerName')} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">{t('phone')} *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">{t('address')}</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t('email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">{t('notes')}</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleEdit}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
