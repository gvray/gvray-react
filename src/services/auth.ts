import { RuntimeControlFields, request } from '@gvray/request';

/** 用户注册 */
export function register(data: API.RegisterDto) {
  return request<
    API.Response<{
      access_token: string;
      refresh_token: string;
      access_token_expires_in: number;
      refresh_token_expires_in: number;
    }>
  >('/auth/register', {
    method: 'POST',
    data,
    skipAuth: true,
    skipErrorHandler: true, // 跳过全局错误处理，避免在注册失败时弹出错误提示
  });
}

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

/** 获取当前用户身份信息（角色、权限码、部门、岗位） */
export function queryMe(options?: RuntimeControlFields) {
  return request<API.Response<API.CurrentUserResponseDto>>('/auth/me', {
    method: 'GET',
    ...options,
  });
}

/** 获取当前用户菜单树 */
export function queryMenus(options?: RuntimeControlFields) {
  return request<API.Response<API.MenuResponseDto[]>>('/auth/menus', {
    method: 'GET',
    ...options,
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
