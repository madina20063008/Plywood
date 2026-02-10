import React, { useMemo, useState } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

export const ReportsPage: React.FC = () => {
  const { sales, language } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const t = (key: string) => getTranslation(language, key as any);

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      switch (selectedPeriod) {
        case 'today':
          return saleDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return saleDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [sales, selectedPeriod]);

  const totals = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalDiscount = filteredSales.reduce((sum, sale) => sum + sale.discount, 0);
    const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items.length, 0);

    return { totalRevenue, totalDiscount, totalItems };
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('reports')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' ? 'Sotuvlar hisoboti va tahlil' : 'Отчет о продажах и анализ'}
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          {language === 'uz' ? 'Excel yuklab olish' : 'Скачать Excel'}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'uz' ? 'Jami sotuvlar' : 'Всего продаж'}</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{filteredSales.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'uz' ? 'Jami daromad' : 'Общая выручка'}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totals.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">UZS</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'uz' ? 'Jami chegirma' : 'Общие скидки'}</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totals.totalDiscount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">UZS</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{language === 'uz' ? 'Sotuvlar tarixi' : 'История продаж'}</CardTitle>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'uz' ? 'Barcha vaqt' : 'Все время'}</SelectItem>
                <SelectItem value="today">{language === 'uz' ? 'Bugun' : 'Сегодня'}</SelectItem>
                <SelectItem value="week">{language === 'uz' ? 'Oxirgi 7 kun' : 'Последние 7 дней'}</SelectItem>
                <SelectItem value="month">{language === 'uz' ? 'Oxirgi 30 kun' : 'Последние 30 дней'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('receiptNumber')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{language === 'uz' ? 'Sotuvchi' : 'Продавец'}</TableHead>
                  <TableHead>{language === 'uz' ? 'Mahsulotlar' : 'Продукты'}</TableHead>
                  <TableHead>{t('paymentMethod')}</TableHead>
                  <TableHead>{t('discount')}</TableHead>
                  <TableHead className="text-right">{t('total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {language === 'uz' ? 'Sotuvlar topilmadi' : 'Продажи не найдены'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.receiptNumber}</TableCell>
                      <TableCell>{format(new Date(sale.createdAt), 'dd.MM.yyyy HH:mm')}</TableCell>
                      <TableCell>{sale.salespersonName}</TableCell>
                      <TableCell>
                        <Badge>{sale.items.length} {language === 'uz' ? 'dona' : 'шт'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(sale.paymentMethod)}</Badge>
                      </TableCell>
                      <TableCell>{sale.discount.toLocaleString()} UZS</TableCell>
                      <TableCell className="text-right font-semibold">{sale.total.toLocaleString()} UZS</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
