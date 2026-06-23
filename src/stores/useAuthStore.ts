import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface AuthStore {
  profile: API.CurrentUserResponseDto | undefined;
  menus: API.MenuResponseDto[] | undefined;

  /** 权限代码列表 */
  permissions: string[];

  setProfile: (profile: API.CurrentUserResponseDto | undefined) => void;
  setMenus: (menus: API.MenuResponseDto[] | undefined) => void;
  /** 登录后一次性设置 profile + menus */
  setAuth: (
    profile: API.CurrentUserResponseDto,
    menus: API.MenuResponseDto[] | undefined,
  ) => void;
  /** 退出登录，清空所有认证状态 */
  clearAuth: () => void;
}

export const useAuthStore = create(
  immer<AuthStore>((set) => ({
    profile: undefined,
    menus: undefined,
    permissions: [],

    setProfile: (profile) =>
      set((state) => {
        state.profile = profile;
        state.permissions = profile?.permissionCodes || [];
      }),
    setMenus: (menus) =>
      set((state) => {
        state.menus = menus;
      }),
    setAuth: (profile, menus) =>
      set((state) => {
        state.profile = profile;
        state.menus = menus;
        state.permissions = profile?.permissionCodes || [];
      }),
    clearAuth: () =>
      set((state) => {
        state.profile = undefined;
        state.menus = undefined;
        state.permissions = [];
      }),
  })),
);
