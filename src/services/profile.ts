import { RuntimeControlFields, request } from '@gvray/request';

/** 获取当前用户信息 */
export function queryProfile(options?: RuntimeControlFields) {
  return request<API.Response<API.CurrentUserResponseDto>>('/profile', {
    method: 'GET',
    ...options,
  });
}

/** 获取当前用户权限信息 */
export function queryProfilePermissions() {
  return request<API.Response<API.UserPermissionsResponseDto>>(
    '/profile/permissions',
    { method: 'GET' },
  );
}

/** 修改当前用户密码 */
export function changePassword(data: API.ChangePasswordDto) {
  return request<API.Response<void>>('/profile/change-password', {
    method: 'POST',
    data,
  });
}
