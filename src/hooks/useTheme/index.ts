import { useSettingStore } from '@/stores';
import { startSystemThemeWatcher, stopSystemThemeWatcher } from '@/utils/theme';
import { theme as antdTheme } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const useAppTheme = () => {
  const { theme } = useSettingStore();
  const [systemTheme, setSystemTheme] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });
  const themeAlgorithm = useMemo(() => {
    if (theme === 'dark') {
      return antdTheme.darkAlgorithm;
    } else if (theme === 'system') {
      if (systemTheme === 'dark') {
        return antdTheme.darkAlgorithm;
      }
    }
    return antdTheme.defaultAlgorithm;
  }, [theme, systemTheme]);

  useEffect(() => {
    if (theme === 'system') {
      startSystemThemeWatcher(setSystemTheme);
    }
    return () => {
      stopSystemThemeWatcher();
    };
  }, [theme]);

  return { themeAlgorithm };
};

export default useAppTheme;
