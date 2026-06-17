import type { TableProColumnsType } from '@/components/TablePro';

export const getDepartmentColumns =
  (): TableProColumnsType<API.DepartmentResponseDto> => {
    return [
      {
        title: '部门名称',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        advancedSearch: {
          type: 'INPUT',
        },
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
