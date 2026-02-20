import React, { useMemo, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

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

  useEffect(() => {
    fetchDashboardStats();
    fetchLowStockNotifications();
  }, []);

  const t = (key: string) => getTranslation(language, key as any);

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

    // Service revenue
    let cuttingRevenue = 0;
    let edgeBandingRevenue = 0;

    (sales || []).forEach(sale => {
      (sale?.items || []).forEach(item => {
        if (item?.cuttingService) {
          cuttingRevenue += (item.cuttingService?.total || 0);
        }
        if (item?.edgeBandingService) {
          edgeBandingRevenue += (item.edgeBandingService?.total || 0);
        }
      });
    });

    // Today's revenue from dashboard stats
    const todayRevenue = dashboardStats?.today_income || 0;

    return {
      totalRevenue,
      totalSales,
      totalProducts: dashboardStats?.total_products || 0,
      lowStockProducts: lowStockNotifications?.low_stock_products || 0,
      todayRevenue,
      revenueByDay,
      topProducts,
      revenueByCategory,
      serviceRevenue: {
        cutting: cuttingRevenue,
        edgeBanding: edgeBandingRevenue,
      },
    };
  }, [sales, products, language, dashboardStats, lowStockNotifications]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {language === 'uz' ? 'Tizim statistikasi va hisobotlar' : 'Статистика системы и отчеты'}
        </p>
      </div>

      {/* Key Metrics */}
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
            <CardTitle>{t('salesTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} UZS`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  name={language === 'uz' ? 'Daromad' : 'Выручка'}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('revenueByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.revenueByCategory}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: ${((entry.revenue / (analytics.totalRevenue || 1)) * 100).toFixed(1)}%`}
                >
                  {analytics.revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} UZS`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>{language === 'uz' ? 'Xizmatlar daromadi' : 'Доход от услуг'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cuttingService')}</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {analytics.serviceRevenue.cutting.toLocaleString()} UZS
                  </span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-400 transition-all"
                    style={{ 
                      width: `${((analytics.serviceRevenue.cutting / (analytics.serviceRevenue.cutting + analytics.serviceRevenue.edgeBanding) * 100) || 0)}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('edgeBandingService')}</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {analytics.serviceRevenue.edgeBanding.toLocaleString()} UZS
                  </span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 dark:bg-green-400 transition-all"
                    style={{ 
                      width: `${((analytics.serviceRevenue.edgeBanding / (analytics.serviceRevenue.cutting + analytics.serviceRevenue.edgeBanding) * 100) || 0)}%` 
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{language === 'uz' ? 'Jami xizmatlar' : 'Всего услуг'}</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(analytics.serviceRevenue.cutting + analytics.serviceRevenue.edgeBanding).toLocaleString()} UZS
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'uz' ? 'Xizmatlar ulushi' : 'Доля услуг'}
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {((analytics.serviceRevenue.cutting + analytics.serviceRevenue.edgeBanding) / (analytics.totalRevenue || 1) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};