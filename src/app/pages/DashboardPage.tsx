import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, TrendingUp, Package, AlertTriangle, DollarSign, Scissors, Ruler } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface IncomeStats {
  total_cutting_income: number;
  today_cutting_income: number;
  total_banding_income: number;
  today_banding_income: number;
  total_income: number;
  today_income: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const DashboardPage: React.FC = () => {
  const { 
    sales = [], 
    products = [], 
    language,
    dashboardStats,
    lowStockNotifications,
    fetchDashboardStats,
    fetchLowStockNotifications
  } = useApp();

  const [incomeStats, setIncomeStats] = useState<IncomeStats>({
    total_cutting_income: 0,
    today_cutting_income: 0,
    total_banding_income: 0,
    today_banding_income: 0,
    total_income: 0,
    today_income: 0
  });

  const [isLoadingIncome, setIsLoadingIncome] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchLowStockNotifications();
    fetchIncomeStats();
  }, []);

  const fetchIncomeStats = async () => {
    setIsLoadingIncome(true);
    try {
      const response = await fetch('https://plywood.pythonanywhere.com/order/income/cutting-banding/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Income stats fetched:', data); // Debug uchun
        setIncomeStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch income stats:', error);
    } finally {
      setIsLoadingIncome(false);
    }
  };

  const t = (key: string) => getTranslation(language, key as any);

  const formatNumber = (num: number) => {
    return num.toLocaleString() + ' UZS';
  };

  const analytics = useMemo(() => {
    // Calculate total revenue with null check (fallback to dashboard stats)
    const totalRevenue = dashboardStats?.total_income || 0;
    const totalSales = (sales || []).length;

    // Revenue by day (last 7 days)
    const revenueByDay = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const dayRevenue = (sales || [])
        .filter(sale => {
          if (!sale?.createdAt) return false;
          const saleDate = startOfDay(new Date(sale.createdAt));
          return saleDate.getTime() === date.getTime();
        })
        .reduce((sum, sale) => sum + (sale?.total || 0), 0);

      return {
        date: format(date, 'dd.MM'),
        revenue: dayRevenue,
      };
    });

    // Top selling products
    const productSales: Record<string, { quantity: number; revenue: number; name: string }> = {};
    
    (sales || []).forEach(sale => {
      (sale?.items || []).forEach(item => {
        if (!item?.product?.id) return;
        
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = {
            quantity: 0,
            revenue: 0,
            name: item.product.name || 'Unknown',
          };
        }
        productSales[item.product.id].quantity += (item?.quantity || 0);
        productSales[item.product.id].revenue += (item?.product?.unitPrice || 0) * (item?.quantity || 0);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => (b?.revenue || 0) - (a?.revenue || 0))
      .slice(0, 5);

    // Revenue by category
    const categoryRevenue: Record<string, number> = {};
    
    (sales || []).forEach(sale => {
      (sale?.items || []).forEach(item => {
        const category = item?.product?.category || 'Uncategorized';
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = 0;
        }
        categoryRevenue[category] += (item?.product?.unitPrice || 0) * (item?.quantity || 0);
      });
    });

    const revenueByCategory = Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category: t(category) || category,
      revenue,
    }));

    return {
      totalRevenue,
      totalSales,
      totalProducts: dashboardStats?.total_products || 0,
      lowStockProducts: lowStockNotifications?.low_stock_products || 0,
      todayRevenue: dashboardStats?.today_income || 0,
      revenueByDay,
      topProducts,
      revenueByCategory,
      // Service revenue FROM API - bu muhim qism
      serviceRevenue: {
        cutting: incomeStats.total_cutting_income,
        edgeBanding: incomeStats.total_banding_income,
      }
    };
  }, [sales, products, language, dashboardStats, lowStockNotifications, incomeStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {language === 'uz' ? 'Tizim statistikasi va hisobotlar' : 'Статистика системы и отчеты'}
        </p>
      </div>

     

      {/* Key Metrics - Existing Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('todayRevenue')}</p>
                <p className="text-2xl font-bold">{analytics.todayRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">UZS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'uz' ? 'Jami daromad' : 'Общая выручка'}</p>
                <p className="text-2xl font-bold">{analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">UZS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalProducts')}</p>
                <p className="text-2xl font-bold">{analytics.totalProducts}</p>
                <p className="text-xs text-gray-500">{language === 'uz' ? 'mahsulot' : 'продуктов'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('lowStock')}</p>
                <p className="text-2xl font-bold">{analytics.lowStockProducts}</p>
                <p className="text-xs text-gray-500">{language === 'uz' ? 'mahsulot' : 'продуктов'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>{language === 'uz' ? 'Xizmatlar daromadi' : 'Доход от услуг'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Kesish xizmati */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'uz' ? 'Kesish xizmati' : 'Услуга распила'}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatNumber(incomeStats.total_cutting_income)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{language === 'uz' ? 'Jami' : 'Всего'}: {formatNumber(incomeStats.total_cutting_income)}</span>
                  <span>{language === 'uz' ? 'Bugun' : 'Сегодня'}: {formatNumber(incomeStats.today_cutting_income)}</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-400 transition-all"
                    style={{ 
                      width: `${incomeStats.total_income > 0 
                        ? (incomeStats.total_cutting_income / incomeStats.total_income * 100) 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Kromkalash xizmati */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'uz' ? 'Kromkalash xizmati' : 'Услуга кромкования'}
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatNumber(incomeStats.total_banding_income)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{language === 'uz' ? 'Jami' : 'Всего'}: {formatNumber(incomeStats.total_banding_income)}</span>
                  <span>{language === 'uz' ? 'Bugun' : 'Сегодня'}: {formatNumber(incomeStats.today_banding_income)}</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 dark:bg-green-400 transition-all"
                    style={{ 
                      width: `${incomeStats.total_income > 0 
                        ? (incomeStats.total_banding_income / incomeStats.total_income * 100) 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Jami xizmatlar */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {language === 'uz' ? 'Jami xizmatlar' : 'Всего услуг'}
                  </span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatNumber(incomeStats.total_income)}
                  </span>
                </div>
                <div className="flex justify-end text-xs text-gray-500 mt-1">
                  <span>{language === 'uz' ? 'Bugun' : 'Сегодня'}: {formatNumber(incomeStats.today_income)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('topSellingProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  type="number" 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} UZS`}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10B981"
                  name={language === 'uz' ? 'Daromad' : 'Выручка'}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-1">
        
      </div>
    </div>
  );
};

export default DashboardPage;