import { RuntimeControlFields, request } from '@gvray/request';

/** 获取当前用户个人资料（昵称、头像、联系方式） */
export function queryProfile(options?: RuntimeControlFields) {
  return request<API.Response<API.ProfileResponseDto>>('/profile', {
    method: 'GET',
    ...options,
  });
}

/** 更新当前用户个人资料 */
export function updateProfile(data: API.UpdateProfileDto) {
  return request<API.Response<API.ProfileResponseDto>>('/profile', {
    method: 'PATCH',
    data,
  });
}

/** 获取当前用户权限信息 */
export function queryProfilePermissions() {
  return request<API.Response<API.UserPermissionsResponseDto>>(
    '/profile/permissions',
    { method: 'GET' },
  );
}

/** 获取当前用户偏好设置 */
export function queryProfileSettings() {
  return request<API.Response<Record<string, unknown>>>('/profile/settings', {
    method: 'GET',
  });
}

/** 更新当前用户偏好设置（扁平 schema） */
export function updateProfileSettings(data: Record<string, unknown>) {
  return request<API.Response<Record<string, unknown>>>('/profile/settings', {
    method: 'PATCH',
    data,
  });
}

/** 获取当前用户登录日志 */
export function queryProfileLoginLogs(params?: API.LoginLogsFindAllParams) {
  return request<API.Response<API.PaginatedResponse<API.LoginLogResponseDto>>>(
    '/profile/login-logs',
    {
      method: 'GET',
      params,
    },
  );
}

/** 修改当前用户密码 */
export function changePassword(data: API.ChangePasswordDto) {
  return request<API.Response<void>>('/profile/change-password', {
    method: 'POST',
    data,
  });
}
