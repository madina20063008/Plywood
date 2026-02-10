import { Language } from './types';

export const translations = {
  uz: {
    // Auth
    login: 'Kirish',
    username: 'Foydalanuvchi nomi',
    password: 'Parol',
    logout: 'Chiqish',
    
    // Roles
    salesperson: 'Sotuvchi',
    admin: 'Administrator',
    manager: 'Menejer',
    
    // Navigation
    dashboard: 'Boshqaruv paneli',
    products: 'Mahsulotlar',
    sales: 'Sotuvlar',
    soldProducts: 'Sotilgan mahsulotlar',
    inventory: 'Ombor',
    users: 'Foydalanuvchilar',
    reports: 'Hisobotlar',
    settings: 'Sozlamalar',
    cart: 'Savatcha',
    
    // Products
    productName: 'Mahsulot nomi',
    category: 'Kategoriya',
    color: 'Rang',
    dimensions: 'O\'lchamlar',
    thickness: 'Qalinligi',
    quality: 'Sifati',
    price: 'Narxi',
    stock: 'Omborda',
    addToCart: 'Savatchaga qo\'shish',
    inStock: 'Omborda',
    outOfStock: 'Omborda yo\'q',
    
    // Categories
    MDF: 'MDF',
    LDSP: 'LDSP',
    DVP: 'DVP',
    DSP: 'DSP',
    OTHER: 'Boshqa',
    
    // Cart
    quantity: 'Miqdori',
    subtotal: 'Jami',
    total: 'Umumiy summa',
    discount: 'Chegirma',
    checkout: 'To\'lov',
    emptyCart: 'Savatcha bo\'sh',
    remove: 'O\'chirish',
    
    // Services
    services: 'Xizmatlar',
    cuttingService: 'Kesish xizmati',
    edgeBandingService: 'Kromkalash xizmati',
    addCutting: 'Kesish qo\'shish',
    addEdgeBanding: 'Kromkalash qo\'shish',
    numberOfBoards: 'Plitalar soni',
    pricePerCut: 'Bir kesishning narxi',
    width: 'Eni',
    height: 'Balandligi',
    linearMeters: 'Chiziqli metrlar',
    pricePerMeter: 'Metr narxi',
    
    // Actions
    add: 'Qo\'shish',
    edit: 'Tahrirlash',
    delete: 'O\'chirish',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    search: 'Qidirish',
    filter: 'Filtrlash',
    print: 'Chop etish',
    download: 'Yuklab olish',
    
    // Receipt
    receipt: 'Chek',
    receiptNumber: 'Chek raqami',
    date: 'Sana',
    time: 'Vaqt',
    
    // Dashboard
    todayRevenue: 'Bugungi daromad',
    monthlySales: 'Oylik sotuvlar',
    totalProducts: 'Jami mahsulotlar',
    lowStock: 'Kam qolgan mahsulotlar',
    topSellingProducts: 'Eng ko\'p sotiladigan mahsulotlar',
    revenueByCategory: 'Kategoriya bo\'yicha daromad',
    salesTrend: 'Sotuvlar tendensiyasi',
    
    // User Management
    addUser: 'Foydalanuvchi qo\'shish',
    fullName: 'To\'liq ismi',
    role: 'Rol',
    createdAt: 'Yaratilgan sana',
    
    // Inventory
    addProduct: 'Mahsulot qo\'shish',
    editProduct: 'Mahsulotni tahrirlash',
    updateStock: 'Omborni yangilash',
    lowStockAlert: 'Kam qolgan mahsulotlar haqida ogohlantirish',
    
    // Product Arrivals
    productArrivals: 'Mahsulot qabul qilish',
    receiveProduct: 'Mahsulot qabul qilish',
    purchasePrice: 'Kelish narxi',
    sellingPrice: 'Sotuv narxi',
    arrivalDate: 'Kelish sanasi',
    notes: 'Izohlar',
    productReceived: 'Mahsulot qabul qilindi',
    arrivalHistory: 'Kelishlar tarixi',
    receivedBy: 'Qabul qildi',
    profitMargin: 'Foyda ulushi',
    totalInvestment: 'Umumiy investitsiya',
    potentialRevenue: 'Potensial daromad',
    noArrivals: 'Hozircha kelishlar yo\'q',
    
    // Theme
    lightMode: 'Yorug\' rejim',
    darkMode: 'Qorong\'u rejim',
    
    // Messages
    loginSuccess: 'Muvaffaqiyatli kirildi',
    loginError: 'Foydalanuvchi nomi yoki parol noto\'g\'ri',
    addedToCart: 'Savatchaga qo\'shildi',
    productAdded: 'Mahsulot qo\'shildi',
    productUpdated: 'Mahsulot yangilandi',
    productDeleted: 'Mahsulot o\'chirildi',
    saleCompleted: 'Sotuv muvaffaqiyatli yakunlandi',
    saleUpdated: 'Sotuv ma\'lumotlari yangilandi',
    
    // Sold Products
    editSale: 'Sotuvni tahrirlash',
    viewDetails: 'Tafsilotlarni ko\'rish',
    noSoldProducts: 'Hozircha sotilgan mahsulotlar yo\'q',
    
    // Customers & Credit
    customers: 'Mijozlar',
    customer: 'Mijoz',
    addCustomer: 'Mijoz qo\'shish',
    customerName: 'Mijoz ismi',
    phone: 'Telefon',
    address: 'Manzil',
    email: 'Email',
    customerAdded: 'Mijoz qo\'shildi',
    customerUpdated: 'Mijoz yangilandi',
    customerDeleted: 'Mijoz o\'chirildi',
    customerLedger: 'Moliyaviy hisob',
    creditSales: 'Nasiya sotuvlar',
    totalDebt: 'Jami qarz',
    totalPaid: 'Jami to\'langan',
    outstandingDebt: 'Qarz qoldiq',
    addPayment: 'To\'lov qo\'shish',
    paymentAmount: 'To\'lov miqdori',
    paymentAdded: 'To\'lov qabul qilindi',
    purchaseHistory: 'Xaridlar tarixi',
    paymentHistory: 'To\'lovlar tarixi',
    noCustomers: 'Hozircha mijozlar yo\'q',
    selectCustomer: 'Mijozni tanlang',
    credit: 'Nasiya',
    purchase: 'Xarid',
    payment: 'To\'lov',
    amountPaid: 'O\'plangan summa',
  },
  ru: {
    // Auth
    login: 'Вход',
    username: 'Имя пользователя',
    password: 'Пароль',
    logout: 'Выход',
    
    // Roles
    salesperson: 'Продавец',
    admin: 'Администратор',
    manager: 'Менеджер',
    
    // Navigation
    dashboard: 'Панель управления',
    products: 'Продукты',
    sales: 'Продажи',
    soldProducts: 'Проданные товары',
    inventory: 'Склад',
    users: 'Пользователи',
    reports: 'Отчеты',
    settings: 'Настройки',
    cart: 'Корзина',
    
    // Products
    productName: 'Название продукта',
    category: 'Категория',
    color: 'Цвет',
    dimensions: 'Размеры',
    thickness: 'Толщина',
    quality: 'Качество',
    price: 'Цена',
    stock: 'На складе',
    addToCart: 'В корзину',
    inStock: 'В наличии',
    outOfStock: 'Нет в наличии',
    
    // Categories
    MDF: 'МДФ',
    LDSP: 'ЛДСП',
    DVP: 'ДВП',
    DSP: 'ДСП',
    OTHER: 'Другое',
    
    // Cart
    quantity: 'Количество',
    subtotal: 'Итого',
    total: 'Общая сумма',
    discount: 'Скидка',
    checkout: 'Оформить',
    emptyCart: 'Корзина пуста',
    remove: 'Удалить',
    
    // Services
    services: 'Услуги',
    cuttingService: 'Услуга распила',
    edgeBandingService: 'Услуга кромкования',
    addCutting: 'Добавить распил',
    addEdgeBanding: 'Добавить кромкование',
    numberOfBoards: 'Количество плит',
    pricePerCut: 'Цена за распил',
    width: 'Ширина',
    height: 'Высота',
    linearMeters: 'Погонные метры',
    pricePerMeter: 'Цена за метр',
    
    // Actions
    add: 'Добавить',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    search: 'Поиск',
    filter: 'Фильтр',
    print: 'Печать',
    download: 'Скачать',
    
    // Receipt
    receipt: 'Чек',
    receiptNumber: 'Номер чека',
    date: 'Дата',
    time: 'Время',
    
    // Dashboard
    todayRevenue: 'Выручка за сегодня',
    monthlySales: 'Продажи за месяц',
    totalProducts: 'Всего продуктов',
    lowStock: 'Заканчивающиеся товары',
    topSellingProducts: 'Топ продаж',
    revenueByCategory: 'Выручка по категориям',
    salesTrend: 'Тренд продаж',
    
    // User Management
    addUser: 'Добавить пользователя',
    fullName: 'Полное имя',
    role: 'Роль',
    createdAt: 'Дата создания',
    
    // Inventory
    addProduct: 'Добавить продукт',
    editProduct: 'Редактировать продукт',
    updateStock: 'Обновить склад',
    lowStockAlert: 'Уведомление о низких запасах',
    
    // Product Arrivals
    productArrivals: 'Прием товара',
    receiveProduct: 'Принять товар',
    purchasePrice: 'Цена закупки',
    sellingPrice: 'Цена продажи',
    arrivalDate: 'Дата поступления',
    notes: 'Примечания',
    productReceived: 'Товар принят',
    arrivalHistory: 'История поступлений',
    receivedBy: 'Принял',
    profitMargin: 'Маржа',
    totalInvestment: 'Общие инвестиции',
    potentialRevenue: 'Потенциальный доход',
    noArrivals: 'Поступлений пока нет',
    
    // Theme
    lightMode: 'Светлая тема',
    darkMode: 'Темная тема',
    
    // Messages
    loginSuccess: 'Вход выполнен успешно',
    loginError: 'Неверное имя пользователя или пароль',
    addedToCart: 'Добавлено в корзину',
    productAdded: 'Продукт добавлен',
    productUpdated: 'Продукт обновлен',
    productDeleted: 'Продукт удален',
    saleCompleted: 'Продажа успешно завершена',
    saleUpdated: 'Данные продажи обновлены',
    
    // Sold Products
    editSale: 'Редактировать продажу',
    viewDetails: 'Просмотр деталей',
    noSoldProducts: 'Проданных товаров пока нет',
    
    // Customers & Credit
    customers: 'Клиенты',
    customer: 'Клиент',
    addCustomer: 'Добавить клиента',
    customerName: 'Имя клиента',
    phone: 'Телефон',
    address: 'Адрес',
    email: 'Email',
    customerAdded: 'Клиент добавлен',
    customerUpdated: 'Клиент обновлен',
    customerDeleted: 'Клиент удален',
    customerLedger: 'Финансовый учет',
    creditSales: 'Продажи в кредит',
    totalDebt: 'Общий долг',
    totalPaid: 'Всего оплачено',
    outstandingDebt: 'Остаток долга',
    addPayment: 'Добавить оплату',
    paymentAmount: 'Сумма оплаты',
    paymentAdded: 'Оплата принята',
    purchaseHistory: 'История покупок',
    paymentHistory: 'История платежей',
    noCustomers: 'Клиентов пока нет',
    selectCustomer: 'Выберите клиента',
    credit: 'Кредит',
    purchase: 'Покупка',
    payment: 'Оплата',
    amountPaid: 'Оплаченная сумма',
    remainingDebt: 'Остаток долга',
    fullCredit: 'Полный кредит',
    partialPayment: 'Частичная оплата',
  }
};

export const getTranslation = (lang: Language, key: keyof typeof translations.uz): string => {
  return translations[lang][key] || key;
};