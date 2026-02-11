import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogIn, Globe, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { login, language, setLanguage, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = (key: string) => getTranslation(language, key as any);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const success = await login(username, password);
    console.log('Login success:', success);
    console.log('Will navigate to /dashboard');
    console.log('Navigate function exists:', typeof navigate);

    if (success) {
      toast.success(t('loginSuccess'));
      
      // Debug: Check current location
      console.log('Current path before navigation:', window.location.pathname);
      
      // Try navigation
      navigate('/dashboard');
      console.log('Navigate function called');
      
      // Check immediately after
      console.log('Path after navigation attempt:', window.location.pathname);
      
      // Force check after a delay
      setTimeout(() => {
        console.log('Path 500ms after navigation:', window.location.pathname);
      }, 500);
      
    } else {
      toast.error(t('loginError'));
    }
  } catch (error: any) {
    console.error('Login error:', error);
    toast.error(t('loginError'));
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
          className="rounded-full"
        >
          <Globe className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Plywood Warehouse</CardTitle>
          <CardDescription className="text-base">
            {language === 'uz' ? 'Tizimga kirish uchun ma\'lumotlaringizni kiriting' : 'Введите свои данные для входа в систему'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t('username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {language === 'uz' ? 'Kirilmoqda...' : 'Вход...'}
                </>
              ) : (
                t('login')
              )}
            </Button>
            
          </form>

          <div className="mt-6 space-y-2 rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold">{language === 'uz' ? 'Test foydalanuvchilari:' : 'Тестовые пользователи:'}</p>
            <div className="space-y-1 text-xs">
              <p><strong>{t('salesperson')}:</strong> sales1 / sales123</p>
              <p><strong>{t('admin')}:</strong> admin / admin123</p>
              <p><strong>{t('manager')}:</strong> manager / manager123</p>
              <p className="text-muted-foreground italic mt-2">
                {language === 'uz' 
                  ? 'Haqiqiy API foydalanuvchilaridan foydalaning' 
                  : 'Используйте реальных пользователей API'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};