import { useSettingStore } from '@/stores';
import {
  getPrefersColorScheme,
  onPrefersColorSchemeChange,
} from '@gvray/domkit';
import { theme as antdTheme } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const useAppTheme = () => {
  const { theme } = useSettingStore();
  const [systemTheme, setSystemTheme] = useState(getPrefersColorScheme);
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
    if (theme !== 'system') return;
    setSystemTheme(getPrefersColorScheme());
    return onPrefersColorSchemeChange(setSystemTheme);
  }, [theme]);

  return { themeAlgorithm };
};

export default useAppTheme;
