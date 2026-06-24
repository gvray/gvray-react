export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeModeWithoutSystem = Exclude<ThemeMode, 'system'>;

export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  light: '亮色',
  dark: '暗黑',
  system: '跟随系统',
};

export type ColorPrimary =
  | '#1677ff'
  | '#1890ff'
  | '#f5222d'
  | '#fa541c'
  | '#faad14'
  | '#a0d911'
  | '#52c41a'
  | '#13c2c2'
  | '#2f54eb'
  | '#722ed1'
  | '#eb2f96';

export const PRIMARY_COLOR_LABELS: Record<ColorPrimary, string> = {
  '#1677ff': '拂晓蓝',
  '#1890ff': '极客蓝',
  '#f5222d': '薄暮',
  '#fa541c': '火山',
  '#faad14': '日暮',
  '#a0d911': '明青',
  '#52c41a': '极光绿',
  '#13c2c2': '海蓝',
  '#2f54eb': '极客蓝',
  '#722ed1': '酱紫',
  '#eb2f96': '酱紫',
};
