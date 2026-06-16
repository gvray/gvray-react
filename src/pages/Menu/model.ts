import {
  deleteMenu,
  getMenuById,
  queryMenuParentList,
  queryMenuTree,
} from '@/services/menu';
import { logger } from '@/utils';
import { useCallback, useEffect, useState } from 'react';

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

export const useUpdataFormModel = (open: boolean) => {
  const [data, setData] = useState<API.MenuTreeNodeDto[]>([]);
  const fetchMenuTree = async () => {
    try {
      const res = await queryMenuParentList();
      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      logger.error(error);
    }
  };
  useEffect(() => {
    if (open) {
      fetchMenuTree();
    }
  }, [open]);
  return {
    data,
    reload: fetchMenuTree,
  };
};
