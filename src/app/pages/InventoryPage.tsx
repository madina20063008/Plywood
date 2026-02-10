import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, AlertTriangle, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

const categories = ['MDF', 'LDSP', 'DVP', 'DSP', 'OTHER'];

export const InventoryPage: React.FC = () => {
  const { products, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const t = (key: string) => getTranslation(language, key as any);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stockQuantity < 20);

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('inventory')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' ? 'Mahsulotlarni boshqarish va ombor nazorati' : 'Управление продуктами и контроль склада'}
          </p>
        </div>
        <Button
          onClick={() => navigate('/product-creation')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          {language === 'uz' ? 'Mahsulot yaratish' : 'Создать продукт'}
        </Button>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900 dark:text-orange-200">
              <AlertTriangle className="mr-2 h-5 w-5" />
              {t('lowStockAlert')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map(product => (
                <Badge key={product.id} variant="outline" className="border-orange-400 text-orange-900 dark:text-orange-200">
                  {product.name} ({product.stockQuantity})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'uz' ? 'Barcha kategoriyalar' : 'Все категории'}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('productName')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('color')}</TableHead>
                  <TableHead>{t('dimensions')}</TableHead>
                  <TableHead>{t('thickness')}</TableHead>
                  <TableHead>{t('purchasePrice')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead>{t('stock')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{t(product.category)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: product.color }}
                        />
                        <span className="text-xs text-gray-500">{product.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.width} × {product.height} mm</TableCell>
                    <TableCell>{product.thickness} mm</TableCell>
                    <TableCell>
                      {product.purchasePrice 
                        ? `${product.purchasePrice.toLocaleString()} UZS` 
                        : '-'}
                    </TableCell>
                    <TableCell>{product.unitPrice.toLocaleString()} UZS</TableCell>
                    <TableCell>
                      <Badge variant={product.stockQuantity < 20 ? 'destructive' : 'default'}>
                        {product.stockQuantity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};