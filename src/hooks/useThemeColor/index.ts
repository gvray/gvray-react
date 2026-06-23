import { useMemo } from 'react';
import useThemeMode from '../useThemeMode';

export interface ThemeColor {
  textColor: string;
  bgColor: string;
  hoverColor: string;
  bgGradient: string;
  bgContainerColor: string;
}

const useThemeColor = (): ThemeColor => {
  const theme = useThemeMode();

  const themeColor = useMemo<ThemeColor>(() => {
    if (theme === 'dark') {
      return {
        textColor: '#ffffff',
        bgColor: '#000',
        bgContainerColor: '#141414',
        hoverColor: '#242424',
        bgGradient: 'linear-gradient(135deg, #1f1f1f 0%, #141414 100%)',
      };
    }

    return {
      textColor: '#000000',
      bgColor: '#ffffff',
      bgContainerColor: '#f2f2f2',
      hoverColor: '#e6e6e6',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };
  }, [theme]);

  return themeColor;
};

export default useThemeColor;
