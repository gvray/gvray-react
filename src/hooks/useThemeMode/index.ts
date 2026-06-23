import { useSettingStore } from '@/stores';
import { useMemo } from 'react';

const useThemeMode = () => {
  const { theme } = useSettingStore();
  const mode = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }, [theme]);
  return mode;
};

export default useThemeMode;
