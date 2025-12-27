// src/constants/paths.ts

//  Dựa vào đây để chỉ các đầu dẫn để sau này dễ sửa tránh thiếu soát nhé Thịnh
export enum AppPath {
  // ==== AUTH ====
  SIGN_IN = '/signin',
  SIGN_UP = '/signup',
  CHANGE_PASSWORD = '/change_password',
  RESET_PASSWORD = '/reset_password',

  // ==== DASHBOARD / HOME ====
  HOME = '/',
  DASHBOARD_APPOINTMENTS = '/appointments/dashboard',
  // ==== TABLES ====
  BASIC_TABLES = '/basic-tables',
  BASIC_TABLES_ORDER = '/basic-tables-order',
  BASIC_TABLES_PRODUCT = '/basic-tables-product',
  BASIC_TABLES_SERVICE = '/basic-tables-service',
  BASIC_TABLES_BRAND = '/basic-tables-brand',
  BASIC_TABLES_REGISTRATION = '/basic-tables-registration',
  BASIC_TABLES_SLOT = '/basic-tables-slot',
  BASIC_TABLES_HOLIDAY = '/basic_tables_holiday',
  BASIC_TABLES_ROOM = '/basic-tables-room',
  BASIC_TABLES_TEMPLATE = '/basic-tables-template',
  BASIC_TABLES_SHEDULES = '/basic-tables-schedules',
  BASIC_TABLES_VOUCHER = '/basic-tables-voucher',
  BASIC_TABLES_CATEGORY = '/basic-tables-category',
  BASIC_TABLES_SKINCONDITION = '/basic-tables-skin-condition',
  BASIC_TABLES_SKINTYPE = '/basic-tables-skin-type',
  BASIC_TABLES_VARIATION = '/basic-tables-variation',
  BASIC_TABLES_TRANSACTION = '/basic-tables-transaction',

  //PRODUCT
  DETAIL_PRODUCT = '/product-detail',

  // ==== UI ELEMENTS ====
  ALERTS = '/alerts',
  AVATARS = '/avatars',
  BADGE = '/badge',
  BUTTONS = '/buttons',
  IMAGES = '/images',
  VIDEOS = '/videos',

  // ==== CHARTS ====
  LINE_CHART = '/line-chart',
  BAR_CHART = '/bar-chart',

  // ==== OTHERS ====
  PROFILE = '/profile',
  CALENDAR = '/calendar',
  FORM_ELEMENTS = '/form-elements',
  BLOGS = '/blogs',
  QUIZZS = '/quizzs',
  PATIENTS = '/patients',
  MEDICAL_RECORD = '/medical-record',
  REPORT = '/report',
  BASIC_TABLES_COUNTRIES = '/basic-tables-countries',

  // ==== ERROR ====
  NOT_FOUND = '*'
}
