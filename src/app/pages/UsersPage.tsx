import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { User, UserRole } from '../../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Users as UsersIcon, Loader2, UserCog, UserCheck, Shield, MoreVertical, Phone, Calendar, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { ScrollArea } from '../components/ui/scroll-area';

export const UsersPage: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    fetchUsers,
    userStats,
    fetchUserStats,
    isFetchingUsers,
    isFetchingUserStats,
    isAddingUser,
    isUpdatingUser,
    isDeletingUser,
    language 
  } = useApp();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const t = (key: string) => getTranslation(language, key as any);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    phone_number: '',
    role: 'salesperson' as UserRole,
  });

  // Fetch users and stats on component mount
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      full_name: '',
      phone_number: '',
      role: 'salesperson',
    });
    setEditingUser(null);
    setSelectedUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name,
      phone_number: user.phone_number || '',
      role: user.role,
    });
    setIsAddDialogOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      await fetchUserStats();
      toast.success(language === 'uz' ? 'Foydalanuvchi o\'chirildi' : 'Пользователь удален');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      // Error is already handled in context
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const updateData: Partial<Omit<User, 'id' | 'createdAt'>> = {
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role,
          phone_number: formData.phone_number,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await updateUser(editingUser.id, updateData);
        toast.success(language === 'uz' ? 'Foydalanuvchi yangilandi' : 'Пользователь обновлен');
      } else {
        await addUser(formData);
        toast.success(language === 'uz' ? 'Foydalanuvchi qo\'shildi' : 'Пользователь добавлен');
      }
      
      await fetchUserStats();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'manager': return 'default';
      case 'admin': return 'secondary';
      case 'salesperson': return 'outline';
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'salesperson': return language === 'uz' ? 'Sotuvchi' : 'Продавец';
      case 'admin': return language === 'uz' ? 'Admin' : 'Админ';
      case 'manager': return language === 'uz' ? 'Menejer' : 'Менеджер';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'salesperson': return <UserCheck className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'manager': return <UserCog className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'salesperson': return 'text-green-600 dark:text-green-400';
      case 'admin': return 'text-purple-600 dark:text-purple-400';
      case 'manager': return 'text-blue-600 dark:text-blue-400';
    }
  };

  // Mobile User Card Component
  const MobileUserCard = ({ user }: { user: User }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`rounded-full p-2 ${getRoleColor(user.role)} bg-opacity-10`}>
                {getRoleIcon(user.role)}
              </div>
              <div>
                <h3 className="font-semibold text-base">{user.full_name}</h3>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-3">
              {user.phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{user.phone_number}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>{format(new Date(user.createdAt), 'dd.MM.yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                  {getRoleIcon(user.role)}
                  {getRoleName(user.role)}
                </Badge>
              </div>
            </div>
          </div>
          
          <Sheet open={isMobileMenuOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
            setIsMobileMenuOpen(open);
            if (!open) setSelectedUser(null);
          }}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedUser(user)}
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-xl">
              <SheetHeader>
                <SheetTitle className="text-left">{user.full_name}</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleEdit(user)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {language === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteClick(user)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {language === 'uz' ? 'O\'chirish' : 'Удалить'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('users')}</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' ? 'Foydalanuvchilarni boshqarish' : 'Управление пользователями'}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="default" className="w-full sm:w-auto" disabled={isAddingUser || isUpdatingUser}>
              <Plus className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">{t('addUser')}</span>
              <span className="sm:hidden">{language === 'uz' ? 'Qo\'shish' : 'Добавить'}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingUser 
                  ? language === 'uz' ? 'Foydalanuvchini tahrirlash' : 'Редактировать пользователя' 
                  : t('addUser')}
              </DialogTitle>
              <DialogDescription>
                {language === 'uz' 
                  ? 'Foydalanuvchi ma\'lumotlarini kiriting' 
                  : 'Введите информацию о пользователе'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('fullName')}</Label>
                <Input
                  id="name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="phone_number">
                  {language === 'uz' ? 'Telefon raqam' : 'Номер телефона'}
                </Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+998901234567"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder={editingUser 
                    ? language === 'uz' ? 'O\'zgartirish uchun kiriting' : 'Введите для изменения' 
                    : ''}
                  className="w-full"
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'uz' 
                      ? 'Parolni o\'zgartirish uchun kiriting' 
                      : 'Введите пароль для изменения'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="role">{t('role')}</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesperson">{t('salesperson')}</SelectItem>
                    <SelectItem value="admin">{t('admin')}</SelectItem>
                    <SelectItem value="manager">{t('manager')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isAddingUser || isUpdatingUser}
                  className="w-full sm:w-auto"
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isAddingUser || isUpdatingUser}
                  className="w-full sm:w-auto"
                >
                  {(isAddingUser || isUpdatingUser) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            {isFetchingUserStats ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3">
                  <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {language === 'uz' ? 'Jami foydalanuvchilar' : 'Всего пользователей'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{userStats.total_users}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            {isFetchingUserStats ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 sm:p-3">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {language === 'uz' ? 'Sotuvchilar' : 'Продавцы'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{userStats.total_salers}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            {isFetchingUserStats ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {language === 'uz' ? 'Admin / Menejer' : 'Админ / Менеджер'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{userStats.total_admins}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users Table/Cards */}
      <Card>
        <CardContent className="p-0">
          {isFetchingUsers ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-sm sm:text-base text-gray-500">
                {language === 'uz' ? 'Foydalanuvchilar yuklanmoqda...' : 'Загрузка пользователей...'}
              </span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm sm:text-base text-gray-500">
                {language === 'uz' 
                  ? 'Foydalanuvchilar mavjud emas' 
                  : 'Нет пользователей'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="block sm:hidden p-4">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {users.map((user) => (
                    <MobileUserCard key={user.id} user={user} />
                  ))}
                </ScrollArea>
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">{t('fullName')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('username')}</TableHead>
                      <TableHead className="whitespace-nowrap">
                        {language === 'uz' ? 'Telefon raqam' : 'Номер телефона'}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">{t('role')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('createdAt')}</TableHead>
                      <TableHead className="text-right whitespace-nowrap">
                        {language === 'uz' ? 'Harakatlar' : 'Действия'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium whitespace-nowrap">{user.full_name}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.username}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.phone_number || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit whitespace-nowrap">
                            {getRoleIcon(user.role)}
                            {getRoleName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(user.createdAt), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              disabled={isUpdatingUser || isDeletingUser}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              disabled={isDeletingUser}
                            >
                              {isDeletingUser ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {language === 'uz' ? 'Foydalanuvchini o\'chirish' : 'Удаление пользователя'}
            </DialogTitle>
            <DialogDescription>
              {language === 'uz' 
                ? `"${userToDelete?.full_name}" foydalanuvchisini o\'chirishga ishonchingiz komilmi? Bu amalni ortga qaytarib bo\'lmaydi.`
                : `Вы уверены, что хотите удалить пользователя "${userToDelete?.full_name}"? Это действие нельзя отменить.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
              className="w-full sm:w-auto"
            >
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto"
            >
              {language === 'uz' ? 'O\'chirish' : 'Удалить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};