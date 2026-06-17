import type { TableProColumnsType } from '@/components/TablePro';

export const getDictionaryColumns =
  (): TableProColumnsType<API.DictionaryTypeResponseDto> => {
    return [
      {
        title: '字典编号',
        dataIndex: 'typeId',
        key: 'typeId',
        width: 100,
      },
      {
        title: '字典名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        advancedSearch: { type: 'INPUT' },
      },
      {
        title: '字典类型',
        dataIndex: 'code',
        key: 'code',
        width: 150,
        advancedSearch: { type: 'INPUT' },
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
        title: '创建时间',
        key: 'createdAt',
        dataIndex: 'createdAt',
        width: 140,
        advancedSearch: {
          type: 'DATE_RANGE',
        },
      },
    ];
  };
