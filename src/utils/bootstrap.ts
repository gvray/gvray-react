import { buildPreferences } from '@/constants/runtime-settings';
import { queryMe, queryMenus } from '@/services/auth';
import { getDictionaryItemsByTypeCodes } from '@/services/dictionary';
import { useAuthStore, useDictStore, useSettingStore } from '@/stores';
import { wrapToBizError } from '@/utils/errors';
import logger from '@/utils/logger';
import { runtimeConfig } from '@/utils/runtime-config';
import { tokenManager } from '@/utils/token';

/**
 * 装载登录态数据：身份信息、菜单、用户偏好、常用字典。
 * getInitialState（已登录刷新）与登录成功后共用，避免逻辑重复。
 *
 * @returns profile 是否装载成功。getInitialState 据此决定跳转；
 *   登录流程据此决定是否提示失败，避免"登录成功"却因 profile 缺失被守卫弹回。
 *   401 时清凭证保留韧性（网络抖动不清），由调用方决定后续跳转。
 */
export async function loadAuthData(): Promise<boolean> {
  let me: API.CurrentUserResponseDto | undefined;
  let menus: API.MenuResponseDto[] | undefined;

  try {
    const [meRes, menusRes] = await Promise.all([
      queryMe({ skipErrorHandler: true }),
      queryMenus({ skipErrorHandler: true }),
    ]);
    me = meRes.data;
    menus = menusRes.data;
  } catch (error) {
    const bizError = wrapToBizError(error);
    // 只有真正的未授权/凭证过期才清凭证；
    // 网络抖动或服务端异常保留原凭证，避免误踢用户
    if (bizError.details?.status === 401) {
      tokenManager.clearTokens();
    } else {
      logger.error('获取初始化用户信息失败', error);
    }
  }

  // preferences：运行时默认值 → persist 恢复值 → 服务端用户偏好（优先级最高）
  useSettingStore.setState((state) => ({
    ...buildPreferences(runtimeConfig.get().ui),
    ...state,
    ...(me?.preferences || {}),
  }));

  if (me) {
    useAuthStore.getState().setAuth(me, menus);
  }

  // 预加载常用字典到全局缓存（失败不阻塞登录态判定，profile 在即视为成功）
  if (tokenManager.isAuthenticated()) {
    try {
      if (!useDictStore.getState().getDict('common_status')) {
        const dictRes = await getDictionaryItemsByTypeCodes(
          {
            typeCodes: 'common_status',
          },
          { skipErrorHandler: true },
        );
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

  return !!me;
}
