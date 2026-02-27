import React, { useState, useEffect } from "react";
import { useApp } from "../../lib/context";
import { getTranslation } from "../../lib/translations";
import { Customer, PaymentHistoryResponse } from "../../lib/types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  UserPlus,
  Edit,
  Trash2,
  Users,
  Search,
  User,
  DollarSign,
  Phone,
  MapPin,
  Mail,
  FileText,
  Eye,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  History,
} from "lucide-react";
import { toast } from "sonner";

export const CustomersPage: React.FC = () => {
  const {
    customers,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    language,
    user,
    customerStats,
    isFetchingCustomerStats,
    coverCustomerDebt,
    getCustomerPaymentHistory,
    isFetchingCustomers, // Add this line
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");

  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    notes: "",
  });

  const t = (key: string) => getTranslation(language, key as any);

  // Search customers with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        fetchCustomers(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, user, fetchCustomers]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, fetchCustomers]);

  // Fetch payment history when customer is selected
  useEffect(() => {
    if (selectedCustomer && user) {
      fetchPaymentHistory(parseInt(selectedCustomer.id));
    }
  }, [selectedCustomer, user]);

  // Function to fetch payment history
  const fetchPaymentHistory = async (customerId: number) => {
    setIsLoadingHistory(true);
    try {
      const history = await getCustomerPaymentHistory(customerId);
      setPaymentHistory(history);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(language === "uz" ? "uz-UZ" : "ru-RU").format(
      numAmount,
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "uz" ? "uz-UZ" : "ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === "uz" ? "uz-UZ" : "ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddClick = () => {
    setFormData({ name: "", phone: "", address: "", email: "", notes: "" });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || "",
      email: customer.email || "",
      notes: customer.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.phone) {
      toast.error(
        language === "uz"
          ? "Ism va telefon raqami talab qilinadi"
          : "Имя и телефон обязательны",
      );
      return;
    }

    setIsAdding(true);
    try {
      await addCustomer({
        name: formData.name,
        phone: formData.phone,
        address: formData.address || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      });

      toast.success(language === "uz" ? "Mijoz qo'shildi" : "Клиент добавлен");
      setIsAddDialogOpen(false);
      setFormData({ name: "", phone: "", address: "", email: "", notes: "" });
    } catch (error) {
      // Error is already handled in context
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCustomer) return;

    if (!formData.name || !formData.phone) {
      toast.error(
        language === "uz"
          ? "Ism va telefon raqami talab qilinadi"
          : "Имя и телефон обязательны",
      );
      return;
    }

    setIsUpdating(true);
    try {
      await updateCustomer(selectedCustomer.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      });

      toast.success(language === "uz" ? "Mijoz yangilandi" : "Клиент обновлен");
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      // Error is already handled in context
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (
      confirm(
        language === "uz"
          ? `${customer.name} mijozini o'chirmoqchimisiz?`
          : `Удалить клиента ${customer.name}?`,
      )
    ) {
      setIsDeleting(customer.id);
      try {
        await deleteCustomer(customer.id);
        toast.success(language === "uz" ? "Mijoz o'chirildi" : "Клиент удален");

        // If deleted customer is selected, clear selection
        if (selectedCustomer?.id === customer.id) {
          setSelectedCustomer(null);
          setPaymentHistory(null);
        }
      } catch (error) {
        // Error is already handled in context
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleAddPayment = async () => {
    if (!selectedCustomer) return;

    const amount = paymentAmount;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(
        language === "uz"
          ? "To'g'ri summa kiriting"
          : "Введите корректную сумму",
      );
      return;
    }

    setIsAddingPayment(true);
    try {
      // Call the new cover debt API
      await coverCustomerDebt(parseInt(selectedCustomer.id), amount);
      
      // Refresh payment history
      await fetchPaymentHistory(parseInt(selectedCustomer.id));
      
      // Refresh customers to get updated debt
      await fetchCustomers();

      toast.success(
        language === "uz"
          ? "To'lov muvaffaqiyatli amalga oshirildi"
          : "Платеж успешно выполнен"
      );
      
      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentDescription("");
    } catch (error) {
      // Error is already handled in context
    } finally {
      setIsAddingPayment(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Get transaction type label
  const getTransactionTypeLabel = (type: "DEBT_ADD" | "PAYMENT") => {
    if (type === "DEBT_ADD") {
      return language === "uz" ? "Qarz yozildi" : "Добавлен долг";
    } else {
      return language === "uz" ? "To'lov" : "Оплата";
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: "DEBT_ADD" | "PAYMENT") => {
    if (type === "DEBT_ADD") {
      return <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />;
    } else {
      return <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />;
    }
  };

  // Get transaction color
  const getTransactionColor = (type: "DEBT_ADD" | "PAYMENT") => {
    return type === "DEBT_ADD" ? "text-red-600" : "text-green-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("customers")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {language === "uz"
              ? "Doimiy mijozlarni boshqarish"
              : "Управление постоянными клиентами"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAddClick}
            disabled={isAdding || isUpdating || isDeleting}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t("addCustomer")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "uz" ? "Jami mijozlar" : "Всего клиентов"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingCustomerStats ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {customerStats?.total_customers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "uz" ? "Ro'yxatdan o'tgan" : "Зарегистрировано"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "uz" ? "Qarzdor mijozlar" : "Клиенты с долгом"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingCustomerStats ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">
                  {customerStats?.debtor_customers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "uz" ? "Qarzdorlar" : "Должники"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "uz" ? "Aktiv mijozlar" : "Активные клиенты"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingCustomerStats ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {customerStats?.total_customers
                    ? customerStats.total_customers -
                      (customerStats?.debtor_customers || 0)
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "uz" ? "Qarzsiz" : "Без долга"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalDebt")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingCustomerStats ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(customerStats?.total_debt || 0)}{" "}
                  {language === "uz" ? "so'm" : "сум"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "uz" ? "Umumiy qarz" : "Общий долг"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("search")}</CardTitle>
          <CardDescription>
            {language === "uz"
              ? "Ism yoki telefon raqami bo'yicha qidirish"
              : "Поиск по имени или номеру телефона"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder={
                language === "uz"
                  ? "Ism yoki telefon raqamini kiriting..."
                  : "Введите имя или номер телефона..."
              }
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
              disabled={isFetchingCustomers}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Split View */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "uz" ? "Mijozlar ro'yxati" : "Список клиентов"}
            </CardTitle>
            <CardDescription>
              {language === "uz"
                ? "Tafsilotlar uchun mijozni tanlang"
                : "Выберите клиента для подробной информации"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetchingCustomers && customers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchTerm
                    ? language === "uz"
                      ? "Hech narsa topilmadi"
                      : "Ничего не найдено"
                    : t("noCustomers")}
                </p>
                {searchTerm && (
                  <Button
                    variant="link"
                    onClick={handleClearSearch}
                    className="mt-2"
                  >
                    {language === "uz" ? "Tozalash" : "Очистить"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {customers.map((customer) => {
                  const isSelected = selectedCustomer?.id === customer.id;

                  return (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {customer.phone}
                          </p>
                          {customer.address && (
                            <p className="text-xs text-gray-400 mt-1">
                              {customer.address}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${customer.debt > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {formatCurrency(customer.debt)}{" "}
                            {language === "uz" ? "so'm" : "сум"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.debt > 0
                              ? t("outstandingDebt")
                              : language === "uz"
                                ? "Qarz yo'q"
                                : "Нет долга"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedCustomer ? selectedCustomer.name : t("selectCustomer")}
              </CardTitle>
              {selectedCustomer && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPaymentDialogOpen(true)}
                    disabled={isAddingPayment}
                    className="bg-black text-white hover:bg-gray-200 hover:text-black hover:border-black transition-colors"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("addPayment")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(selectedCustomer)}
                    disabled={isUpdating || isDeleting === selectedCustomer.id}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t("edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedCustomer)}
                    disabled={isUpdating || isDeleting === selectedCustomer.id}
                  >
                    {isDeleting === selectedCustomer.id ? (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {t("delete")}
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              {selectedCustomer
                ? language === "uz"
                  ? "Mijoz ma'lumotlari va operatsiyalar tarixi"
                  : "Информация о клиенте и история операций"
                : language === "uz"
                  ? "Mijoz tanlanmagan"
                  : "Клиент не выбран"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="space-y-6">
                {/* Financial Summary - Using stats from payment history */}
                <div className="grid gap-4 sm:grid-cols-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language === "uz" ? "Jami xaridlar" : "Всего покупок"}
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(paymentHistory?.stats.total_orders || 0)}{" "}
                      {language === "uz" ? "so'm" : "сум"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language === "uz" ? "Jami to'langan" : "Всего оплачено"}
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(paymentHistory?.stats.total_paid || 0)}{" "}
                      {language === "uz" ? "so'm" : "сум"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language === "uz" ? "Qarz qoldiq" : "Остаток долга"}
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(paymentHistory?.stats.remaining_debt || 0)}{" "}
                      {language === "uz" ? "so'm" : "сум"}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-3">
                    {language === "uz"
                      ? "Bog'lanish ma'lumotlari"
                      : "Контактная информация"}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 border rounded-lg dark:border-gray-700">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("phone")}
                        </p>
                        <p className="font-medium">{selectedCustomer.phone}</p>
                      </div>
                    </div>

                    {selectedCustomer.address && (
                      <div className="flex items-center gap-3 p-2 border rounded-lg dark:border-gray-700">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("address")}
                          </p>
                          <p className="font-medium">
                            {selectedCustomer.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Email field */}
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-3 p-2 border rounded-lg dark:border-gray-700">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Email
                          </p>
                          <p className="font-medium">
                            {selectedCustomer.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notes field */}
                    {selectedCustomer.notes && (
                      <div className="flex items-start gap-3 p-2 border rounded-lg dark:border-gray-700">
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("notes")}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {selectedCustomer.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction History - Using payment history from API */}
                <div>
                  <h4 className="font-semibold mb-3">
                    {language === "uz"
                      ? "Operatsiyalar tarixi"
                      : "История операций"}
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {isLoadingHistory ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : !paymentHistory || paymentHistory.history.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {language === "uz"
                            ? "Hozircha operatsiyalar yo'q"
                            : "Операций пока нет"}
                        </p>
                      </div>
                    ) : (
                      paymentHistory.history.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-start justify-between p-3 border rounded-lg dark:border-gray-700"
                        >
                          <div className="flex items-start gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium">
                                {getTransactionTypeLabel(transaction.type)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(transaction.created_at)} •{" "}
                                {formatTime(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${getTransactionColor(transaction.type)}`}
                            >
                              {transaction.type === "DEBT_ADD" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}{" "}
                              {language === "uz" ? "so'm" : "сум"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>
                  {language === "uz"
                    ? "Ma'lumot ko'rish uchun mijoz tanlang"
                    : "Выберите клиента для просмотра информации"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          if (!isAddingPayment) {
            setIsPaymentDialogOpen(open);
            if (!open) {
              setPaymentAmount("");
              setPaymentDescription("");
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{t("addPayment")}</DialogTitle>
            <DialogDescription>
              {selectedCustomer &&
                `${selectedCustomer.name} — ${language === "uz" ? "To'lov qabul qilish" : "Прием оплаты"}`}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {language === "uz" ? "Joriy qarz" : "Текущий долг"}:
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(selectedCustomer.debt)}{" "}
                  {language === "uz" ? "so'm" : "сум"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-amount">{t("paymentAmount")} *</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  disabled={isAddingPayment}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isAddingPayment}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAddPayment}
              disabled={isAddingPayment || !paymentAmount}
            >
              {isAddingPayment ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {language === "uz" ? "To'lanmoqda..." : "Оплата..."}
                </>
              ) : (
                t("pay")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          if (!isAdding) {
            setIsAddDialogOpen(open);
            if (!open) {
              setFormData({
                name: "",
                phone: "",
                address: "",
                email: "",
                notes: "",
              });
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("addCustomer")}</DialogTitle>
            <DialogDescription>
              {language === "uz"
                ? "Yangi mijoz ma'lumotlarini kiriting"
                : "Введите информацию о новом клиенте"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("customerName")} <span className="text-red-500">*</span>
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
                disabled={isAdding}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t("phone")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+998901234567"
                disabled={isAdding}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder={language === "uz" ? "Manzil" : "Адрес"}
                disabled={isAdding}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@mail.com"
                disabled={isAdding}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={
                  language === "uz"
                    ? "Qo'shimcha ma'lumotlar"
                    : "Дополнительная информация"
                }
                rows={3}
                disabled={isAdding}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isAdding}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isAdding || !formData.name || !formData.phone}
            >
              {isAdding ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {language === "uz" ? "Qo'shilmoqda..." : "Добавление..."}
                </>
              ) : (
                t("add")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!isUpdating) {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedCustomer(null);
              setFormData({
                name: "",
                phone: "",
                address: "",
                email: "",
                notes: "",
              });
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {language === "uz"
                ? "Mijozni tahrirlash"
                : "Редактировать клиента"}
            </DialogTitle>
            <DialogDescription>
              {language === "uz"
                ? "Mijoz ma'lumotlarini o'zgartiring"
                : "Измените информацию о клиенте"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                {t("customerName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isUpdating}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">
                {t("phone")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">{t("address")}</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@mail.com"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">{t("notes")}</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isUpdating || !formData.name || !formData.phone}
            >
              {isUpdating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {language === "uz" ? "Saqlanmoqda..." : "Сохранение..."}
                </>
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};