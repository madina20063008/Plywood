import React, { useState, useEffect } from "react";
import { useApp } from "../../lib/context";
import { getTranslation } from "../../lib/translations";
import { Supplier, SupplierTransaction } from "../../lib/types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Users as UsersIcon,
  Loader2,
  Phone,
  User as UserIcon,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  X,
  MoreVertical,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";

export const SupplierPage: React.FC = () => {
  const {
    suppliers,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSupplierPayment,
    fetchSupplierTransactions,
    getSupplierBalance,
    isFetchingSuppliers,
    isAddingSupplier,
    isUpdatingSupplier,
    isDeletingSupplier,
    isAddingSupplierPayment,
    language,
    user,
    supplierStats,
    isFetchingSupplierStats,
    fetchSupplierStats,
  } = useApp();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null,
  );
  const [supplierTransactions, setSupplierTransactions] = useState<
    SupplierTransaction[]
  >([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    company: "",
  });

  const t = (key: string) => getTranslation(language, key as any);

  // Fetch suppliers and stats on component mount
  useEffect(() => {
    if (user) {
      fetchSuppliers();
      fetchSupplierStats();
    }
  }, [user]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        fetchSuppliers(searchTerm);
        fetchSupplierStats(); // Refresh stats when searching
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, user]);

  // Fetch transactions when supplier is selected
  useEffect(() => {
    if (selectedSupplier && user) {
      loadSupplierTransactions(selectedSupplier.id);
    }
  }, [selectedSupplier, user]);

  const loadSupplierTransactions = async (supplierId: string) => {
    setIsLoadingTransactions(true);
    try {
      const transactions = await fetchSupplierTransactions(supplierId);
      setSupplierTransactions(Array.isArray(transactions) ? transactions : []);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setSupplierTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      company: "",
    });
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      company: supplier.company || "",
    });
    setIsEditDialogOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handlePaymentClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPaymentAmount("");
    setPaymentDescription("");
    setIsPaymentDialogOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error(
        language === "uz"
          ? "Ism va telefon raqami talab qilinadi"
          : "Имя и номер телефона обязательны",
      );
      return;
    }

    try {
      await addSupplier(formData);
      await fetchSupplierStats(); // Refresh stats after adding
      toast.success(
        language === "uz" ? "Ta'minotchi qo'shildi" : "Поставщик добавлен",
      );
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled in context
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplier) return;

    if (!formData.name || !formData.phone) {
      toast.error(
        language === "uz"
          ? "Ism va telefon raqami talab qilinadi"
          : "Имя и номер телефона обязательны",
      );
      return;
    }

    try {
      await updateSupplier(selectedSupplier.id, {
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
      });
      await fetchSupplierStats(); // Refresh stats after updating
      toast.success(
        language === "uz" ? "Ta'minotchi yangilandi" : "Поставщик обновлен",
      );
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      resetForm();
    } catch (error) {
      // Error handled in context
    }
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplier(supplierToDelete.id);
      await fetchSupplierStats(); // Refresh stats after deleting
      toast.success(
        language === "uz" ? "Ta'minotchi o'chirildi" : "Поставщик удален",
      );
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
      if (selectedSupplier?.id === supplierToDelete.id) {
        setSelectedSupplier(null);
        setSupplierTransactions([]);
      }
    } catch (error) {
      // Error handled in context
    }
  };

  const handleAddPayment = async () => {
    if (!selectedSupplier) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(
        language === "uz"
          ? "To'g'ri summa kiriting"
          : "Введите корректную сумму",
      );
      return;
    }

    try {
      await addSupplierPayment(selectedSupplier.id, amount, paymentDescription);

      // Refresh supplier list, transactions, and stats
      await fetchSuppliers();
      await fetchSupplierStats();
      await loadSupplierTransactions(selectedSupplier.id);

      toast.success(
        language === "uz" ? "To'lov qabul qilindi" : "Платеж принят",
      );
      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentDescription("");
    } catch (error) {
      // Error handled in context
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "uz" ? "uz-UZ" : "ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "uz" ? "uz-UZ" : "ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDebtBadgeVariant = (debt: number) => {
    if (debt > 0) return "destructive";
    if (debt < 0) return "secondary";
    return "outline";
  };

  const getDebtText = (debt: number) => {
    if (debt > 0) {
      return language === "uz" ? "Qarzdor" : "Должен";
    }
    if (debt < 0) {
      return language === "uz" ? "Ortiqcha to'lov" : "Переплата";
    }
    return language === "uz" ? "Qarz yo'q" : "Нет долга";
  };

  // Mobile Supplier Card Component - Fixed layout
  const MobileSupplierCard = ({ supplier }: { supplier: Supplier }) => {
    const balance = getSupplierBalance(supplier.id);
    const isSelected = selectedSupplier?.id === supplier.id;

    return (
      <Card
        className={`mb-3 cursor-pointer transition-all ${
          isSelected
            ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
            : "border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
        }`}
        onClick={() => {
          setSelectedSupplier(supplier);
          setIsMobileMenuOpen(false);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header with name and phone */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`rounded-full p-2 ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3
                    className={`font-semibold text-base ${
                      isSelected ? "text-blue-700 dark:text-blue-300" : ""
                    }`}
                  >
                    {supplier.name}
                  </h3>
                  <p className="text-xs text-gray-500">{supplier.phone}</p>
                </div>
              </div>

              {/* Company name */}
              {supplier.company && (
                <div className="flex items-center gap-1 text-xs mb-3 ml-1">
                  <Building2
                    className={`h-3 w-3 ${
                      isSelected ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={
                      isSelected
                        ? "text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-500"
                    }
                  >
                    {supplier.company}
                  </span>
                </div>
              )}

              {/* Debt badge - First row */}
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant={getDebtBadgeVariant(balance.balance)}
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(Math.abs(balance.balance))} so'm
                </Badge>
                <span className="text-xs text-gray-500">
                  {getDebtText(balance.balance)}
                </span>
              </div>

              {/* Financial stats in a single row */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">
                    {language === "uz" ? "Qabul" : "Приход"}
                  </p>
                  <p className="text-sm font-bold text-red-600">
                    +{formatCurrency(balance.totalPurchases)}
                  </p>
                </div>

                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex-1 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">
                    {language === "uz" ? "To'lov" : "Оплата"}
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    -{formatCurrency(balance.totalPayments)}
                  </p>
                </div>

                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex-1 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">
                    {language === "uz" ? "Qoldiq" : "Остаток"}
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      balance.balance > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(balance.balance))}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu button */}
            <Sheet
              open={isMobileMenuOpen && selectedSupplier?.id === supplier.id}
              onOpenChange={(open) => {
                setIsMobileMenuOpen(open);
              }}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSupplier(supplier);
                  }}
                  className={`h-8 w-8 p-0 ${isSelected ? "text-blue-600" : ""}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-xl">
                <SheetHeader>
                  <SheetTitle className="text-left">{supplier.name}</SheetTitle>
                  {supplier.company && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {supplier.company}
                    </p>
                  )}
                </SheetHeader>
                <div className="py-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePaymentClick(supplier);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {language === "uz"
                      ? "To'lov qabul qilish"
                      : "Принять платеж"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(supplier);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {language === "uz" ? "Tahrirlash" : "Редактировать"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(supplier);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {language === "uz" ? "O'chirish" : "Удалить"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {language === "uz" ? "Ta'minotchilar" : "Поставщики"}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            {language === "uz"
              ? "Ta'minotchilar bilan hisob-kitob"
              : "Расчеты с поставщиками"}
          </p>
        </div>

        {/* Add Supplier Button */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="default"
              className="w-full sm:w-auto"
              disabled={isAddingSupplier}
            >
              <Plus className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">
                {language === "uz"
                  ? "Ta'minotchi qo'shish"
                  : "Добавить поставщика"}
              </span>
              <span className="sm:hidden">
                {language === "uz" ? "Qo'shish" : "Добавить"}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {language === "uz"
                  ? "Ta'minotchi qo'shish"
                  : "Добавить поставщика"}
              </DialogTitle>
              <DialogDescription>
                {language === "uz"
                  ? "Yangi ta'minotchi ma'lumotlarini kiriting"
                  : "Введите информацию о новом поставщике"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <Label htmlFor="name">
                  {language === "uz" ? "Ism" : "Имя"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={
                    language === "uz"
                      ? "Masalan: Anvar Aliyev"
                      : "Например: Анвар Алиев"
                  }
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="phone">
                  {language === "uz" ? "Telefon raqam" : "Номер телефона"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+998901234567"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="company">
                  {language === "uz" ? "Kompaniya nomi" : "Название компании"}
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder={
                    language === "uz"
                      ? 'Masalan: MChJ "Alfa"'
                      : 'Например: ООО "Альфа"'
                  }
                  className="w-full"
                />
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isAddingSupplier}
                  className="w-full sm:w-auto"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingSupplier}
                  className="w-full sm:w-auto"
                >
                  {isAddingSupplier && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards - UPDATED to use supplierStats from API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            {isFetchingSupplierStats ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3">
                  <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {language === "uz"
                      ? "Jami ta'minotchilar"
                      : "Всего поставщиков"}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {supplierStats.total_customers}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            {isFetchingSupplierStats ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 sm:p-3">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {language === "uz" ? "Umumiy qarz" : "Общий долг"}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {formatCurrency(supplierStats.total_debt)} so'm
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder={
                language === "uz"
                  ? "Ism bo'yicha qidirish..."
                  : "Поиск по имени..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              disabled={isFetchingSuppliers}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Split View */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Suppliers List */}
        <Card>
          <CardContent className="p-0">
            {isFetchingSuppliers && suppliers.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-sm sm:text-base text-gray-500">
                  {language === "uz"
                    ? "Ta'minotchilar yuklanmoqda..."
                    : "Загрузка поставщиков..."}
                </span>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm sm:text-base text-gray-500">
                  {searchTerm
                    ? language === "uz"
                      ? "Hech narsa topilmadi"
                      : "Ничего не найдено"
                    : language === "uz"
                      ? "Ta'minotchilar mavjud emas"
                      : "Нет поставщиков"}
                </p>
                {searchTerm && (
                  <Button
                    variant="link"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    {language === "uz" ? "Tozalash" : "Очистить"}
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile View - Card Layout */}
                <div className="block lg:hidden p-4">
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    {suppliers.map((supplier) => (
                      <MobileSupplierCard
                        key={supplier.id}
                        supplier={supplier}
                      />
                    ))}
                  </ScrollArea>
                </div>

                {/* Desktop View - List Layout */}
                <div className="hidden lg:block p-4">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {suppliers.map((supplier) => {
                        const balance = getSupplierBalance(supplier.id);
                        const isSelected = selectedSupplier?.id === supplier.id;

                        return (
                          <button
                            key={supplier.id}
                            onClick={() => setSelectedSupplier(supplier)}
                            className={`w-full text-left p-4 rounded-lg transition-all ${
                              isSelected
                                ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                                : "border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className={`rounded-full p-1.5 ${
                                      isSelected
                                        ? "bg-blue-500 text-white"
                                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    }`}
                                  >
                                    <UserIcon className="h-3 w-3" />
                                  </div>
                                  <p
                                    className={`font-semibold ${
                                      isSelected
                                        ? "text-blue-700 dark:text-blue-300"
                                        : ""
                                    }`}
                                  >
                                    {supplier.name}
                                  </p>
                                </div>
                                <div className="ml-7 space-y-1">
                                  <p className="text-sm text-gray-500">
                                    {supplier.phone}
                                  </p>
                                  {supplier.company && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                      <Building2 className="h-3 w-3" />
                                      {supplier.company}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right min-w-[180px]">
                                <div className="flex items-center justify-end gap-2 mb-2">
                                  <Badge
                                    variant={getDebtBadgeVariant(
                                      balance.balance,
                                    )}
                                    className="flex items-center gap-1"
                                  >
                                    {formatCurrency(
                                      Math.abs(balance.balance),
                                    )}{" "}
                                    so'm
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {getDebtText(balance.balance)}
                                  </span>
                                </div>

                                <div className="flex items-center justify-end gap-4 text-xs">
                                  <span className="text-red-600">
                                    +{formatCurrency(balance.totalPurchases)}
                                  </span>
                                  <span className="text-green-600">
                                    -{formatCurrency(balance.totalPayments)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Supplier Details */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            {selectedSupplier ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Header with actions - Stack on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {selectedSupplier.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePaymentClick(selectedSupplier)}
                      disabled={isAddingSupplierPayment}
                      className="bg-black text-white hover:bg-white hover:text-black hover:border-black transition-all duration-200 [&_svg]:text-white hover:[&_svg]:text-black flex-1 sm:flex-none"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {language === "uz" ? "To'lov" : "Платеж"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(selectedSupplier)}
                      disabled={isUpdatingSupplier}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t("edit")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(selectedSupplier)}
                      disabled={isDeletingSupplier}
                      className="flex-1 sm:flex-none"
                    >
                      {isDeletingSupplier ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      {t("delete")}
                    </Button>
                  </div>
                </div>

                {/* Contact Info - Better mobile layout */}
                <div className="grid gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language === "uz" ? "Telefon raqam" : "Номер телефона"}
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {selectedSupplier.phone}
                      </p>
                    </div>
                  </div>

                  {selectedSupplier.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {language === "uz" ? "Kompaniya" : "Компания"}
                        </p>
                        <p className="font-medium text-sm sm:text-base">
                          {selectedSupplier.company}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div>
                  <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                    {language === "uz"
                      ? "Moliyaviy ma'lumotlar"
                      : "Финансовая информация"}
                  </h3>
                  
                  {selectedSupplier && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      {(() => {
                        const balance = getSupplierBalance(selectedSupplier.id);
                        
                        return (
                          <>
                            <div className="p-2 sm:p-3 border rounded-lg">
                              <p className="text-xs text-gray-500">
                                {language === "uz" ? "Qabul qilingan" : "Принято"}
                              </p>
                              <p className="text-base sm:text-lg font-bold text-red-600">
                                +{formatCurrency(balance.totalPurchases)} so'm
                              </p>
                            </div>
                            <div className="p-2 sm:p-3 border rounded-lg">
                              <p className="text-xs text-gray-500">
                                {language === "uz" ? "To'langan" : "Оплачено"}
                              </p>
                              <p className="text-base sm:text-lg font-bold text-green-600">
                                -{formatCurrency(balance.totalPayments)} so'm
                              </p>
                            </div>
                            <div className="p-2 sm:p-3 border rounded-lg">
                              <p className="text-xs text-gray-500">
                                {language === "uz" ? "Qoldiq" : "Остаток"}
                              </p>
                              <p
                                className={`text-base sm:text-lg font-bold ${
                                  balance.balance > 0 ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {formatCurrency(Math.abs(balance.balance))} so'm
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Transaction History - Scrollable on mobile */}
                <div>
                  <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                    {language === "uz"
                      ? "Operatsiyalar tarixi"
                      : "История операций"}
                  </h3>
                  <div className="space-y-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto">
                    {isLoadingTransactions ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600" />
                      </div>
                    ) : supplierTransactions.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-400">
                        <p className="text-xs sm:text-sm">
                          {language === "uz"
                            ? "Hozircha operatsiyalar yo'q"
                            : "Операций пока нет"}
                        </p>
                      </div>
                    ) : (
                      supplierTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-start justify-between p-2 sm:p-3 border rounded-lg"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            {transaction.transaction_type === "purchase" ? (
                              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5" />
                            ) : (
                              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5" />
                            )}
                            <div>
                              <p className="font-medium text-sm sm:text-base">
                                {transaction.transaction_type === "purchase"
                                  ? language === "uz"
                                    ? "Mahsulot qabuli"
                                    : "Прием товара"
                                  : language === "uz"
                                    ? "To'lov"
                                    : "Платеж"}
                              </p>
                              {transaction.description && (
                                <p className="text-xs sm:text-sm text-gray-500">
                                  {transaction.description}
                                </p>
                              )}
                              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                                {formatDate(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm sm:text-base font-semibold ${
                                transaction.transaction_type === "purchase"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {transaction.transaction_type === "purchase"
                                ? "+"
                                : "-"}
                              {formatCurrency(parseFloat(transaction.amount))}{" "}
                              so'm
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-400">
                <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">
                  {language === "uz"
                    ? "Ma'lumot ko'rish uchun ta'minotchi tanlang"
                    : "Выберите поставщика для просмотра информации"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Supplier Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedSupplier(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {language === "uz"
                ? "Ta'minotchini tahrirlash"
                : "Редактировать поставщика"}
            </DialogTitle>
            <DialogDescription>
              {language === "uz"
                ? "Ta'minotchi ma'lumotlarini o'zgartiring"
                : "Измените информацию о поставщике"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSupplier} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">
                {language === "uz" ? "Ism" : "Имя"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">
                {language === "uz" ? "Telefon raqam" : "Номер телефона"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="edit-company">
                {language === "uz" ? "Kompaniya nomi" : "Название компании"}
              </Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full"
              />
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedSupplier(null);
                  resetForm();
                }}
                disabled={isUpdatingSupplier}
                className="w-full sm:w-auto"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingSupplier}
                className="w-full sm:w-auto"
              >
                {isUpdatingSupplier && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          if (!isAddingSupplierPayment) {
            setIsPaymentDialogOpen(open);
            if (!open) {
              setPaymentAmount("");
              setPaymentDescription("");
            }
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {language === "uz" ? "To'lov qabul qilish" : "Принять платеж"}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplier &&
                `${selectedSupplier.name} — ${language === "uz" ? "To'lov miqdorini kiriting" : "Введите сумму платежа"}`}
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {language === "uz" ? "Joriy qarz" : "Текущий долг"}:
                </p>
                <p
                  className={`text-2xl font-bold ${selectedSupplier.debt > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {formatCurrency(Math.abs(selectedSupplier.debt))} so'm
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getDebtText(selectedSupplier.debt)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-amount">
                  {language === "uz" ? "To'lov miqdori" : "Сумма платежа"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  disabled={isAddingSupplierPayment}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isAddingSupplierPayment}
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAddPayment}
              disabled={isAddingSupplierPayment || !paymentAmount}
              className="w-full sm:w-auto"
            >
              {isAddingSupplierPayment && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {language === "uz" ? "To'lovni qabul qilish" : "Принять платеж"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {language === "uz"
                ? "Ta'minotchini o'chirish"
                : "Удаление поставщика"}
            </DialogTitle>
            <DialogDescription>
              {language === "uz"
                ? `"${supplierToDelete?.name}" ta\'minotchini o\'chirishga ishonchingiz komilmi? Bu amalni ortga qaytarib bo\'lmaydi.`
                : `Вы уверены, что хотите удалить поставщика "${supplierToDelete?.name}"? Это действие нельзя отменить.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSupplierToDelete(null);
              }}
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingSupplier}
              className="w-full sm:w-auto"
            >
              {isDeletingSupplier && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {language === "uz" ? "O'chirish" : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierPage;