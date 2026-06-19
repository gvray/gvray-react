import { request } from '@gvray/request';

/** 获取部门列表 */
export function queryDepartmentList(params?: API.DepartmentsFindAllParams) {
  return request<
    API.Response<API.PaginatedResponse<API.DepartmentResponseDto>>
  >('/system/departments', {
    method: 'GET',
    params,
  });
}

/** 获取部门详情 */
export function getDepartmentById(departmentId: string) {
  return request<API.Response<API.DepartmentResponseDto>>(
    `/system/departments/${departmentId}`,
    {
      method: 'GET',
    },
  );
}

/** 创建部门 */
export function createDepartment(data: API.CreateDepartmentDto) {
  return request<API.Response<API.DepartmentResponseDto>>(
    '/system/departments',
    {
      method: 'POST',
      data,
    },
  );
}

/** 更新部门 */
export function updateDepartment(
  departmentId: string,
  data: API.UpdateDepartmentDto,
) {
  return request<API.Response<API.DepartmentResponseDto>>(
    `/system/departments/${departmentId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

/** 删除部门 */
export function deleteDepartment(departmentId: string) {
  return request<API.Response<void>>(`/system/departments/${departmentId}`, {
    method: 'DELETE',
  });
}

/** 批量删除部门 */
export function batchDeleteDepartments(data: API.BatchDeleteDepartmentsDto) {
  return request<API.Response<void>>('/system/departments/batch-delete', {
    method: 'POST',
    data,
  });
}

/** 获取部门树结构 */
export function queryDepartmentTree(params?: API.DepartmentsGetTreeParams) {
  return request<API.Response<API.DepartmentResponseDto[]>>(
    '/system/departments/tree',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取部门选项列表（用于上级部门选择） */
export function queryDepartmentOptions() {
  return request<API.Response<API.DepartmentResponseDto[]>>(
    '/system/departments/options',
    {
      method: 'GET',
      skipErrorHandler: true,
    },
  );
}
