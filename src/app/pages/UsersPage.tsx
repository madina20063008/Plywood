import React, { useState } from 'react';
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
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, language } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const t = (key: string) => getTranslation(language, key as any);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'salesperson' as UserRole,
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'salesperson',
    });
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast.success(language === 'uz' ? 'Foydalanuvchi yangilandi' : 'Пользователь обновлен');
    } else {
      addUser(formData);
      toast.success(language === 'uz' ? 'Foydalanuvchi qo\'shildi' : 'Пользователь добавлен');
    }
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDelete = (user: User) => {
    if (window.confirm(language === 'uz' ? 'Foydalanuvchini o\'chirishga ishonchingiz komilmi?' : 'Вы уверены, что хотите удалить этого пользователя?')) {
      deleteUser(user.id);
      toast.success(language === 'uz' ? 'Foydalanuvchi o\'chirildi' : 'Пользователь удален');
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'manager': return 'default';
      case 'admin': return 'secondary';
      case 'salesperson': return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('users')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' ? 'Foydalanuvchilarni boshqarish' : 'Управление пользователями'}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              {t('addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? language === 'uz' ? 'Foydalanuvchini tahrirlash' : 'Редактировать пользователя' : t('addUser')}</DialogTitle>
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
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
                  placeholder={editingUser ? language === 'uz' ? 'Boshing uchun bo\'sh qoldiring' : 'Оставьте пустым для без изменений' : ''}
                />
              </div>
              <div>
                <Label htmlFor="role">{t('role')}</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesperson">{t('salesperson')}</SelectItem>
                    <SelectItem value="admin">{t('admin')}</SelectItem>
                    <SelectItem value="manager">{t('manager')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  {t('cancel')}
                </Button>
                <Button type="submit">{t('save')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fullName')}</TableHead>
                  <TableHead>{t('username')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('createdAt')}</TableHead>
                  <TableHead className="text-right">{language === 'uz' ? 'Harakatlar' : 'Действия'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {t(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'dd.MM.yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'uz' ? 'Jami foydalanuvchilar' : 'Всего пользователей'}</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('salesperson')}</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'salesperson').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin')} / {t('manager')}</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin' || u.role === 'manager').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};