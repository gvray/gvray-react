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
        width: 240,
        ellipsis: { showTitle: false },
      },
      {
        title: '权限代码',
        dataIndex: 'code',
        key: 'code',
        width: 150,
        ellipsis: { showTitle: false },
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: { showTitle: false },
      },
      {
        title: '来源',
        dataIndex: 'origin',
        key: 'origin',
        width: 90,
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 100,
      },
    ];
  };
