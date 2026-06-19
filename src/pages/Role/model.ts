import { queryPermissionFlat } from '@/services/permission';
import { deleteRole, getRoleById, queryRoleList } from '@/services/role';
import { logger } from '@/utils';
import { useCallback, useEffect, useState } from 'react';

export const useUpdataFormModel = (open: boolean) => {
  const [data, setData] = useState<API.PermissionResponseDto[]>([]);
  const fetchPermissionTree = async () => {
    try {
      const res = await queryPermissionFlat();
      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      logger.error(error);
    }
  };
  useEffect(() => {
    if (open) {
      fetchPermissionTree();
    }
  }, [open]);
  return {
    data,
    fetchPermissions: fetchPermissionTree,
  };
};

export const useRoleModel = () => {
  const fetchRoleList = useCallback(async (params?: API.RolesFindAllParams) => {
    return queryRoleList(params);
  }, []);
  const fetchRoleDetail = useCallback(async (roleId: string) => {
    const { data } = await getRoleById(roleId);
    return data;
  }, []);
  const removeRole = useCallback(async (roleId: string) => {
    await deleteRole(roleId);
  }, []);
  return {
    fetchRoleList,
    fetchRoleDetail,
    removeRole,
  };
};
