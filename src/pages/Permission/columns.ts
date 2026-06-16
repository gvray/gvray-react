import type { TableProColumnsType } from '@/components/TablePro';
import type { PermissionTreeNode } from './model';

export const getPermissionColumns =
  (): TableProColumnsType<PermissionTreeNode> => {
    return [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 200,
      },
      {
        title: '权限代码',
        dataIndex: 'code',
        key: 'code',
        width: 280,
      },
      {
        title: '动作',
        dataIndex: 'action',
        key: 'action',
        width: 120,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        width: 240,
      },
      {
        title: '来源',
        dataIndex: 'origin',
        key: 'origin',
        width: 100,
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 160,
      },
    ];
  };
