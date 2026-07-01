import { request } from '@gvray/request';

/** 获取用户列表 */
export function queryUserList(params?: API.UsersFindAllParams) {
  return request<API.Response<API.PaginatedResponse<API.UserResponseDto>>>(
    '/system/users',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取用户详情 */
export function getUserById(userId: string) {
  return request<API.Response<API.UserResponseDto>>(`/system/users/${userId}`, {
    method: 'GET',
  });
}

/** 创建用户 */
export function createUser(data: API.CreateUserDto) {
  return request<API.Response<API.UserResponseDto>>('/system/users', {
    method: 'POST',
    data,
  });
}

/** 更新用户 */
export function updateUser(data: API.UpdateUserDto & { userId: string }) {
  const { userId, ...rest } = data;
  return request<API.Response<API.UserResponseDto>>(`/system/users/${userId}`, {
    method: 'PATCH',
    data: rest,
  });
}

/** 删除用户 */
export function deleteUser(userId: string) {
  return request<API.Response<void>>(`/system/users/${userId}`, {
    method: 'DELETE',
  });
}

/** 批量删除用户 */
export function batchDeleteUsers(data: API.BatchDeleteUsersDto) {
  return request<API.Response<void>>('/system/users/batch-delete', {
    method: 'POST',
    data,
  });
}

/** 重置用户密码 */
export function resetUserPassword(userId: string, data: API.ResetPasswordDto) {
  return request<API.Response<void>>(`/system/users/${userId}/reset-password`, {
    method: 'POST',
    data,
  });
}

/** 为用户分配角色 */
export function assignUserRoles(userId: string, data: API.AssignRolesDto) {
  return request<API.Response<API.UserResponseDto>>(
    `/system/users/${userId}/roles`,
    {
      method: 'PUT',
      data,
    },
  );
}
