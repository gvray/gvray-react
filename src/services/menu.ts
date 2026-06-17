import { request } from '@gvray/request';

/** 获取菜单列表 */
export function queryMenuList(params?: API.MenuFindAllParams) {
  return request<API.Response<API.PaginatedResponse<API.MenuResponseDto>>>(
    '/system/menus',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取菜单树 */
export function queryMenuTree(params?: API.MenuGetTreeParams) {
  return request<API.Response<API.MenuTreeNodeDto[]>>('/system/menus/tree', {
    method: 'GET',
    params,
  });
}

/** 获取菜单选项列表（用于上级菜单选择） */
export function queryMenuOptions() {
  return request<API.Response<API.MenuTreeNodeDto[]>>('/system/menus/options', {
    method: 'GET',
  });
}

/** 获取菜单详情 */
export function getMenuById(menuId: string) {
  return request<API.Response<API.MenuResponseDto>>(`/system/menus/${menuId}`, {
    method: 'GET',
  });
}

/** 创建菜单 */
export function createMenu(data: API.CreateMenuDto) {
  return request<API.Response<API.MenuResponseDto>>('/system/menus', {
    method: 'POST',
    data,
  });
}

/** 更新菜单 */
export function updateMenu(menuId: string, data: API.UpdateMenuDto) {
  return request<API.Response<API.MenuResponseDto>>(`/system/menus/${menuId}`, {
    method: 'PATCH',
    data,
  });
}

/** 删除菜单 */
export function deleteMenu(menuId: string) {
  return request<API.Response<void>>(`/system/menus/${menuId}`, {
    method: 'DELETE',
  });
}
