import AppWatermark from '@/components/AppWatermark';
import ErrorBoundary from '@/components/ErrorBoundary';
import NavigationProgress from '@/components/NavigationProgress';
import { RouteMetaProvider } from '@/contexts/routeMeta';
import { useAppTheme, useRouteMeta } from '@/hooks';
import useThemeColor from '@/hooks/useThemeColor';
import useThemeMode from '@/hooks/useThemeMode';
import { useSettingStore } from '@/stores';
import { runtimeConfig } from '@/utils/runtime-config';
import { App, ConfigProvider, Layout } from 'antd';
import classNames from 'classnames';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Outlet, styled } from 'umi';
import AppFooter from './components/AppFooter';
import AppHeader from './components/AppHeader';
import AppViewport from './components/AppViewport';
import SideNav from './components/SideNav';
import ThemeTokenInjector from './components/ThemeTokenInjector';

const AppLayout = styled(Layout)`
  height: 100%;
`;

export default function BaseLayout() {
  const { system } = runtimeConfig.get();
  const {
    colorPrimary,
    collapsed,
    sidebarTheme,
    showLogo,
    fixedHeader,
    showFooter,
    colorWeak,
  } = useSettingStore();
  const grayMode = runtimeConfig.get().ui.grayMode;
  const themeColor = useThemeColor();
  const meta = useRouteMeta();
  const routeTitle = meta.title ?? '';
  const { themeAlgorithm } = useAppTheme();
  const effectiveThemeMode = useThemeMode();

  // 暗色模式下强制 sidebar dark，浅色模式下尊重用户偏好
  const effectiveSiderTheme =
    effectiveThemeMode === 'dark' ? 'dark' : sidebarTheme;

  const documentTitle = routeTitle
    ? `${routeTitle} - ${system.name}`
    : system.name;

  const layoutClassName = classNames({
    'color-weak': colorWeak,
    'gray-mode': grayMode,
  });

  return (
    <RouteMetaProvider meta={meta}>
      <HelmetProvider>
        <Helmet>
          <title>{documentTitle}</title>
        </Helmet>
        <ConfigProvider
          theme={{
            algorithm: themeAlgorithm,
            token: { colorPrimary },
            components: {
              Menu: {
                darkItemSelectedBg: colorPrimary,
              },
            },
          }}
        >
          <App>
            <ThemeTokenInjector>
              <AppLayout className={layoutClassName}>
                <SideNav
                  collapsed={collapsed}
                  theme={effectiveSiderTheme}
                  width={220}
                  collapsedWidth={64}
                  showLogo={showLogo}
                />
                <AppViewport>
                  <NavigationProgress />
                  <AppHeader
                    themeColor={themeColor}
                    headerFixed={fixedHeader}
                  />

                  <ErrorBoundary>
                    <Outlet />
                  </ErrorBoundary>
                  <AppFooter visible={showFooter} text={system.footerText} />
                  <AppWatermark />
                </AppViewport>
              </AppLayout>
            </ThemeTokenInjector>
          </App>
        </ConfigProvider>
      </HelmetProvider>
    </RouteMetaProvider>
  );
}
