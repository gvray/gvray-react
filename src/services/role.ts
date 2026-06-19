import { request } from '@gvray/request';

/** 获取角色列表 */
export function queryRoleList(params?: API.RolesFindAllParams) {
  return request<API.Response<API.PaginatedResponse<API.RoleResponseDto>>>(
    '/system/roles',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取角色详情 */
export function getRoleById(roleId: string) {
  return request<API.Response<API.RoleResponseDto>>(`/system/roles/${roleId}`, {
    method: 'GET',
  });
}

/** 创建角色 */
export function createRole(data: API.CreateRoleDto) {
  return request<API.Response<API.RoleResponseDto>>('/system/roles', {
    method: 'POST',
    data,
  });
}

/** 更新角色 */
export function updateRole(data: API.UpdateRoleDto & { roleId: string }) {
  const { roleId, ...rest } = data;
  return request<API.Response<API.RoleResponseDto>>(`/system/roles/${roleId}`, {
    method: 'PATCH',
    data: rest,
  });
}

/** 删除角色 */
export function deleteRole(roleId: string) {
  return request<API.Response<void>>(`/system/roles/${roleId}`, {
    method: 'DELETE',
  });
}

/** 批量删除角色 */
export function batchDeleteRoles(data: API.BatchDeleteRolesDto) {
  return request<API.Response<void>>('/system/roles/batch-delete', {
    method: 'POST',
    data,
  });
}

/** 更新角色状态 */
export function updateRoleStatus(roleId: string, status: number) {
  return request<API.Response<API.RoleResponseDto>>(
    `/system/roles/${roleId}/status`,
    {
      method: 'PATCH',
      data: { status },
    },
  );
}

/** 分配角色权限 */
export function assignRolePermissions(
  roleId: string,
  data: API.AssignPermissionsDto,
) {
  return request<API.Response<API.RoleResponseDto>>(
    `/system/roles/${roleId}/permissions`,
    {
      method: 'PUT',
      data,
    },
  );
}

/** 获取角色权限列表 */
export function getRolePermissionsById(roleId: string) {
  return request<API.Response<API.RolePermissionResponseDto[]>>(
    `/system/roles/${roleId}/permissions`,
    {
      method: 'GET',
    },
  );
}

/** 获取角色下的用户列表 */
export function getRoleUsersById(roleId: string) {
  return request<API.Response<API.RoleUserResponseDto[]>>(
    `/system/roles/${roleId}/users`,
    {
      method: 'GET',
    },
  );
}

/** 为角色分配用户 */
export function assignRoleUsers(roleId: string, data: API.AssignUsersDto) {
  return request<API.Response<API.RoleResponseDto>>(
    `/system/roles/${roleId}/users`,
    {
      method: 'PUT',
      data,
    },
  );
}

/** 获取角色数据权限 */
export function getRoleDataScopesById(roleId: string) {
  return request<API.Response<API.AssignDataScopeDto>>(
    `/system/roles/${roleId}/data-scope`,
    {
      method: 'GET',
    },
  );
}

/** 分配角色数据权限 */
export function assignRoleDataScopes(
  roleId: string,
  data: API.AssignDataScopeDto,
) {
  return request<API.Response<API.RoleResponseDto>>(
    `/system/roles/${roleId}/data-scope`,
    {
      method: 'PUT',
      data,
    },
  );
}

/** 获取角色选项列表 */
export function queryRoleOptions() {
  return request<API.Response<API.RoleResponseDto[]>>('/system/roles/options', {
    method: 'GET',
    skipErrorHandler: true,
  });
}
