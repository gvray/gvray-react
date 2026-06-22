import { PrimaryColor, ThemeMode } from '@/constants';
import { DEFAULT_SERVER_CONFIG, type ServerConfig } from '@/constants/settings';
import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ─── 偏好子类型 ─────────────────────────────────────────

export type SiderTheme = 'light' | 'dark';

export interface SiderPrefs {
  collapsed: boolean;
  theme: SiderTheme;
  width: number;
  collapsedWidth: number;
  showLogo: boolean;
}

export interface HeaderPrefs {
  fixed: boolean;
}

export interface ContentPrefs {
  showFooter: boolean;
  footerText: string;
}

export interface AccessibilityPrefs {
  colorWeak: boolean;
  grayMode: boolean;
}

// ─── 偏好完整类型 ───────────────────────────────────────

/**
 * 所有 UI 偏好字段。
 *
 * 数据来源优先级：userSettings > serverConfig（已含默认值）
 */
export interface Preferences {
  themeMode: ThemeMode;
  colorPrimary: PrimaryColor;
  language: string;
  pageSize: number;
  showBreadcrumb: boolean;
  sider: SiderPrefs;
  header: HeaderPrefs;
  content: ContentPrefs;
  accessibility: AccessibilityPrefs;
}

// ─── serverConfig → 完整偏好基准 ─────────────────────────

/**
 * 从 serverConfig 生成完整的 Preferences 基准值。
 * serverConfig 已经是 runtime API + DEFAULT_SERVER_CONFIG 合并后的完整配置，
 * 对于 uiDefaults 没覆盖的偏好字段，这里用前端默认值补齐。
 */
export function configToPreferences(config: ServerConfig): Preferences {
  const ui = config.uiDefaults;
  return {
    themeMode: (ui.theme || 'light') as ThemeMode,
    colorPrimary: '#1677ff',
    language: ui.language || 'zh-CN',
    pageSize: ui.pageSize || 10,
    showBreadcrumb: ui.showBreadcrumb !== false,
    sider: {
      collapsed: ui.sidebarCollapsed,
      theme: 'light',
      width: 220,
      collapsedWidth: 64,
      showLogo: true,
    },
    header: { fixed: true },
    content: {
      showFooter: false,
      footerText: '© 2026 G-ADMIN · Crafted with ❤️',
    },
    accessibility: { colorWeak: false, grayMode: false },
  };
}

// ─── me.preferences → Partial<Preferences> 映射 ────────────

/**
 * 把 /auth/me 返回的扁平 preferences 映射为前端 Preferences 的 Partial 结构。
 * 与 /profile/settings 共用同一套扁平 schema。
 */
export function normalizeMePreferences(
  raw?: Record<string, unknown>,
): Partial<Preferences> {
  if (!raw) return {};
  const result: Partial<Preferences> = {};

  if (raw.theme) result.themeMode = raw.theme as ThemeMode;
  if (raw.language) result.language = raw.language as string;
  if (typeof raw.pageSize === 'number') result.pageSize = raw.pageSize;
  if (typeof raw.showBreadcrumb === 'boolean')
    result.showBreadcrumb = raw.showBreadcrumb;

  if (
    typeof raw.sidebarCollapsed === 'boolean' ||
    typeof raw.sidebarDark === 'boolean' ||
    typeof raw.showLogo === 'boolean'
  ) {
    result.sider = {
      collapsed: false,
      theme: 'light' as SiderTheme,
      width: 220,
      collapsedWidth: 64,
      showLogo: true,
    };
    if (typeof raw.sidebarCollapsed === 'boolean')
      result.sider.collapsed = raw.sidebarCollapsed;
    if (typeof raw.sidebarDark === 'boolean')
      result.sider.theme = raw.sidebarDark ? 'dark' : 'light';
    if (typeof raw.showLogo === 'boolean') result.sider.showLogo = raw.showLogo;
  }

  if (typeof raw.fixedHeader === 'boolean') {
    result.header = { fixed: raw.fixedHeader };
  }

  if (typeof raw.showFooter === 'boolean') {
    result.content = {
      showFooter: raw.showFooter,
      footerText: '© 2026 G-ADMIN · Crafted with ❤️',
    };
  }

  if (typeof raw.colorWeak === 'boolean' || typeof raw.grayMode === 'boolean') {
    result.accessibility = { colorWeak: false, grayMode: false };
    if (typeof raw.colorWeak === 'boolean')
      result.accessibility.colorWeak = raw.colorWeak;
    if (typeof raw.grayMode === 'boolean')
      result.accessibility.grayMode = raw.grayMode;
  }

  return result;
}

// ─── resolve：userSettings > mePreferences > base ─────────

/**
 * 三层优先级：userSettings > mePreferences > base（来自 serverConfig）
 * 对象类型字段做浅合并，基本类型字段直接 ??。
 */
export function resolvePreferences(
  userSettings: Partial<Preferences>,
  mePreferences: Partial<Preferences> | undefined,
  base: Preferences,
): Preferences {
  const pick = <K extends keyof Preferences>(key: K): Preferences[K] => {
    const user = userSettings[key];
    const me = mePreferences?.[key];
    const fallback = base[key];

    if (
      typeof fallback === 'object' &&
      fallback !== null &&
      !Array.isArray(fallback)
    ) {
      // 对象类型浅合并：base <- me <- user
      return { ...(fallback as any), ...(me as any), ...(user as any) };
    }
    // 基本类型：user > me > fallback
    if (user !== undefined) return user;
    if (me !== undefined) return me;
    return fallback;
  };

  return {
    themeMode: pick('themeMode'),
    colorPrimary: pick('colorPrimary'),
    language: pick('language'),
    pageSize: pick('pageSize'),
    showBreadcrumb: pick('showBreadcrumb'),
    sider: pick('sider'),
    header: pick('header'),
    content: pick('content'),
    accessibility: pick('accessibility'),
  };
}

// ─── Store 类型 ──────────────────────────────────────────

interface AppState {
  /**
   * ① 服务端配置 = runtime API 返回 + default 合并后的完整基准。
   * 不持久化，每次启动从 API 获取。
   */
  serverConfig: ServerConfig;

  /**
   * ② 用户个性化设置（只存用户改过的字段）。
   * 持久化到 localStorage。
   */
  userSettings: Partial<Preferences>;

  /**
   * ③ /auth/me 返回的用户偏好（中间层）。
   * 不持久化，每次登录/刷新从 API 获取，覆盖 serverConfig。
   */
  mePreferences?: Partial<Preferences>;
}

interface AppActions {
  setServerConfig: (config: ServerConfig) => void;

  /** 设置 me 返回的 preferences（中间优先级） */
  setMePreferences: (prefs: Partial<Preferences>) => void;

  setThemeMode: (mode: ThemeMode) => void;
  setColorPrimary: (color: PrimaryColor) => void;
  setLanguage: (lang: string) => void;
  setPageSize: (size: number) => void;
  setShowBreadcrumb: (show: boolean) => void;
  setSider: (patch: Partial<SiderPrefs>) => void;
  setHeader: (patch: Partial<HeaderPrefs>) => void;
  setContent: (patch: Partial<ContentPrefs>) => void;
  setAccessibility: (patch: Partial<AccessibilityPrefs>) => void;
  toggleCollapsed: () => void;

  /** 清空用户设置，回退到 mePreferences / serverConfig 基准值 */
  resetPreferences: () => void;
}

// ─── Store 实例 ──────────────────────────────────────────

// const DEFAULT_PREFERENCES = configToPreferences(DEFAULT_SERVER_CONFIG);

export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set) => ({
      serverConfig: { ...DEFAULT_SERVER_CONFIG },
      userSettings: {},
      mePreferences: undefined,

      // ── Actions ──

      setServerConfig: (config) =>
        set((s) => {
          s.serverConfig = config;
        }),

      setMePreferences: (prefs) =>
        set((s) => {
          s.mePreferences = prefs;
        }),

      setThemeMode: (mode) =>
        set((s) => {
          s.userSettings.themeMode = mode;
        }),

      setColorPrimary: (color) =>
        set((s) => {
          s.userSettings.colorPrimary = color;
        }),

      setLanguage: (lang) =>
        set((s) => {
          s.userSettings.language = lang;
        }),

      setPageSize: (size) =>
        set((s) => {
          s.userSettings.pageSize = size;
        }),

      setShowBreadcrumb: (show) =>
        set((s) => {
          s.userSettings.showBreadcrumb = show;
        }),

      setSider: (patch) =>
        set((s) => {
          const current = resolvePreferences(
            s.userSettings,
            s.mePreferences,
            configToPreferences(s.serverConfig),
          ).sider;
          s.userSettings.sider = { ...current, ...patch };
        }),

      setHeader: (patch) =>
        set((s) => {
          const current = resolvePreferences(
            s.userSettings,
            s.mePreferences,
            configToPreferences(s.serverConfig),
          ).header;
          s.userSettings.header = { ...current, ...patch };
        }),

      setContent: (patch) =>
        set((s) => {
          const current = resolvePreferences(
            s.userSettings,
            s.mePreferences,
            configToPreferences(s.serverConfig),
          ).content;
          s.userSettings.content = { ...current, ...patch };
        }),

      setAccessibility: (patch) =>
        set((s) => {
          const current = resolvePreferences(
            s.userSettings,
            s.mePreferences,
            configToPreferences(s.serverConfig),
          ).accessibility;
          s.userSettings.accessibility = { ...current, ...patch };
        }),

      toggleCollapsed: () =>
        set((s) => {
          const current = resolvePreferences(
            s.userSettings,
            s.mePreferences,
            configToPreferences(s.serverConfig),
          ).sider;
          s.userSettings.sider = { ...current, collapsed: !current.collapsed };
        }),

      resetPreferences: () =>
        set((s) => {
          s.userSettings = {};
        }),
    })),
    {
      name: 'app-preferences',
      version: 3,
      partialize: (state) => ({
        userSettings: state.userSettings,
      }),
    },
  ),
);

// ─── 消费端 Hook：读取 resolved 偏好 ────────────────────

/**
 * 返回 resolved 后的完整偏好：userSettings ?? serverConfig。
 *
 * 订阅了 userSettings 和 serverConfig，任一变化（包括 persist rehydrate）
 * 都会触发重新计算和 re-render。
 */
export function usePreferences(): Preferences {
  const userSettings = useAppStore((s) => s.userSettings);
  const mePreferences = useAppStore((s) => s.mePreferences);
  const serverConfig = useAppStore((s) => s.serverConfig);
  return useMemo(
    () =>
      resolvePreferences(
        userSettings,
        mePreferences,
        configToPreferences(serverConfig),
      ),
    [userSettings, mePreferences, serverConfig],
  );
}

/**
 * 非 React 上下文中获取 resolved 偏好（如 app.tsx 初始化）。
 */
export function getPreferences(): Preferences {
  const { userSettings, mePreferences, serverConfig } = useAppStore.getState();
  return resolvePreferences(
    userSettings,
    mePreferences,
    configToPreferences(serverConfig),
  );
}
