import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getTranslation } from '../../lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Scissors, Ruler, PlusCircle, Trash2, TrendingUp, DollarSign, Edit2, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  cuttingApi,
  bandingApi,
  thicknessApi,
} from '../../lib/api';
import { ApiCutting, ApiBanding, ApiThickness } from '../../lib/types';
import { format } from 'date-fns';

interface IncomeStats {
  total_cutting_income: number;
  today_cutting_income: number;
  total_banding_income: number;
  today_banding_income: number;
  total_income: number;
  today_income: number;
}

interface CuttingForm {
  numberOfBoards: number;
  pricePerCut: number;
}

export const Services: React.FC = () => {
  const { language, user } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cutting');
  
  // State for services
  const [cuttings, setCuttings] = useState<ApiCutting[]>([]);
  const [bandings, setBandings] = useState<ApiBanding[]>([]);
  const [thicknesses, setThicknesses] = useState<ApiThickness[]>([]);
  const [incomeStats, setIncomeStats] = useState<IncomeStats>({
    total_cutting_income: 0,
    today_cutting_income: 0,
    total_banding_income: 0,
    today_banding_income: 0,
    total_income: 0,
    today_income: 0
  });

  // Loading states
  const [isLoadingCuttings, setIsLoadingCuttings] = useState(false);
  const [isLoadingBandings, setIsLoadingBandings] = useState(false);
  const [isLoadingThicknesses, setIsLoadingThicknesses] = useState(false);
  const [isLoadingIncome, setIsLoadingIncome] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dialog states
  const [isCuttingDialogOpen, setIsCuttingDialogOpen] = useState(false);
  const [isBandingDialogOpen, setIsBandingDialogOpen] = useState(false);
  const [isThicknessDialogOpen, setIsThicknessDialogOpen] = useState(false);
  const [isEditCuttingDialogOpen, setIsEditCuttingDialogOpen] = useState(false);
  const [isEditBandingDialogOpen, setIsEditBandingDialogOpen] = useState(false);
  const [isEditThicknessDialogOpen, setIsEditThicknessDialogOpen] = useState(false);

  // Selected item for edit
  const [selectedCutting, setSelectedCutting] = useState<ApiCutting | null>(null);

  // Form states for create
  const [cuttingForm, setCuttingForm] = useState<CuttingForm>({
    numberOfBoards: 1,
    pricePerCut: 20000
  });

  const [newBanding, setNewBanding] = useState({
    thickness: '',
    width: '',
    height: ''
  });

  const [newThickness, setNewThickness] = useState({
    size: '',
    price: ''
  });

  // Form states for edit
  const [editCutting, setEditCutting] = useState<{
    id: number;
    numberOfBoards: number;
    pricePerCut: number;
  } | null>(null);

  const [editBanding, setEditBanding] = useState<{
    id: number;
    thickness: string;
    width: string;
    height: string;
  } | null>(null);

  const [editThickness, setEditThickness] = useState<{
    id: number;
    size: string;
    price: string;
  } | null>(null);

  const t = (key: string) => getTranslation(language, key as any);

  // Format date function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy');
    } catch (error) {
      return '-';
    }
  };

  // Format date with time
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy HH:mm');
    } catch (error) {
      return '-';
    }
  };

  // Fetch all data
  const fetchIncomeStats = async () => {
    if (!user) return;
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
        setIncomeStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch income stats:', error);
    } finally {
      setIsLoadingIncome(false);
    }
  };

  const fetchCuttings = async () => {
    if (!user) return;
    setIsLoadingCuttings(true);
    try {
      const data = await cuttingApi.getAll();
      setCuttings(data || []);
    } catch (error) {
      console.error('Failed to fetch cuttings:', error);
      toast.error(language === 'uz' ? 'Kesish xizmatlarini yuklashda xatolik' : 'Ошибка при загрузке услуг распила');
    } finally {
      setIsLoadingCuttings(false);
    }
  };

  const fetchBandings = async () => {
    if (!user) return;
    setIsLoadingBandings(true);
    try {
      const data = await bandingApi.getAll();
      console.log('Fetched bandings:', data);
      setBandings(data || []);
    } catch (error) {
      console.error('Failed to fetch bandings:', error);
      toast.error(language === 'uz' ? 'Kromkalash xizmatlarini yuklashda xatolik' : 'Ошибка при загрузке услуг кромкования');
    } finally {
      setIsLoadingBandings(false);
    }
  };

  const fetchThicknesses = async () => {
    if (!user) return;
    setIsLoadingThicknesses(true);
    try {
      const data = await thicknessApi.getAll();
      setThicknesses(data || []);
    } catch (error) {
      console.error('Failed to fetch thicknesses:', error);
      toast.error(language === 'uz' ? 'Qalinliklarni yuklashda xatolik' : 'Ошибка при загрузке толщин');
    } finally {
      setIsLoadingThicknesses(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIncomeStats();
      fetchCuttings();
      fetchBandings();
      fetchThicknesses();
    }
  }, [user]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isCuttingDialogOpen) {
      setCuttingForm({ numberOfBoards: 1, pricePerCut: 20000 });
    }
  }, [isCuttingDialogOpen]);

  useEffect(() => {
    if (!isEditCuttingDialogOpen) {
      setEditCutting(null);
      setSelectedCutting(null);
    }
  }, [isEditCuttingDialogOpen]);

  // Create handlers
  const handleCreateCutting = async () => {
    if (!user) return;
    setIsAdding(true);
    try {
      const totalPrice = cuttingForm.numberOfBoards * cuttingForm.pricePerCut;
      
      const data = await cuttingApi.create({
        count: cuttingForm.numberOfBoards,
        price: cuttingForm.pricePerCut.toString(),
        total_price: totalPrice.toString()
      });
      
      setCuttings(prev => [data, ...prev]);
      setIsCuttingDialogOpen(false);
      fetchIncomeStats();
      
      toast.success(language === 'uz' ? 'Kesish xizmati qo\'shildi' : 'Услуга распила добавлена');
    } catch (error) {
      console.error('Failed to create cutting:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    } finally {
      setIsAdding(false);
    }
  };

  // Update handlers
  const handleOpenEditCutting = (cutting: ApiCutting) => {
    setSelectedCutting(cutting);
    setEditCutting({
      id: cutting.id,
      numberOfBoards: cutting.count,
      pricePerCut: parseFloat(cutting.price)
    });
    setIsEditCuttingDialogOpen(true);
  };

  const handleUpdateCutting = async () => {
    if (!user || !editCutting) return;
    setIsUpdating(true);
    try {
      const totalPrice = editCutting.numberOfBoards * editCutting.pricePerCut;
      
      const updatedData = await cuttingApi.update(editCutting.id, {
        count: editCutting.numberOfBoards,
        price: editCutting.pricePerCut.toString(),
        total_price: totalPrice.toString()
      });
      
      setCuttings(prev => prev.map(c => c.id === editCutting.id ? updatedData : c));
      setIsEditCuttingDialogOpen(false);
      fetchIncomeStats();
      
      toast.success(language === 'uz' ? 'Kesish xizmati yangilandi' : 'Услуга распила обновлена');
    } catch (error) {
      console.error('Failed to update cutting:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateBanding = async () => {
    if (!user) return;
    try {
      await bandingApi.create({
        thickness: parseInt(newBanding.thickness),
        width: newBanding.width,
        height: newBanding.height
      });
      
      await fetchBandings();
      
      setIsBandingDialogOpen(false);
      setNewBanding({ thickness: '', width: '', height: '' });
      fetchIncomeStats();
      toast.success(language === 'uz' ? 'Kromkalash xizmati qo\'shildi' : 'Услуга кромкования добавлена');
    } catch (error) {
      console.error('Failed to create banding:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    }
  };

  const handleCreateThickness = async () => {
    if (!user) return;
    try {
      const data = await thicknessApi.create({
        size: newThickness.size,
        price: newThickness.price
      });
      setThicknesses(prev => [data, ...prev]);
      setIsThicknessDialogOpen(false);
      setNewThickness({ size: '', price: '' });
      toast.success(language === 'uz' ? 'Qalinlik qo\'shildi' : 'Толщина добавлена');
    } catch (error) {
      console.error('Failed to create thickness:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    }
  };

  const handleOpenEditBanding = (banding: ApiBanding) => {
    setEditBanding({
      id: banding.id,
      thickness: banding.thickness?.id?.toString() || '',
      width: banding.width.toString(),
      height: banding.height.toString()
    });
    setIsEditBandingDialogOpen(true);
  };

  const handleUpdateBanding = async () => {
    if (!user || !editBanding) return;
    try {
      await bandingApi.update(editBanding.id, {
        thickness: parseInt(editBanding.thickness),
        width: editBanding.width,
        height: editBanding.height
      });
      
      await fetchBandings();
      setIsEditBandingDialogOpen(false);
      setEditBanding(null);
      fetchIncomeStats();
      toast.success(language === 'uz' ? 'Kromkalash xizmati yangilandi' : 'Услуга кромкования обновлена');
    } catch (error) {
      console.error('Failed to update banding:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    }
  };

  const handleOpenEditThickness = (thickness: ApiThickness) => {
    setEditThickness({
      id: thickness.id,
      size: thickness.size,
      price: thickness.price
    });
    setIsEditThicknessDialogOpen(true);
  };

  const handleUpdateThickness = async () => {
    if (!user || !editThickness) return;
    try {
      const updatedData = await thicknessApi.update(editThickness.id, {
        size: editThickness.size,
        price: editThickness.price
      });
      
      setThicknesses(prev => prev.map(t => t.id === editThickness.id ? updatedData : t));
      setIsEditThicknessDialogOpen(false);
      setEditThickness(null);
      toast.success(language === 'uz' ? 'Qalinlik yangilandi' : 'Толщина обновлена');
    } catch (error) {
      console.error('Failed to update thickness:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    }
  };

  // Delete handlers
  const handleDeleteCutting = async (id: number) => {
    if (!user) return;
    if (!window.confirm(language === 'uz' ? 'Rostdan ham o\'chirmoqchimisiz?' : 'Вы уверены, что хотите удалить?')) return;
    
    try {
      await cuttingApi.delete(id);
      setCuttings(prev => prev.filter(c => c.id !== id));
      fetchIncomeStats();
      toast.success(language === 'uz' ? 'Kesish xizmati o\'chirildi' : 'Услуга распила удалена');
    } catch (error) {
      console.error('Failed to delete cutting:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    }
  };

  const handleDeleteBanding = async (id: number) => {
    if (!user) return;
    if (!window.confirm(language === 'uz' ? 'Rostdan ham o\'chirmoqchimisiz?' : 'Вы уверены, что хотите удалить?')) return;
    
    try {
      await bandingApi.delete(id);
      setBandings(prev => prev.filter(b => b.id !== id));
      fetchIncomeStats();
      toast.success(language === 'uz' ? 'Kromkalash xizmati o\'chirildi' : 'Услуга кромкования удалена');
    } catch (error) {
      console.error('Failed to delete banding:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    }
  };

  const handleDeleteThickness = async (id: number) => {
    if (!user) return;
    if (!window.confirm(language === 'uz' ? 'Rostdan ham o\'chirmoqchimisiz?' : 'Вы уверены, что хотите удалить?')) return;
    
    try {
      await thicknessApi.delete(id);
      setThicknesses(prev => prev.filter(t => t.id !== id));
      toast.success(language === 'uz' ? 'Qalinlik o\'chirildi' : 'Толщина удалена');
    } catch (error) {
      console.error('Failed to delete thickness:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString() + ' UZS';
  };

  // Helper function to safely parse numbers
  const parseNumber = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const parseNumericInput = (value: string): number => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {language === 'uz' ? 'Xizmatlar' : 'Услуги'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === 'uz' 
              ? 'Kesish va kromkalash xizmatlarini boshqarish' 
              : 'Управление услугами распила и кромкования'}
          </p>
        </div>
      </div>

      {/* Income Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'uz' ? 'Kesish (Jami)' : 'Распил (Всего)'}
            </CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(incomeStats.total_cutting_income)}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'uz' ? 'Bugun: ' : 'Сегодня: '}
              {formatNumber(incomeStats.today_cutting_income)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'uz' ? 'Kromkalash (Jami)' : 'Кромкование (Всего)'}
            </CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(incomeStats.total_banding_income)}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'uz' ? 'Bugun: ' : 'Сегодня: '}
              {formatNumber(incomeStats.today_banding_income)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'uz' ? 'Jami daromad' : 'Общий доход'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(incomeStats.total_income)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'uz' ? 'Bugungi daromad' : 'Доход за сегодня'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(incomeStats.today_income)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto">
            <TabsTrigger value="cutting" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
              <Scissors className="h-4 w-4" />
              <span className="text-sm">{language === 'uz' ? 'Kesish xizmatlari' : 'Услуги распила'}</span>
            </TabsTrigger>
            <TabsTrigger value="banding" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
              <Ruler className="h-4 w-4" />
              <span className="text-sm">{language === 'uz' ? 'Kromkalash xizmatlari' : 'Услуги кромкования'}</span>
            </TabsTrigger>
            <TabsTrigger value="thickness" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
              <span className="h-4 w-4 text-sm">📏</span>
              <span className="text-sm">{language === 'uz' ? 'Qalinliklar' : 'Толщины'}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Cutting Tab */}
        <TabsContent value="cutting" className="space-y-4">
          <div className="flex justify-end">
            {/* Add Cutting Dialog */}
            <Dialog open={isCuttingDialogOpen} onOpenChange={setIsCuttingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  {language === 'uz' ? 'Kesish xizmati qo\'shish' : 'Добавить услугу распила'}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {language === 'uz' ? 'Yangi kesish xizmati' : 'Новая услуга распила'}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {language === 'uz' 
                      ? 'Kesish xizmati parametrlarini kiriting' 
                      : 'Введите параметры услуги резки'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-sm">{language === 'uz' ? 'Soni' : 'Количество'}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cuttingForm.numberOfBoards || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCuttingForm({ 
                          ...cuttingForm, 
                          numberOfBoards: val === '' ? 1 : Math.max(1, parseNumericInput(val))
                        });
                      }}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{language === 'uz' ? 'Narxi (UZS)' : 'Цена (UZS)'}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cuttingForm.pricePerCut || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCuttingForm({ 
                          ...cuttingForm, 
                          pricePerCut: val === '' ? 20000 : Math.max(1, parseNumericInput(val))
                        });
                      }}
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Total Price Display */}
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {language === 'uz' ? 'Jami summa' : 'Общая сумма'}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 break-all">
                      {(cuttingForm.numberOfBoards * cuttingForm.pricePerCut).toLocaleString()} UZS
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleCreateCutting}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {language === 'uz' ? 'Qo\'shish' : 'Добавить'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Cutting Dialog */}
            <Dialog open={isEditCuttingDialogOpen} onOpenChange={setIsEditCuttingDialogOpen}>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {language === 'uz' ? 'Kesish xizmatini tahrirlash' : 'Редактировать услугу распила'}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {language === 'uz' 
                      ? 'Kesish xizmati parametrlarini o\'zgartiring' 
                      : 'Измените параметры услуги резки'}
                  </DialogDescription>
                </DialogHeader>
                {editCutting && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-sm">{language === 'uz' ? 'Soni' : 'Количество'}</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editCutting.numberOfBoards || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditCutting({ 
                            ...editCutting, 
                            numberOfBoards: val === '' ? 1 : Math.max(1, parseNumericInput(val))
                          });
                        }}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">{language === 'uz' ? 'Narxi (UZS)' : 'Цена (UZS)'}</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editCutting.pricePerCut || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditCutting({ 
                            ...editCutting, 
                            pricePerCut: val === '' ? 20000 : Math.max(1, parseNumericInput(val))
                          });
                        }}
                        className="text-sm"
                      />
                    </div>

                    {/* Total Price Display for Edit */}
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {language === 'uz' ? 'Jami summa' : 'Общая сумма'}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 break-all">
                        {(editCutting.numberOfBoards * editCutting.pricePerCut).toLocaleString()} UZS
                      </p>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleUpdateCutting}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {language === 'uz' ? 'Yangilash' : 'Обновить'}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{language === 'uz' ? 'Soni' : 'Количество'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Narxi' : 'Цена'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Jami summa' : 'Общая сумма'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Sana' : 'Дата'}</TableHead>
                    <TableHead className="text-right">{language === 'uz' ? 'Amallar' : 'Действия'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuttings.map((cutting) => (
                    <TableRow key={cutting.id}>
                      <TableCell className="font-medium">#{cutting.id}</TableCell>
                      <TableCell>{cutting.count.toLocaleString()}</TableCell>
                      <TableCell>{parseNumber(cutting.price).toLocaleString()} UZS</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {parseNumber(cutting.total_price).toLocaleString()} UZS
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(cutting.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditCutting(cutting)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCutting(cutting.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cuttings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {language === 'uz' 
                          ? 'Kesish xizmatlari mavjud emas' 
                          : 'Услуги распила отсутствуют'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banding Tab - with created_at */}
        <TabsContent value="banding" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Dialog open={isThicknessDialogOpen} onOpenChange={setIsThicknessDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  {language === 'uz' ? 'Qalinlik qo\'shish' : 'Добавить толщину'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'uz' ? 'Yangi qalinlik' : 'Новая толщина'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Qalinligi (mm)' : 'Толщина (мм)'}</Label>
                    <Input
                      type="text"
                      value={newThickness.size}
                      onChange={(e) => setNewThickness({...newThickness, size: e.target.value})}
                      placeholder="16"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Narxi' : 'Цена'}</Label>
                    <Input
                      type="text"
                      value={newThickness.price}
                      onChange={(e) => setNewThickness({...newThickness, price: e.target.value})}
                      placeholder="5000"
                    />
                  </div>
                  <Button onClick={handleCreateThickness} className="w-full">
                    {language === 'uz' ? 'Qo\'shish' : 'Добавить'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isBandingDialogOpen} onOpenChange={setIsBandingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  {language === 'uz' ? 'Kromkalash xizmati qo\'shish' : 'Добавить услугу кромкования'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'uz' ? 'Yangi kromkalash xizmati' : 'Новая услуга кромкования'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Qalinlik' : 'Толщина'}</Label>
                    <Select 
                      value={newBanding.thickness} 
                      onValueChange={(value) => setNewBanding({...newBanding, thickness: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'uz' ? 'Qalinlikni tanlang' : 'Выберите толщину'} />
                      </SelectTrigger>
                      <SelectContent>
                        {thicknesses.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.size} mm - {parseNumber(t.price).toLocaleString()} UZS
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Eni (mm)' : 'Ширина (мм)'}</Label>
                    <Input
                      type="text"
                      value={newBanding.width}
                      onChange={(e) => setNewBanding({...newBanding, width: e.target.value})}
                      placeholder="3000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Balandligi (mm)' : 'Высота (мм)'}</Label>
                    <Input
                      type="text"
                      value={newBanding.height}
                      onChange={(e) => setNewBanding({...newBanding, height: e.target.value})}
                      placeholder="1500"
                    />
                  </div>
                  <Button onClick={handleCreateBanding} className="w-full">
                    {language === 'uz' ? 'Qo\'shish' : 'Добавить'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Banding Dialog */}
            <Dialog open={isEditBandingDialogOpen} onOpenChange={setIsEditBandingDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'uz' ? 'Kromkalash xizmatini tahrirlash' : 'Редактировать услугу кромкования'}
                  </DialogTitle>
                </DialogHeader>
                {editBanding && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{language === 'uz' ? 'Qalinlik' : 'Толщина'}</Label>
                      <Select 
                        value={editBanding.thickness} 
                        onValueChange={(value) => setEditBanding({...editBanding, thickness: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'uz' ? 'Qalinlikni tanlang' : 'Выберите толщину'} />
                        </SelectTrigger>
                        <SelectContent>
                          {thicknesses.map((t) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                              {t.size} mm - {parseNumber(t.price).toLocaleString()} UZS
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'uz' ? 'Eni (mm)' : 'Ширина (мм)'}</Label>
                      <Input
                        type="text"
                        value={editBanding.width}
                        onChange={(e) => setEditBanding({...editBanding, width: e.target.value})}
                        placeholder="3000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'uz' ? 'Balandligi (mm)' : 'Высота (мм)'}</Label>
                      <Input
                        type="text"
                        value={editBanding.height}
                        onChange={(e) => setEditBanding({...editBanding, height: e.target.value})}
                        placeholder="1500"
                      />
                    </div>
                    <Button onClick={handleUpdateBanding} className="w-full">
                      {language === 'uz' ? 'Yangilash' : 'Обновить'}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{language === 'uz' ? 'Qalinlik' : 'Толщина'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Eni (mm)' : 'Ширина (мм)'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Balandligi (mm)' : 'Высота (мм)'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Chiziqli metr' : 'Пог. метры'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Jami summa' : 'Общая сумма'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Sana' : 'Дата'}</TableHead>
                    <TableHead className="text-right">{language === 'uz' ? 'Amallar' : 'Действия'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bandings.map((banding) => {
                    const thickness = banding.thickness;
                    
                    return (
                      <TableRow key={banding.id}>
                        <TableCell className="font-medium">#{banding.id}</TableCell>
                        <TableCell>
                          {thickness ? (
                            <div>
                              <div>{thickness.size} mm</div>
                              <div className="text-xs text-gray-500">
                                {parseNumber(thickness.price).toLocaleString()} UZS
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{parseNumber(banding.width).toFixed(2)}</TableCell>
                        <TableCell>{parseNumber(banding.height).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {parseNumber(banding.linear_meter).toFixed(2)} m
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {parseNumber(banding.total_price).toLocaleString()} UZS
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(banding.created_at)}
                            
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditBanding(banding)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBanding(banding.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {bandings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {language === 'uz' 
                          ? 'Kromkalash xizmatlari mavjud emas' 
                          : 'Услуги кромкования отсутствуют'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thickness Tab */}
        <TabsContent value="thickness" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isThicknessDialogOpen} onOpenChange={setIsThicknessDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  {language === 'uz' ? 'Qalinlik qo\'shish' : 'Добавить толщину'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'uz' ? 'Yangi qalinlik' : 'Новая толщина'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Qalinligi (mm)' : 'Толщина (мм)'}</Label>
                    <Input
                      type="text"
                      value={newThickness.size}
                      onChange={(e) => setNewThickness({...newThickness, size: e.target.value})}
                      placeholder="16"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Narxi (UZS/m)' : 'Цена (UZS/м)'}</Label>
                    <Input
                      type="text"
                      value={newThickness.price}
                      onChange={(e) => setNewThickness({...newThickness, price: e.target.value})}
                      placeholder="5000"
                    />
                  </div>
                  <Button onClick={handleCreateThickness} className="w-full">
                    {language === 'uz' ? 'Qo\'shish' : 'Добавить'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Thickness Dialog */}
            <Dialog open={isEditThicknessDialogOpen} onOpenChange={setIsEditThicknessDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'uz' ? 'Qalinlikni tahrirlash' : 'Редактировать толщину'}
                  </DialogTitle>
                </DialogHeader>
                {editThickness && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{language === 'uz' ? 'Qalinligi (mm)' : 'Толщина (мм)'}</Label>
                      <Input
                        type="text"
                        value={editThickness.size}
                        onChange={(e) => setEditThickness({...editThickness, size: e.target.value})}
                        placeholder="16"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'uz' ? 'Narxi (UZS/m)' : 'Цена (UZS/м)'}</Label>
                      <Input
                        type="text"
                        value={editThickness.price}
                        onChange={(e) => setEditThickness({...editThickness, price: e.target.value})}
                        placeholder="5000"
                      />
                    </div>
                    <Button onClick={handleUpdateThickness} className="w-full">
                      {language === 'uz' ? 'Yangilash' : 'Обновить'}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{language === 'uz' ? 'Qalinligi (mm)' : 'Толщина (мм)'}</TableHead>
                    <TableHead>{language === 'uz' ? 'Narxi (UZS/m)' : 'Цена (UZS/м)'}</TableHead>
                    <TableHead className="text-right">{language === 'uz' ? 'Amallar' : 'Действия'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thicknesses.map((thickness) => (
                    <TableRow key={thickness.id}>
                      <TableCell className="font-medium">#{thickness.id}</TableCell>
                      <TableCell>{thickness.size} mm</TableCell>
                      <TableCell>{parseNumber(thickness.price).toLocaleString()} UZS</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditThickness(thickness)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteThickness(thickness.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {thicknesses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        {language === 'uz' 
                          ? 'Qalinliklar mavjud emas' 
                          : 'Толщины отсутствуют'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Services;