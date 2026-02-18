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
      <PopoverContent className="w-67 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-semibold">
            {language === 'uz' ? 'Bildirishnomalar' : 'Уведомления'}
          </h4>
        </div>
        <ScrollArea className="">
          {notificationCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-[150px] text-center p-4">
              <Bell className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'uz' 
                  ? 'Bildirishnomalar yo\'q' 
                  : 'Нет уведомлений'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                  {language === 'uz' 
                    ? 'Zaxirasi kam mahsulotlar' 
                    : 'Товары с низким запасом'}
                </p>
                <div className="space-y-2">
                  {lowStockNotifications?.products.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {product.name}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {product.count} {language === 'uz' ? 'dona' : 'шт'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t text-center">
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