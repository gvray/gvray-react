import {
  deleteDepartment,
  getDepartmentById,
  queryDepartmentTree,
} from '@/services/department';
import { useCallback } from 'react';

export const useDepartmentModel = () => {
  const fetchDepartmentTree = useCallback(
    async (params?: API.DepartmentsGetTreeParams) => {
      return queryDepartmentTree(params);
    },
    [],
  );
  const fetchDepartmentDetail = useCallback(async (departmentId: string) => {
    const { data } = await getDepartmentById(departmentId);
    return data;
  }, []);
  const removeDepartment = useCallback(async (departmentId: string) => {
    await deleteDepartment(departmentId);
  }, []);

  return {
    fetchDepartmentDetail,
    removeDepartment,
    fetchDepartmentTree,
  };
};
