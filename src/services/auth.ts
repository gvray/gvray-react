import { request } from '@gvray/request';

/** 用户登录 */
export function login(data: API.LoginDto) {
  return request<
    API.Response<{
      access_token: string;
      refresh_token: string;
      access_token_expires_in: number;
      refresh_token_expires_in: number;
    }>
  >('/auth/login', {
    method: 'POST',
    data,
    skipAuth: true,
  });
}

/** 退出登录 */
export function logout() {
  return request<API.Response<void>>('/auth/logout', {
    method: 'POST',
  });
}

/** 获取当前用户菜单树 */
export function queryMenus() {
  return request<API.Response<API.MenuResponseDto[]>>('/auth/menus', {
    method: 'GET',
  });
}

/** 刷新访问令牌 */
export function refreshToken(data: API.RefreshTokenDto) {
  return request<
    API.Response<{
      access_token: string;
      refresh_token: string;
      access_token_expires_in: number;
      refresh_token_expires_in: number;
    }>
  >('/auth/refresh', {
    method: 'POST',
    data,
    skipAuth: true,
  });
}
