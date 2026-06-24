import { ColorPrimary, ThemeMode } from './theme';

export interface FeatureConfig {
  register: boolean;
  auditLog: boolean;
  emailNotification: boolean;
  smsNotification: boolean;
  mfa: boolean;
  guestAccount?: {
    username: string;
    password: string;
  };
}

export interface OauthConfig {
  githubEnabled: boolean;
  googleEnabled: boolean;
  wechatEnabled: boolean;
}

export interface SecurityConfig {
  watermarkEnabled: boolean;
}

export interface StorageConfig {
  maxFileSize: number;
  allowedTypes: string;
}

export interface SystemConfig {
  name: string;
  logo: string;
  favicon: string;
  copyright: string;
  icp: string;
  timezone: string;
  footerText: string;
}

export type SiderTheme = 'light' | 'dark';

export interface UserSettings {
  theme: ThemeMode;
  colorPrimary: ColorPrimary;
  language: string;
  pageSize: number;
  showBreadcrumb: boolean;
  sidebarCollapsed: boolean;
  sidebarTheme: SiderTheme;
  showLogo: boolean;
  fixedHeader: boolean;
  showFooter: boolean;
  colorWeak: boolean;
  uniqueOpened: boolean;
  enableNotification: boolean;
}

/** 运行时 UI 配置。后端字段带 `default*` 前缀，normalizeUi 去掉前缀后映射到本结构。 */
export interface AppRuntimeUiConfig
  extends Omit<
    UserSettings,
    | 'theme'
    | 'language'
    | 'pageSize'
    | 'sidebarCollapsed'
    | 'colorPrimary'
    | 'enableNotification'
  > {
  theme: string; // defaultTheme
  language: string; // defaultLanguage
  pageSize: number; // defaultPageSize
  sidebarCollapsed: boolean; // defaultSidebarCollapsed
  colorPrimary: string; // defaultColorPrimary
  enableNotification: boolean; // defaultEnableNotification
  grayMode: boolean;
}

export interface UserConfig {
  defaultAvatar: string;
}

export interface AppRuntimeConfig {
  feature: FeatureConfig;
  oauth: OauthConfig;
  security: SecurityConfig;
  storage: StorageConfig;
  system: SystemConfig;
  ui: AppRuntimeUiConfig;
  user: UserConfig;
}

export const DEFAULT_RUNTIME_CONFIG: AppRuntimeConfig = {
  feature: {
    register: false,
    auditLog: true,
    emailNotification: true,
    smsNotification: false,
    mfa: false,
  },
  oauth: {
    githubEnabled: false,
    googleEnabled: false,
    wechatEnabled: false,
  },
  security: {
    watermarkEnabled: true,
  },
  storage: {
    maxFileSize: 10485760,
    allowedTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',
  },
  system: {
    name: 'GVRAY Admin',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
    copyright: '© 2025 GVRAY Admin. All rights reserved.',
    icp: '',
    timezone: 'Asia/Shanghai',
    footerText: '© 2026 G-ADMIN · Crafted with ❤️',
  },
  ui: {
    theme: 'light',
    language: 'zh-CN',
    pageSize: 10,
    showBreadcrumb: true,
    sidebarCollapsed: false,
    colorPrimary: '#1890ff',
    enableNotification: true,
    grayMode: false,
    showFooter: false,
    showLogo: true,
    colorWeak: false,
    uniqueOpened: true,
    sidebarTheme: 'light',
    fixedHeader: true,
  },
  user: {
    defaultAvatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=GVRAY',
  },
};

export function buildPreferences(ui: AppRuntimeUiConfig): UserSettings {
  return {
    theme: ui.theme as ThemeMode,
    colorPrimary: ui.colorPrimary as ColorPrimary,
    language: ui.language,
    pageSize: ui.pageSize,
    showBreadcrumb: ui.showBreadcrumb,
    sidebarCollapsed: ui.sidebarCollapsed,
    sidebarTheme: ui.sidebarTheme as SiderTheme,
    showLogo: ui.showLogo,
    fixedHeader: ui.fixedHeader,
    showFooter: ui.showFooter,
    colorWeak: ui.colorWeak,
    uniqueOpened: ui.uniqueOpened,
    enableNotification: ui.enableNotification,
  };
}
