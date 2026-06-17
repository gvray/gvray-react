import type { TableProColumnsType } from '@/components/TablePro';

export const getMenuColumns = (): TableProColumnsType<API.MenuTreeNodeDto> => {
  return [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      advancedSearch: {
        type: 'INPUT',
      },
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      advancedSearch: {
        type: 'SELECT',
      },
      width: 100,
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      advancedSearch: {
        type: 'INPUT',
      },
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      advancedSearch: {
        type: 'SELECT',
      },
      width: 100,
    },
    {
      title: '是否隐藏',
      dataIndex: 'hidden',
      key: 'hidden',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      advancedSearch: {
        type: 'DATE_RANGE',
      },
    },
  ];
};
