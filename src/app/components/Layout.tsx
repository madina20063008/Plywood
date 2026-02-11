import React from 'react';
import { Link, useLocation } from 'react-router';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  LogOut,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  ShoppingBag,
  PackagePlus,
  UserPlus,
  Wallet,
  PlusCircle,
  PackageCheck
} from 'lucide-react';
import { cn } from './ui/utils';
import { useState } from 'react';
import { toast } from 'sonner';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, language, setLanguage, theme, toggleTheme, cart = [] } = useApp();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const t = (key: string) => getTranslation(language, key as any);

  const navigation = [
    { 
      name: t('dashboard'), 
      path: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['admin', 'manager']
    },
    { 
      name: t('products'), 
      path: '/products', 
      icon: Package,
      roles: ['salesperson', 'admin', 'manager']
    },
    { 
      name: t('cart'), 
      path: '/cart', 
      icon: ShoppingCart,
      roles: ['salesperson'],
      badge: cart.length
    },
    { 
      name: t('soldProducts'), 
      path: '/sold-products', 
      icon: ShoppingBag,
      roles: ['salesperson', 'admin', 'manager']
    },
    { 
      name: language === 'uz' ? 'Mahsulot yaratish' : 'Создать продукт', 
      path: '/product-creation', 
      icon: PlusCircle,
      roles: ['admin', 'manager']
    },
    { 
      name: language === 'uz' ? 'Mahsulot qabul qilish' : 'Приём товара', 
      path: '/product-receiving', 
      icon: PackageCheck,
      roles: ['admin', 'manager']
    },
    { 
      name: t('inventory'), 
      path: '/inventory', 
      icon: Package,
      roles: ['admin', 'manager']
    },
    { 
      name: t('users'), 
      path: '/users', 
      icon: Users,
      roles: ['admin', 'manager']
    },
    { 
      name: t('customers'), 
      path: '/customers', 
      icon: UserPlus,
      roles: ['admin', 'manager']
    },
    { 
      name: t('customerLedger'), 
      path: '/customer-ledger', 
      icon: Wallet,
      roles: ['admin', 'manager']
    },
    { 
      name: t('reports'), 
      path: '/reports', 
      icon: BarChart3,
      roles: ['manager']
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Call the API logout
        await logout(); // Your context logout function should call authApi.logout
        
        toast.success(language === 'uz' 
          ? 'Chiqish muvaffaqiyatli' 
          : 'Выход успешный');
      } else {
        // If no refresh token, just do local logout
        logout();
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if API logout fails, do local logout
      logout();
      
      toast.error(language === 'uz' 
        ? 'Chiqishda xatolik yuz berdi' 
        : 'Произошла ошибка при выходе');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Plywood WMS
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t(user?.role || '')}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="animate-spin mr-3">⟳</span>
                  {language === 'uz' ? 'Chiqilmoqda...' : 'Выход...'}
                </>
              ) : (
                <>
                  <LogOut className="mr-3 h-5 w-5" />
                  {t('logout')}
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};