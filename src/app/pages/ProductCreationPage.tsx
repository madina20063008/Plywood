import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Map API quality name to our app's quality values
const mapQualityToAppValue = (qualityName: string): 'standard' | 'economic' | 'premium' => {
  const lowerName = qualityName.toLowerCase();
  if (lowerName.includes('premium')) return 'premium';
  if (lowerName.includes('economic') || lowerName.includes('эконом')) return 'economic';
  return 'standard'; // Default to standard
};

// Map app quality value to API quality name (for finding matching ID)
const mapAppValueToQualityName = (value: 'standard' | 'economic' | 'premium'): string => {
  switch (value) {
    case 'premium':
      return 'Premium';
    case 'economic':
      return 'Economic';
    case 'standard':
    default:
      return 'Standart';
  }
};

export const ProductCreationPage: React.FC = () => {
  const { 
    addProduct, 
    isAddingProduct, 
    language, 
    categories, 
    fetchCategories,
    isFetchingCategories,
    qualities,
    fetchQualities,
    isFetchingQualities
  } = useApp();
  
  const navigate = useNavigate();
  
  // Use string values for inputs to allow empty state
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    category: '',
    color: '#000000',
    width: '',
    height: '',
    thickness: '',
    quality: 'standard' as 'standard' | 'economic' | 'premium',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = (key: string) => getTranslation(language, key as any);

  // Fetch categories and qualities on component mount
  useEffect(() => {
    fetchCategories();
    fetchQualities();
  }, []);

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories]);

  // Find the selected quality object
  const selectedQuality = qualities.find(q => 
    q.name.toLowerCase() === mapAppValueToQualityName(formData.quality).toLowerCase()
  );

  const resetForm = () => {
    setFormData({
      id: 0,
      name: '',
      category: categories[0]?.name || '',
      color: '#000000',
      width: '',
      height: '',
      thickness: '',
      quality: 'standard',
      description: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'uz' 
        ? 'Mahsulot nomi kiritilishi shart'
        : 'Название продукта обязательно';
    }

    if (!formData.category) {
      newErrors.category = language === 'uz'
        ? 'Kategoriya tanlanishi shart'
        : 'Категория должна быть выбрана';
    }

    if (!selectedQuality) {
      newErrors.quality = language === 'uz'
        ? 'Sifat tanlanishi shart'
        : 'Качество должно быть выбрано';
    }

    // Validate width
    if (!formData.width.trim()) {
      newErrors.width = language === 'uz'
        ? 'Kenglik kiritilishi shart'
        : 'Ширина должна быть введена';
    } else {
      const widthNum = Number(formData.width);
      if (isNaN(widthNum) || widthNum <= 0) {
        newErrors.width = language === 'uz'
          ? 'Kenglik musbat son bo\'lishi kerak'
          : 'Ширина должна быть положительным числом';
      }
    }

    // Validate height
    if (!formData.height.trim()) {
      newErrors.height = language === 'uz'
        ? 'Balandlik kiritilishi shart'
        : 'Высота должна быть введена';
    } else {
      const heightNum = Number(formData.height);
      if (isNaN(heightNum) || heightNum <= 0) {
        newErrors.height = language === 'uz'
          ? 'Balandlik musbat son bo\'lishi kerak'
          : 'Высота должна быть положительным числом';
      }
    }

    // Validate thickness
    if (!formData.thickness.trim()) {
      newErrors.thickness = language === 'uz'
        ? 'Qalinlik kiritilishi shart'
        : 'Толщина должна быть введена';
    } else {
      const thicknessNum = Number(formData.thickness);
      if (isNaN(thicknessNum) || thicknessNum <= 0) {
        newErrors.thickness = language === 'uz'
          ? 'Qalinlik musbat son bo\'lishi kerak'
          : 'Толщина должна быть положительным числом';
      }
    }

    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(formData.color)) {
      newErrors.color = language === 'uz'
        ? 'Rang formati noto\'g\'ri (masalan: #000000)'
        : 'Неверный формат цвета (например: #000000)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(language === 'uz' 
        ? 'Formani to\'g\'ri to\'ldiring'
        : 'Заполните форму правильно'
      );
      return;
    }
    
    try {
      // Convert string values to numbers for the API
      await addProduct({
        id: formData.id,
        name: formData.name,
        category: formData.category,
        color: formData.color,
        width: Number(formData.width),
        height: Number(formData.height),
        thickness: Number(formData.thickness),
        quality: formData.quality,
        description: formData.description,
        unitPrice: 0,
        stockQuantity: 0,
        purchasePrice: 0,
      });
      
      toast.success(language === 'uz' 
        ? 'Mahsulot muvaffaqiyatli yaratildi'
        : 'Продукт успешно создан'
      );
      
      toast.info(language === 'uz' 
        ? 'Kelish narxi va miqdorini "Mahsulot qabul qilish" sahifasida kiriting.'
        : 'Введите цену поступления и количество на странице "Приём товара".',
        { duration: 5000 }
      );
      
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
      
    } catch (error) {
      console.error('Product creation error:', error);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.description || formData.width !== '' || formData.height !== '' || formData.thickness !== '') {
      if (window.confirm(language === 'uz' 
        ? 'O\'zgarishlar saqlanmaydi. Chiqishni xohlaysizmi?'
        : 'Изменения не будут сохранены. Вы хотите выйти?'
      )) {
        navigate('/inventory');
      }
    } else {
      navigate('/inventory');
    }
  };

  const handleNumberInput = (field: 'width' | 'height' | 'thickness', value: string) => {
    // Allow empty string, numbers, and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const getQualityLabel = (qualityName: string) => {
    return qualityName || formData.quality;
  };

  // Loading state
  if (isFetchingCategories || isFetchingQualities) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">
          {language === 'uz' ? 'Ma\'lumotlar yuklanmoqda...' : 'Загрузка данных...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isAddingProduct}
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
              <Label htmlFor="name">
                {t('productName')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'uz' ? 'Masalan: LDSP Qora' : 'Например: LDSP Черный'}
                disabled={isAddingProduct}
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category - From API */}
              <div>
                <Label htmlFor="category">
                  {t('category')}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isAddingProduct || categories.length === 0}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder={language === 'uz' ? 'Kategoriyani tanlang' : 'Выберите категорию'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
                {categories.length === 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    {language === 'uz' 
                      ? 'Kategoriyalar topilmadi. Avval kategoriya yarating.' 
                      : 'Категории не найдены. Сначала создайте категорию.'}
                  </p>
                )}
              </div>

              {/* Quality - From API */}
              <div>
                <Label htmlFor="quality">
                  {t('quality')}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select 
                  value={formData.quality} 
                  onValueChange={(value: 'standard' | 'economic' | 'premium') => 
                    setFormData({ ...formData, quality: value })
                  }
                  disabled={isAddingProduct || qualities.length === 0}
                >
                  <SelectTrigger className={errors.quality ? 'border-red-500' : ''}>
                    <SelectValue placeholder={language === 'uz' ? 'Sifatni tanlang' : 'Выберите качество'} />
                  </SelectTrigger>
                  <SelectContent>
                    {qualities.map((quality) => (
                      <SelectItem 
                        key={quality.id} 
                        value={mapQualityToAppValue(quality.name)}
                      >
                        {quality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.quality && (
                  <p className="text-sm text-red-500 mt-1">{errors.quality}</p>
                )}
                {qualities.length === 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    {language === 'uz' 
                      ? 'Sifatlar topilmadi.' 
                      : 'Качества не найдены.'}
                  </p>
                )}
              </div>
            </div>

            {/* Color */}
            <div>
              <Label htmlFor="color">
                {t('color')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-3">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-12 w-24 cursor-pointer"
                  disabled={isAddingProduct}
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#000000"
                  className={`flex-1 ${errors.color ? 'border-red-500' : ''}`}
                  disabled={isAddingProduct}
                />
              </div>
              {errors.color ? (
                <p className="text-sm text-red-500 mt-1">{errors.color}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {language === 'uz' 
                    ? 'Rangni tanlang yoki HEX kod kiriting' 
                    : 'Выберите цвет или введите HEX код'}
                </p>
              )}
            </div>

            {/* Dimensions - Fixed to allow deleting */}
            <div>
              <Label className="mb-2 block">
                {t('dimensions')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width" className="text-sm text-gray-600 dark:text-gray-400">
                    {t('width')} (mm)
                  </Label>
                  <Input
                    id="width"
                    type="text"
                    inputMode="numeric"
                    value={formData.width}
                    onChange={(e) => handleNumberInput('width', e.target.value)}
                    placeholder="2700"
                    disabled={isAddingProduct}
                    className={errors.width ? 'border-red-500' : ''}
                    required
                  />
                  {errors.width && (
                    <p className="text-sm text-red-500 mt-1">{errors.width}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm text-gray-600 dark:text-gray-400">
                    {t('height')} (mm)
                  </Label>
                  <Input
                    id="height"
                    type="text"
                    inputMode="numeric"
                    value={formData.height}
                    onChange={(e) => handleNumberInput('height', e.target.value)}
                    placeholder="1000"
                    disabled={isAddingProduct}
                    className={errors.height ? 'border-red-500' : ''}
                    required
                  />
                  {errors.height && (
                    <p className="text-sm text-red-500 mt-1">{errors.height}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="thickness" className="text-sm text-gray-600 dark:text-gray-400">
                    {t('thickness')} (mm)
                  </Label>
                  <Input
                    id="thickness"
                    type="text"
                    inputMode="numeric"
                    value={formData.thickness}
                    onChange={(e) => handleNumberInput('thickness', e.target.value)}
                    placeholder="16"
                    disabled={isAddingProduct}
                    className={errors.thickness ? 'border-red-500' : ''}
                    required
                  />
                  {errors.thickness && (
                    <p className="text-sm text-red-500 mt-1">{errors.thickness}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                {language === 'uz' ? 'Tavsif' : 'Описание'}
              </Label>
              <Input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'uz' 
                  ? 'Mahsulot haqida qo\'shimcha ma\'lumot' 
                  : 'Дополнительная информация о продукте'
                }
                disabled={isAddingProduct}
              />
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
                    {formData.category || (language === 'uz' ? 'Kategoriya' : 'Категория')} • {selectedQuality?.name || formData.quality}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formData.width || '0'} × {formData.height || '0'} × {formData.thickness || '0'} mm
                  </p>
                  {formData.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formData.description}
                    </p>
                  )}
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
                onClick={handleCancel}
                disabled={isAddingProduct}
              >
                {t('cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isAddingProduct || categories.length === 0 || qualities.length === 0}
              >
                {isAddingProduct ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'uz' ? 'Yaratilmoqda...' : 'Создание...'}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {language === 'uz' ? 'Mahsulot yaratish' : 'Создать продукт'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};