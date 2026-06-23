/**
 * 服务端运行时配置
 *
 * 数据来源：GET /public/runtime-config（无需登录即可获取）
 * 运营 / 管理员在后台配置的全局参数，前端只读、不持久化。
 */

import type { Preferences } from '@/types/settings';

// ─── 子类型 ─────────────────────────────────────────────

export interface FeatureConfig {
  register: boolean;
  auditLog: boolean;
  emailNotification: boolean;
  smsNotification: boolean;
  mfa: boolean;
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
  welcomeMessage: string;
  copyright: string;
  icp: string;
  timezone: string;
  footerText: string;
}

export interface UiConfig {
  defaultTheme: string;
  defaultLanguage: string;
  defaultPageSize: number;
  showBreadcrumb: boolean;
  defaultSidebarCollapsed: boolean;
  dateFormat: string;
  timeFormat: string;
  defaultColorPrimary: string;
  timezone: string;
  enableNotification: boolean;
  grayMode: boolean;
  showFooter: boolean;
  showLogo: boolean;
  colorWeak: boolean;
  uniqueOpened: boolean;
}

export interface UserConfig {
  defaultAvatar: string;
}

// ─── 聚合类型 ───────────────────────────────────────────

export interface ServerConfig {
  feature: FeatureConfig;
  oauth: OauthConfig;
  security: SecurityConfig;
  storage: StorageConfig;
  system: SystemConfig;
  ui: UiConfig;
  user: UserConfig;
}

// ─── 默认值 ─────────────────────────────────────────────

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
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
    welcomeMessage: '欢迎使用 GVRAY Admin',
    copyright: '© 2025 GVRAY Admin. All rights reserved.',
    icp: '',
    timezone: 'Asia/Shanghai',
    footerText: '© 2026 G-ADMIN · Crafted with ❤️',
  },
  ui: {
    defaultTheme: 'light',
    defaultLanguage: 'zh-CN',
    defaultPageSize: 10,
    showBreadcrumb: true,
    defaultSidebarCollapsed: false,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    colorPrimary: '#1890ff',
    timezone: 'Asia/Shanghai',
    enableNotification: true,
    grayMode: false,
    showFooter: false,
    showLogo: true,
    colorWeak: false,
    uniqueOpened: true,
  },
  user: {
    defaultAvatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=GVRAY',
  },
};

// ─── ui → Preferences 映射 ───────────────────────────────

/**
 * 把 runtime-config 中的 ui 配置映射为前端 Preferences 的完整结构。
 * 默认值全部来自 DEFAULT_SERVER_CONFIG.ui，不单独定义 DEFAULT_PREFERENCES。
 */
export function uiToPreferences(ui: UiConfig): Preferences {
  return {
    theme: ui.defaultTheme as Preferences['theme'],
    colorPrimary: ui.defaultColorPrimary as Preferences['colorPrimary'],
    language: ui.defaultLanguage,
    pageSize: ui.defaultPageSize,
    showBreadcrumb: ui.showBreadcrumb,
    collapsed: ui.defaultSidebarCollapsed,
    sidebarTheme: ui.defaultTheme as Preferences['sidebarTheme'],
    showLogo: ui.showLogo,
    fixedHeader: true,
    showFooter: ui.showFooter,
    colorWeak: ui.colorWeak,
    uniqueOpened: ui.uniqueOpened,
    timezone: ui.timezone,
    enableNotification: ui.enableNotification,
  };
}
