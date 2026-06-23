import { PrimaryColor, ThemeMode } from '@/constants';

export type SiderTheme = 'light' | 'dark';

export interface Preferences {
  theme: ThemeMode;
  colorPrimary: PrimaryColor;
  language: string;
  pageSize: number;
  showBreadcrumb: boolean;
  collapsed: boolean;
  sidebarTheme: SiderTheme;
  showLogo: boolean;
  fixedHeader: boolean;
  showFooter: boolean;
  colorWeak: boolean;
  uniqueOpened: boolean;
  timezone: string;
  enableNotification: boolean;
}
