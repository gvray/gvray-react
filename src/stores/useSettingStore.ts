import {
  DEFAULT_RUNTIME_CONFIG,
  type SiderTheme,
  type UserSettings,
  buildPreferences,
} from '@/constants/runtime-settings';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ─── Store ──────────────────────────────────────────────────────

interface SettingActions {
  /** 增量 patch（用户手动修改） */
  patchSettings: (patch: Partial<UserSettings>) => void;

  setTheme: (mode: UserSettings['theme']) => void;
  setColorPrimary: (color: UserSettings['colorPrimary']) => void;
  setLanguage: (lang: string) => void;
  setPageSize: (size: number) => void;
  setShowBreadcrumb: (show: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarTheme: (theme: SiderTheme) => void;
  setShowLogo: (show: boolean) => void;
  setFixedHeader: (fixed: boolean) => void;
  setShowFooter: (show: boolean) => void;
  setColorWeak: (enabled: boolean) => void;
  setUniqueOpened: (enabled: boolean) => void;
  setEnableNotification: (enabled: boolean) => void;
  toggleSidebarCollapsed: () => void;

  /** 清空用户修改，回退到传入的默认值 */
  reset: () => void;
}

export const useSettingStore = create<UserSettings & SettingActions>()(
  persist(
    immer((set) => ({
      ...buildPreferences(DEFAULT_RUNTIME_CONFIG.ui),

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

      setSidebarCollapsed: (collapsed) =>
        set((s) => {
          s.sidebarCollapsed = collapsed;
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

      setEnableNotification: (enabled) =>
        set((s) => {
          s.enableNotification = enabled;
        }),

      toggleSidebarCollapsed: () =>
        set((s) => {
          s.sidebarCollapsed = !s.sidebarCollapsed;
        }),

      reset: () =>
        set((s) => {
          Object.assign(s, buildPreferences(DEFAULT_RUNTIME_CONFIG.ui));
        }),
    })),
    {
      name: 'app-settings',
      version: 1,
    },
  ),
);
