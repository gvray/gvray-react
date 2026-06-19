import {
  deleteDepartment,
  getDepartmentById,
  queryDepartmentList,
  queryDepartmentTree,
} from '@/services/department';
import { logger } from '@/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { withVirtualRoot } from './util';

export const useDepartmentModel = () => {
  const paramsRef = useRef<Record<string, unknown>>({});
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
    paramsRef,
    fetchDepartmentDetail,
    removeDepartment,
    fetchDepartmentTree,
  };
};

export const useUpdataFormModel = (open: boolean) => {
  const [data, setData] = useState<API.DepartmentResponseDto[]>([]);
  const fetchDepartmentList = async () => {
    try {
      const res = await queryDepartmentList();
      if (res.data?.items?.length) {
        setData(withVirtualRoot(res.data.items));
      }
    } catch (error) {
      logger.error(error);
    }
  };
  useEffect(() => {
    if (open) {
      fetchDepartmentList();
    }
  }, [open]);
  return {
    data,
    fetchDepartments: fetchDepartmentList,
  };
};
