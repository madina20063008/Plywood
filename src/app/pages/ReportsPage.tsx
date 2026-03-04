import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useApp } from "../../lib/context";
import { getTranslation } from "../../lib/translations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  TrendingUp,
  Percent,
  DollarSign,
  Download,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { DailyStats } from "../../lib/types";
// import { dailyStatsApi } from '../../lib/api/dailyStats';
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { dailyStatsApi } from "../../lib/api";
import { cn } from "../components/ui/utils";
// import { cn } from '../components/lib/utils';

export const ReportsPage: React.FC = () => {
  const { sales, language, fetchDashboardStats, isFetchingDashboardStats } =
    useApp();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isFetchingDailyStats, setIsFetchingDailyStats] = useState(false);

  // Fetch daily stats when date changes
  const fetchDailyStats = useCallback(async (date?: string) => {
    setIsFetchingDailyStats(true);
    try {
      const stats = await dailyStatsApi.getStats(date);
      setDailyStats(stats);
    } catch (error) {
      console.error("Failed to fetch daily stats:", error);
    } finally {
      setIsFetchingDailyStats(false);
    }
  }, []);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Fetch daily stats when date changes
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      fetchDailyStats(formattedDate);
    } else {
      fetchDailyStats();
    }
  }, [selectedDate, fetchDailyStats]);

  const t = (key: string) => getTranslation(language, key as any);

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      switch (selectedPeriod) {
        case "today":
          return saleDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return saleDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [sales, selectedPeriod]);

  const totals = useMemo(() => {
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.total,
      0,
    );
    const totalDiscount = filteredSales.reduce(
      (sum, sale) => sum + sale.discount,
      0,
    );
    const totalItems = filteredSales.reduce(
      (sum, sale) => sum + sale.items.length,
      0,
    );

    return { totalRevenue, totalDiscount, totalItems };
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("reports")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === "uz"
              ? "Sotuvlar hisoboti va tahlil"
              : "Отчет о продажах и анализ"}
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          {language === "uz" ? "Excel yuklab olish" : "Скачать Excel"}
        </Button>
      </div>

      <Card className="w-full">
        <div className="flex flex-row items-center justify-between p-6">
          <CardHeader className="p-0 m-0">
            <CardTitle className="text-lg whitespace-nowrap">
              {language === "uz"
                ? "Sana bo'yicha statistika"
                : "Статистика по дате"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "dd.MM.yyyy")
                      : language === "uz"
                        ? "Sanani tanlang"
                        : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Daily Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "uz" ? "Kassa jami" : "Касса всего"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingDailyStats ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {dailyStats?.cashbox_total?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedDate
                    ? format(selectedDate, "dd.MM.yyyy")
                    : format(new Date(), "dd.MM.yyyy")}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "uz" ? "Mahsulot sotuvi" : "Продажи продуктов"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingDailyStats ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {dailyStats?.product_sales?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">UZS</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "uz" ? "Kromkalash daromadi" : "Доход от бандинга"}
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingDailyStats ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {dailyStats?.banding_income?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">UZS</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "uz" ? "Kesish daromadi" : "Доход от резки"}
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetchingDailyStats ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {dailyStats?.cutting_income?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">UZS</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Period Filter and Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {language === "uz" ? "Sotuvlar tarixi" : "История продаж"}
            </CardTitle>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === "uz" ? "Barcha vaqt" : "Все время"}
                </SelectItem>
                <SelectItem value="today">
                  {language === "uz" ? "Bugun" : "Сегодня"}
                </SelectItem>
                <SelectItem value="week">
                  {language === "uz" ? "Oxirgi 7 kun" : "Последние 7 дней"}
                </SelectItem>
                <SelectItem value="month">
                  {language === "uz" ? "Oxirgi 30 kun" : "Последние 30 дней"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("receiptNumber")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>
                    {language === "uz" ? "Sotuvchi" : "Продавец"}
                  </TableHead>
                  <TableHead>
                    {language === "uz" ? "Mahsulotlar" : "Продукты"}
                  </TableHead>
                  <TableHead>{t("paymentMethod")}</TableHead>
                  <TableHead>{t("discount")}</TableHead>
                  <TableHead className="text-right">{t("total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      {language === "uz"
                        ? "Sotuvlar topilmadi"
                        : "Продажи не найдены"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.receiptNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(sale.createdAt), "dd.MM.yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{sale.salespersonName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {sale.items.length}{" "}
                          {language === "uz" ? "dona" : "шт"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(sale.paymentMethod)}</Badge>
                      </TableCell>
                      <TableCell className="text-orange-600 dark:text-orange-400">
                        {sale.discount.toLocaleString()} UZS
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                        {sale.total.toLocaleString()} UZS
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
