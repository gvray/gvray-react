import type { TableProColumnsType } from '@/components/TablePro';

export const getRoleColumns = (): TableProColumnsType<API.RoleResponseDto> => {
  return [
    {
      title: '角色编号',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 120,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      advancedSearch: { type: 'INPUT' },
      width: 180,
    },
    {
      title: '角色标识',
      dataIndex: 'roleKey',
      key: 'roleKey',
      advancedSearch: { type: 'INPUT' },
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      advancedSearch: {
        type: 'SELECT',
      },
      width: 120,
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
