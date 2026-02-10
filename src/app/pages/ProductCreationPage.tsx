import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['MDF', 'LDSP', 'DVP', 'DSP', 'OTHER'];
const qualities = ['Премиум', 'Стандарт', 'Эконом'];

export const ProductCreationPage: React.FC = () => {
  const { addProduct, language } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'LDSP',
    color: '#000000',
    width: 2700,
    height: 1000,
    thickness: 16,
    quality: 'Стандарт',
    enabled: true,
  });

  const t = (key: string) => getTranslation(language, key as any);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'LDSP',
      color: '#000000',
      width: 2700,
      height: 1000,
      thickness: 16,
      quality: 'Стандарт',
      enabled: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create product with default values for price and stock
    addProduct({
      ...formData,
      unitPrice: 0,
      stockQuantity: 0,
      purchasePrice: 0,
    });
    
    toast.success(language === 'uz' 
      ? 'Mahsulot muvaffaqiyatli yaratildi. Kelish narxi va miqdorini "Mahsulot qabul qilish" sahifasida kiriting.'
      : 'Продукт успешно создан. Введите цену поступления и количество на странице "Приём товара".'
    );
    
    resetForm();
  };

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
            {language === 'uz' ? 'Yangi mahsulot yaratish' : 'Создание нового продукта'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' 
              ? 'Mahsulotning asosiy xususiyatlarini kiriting' 
              : 'Введите основные характеристики продукта'}
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>
            {language === 'uz' ? 'Mahsulot ma\'lumotlari' : 'Информация о продукте'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="name">{t('productName')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'uz' ? 'Masalan: LDSP Qora' : 'Например: LDSP Черный'}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <Label htmlFor="category">{t('category')}</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality */}
              <div>
                <Label htmlFor="quality">{t('quality')}</Label>
                <Select 
                  value={formData.quality} 
                  onValueChange={(value) => setFormData({ ...formData, quality: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualities.map(q => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color */}
            <div>
              <Label htmlFor="color">{t('color')}</Label>
              <div className="flex gap-3">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-12 w-24 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {language === 'uz' 
                  ? 'Rangni tanlang yoki HEX kod kiriting' 
                  : 'Выберите цвет или введите HEX код'}
              </p>
            </div>

            {/* Dimensions */}
            <div>
              <Label className="mb-2 block">{t('dimensions')}</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width" className="text-sm text-gray-600 dark:text-gray-400">
                    {t('width')} (mm)
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm text-gray-600 dark:text-gray-400">
                    {t('height')} (mm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="thickness" className="text-sm text-gray-600 dark:text-gray-400">
                    {t('thickness')} (mm)
                  </Label>
                  <Input
                    id="thickness"
                    type="number"
                    value={formData.thickness}
                    onChange={(e) => setFormData({ ...formData, thickness: Number(e.target.value) })}
                    required
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
              <Label className="mb-3 block">
                {language === 'uz' ? 'Ko\'rinish' : 'Предварительный просмотр'}
              </Label>
              <div className="flex items-center gap-4">
                <div 
                  className="h-16 w-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: formData.color }}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formData.name || (language === 'uz' ? 'Mahsulot nomi' : 'Название продукта')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(formData.category)} • {formData.quality}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formData.width} × {formData.height} × {formData.thickness} mm
                  </p>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                {language === 'uz' 
                  ? '💡 Mahsulotning kelish narxi va miqdori "Mahsulot qabul qilish" sahifasida kiritiladi.'
                  : '💡 Цена поступления и количество товара вводятся на странице "Приём товара".'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/inventory')}
              >
                {t('cancel')}
              </Button>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                {language === 'uz' ? 'Mahsulot yaratish' : 'Создать продукт'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};