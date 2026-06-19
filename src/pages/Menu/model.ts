import { deleteMenu, getMenuById, queryMenuTree } from '@/services/menu';
import { useCallback } from 'react';

export const useMenuModel = () => {
  const fetchMenuTree = useCallback(async (params?: API.MenuGetTreeParams) => {
    return queryMenuTree(params);
  }, []);
  const fetchMenuDetail = useCallback(async (menuId: string) => {
    const { data } = await getMenuById(menuId);
    return data;
  }, []);
  const removeMenu = useCallback(async (menuId: string) => {
    await deleteMenu(menuId);
  }, []);

  return {
    fetchMenuTree,
    fetchMenuDetail,
    removeMenu,
  };
};
