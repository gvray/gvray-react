import { PrimaryColor, ThemeMode } from '@/constants';
import { DEFAULT_SERVER_CONFIG, uiToPreferences } from '@/constants/settings';
import type { Preferences } from '@/types/settings';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ─── Store ──────────────────────────────────────────────────────

interface SettingState {
  theme: ThemeMode;
  colorPrimary: PrimaryColor;
  language: string;
  pageSize: number;
  showBreadcrumb: boolean;
  collapsed: boolean;
  sidebarTheme: Preferences['sidebarTheme'];
  showLogo: boolean;
  fixedHeader: boolean;
  showFooter: boolean;
  colorWeak: boolean;
  uniqueOpened: boolean;
  timezone: string;
  enableNotification: boolean;
}

interface SettingActions {
  /** 增量 patch（用户手动修改） */
  patchSettings: (patch: Partial<Preferences>) => void;

  setTheme: (mode: ThemeMode) => void;
  setColorPrimary: (color: PrimaryColor) => void;
  setLanguage: (lang: string) => void;
  setPageSize: (size: number) => void;
  setShowBreadcrumb: (show: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  setSidebarTheme: (theme: Preferences['sidebarTheme']) => void;
  setShowLogo: (show: boolean) => void;
  setFixedHeader: (fixed: boolean) => void;
  setShowFooter: (show: boolean) => void;
  setColorWeak: (enabled: boolean) => void;
  setUniqueOpened: (enabled: boolean) => void;
  setTimezone: (tz: string) => void;
  setEnableNotification: (enabled: boolean) => void;
  toggleCollapsed: () => void;

  /** 清空用户修改，回退到传入的默认值 */
  reset: () => void;
}

export const useSettingStore = create<SettingState & SettingActions>()(
  persist(
    immer((set) => ({
      ...uiToPreferences(DEFAULT_SERVER_CONFIG.ui),

      patchSettings: (patch) =>
        set((s) => {
          for (const [key, val] of Object.entries(patch)) {
            if (val !== undefined) {
              (s as any)[key] = val;
            }
          }
        }),

      setTheme: (mode) =>
        set((s) => {
          s.theme = mode;
        }),

      setColorPrimary: (color) =>
        set((s) => {
          s.colorPrimary = color;
        }),

      setLanguage: (lang) =>
        set((s) => {
          s.language = lang;
        }),

      setPageSize: (size) =>
        set((s) => {
          s.pageSize = size;
        }),

      setShowBreadcrumb: (show) =>
        set((s) => {
          s.showBreadcrumb = show;
        }),

      setCollapsed: (collapsed) =>
        set((s) => {
          s.collapsed = collapsed;
        }),

      setSidebarTheme: (theme) =>
        set((s) => {
          s.sidebarTheme = theme;
        }),

      setShowLogo: (show) =>
        set((s) => {
          s.showLogo = show;
        }),

      setFixedHeader: (fixed) =>
        set((s) => {
          s.fixedHeader = fixed;
        }),

      setShowFooter: (show) =>
        set((s) => {
          s.showFooter = show;
        }),

      setColorWeak: (enabled) =>
        set((s) => {
          s.colorWeak = enabled;
        }),

      setUniqueOpened: (enabled) =>
        set((s) => {
          s.uniqueOpened = enabled;
        }),

      setTimezone: (tz) =>
        set((s) => {
          s.timezone = tz;
        }),

      setEnableNotification: (enabled) =>
        set((s) => {
          s.enableNotification = enabled;
        }),

      toggleCollapsed: () =>
        set((s) => {
          s.collapsed = !s.collapsed;
        }),

      reset: () =>
        set((s) => {
          Object.assign(s, uiToPreferences(DEFAULT_SERVER_CONFIG.ui));
        }),
    })),
    {
      name: 'app-settings',
      version: 1,
    },
  ),
);
