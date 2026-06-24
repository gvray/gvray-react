import type { TableProColumnsType } from '@/components/TablePro';

export const getConfigColumns =
  (): TableProColumnsType<API.ConfigResponseDto> => {
    return [
      {
        title: '配置名称',
        dataIndex: 'name',
        key: 'name',
        width: 240,
        advancedSearch: { type: 'INPUT' },
      },
      {
        title: '配置键',
        dataIndex: 'key',
        key: 'key',
        width: 180,
        advancedSearch: { type: 'INPUT' },
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
      },
      {
        title: '分组',
        dataIndex: 'group',
        key: 'group',
        width: 120,
        advancedSearch: {
          type: 'SELECT',
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        advancedSearch: {
          type: 'SELECT',
        },
      },
      {
        title: '前端公开',
        dataIndex: 'isPublic',
        key: 'isPublic',
        width: 100,
        advancedSearch: {
          type: 'SELECT',
        },
      },
      {
        title: '创建时间',
        key: 'createdAt',
        dataIndex: 'createdAt',
        width: 160,
      },
    ];
  };
