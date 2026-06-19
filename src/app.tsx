import { LOGIN_PATH } from '@/constants';
import { resolveServerConfig } from '@/constants/settings';
import { queryMenus } from '@/services/auth';
import { getRuntimeConfig } from '@/services/config';
import { getDictionaryItemsByTypeCodes } from '@/services/dictionary';
import { queryProfile } from '@/services/profile';
import { useAppStore, useAuthStore, useDictStore } from '@/stores';
import { history, matchRoutes } from 'umi';
import { logger, redirectToLogin, tokenManager } from './utils';

// const isDev = process.env.NODE_ENV === 'development';

/**
 * 应用启动时的数据获取入口，获取完后分发到各 Store。
 * UI 层不直接消费 initialState，统一通过 Store 读取。
 *
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 */
export async function getInitialState() {
  let runtimeConfig: Record<string, unknown> | undefined;
  let profile: API.CurrentUserResponseDto | undefined;
  let menus: API.MenuResponseDto[] | undefined;

  // 获取运行时配置（无需登录）
  try {
    const res = await getRuntimeConfig();
    runtimeConfig = res.data;
  } catch (error) {
    logger.error(error);
  }

  // 已登录时并行获取用户信息和菜单
  if (tokenManager.isAuthenticated()) {
    try {
      const [profileRes, menusRes] = await Promise.all([
        queryProfile({ skipErrorHandler: true }),
        queryMenus(),
      ]);
      profile = profileRes.data;
      menus = menusRes.data;
      // 在login页面刷新 这里应该跳转到首页
      if (history.location.pathname === LOGIN_PATH) {
        history.push('/');
      }
    } catch (error) {
      tokenManager.clearTokens();
      redirectToLogin();
    }
  }

  // 服务端配置 → AppStore
  useAppStore.getState().setServerConfig(resolveServerConfig(runtimeConfig));

  // 认证数据 → 分发到 AuthStore
  if (profile) {
    useAuthStore.getState().setAuth(profile, menus);
  }

  // 已登录时预加载常用字典到全局缓存
  if (tokenManager.isAuthenticated()) {
    try {
      if (!useDictStore.getState().getDict('common_status')) {
        const dictRes = await getDictionaryItemsByTypeCodes({
          typeCodes: 'common_status',
        });
        if (dictRes.data?.common_status) {
          useDictStore
            .getState()
            .setDict('common_status', dictRes.data.common_status);
        }
      }
    } catch (error) {
      logger.error('预加载 common_status 字典失败', error);
    }
  }

  logger.info('App 初始化完成');
  return {};
}

/**
 * 路由切换时检查登录状态
 * 如果未登录且不在登录页，则重定向到登录页
 */
export function onRouteChange({
  clientRoutes,
  location,
}: {
  clientRoutes: any[];
  location: Location;
}) {
  const route = matchRoutes(clientRoutes, location.pathname)?.pop()
    ?.route as any;

  // 检查路由是否需要认证
  const authRequired = route?.meta?.auth ?? true; // 默认为true，即需要认证

  if (authRequired) {
    if (!tokenManager.isAuthenticated()) {
      redirectToLogin();
      return;
    }
  }
}
