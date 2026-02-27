import React, { useState } from 'react';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { useApp } from '../../lib/context';

export const NotificationBell: React.FC = () => {
  const { lowStockNotifications, language } = useApp();
  const [open, setOpen] = useState(false);

  const notificationCount = lowStockNotifications?.low_stock_products || 0;
  const products = lowStockNotifications?.products || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">
            {language === 'uz' ? 'Bildirishnomalar' : 'Уведомления'}
          </h4>
        </div>
        
        {notificationCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <Bell className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'uz' 
                ? 'Bildirishnomalar yo\'q' 
                : 'Нет уведомлений'}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 pt-3 pb-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                {language === 'uz' 
                  ? 'Zaxirasi kam mahsulotlar' 
                  : 'Товары с низким запасом'}
                <span className="ml-2 text-xs text-gray-500">
                  ({notificationCount})
                </span>
              </p>
            </div>
            <ScrollArea className="bg-yellow-50 dark:bg-yellow-900/20 h-[350px] px-4">
              <div className=" py-2 space-y-2">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={product.name}>
                      {product.name}
                    </span>
                    <Badge variant="outline" className="ml-2 flex-shrink-0 bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                      {product.count} {language === 'uz' ? 'dona' : 'шт'}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
        
        <div className="p-3 border-t text-center bg-gray-50 dark:bg-gray-800/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => setOpen(false)}
          >
            {language === 'uz' ? 'Yopish' : 'Закрыть'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};