import AppWatermark from '@/components/AppWatermark';
import ErrorBoundary from '@/components/ErrorBoundary';
import NavigationProgress from '@/components/NavigationProgress';
import { RouteMetaProvider } from '@/contexts/routeMeta';
import { useAppTheme, useRouteMeta } from '@/hooks';
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
    sidebarCollapsed,
    sidebarTheme,
    showLogo,
    fixedHeader,
    showFooter,
    colorWeak,
  } = useSettingStore();
  const grayMode = runtimeConfig.get().ui.grayMode;
  const meta = useRouteMeta();
  const routeTitle = meta.title ?? '';
  const { themeAlgorithm } = useAppTheme();

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
            token: { colorPrimary, colorInfo: colorPrimary },
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
                  collapsed={sidebarCollapsed}
                  sidebarTheme={sidebarTheme}
                  showLogo={showLogo}
                />
                <AppViewport>
                  <NavigationProgress />
                  <AppHeader headerFixed={fixedHeader} />

                  <ErrorBoundary>
                    <Outlet />
                  </ErrorBoundary>
                  <AppFooter
                    visible={showFooter}
                    text={system.footerText}
                    copyright={system.copyright}
                    icp={system.icp}
                  />
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
