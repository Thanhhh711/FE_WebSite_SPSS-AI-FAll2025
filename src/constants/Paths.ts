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
  PATIENT_DETAIL = '/patient-detail',

  // ==== ERROR ====
  NOT_FOUND = '*'
}
