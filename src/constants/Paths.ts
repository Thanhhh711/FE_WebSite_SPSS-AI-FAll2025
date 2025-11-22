// src/constants/paths.ts

//  Dựa vào đây để chỉ các đầu dẫn để sau này dễ sửa tránh thiếu soát nhé Thịnh
export enum AppPath {
  // ==== AUTH ====
  SIGN_IN = '/signin',
  SIGN_UP = '/signup',

  // ==== DASHBOARD / HOME ====
  HOME = '/',

  // ==== TABLES ====
  BASIC_TABLES = '/basic-tables',
  BASIC_TABLES_ORDER = '/basic-tables-order',
  BASIC_TABLES_PRODUCT = '/basic-tables-product',
  BASIC_TABLES_SERVICE = '/basic-tables-service',
  BASIC_TABLES_REGISTRATION = '/basic-tables-registration',
  BASIC_TABLES_SLOT = '/basic-tables-slot',
  BASIC_TABLES_ROOM = '/basic-tables-room',
  BASIC_TABLES_TEMPLATE = '/basic-tables-template',
  BASIC_TABLES_SHEDULES = '/basic-tables-schedules',
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
  BLANK = '/blank',
  PATIENTS = '/patients',
  PATIENT_DETAIL = '/medical-record',
  REPORT = '/report',

  // ==== ERROR ====
  NOT_FOUND = '*'
}
