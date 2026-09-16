import { LOGIN_PATH } from '@/constants';
import { buildPreferences } from '@/constants/runtime-settings';
import { AppProviders } from '@/providers';
import { getRuntimeConfig } from '@/services/system';
import { useSettingStore } from '@/stores';
import { runtimeConfig } from '@/utils/runtime-config';
import React from 'react';
import { history, matchRoutes } from 'umi';
import {
  handleAuthExpired,
  loadAuthData,
  logger,
  redirectToLogin,
  tokenManager,
} from './utils';

// const isDev = process.env.NODE_ENV === 'development';

/**
 * 全局根容器：注入全局 Provider（Theme、Config、Intl、Helmet、Styled Theme 等），
 * 覆盖所有页面，包括 layout: false 的登录/注册/404 页面。
 */
export function rootContainer(container: React.ReactNode) {
  return <AppProviders>{container}</AppProviders>;
}

/**
 * 应用启动时的数据获取入口，获取完后分发到各 Store。
 * UI 层不直接消费 initialState，统一通过 Store 读取。
 *
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 */
export async function getInitialState() {
  // 等待 zustand persist 从 localStorage 恢复完成，避免 getInitialState 覆盖用户本地设置
  if (!useSettingStore.persist?.hasHydrated?.()) {
    await useSettingStore.persist?.rehydrate?.();
  }

  // 获取运行时配置（无需登录）。失败不 set，保留默认值
  try {
    const res = await getRuntimeConfig();
    runtimeConfig.set(res.data);
  } catch (error) {
    logger.error(error);
  }

  // 已登录时装载身份信息、偏好与字典（loadAuthData 内 401 清凭证保留韧性）
  if (tokenManager.isAuthenticated()) {
    await loadAuthData();

    if (tokenManager.isAuthenticated()) {
      // 凭证仍有效：若停在 login 页则跳首页
      if (history.location.pathname === LOGIN_PATH) {
        history.push('/');
      }
    } else {
      // loadAuthData 遇 401 已清凭证 → 跳登录（handleAuthExpired 内部处理 login 页/弹窗逻辑）
      handleAuthExpired();
    }
  } else {
    // 未登录：仅应用运行时配置默认偏好 + persist 恢复值
    useSettingStore.setState((state) => ({
      ...buildPreferences(runtimeConfig.get().ui),
      ...state,
    }));
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
