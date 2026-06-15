import {
  normalizeVirtualRoot,
  VIRTUAL_ROOT_ID,
  withVirtualRoot as withVirtualRootGeneric,
  type VirtualRootConfig,
} from '@gvray/adminkit';

/**
 * 部门模块的虚拟根节点配置
 */
export const DEPARTMENT_VIRTUAL_ROOT_CONFIG: VirtualRootConfig = {
  idField: 'departmentId',
  idValue: VIRTUAL_ROOT_ID,
  nameField: 'name',
  nameValue: '顶级部门（无上级）',
  parentIdField: 'parentId',
};

/**
 * 为部门数据添加虚拟根节点
 */
export const withVirtualRoot = <T extends Record<string, any>>(
  data: T[],
): T[] => {
  return withVirtualRootGeneric(data, DEPARTMENT_VIRTUAL_ROOT_CONFIG);
};

/**
 * 将表单数据中的虚拟根节点转换为 null（提交到后端）
 */
export const normalizeToBackend = <T extends Record<string, any>>(
  values: T,
): T => {
  return normalizeVirtualRoot(
    values,
    VIRTUAL_ROOT_ID,
    DEPARTMENT_VIRTUAL_ROOT_CONFIG.parentIdField as string,
  );
};
