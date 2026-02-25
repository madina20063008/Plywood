import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../../lib/context";
import { getTranslation } from "../../lib/translations";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  ArrowLeft,
  PackagePlus,
  Package,
  Calendar,
  History,
  RefreshCw,
  Loader2,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Badge } from "../components/ui/badge";

interface FormData {
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  arrivalDate: string;
  notes: string;
  priceType: "dollar" | "sum";
  exchange_rate?: number; // Optional exchange rate for dollar
}

export const ProductReceivingPage: React.FC = () => {
  const {
    products,
    updateProduct,
    productArrivals,
    addProductArrival,
    fetchAcceptanceHistory,
    fetchProducts,
    user,
    language,
    isAddingProduct,
    isFetchingProducts,
  } = useApp();

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    arrivalDate: new Date().toISOString().split("T")[0],
    notes: "",
    priceType: "sum", // Default to sum
    exchange_rate: undefined, // No exchange rate by default
  });

  // Display prices with currency symbol based on price type
  const formatPrice = (price: number, type: "dollar" | "sum"): string => {
    if (type === "dollar") {
      return `$${price.toFixed(2)}`;
    }
    return `${price.toLocaleString()} UZS`;
  };

  // Format exchange rate properly
  const formatExchangeRate = (rate: string | null | undefined): string => {
    if (!rate) return "-";
    const numRate = parseFloat(rate);
    if (isNaN(numRate)) return "-";
    return `${numRate.toLocaleString()} UZS/USD`;
  };

  // Calculate investment with proper currency
  const calculateInvestment = (
    price: string | number,
    quantity: number,
    priceType: "dollar" | "sum",
  ): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    const total = numPrice * quantity;

    if (priceType === "dollar") {
      return `$${total.toFixed(2)}`;
    }
    return `${total.toLocaleString()} UZS`;
  };

  // Parse price from string to number
  const parsePrice = (price: string | number): number => {
    if (typeof price === "string") {
      return parseFloat(price);
    }
    return price;
  };

  // Fetch acceptance history on component mount
  useEffect(() => {
    if (user) {
      console.log("Fetching acceptance history...");
      fetchAcceptanceHistory();
    }
  }, [fetchAcceptanceHistory, user]);

  const t = (key: string) => getTranslation(language, key as any);

  const selectedProduct = products.find(
    (p) => String(p.id) === String(selectedProductId),
  );
  console.log("Selected product:", selectedProduct);

  const resetForm = () => {
    setSelectedProductId("");
    setFormData({
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      arrivalDate: new Date().toISOString().split("T")[0],
      notes: "",
      priceType: "sum",
      exchange_rate: undefined,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log("Refreshing data...");
      await Promise.all([fetchAcceptanceHistory(), fetchProducts()]);
      toast.success(
        language === "uz" ? "Ma'lumotlar yangilandi" : "Данные обновлены",
      );
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error(
        language === "uz"
          ? "Yangilashda xatolik yuz berdi"
          : "Ошибка при обновлении",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId || !selectedProduct) {
      toast.error(
        language === "uz"
          ? "Iltimos, mahsulotni tanlang"
          : "Пожалуйста, выберите продукт",
      );
      return;
    }

    // Parse quantity as integer
    const quantity = parseInt(formData.quantity.toString());
    console.log("Quantity to submit:", quantity);

    if (quantity <= 0) {
      toast.error(
        language === "uz"
          ? "Miqdor 0 dan katta bo'lishi kerak"
          : "Количество должно быть больше 0",
      );
      return;
    }

    if (formData.purchasePrice <= 0 || formData.sellingPrice <= 0) {
      toast.error(
        language === "uz"
          ? "Narxlar 0 dan katta bo'lishi kerak"
          : "Цены должны быть больше 0",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Debug: check what priceType is being sent
      console.log("Submitting with priceType:", formData.priceType);
      console.log("Purchase price:", formData.purchasePrice);
      console.log("Selling price:", formData.sellingPrice);

      // Call API through context - send exactly what user entered
      await addProductArrival({
        productId: selectedProductId,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        quantity: quantity,
        purchasePrice: formData.purchasePrice, // Send as is (10 for dollar, 10000 for sum)
        sellingPrice: formData.sellingPrice, // Send as is (15 for dollar, 15000 for sum)
        priceType: formData.priceType, // This will be 'dollar' or 'sum'
        totalInvestment: formData.purchasePrice * quantity,
        arrivalDate: formData.arrivalDate,
        notes: formData.notes,
        receivedBy: user?.full_name || "Unknown",
      });

      // Update product with new stock and prices
      await updateProduct(selectedProductId, {
        stockQuantity: selectedProduct.stockQuantity + quantity,
        purchasePrice:
          formData.priceType === "sum" ? formData.purchasePrice : 0,
        unitPrice: formData.priceType === "sum" ? formData.sellingPrice : 0,
        purchasePriceDollar:
          formData.priceType === "dollar" ? formData.purchasePrice : 0,
        unitPriceDollar:
          formData.priceType === "dollar" ? formData.sellingPrice : 0,
        arrival_date: formData.arrivalDate,
        lastPriceType: formData.priceType, // Save last used price type
      });

      resetForm();

      toast.success(
        language === "uz"
          ? `Mahsulot muvaffaqiyatli qabul qilindi (${quantity} dona)`
          : `Товар успешно принят (${quantity} шт.)`,
      );
    } catch (error) {
      console.error("Error submitting acceptance:", error);
      toast.error(
        language === "uz"
          ? "Qabul qilishda xatolik yuz berdi"
          : "Ошибка при приеме товара",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    console.log("handleProductSelect called with:", productId);

    setSelectedProductId(productId);

    const product = products.find((p) => String(p.id) === String(productId));
    console.log("Found product in handleProductSelect:", product);

    if (product) {
      // Use the product's last price type or default to sum
      const priceType = product.lastPriceType || "sum";

      // Set prices based on last used price type
      if (priceType === "dollar" && product.purchasePriceDollar) {
        setFormData({
          purchasePrice: product.purchasePriceDollar,
          sellingPrice: product.unitPriceDollar || 0,
          quantity: 0,
          arrivalDate: new Date().toISOString().split("T")[0],
          notes: "",
          priceType: "dollar",
          exchange_rate: undefined,
        });
      } else {
        setFormData({
          purchasePrice: product.purchasePrice || 0,
          sellingPrice: product.unitPrice || 0,
          quantity: 0,
          arrivalDate: new Date().toISOString().split("T")[0],
          notes: "",
          priceType: "sum",
          exchange_rate: undefined,
        });
      }

      console.log("Form data updated:", {
        purchasePrice: product.purchasePrice,
        sellingPrice: product.unitPrice,
        priceType,
      });
    }
  };

  // Sort arrivals by date (newest first)
  const sortedArrivals = [...productArrivals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Show loading state
  if (isFetchingProducts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {language === "uz"
              ? "Mahsulotlar yuklanmoqda..."
              : "Загрузка продуктов..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "uz" ? "Orqaga" : "Назад"}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {language === "uz" ? "Mahsulot qabul qilish" : "Приём товара"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {language === "uz"
                ? "Kelgan mahsulotning narxi va miqdorini kiriting"
                : "Введите цену и количество поступившего товара"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {language === "uz" ? "Yangilash" : "Обновить"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {language === "uz"
                ? "Qabul qilish ma'lumotlari"
                : "Информация о приёме"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Selection */}
              <div>
                <Label htmlFor="product">
                  {language === "uz"
                    ? "Mahsulotni tanlang"
                    : "Выберите продукт"}{" "}
                  *
                </Label>
                <Select
                  value={selectedProductId}
                  onValueChange={handleProductSelect}
                  disabled={products.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        products.length === 0
                          ? language === "uz"
                            ? "Mahsulotlar mavjud emas"
                            : "Нет доступных продуктов"
                          : language === "uz"
                            ? "Mahsulot tanlang"
                            : "Выберите продукт"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {products.length === 0 ? (
                      <div className="p-4 text-center">
                        <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {language === "uz"
                            ? "Mahsulotlar mavjud emas"
                            : "Нет доступных продуктов"}
                        </p>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate("/inventory/products")}
                        >
                          {language === "uz"
                            ? "Mahsulot qo'shish"
                            : "Добавить продукт"}
                        </Button>
                      </div>
                    ) : (
                      products.map((product) => {
                        return (
                          <SelectItem
                            key={String(product.id)}
                            value={String(product.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: product.color }}
                              />
                              <span className="font-medium">
                                {product.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({product.width}×{product.height}×
                                {product.thickness}mm)
                              </span>
                              <span className="text-xs text-gray-400">
                                {product.stockQuantity}{" "}
                                {language === "uz" ? "dona" : "шт."}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                {products.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    {language === "uz"
                      ? "Mahsulot qabul qilish uchun avval mahsulot qo'shing."
                      : "Для приема товара сначала добавьте продукт."}
                  </p>
                )}
              </div>

              {/* Price Type Selection */}
              <div>
                <Label>
                  {language === "uz" ? "Valyuta turi" : "Тип валюты"} *
                </Label>
                <RadioGroup
                  value={formData.priceType}
                  onValueChange={(value: "dollar" | "sum") =>
                    setFormData({ ...formData, priceType: value })
                  }
                  className="flex gap-4 mt-2"
                  disabled={!selectedProductId || isSubmitting}
                >
                  <div
                    className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                      formData.priceType === "sum"
                        ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                        : ""
                    }`}
                  >
                    <RadioGroupItem value="sum" id="sum" />
                    <Label
                      htmlFor="sum"
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4" />
                      UZS (So'm)
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                      formData.priceType === "dollar"
                        ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                        : ""
                    }`}
                  >
                    <RadioGroupItem value="dollar" id="dollar" />
                    <Label
                      htmlFor="dollar"
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="h-4 w-4" />
                      USD ($)
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-500 mt-1">
                  {language === "uz"
                    ? "Narxlar kiritilgan valyutada saqlanadi"
                    : "Цены сохраняются в выбранной валюте"}
                </p>
              </div>

              {/* Arrival Date */}
              <div>
                <Label htmlFor="arrivalDate">
                  {language === "uz" ? "Kelish sanasi" : "Дата поступления"} *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="arrivalDate"
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) =>
                      setFormData({ ...formData, arrivalDate: e.target.value })
                    }
                    className="pl-10"
                    required
                    disabled={!selectedProductId || isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Price */}
                <div>
                  <Label htmlFor="purchasePrice">
                    {language === "uz" ? "Kelish narxi" : "Цена закупки"} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={formData.purchasePrice || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchasePrice: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      required
                      min="0"
                      step={formData.priceType === "dollar" ? "0.01" : "1"}
                      disabled={!selectedProductId || isSubmitting}
                      className="pr-16"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      {formData.priceType === "dollar" ? "USD" : "UZS"}
                    </div>
                  </div>
                </div>

                {/* Selling Price */}
                <div>
                  <Label htmlFor="sellingPrice">
                    {language === "uz" ? "Sotish narxi" : "Цена продажи"} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="sellingPrice"
                      type="number"
                      value={formData.sellingPrice || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sellingPrice: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      required
                      min="0"
                      step={formData.priceType === "dollar" ? "0.01" : "1"}
                      disabled={!selectedProductId || isSubmitting}
                      className="pr-16"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      {formData.priceType === "dollar" ? "USD" : "UZS"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity">
                  {language === "uz" ? "Miqdor" : "Количество"} *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  required
                  min="1"
                  disabled={!selectedProductId || isSubmitting}
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">
                  {language === "uz" ? "Izohlar" : "Примечания"}
                </Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder={
                    language === "uz"
                      ? "Qo'shimcha ma'lumot..."
                      : "Дополнительная информация..."
                  }
                  disabled={!selectedProductId || isSubmitting}
                />
              </div>

              {/* Profit Margin Display */}
              {formData.purchasePrice > 0 && formData.sellingPrice > 0 && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {formData.priceType === "dollar" ? "USD" : "UZS"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {language === "uz"
                        ? "Joriy valyutada"
                        : "В текущей валюте"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {language === "uz"
                          ? "Foyda (dona)"
                          : "Прибыль (за шт.)"}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(
                          formData.sellingPrice - formData.purchasePrice,
                          formData.priceType,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {language === "uz" ? "Foyda foizi" : "Процент прибыли"}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {(
                          ((formData.sellingPrice - formData.purchasePrice) /
                            formData.purchasePrice) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {language === "uz"
                          ? "Jami investitsiya"
                          : "Общие инвестиции"}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(
                          formData.purchasePrice * formData.quantity,
                          formData.priceType,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  {language === "uz" ? "Tozalash" : "Очистить"}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !selectedProductId ||
                    isSubmitting ||
                    isAddingProduct ||
                    products.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === "uz" ? "Qabul qilinmoqda..." : "Прием..."}
                    </>
                  ) : (
                    <>
                      <PackagePlus className="mr-2 h-4 w-4" />
                      {language === "uz" ? "Qabul qilish" : "Принять товар"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Product Preview */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "uz"
                ? "Mahsulot ma'lumoti"
                : "Информация о продукте"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-16 w-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: selectedProduct.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {selectedProduct.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(selectedProduct.category)} • {selectedProduct.quality}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("dimensions")}:
                    </span>
                    <span className="font-medium">
                      {selectedProduct.width}×{selectedProduct.height}×
                      {selectedProduct.thickness}mm
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === "uz" ? "Joriy zaxira" : "Текущий запас"}:
                    </span>
                    <span className="font-medium">
                      {selectedProduct.stockQuantity}{" "}
                      {language === "uz" ? "dona" : "шт."}
                    </span>
                  </div>

                  {/* Show prices in the last used currency */}
                  {selectedProduct.lastPriceType === "dollar" ? (
                    <>
                      {selectedProduct.purchasePriceDollar > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {language === "uz"
                              ? "Kelish narxi (dollar)"
                              : "Цена закупки (доллар)"}
                            :
                          </span>
                          <span className="font-medium">
                            ${selectedProduct.purchasePriceDollar.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {selectedProduct.unitPriceDollar > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {language === "uz"
                              ? "Sotish narxi (dollar)"
                              : "Цена продажи (доллар)"}
                            :
                          </span>
                          <span className="font-medium">
                            ${selectedProduct.unitPriceDollar.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedProduct.purchasePrice > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {language === "uz"
                              ? "Kelish narxi (so'm)"
                              : "Цена закупки (сум)"}
                            :
                          </span>
                          <span className="font-medium">
                            {selectedProduct.purchasePrice.toLocaleString()} UZS
                          </span>
                        </div>
                      )}
                      {selectedProduct.unitPrice > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {language === "uz"
                              ? "Sotish narxi (so'm)"
                              : "Цена продажи (сум)"}
                            :
                          </span>
                          <span className="font-medium">
                            {selectedProduct.unitPrice.toLocaleString()} UZS
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === "uz"
                        ? "Oxirgi valyuta"
                        : "Последняя валюта"}
                      :
                    </span>
                    <Badge
                      variant={
                        selectedProduct.lastPriceType === "dollar"
                          ? "default"
                          : "outline"
                      }
                    >
                      {selectedProduct.lastPriceType === "dollar"
                        ? "USD"
                        : "UZS"}
                    </Badge>
                  </div>
                </div>

                {formData.quantity > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {language === "uz"
                        ? "Qabul qilingandan keyin"
                        : "После приёма"}
                      :
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === "uz" ? "Yangi zaxira" : "Новый запас"}:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {selectedProduct.stockQuantity + formData.quantity}{" "}
                        {language === "uz" ? "dona" : "шт."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === "uz"
                    ? "Mahsulotni tanlang"
                    : "Выберите продукт"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receiving History - Fixed version with proper currency display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {language === "uz"
              ? "Qabul qilish tarixi"
              : "История приёма товаров"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedArrivals.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {language === "uz"
                  ? "Hozircha qabul qilish tarixi yo'q"
                  : "Пока нет истории приёма товаров"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "uz" ? "Sana" : "Дата"}</TableHead>
                    <TableHead>
                      {language === "uz" ? "Mahsulot" : "Продукт"}
                    </TableHead>
                    <TableHead>
                      {language === "uz" ? "Kategoriya" : "Категория"}
                    </TableHead>
                    <TableHead className="text-right">
                      {language === "uz" ? "Miqdor" : "Количество"}
                    </TableHead>
                    <TableHead className="text-right">
                      {language === "uz" ? "Kelish narxi" : "Цена закупки"}
                    </TableHead>
                    <TableHead className="text-right">
                      {language === "uz" ? "Sotish narxi" : "Цена продажи"}
                    </TableHead>
                    <TableHead className="text-right">
                      {language === "uz" ? "Investitsiya" : "Инвестиции"}
                    </TableHead>
                    <TableHead>
                      {language === "uz" ? "Valyuta" : "Валюта"}
                    </TableHead>
                    <TableHead className="text-right">
                      {language === "uz" ? "Kurs" : "Курс"}
                    </TableHead>
                    <TableHead>
                      {language === "uz" ? "Qabul qildi" : "Принял"}
                    </TableHead>
                    <TableHead>
                      {language === "uz" ? "Izohlar" : "Примечания"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedArrivals.map((arrival) => {
                    // Parse prices from string to number
                    const purchasePrice = parsePrice(arrival.purchasePrice);
                    const sellingPrice = parsePrice(arrival.sellingPrice);

                    return (
                      <TableRow key={arrival.id}>
                        <TableCell className="font-medium">
                          {format(new Date(arrival.arrivalDate), "dd.MM.yyyy")}
                        </TableCell>
                        <TableCell>{arrival.productName}</TableCell>
                        <TableCell>{t(arrival.category)}</TableCell>
                        <TableCell className="text-right">
                          {arrival.quantity}{" "}
                          {language === "uz" ? "dona" : "шт."}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(purchasePrice, arrival.priceType)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(sellingPrice, arrival.priceType)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {calculateInvestment(
                            purchasePrice,
                            arrival.quantity,
                            arrival.priceType,
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              arrival.priceType === "dollar"
                                ? "default"
                                : "outline"
                            }
                          >
                            {arrival.priceType === "dollar" ? "USD" : "UZS"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600 dark:text-gray-400">
                          {formatExchangeRate(arrival.exchangeRate)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {arrival.receivedBy}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {arrival.notes || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
