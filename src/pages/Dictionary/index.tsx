import {
  AuthButton,
  DateTimeFormat,
  PageContainer,
  StatusTag,
  TablePro,
} from '@/components';
import { TableProRef } from '@/components/TablePro';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import type { DictOption } from '@/types/dict';
import { callRef, logger } from '@/utils';
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Modal, Space, Tag, Typography } from 'antd';
import { useRef } from 'react';
import { useNavigate } from 'umi';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getDictionaryColumns } from './columns';
import { useDictionary } from './model';

const { Text, Paragraph } = Typography;

type DictionaryDict = {
  dictionary_status: DictOption[];
};

const DictionaryPage = () => {
  const navigate = useNavigate();
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const {
    fetchDictionaryTypeList,
    fetchDictionaryTypeDetail,
    removeDictionaryType,
  } = useDictionary();

  const dict = useDict<DictionaryDict>(['dictionary_status']);
  const { message } = useFeedback();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = async () => {
    callRef(updateFormRef, (t) => t.show('添加字典类型'));
  };

  const handleDelete = async (record: API.DictionaryTypeResponseDto) => {
    Modal.confirm({
      title: `删除确认`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            确定要删除字典类型 <strong>&quot;{record.name}&quot;</strong> 吗？
          </p>
          <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '8px' }}>
            删除后将无法恢复，且会同时删除该类型下的所有字典项！
          </p>
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      async onOk() {
        try {
          await removeDictionaryType(record.typeId);
          tableReload();
          message.success(`字典类型"${record.name}"删除成功`);
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = async (record: API.DictionaryTypeResponseDto) => {
    const typeId = record.typeId;
    try {
      const msg: any = await fetchDictionaryTypeDetail(typeId);
      callRef(updateFormRef, (t) => t.show('修改字典类型', { ...msg }));
    } catch (error) {
      logger.error(error);
    }
  };

  const handleManageItems = (record: API.DictionaryTypeResponseDto) => {
    navigate(`/system/dictionary/items/${record.typeId}`);
  };

  const handleOk = () => {
    tableReload();
  };

  let columns = getDictionaryColumns().map((column: any) => {
    if (column.dataIndex === 'typeId') {
      return {
        ...column,
        render: (typeId: string) => (
          <Paragraph ellipsis copyable style={{ width: '80px' }}>
            {typeId}
          </Paragraph>
        ),
      };
    }
    if (column.dataIndex === 'name') {
      return {
        ...column,
        render: (name: string, record: API.DictionaryTypeResponseDto) => (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <BookOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
              <Text strong>{name}</Text>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.description || '暂无描述'}
            </div>
          </div>
        ),
      };
    }
    if (column.dataIndex === 'code') {
      return {
        ...column,
        render: (code: string) => (
          <Tag color="blue" style={{ fontFamily: 'monospace' }}>
            {code}
          </Tag>
        ),
      };
    }
    if (column.dataIndex === 'sort') {
      return {
        ...column,
        render: (sort: number) => (
          <Tag color={sort === 0 ? 'default' : 'green'}>{sort}</Tag>
        ),
      };
    }
    if (column.dataIndex === 'status') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict.dictionary_status,
        },
        render: (status: string | number) => (
          <StatusTag value={status} options={dict.dictionary_status} />
        ),
      };
    }
    if (column.dataIndex === 'createdAt') {
      return {
        ...column,
        render: (time: string) => <DateTimeFormat value={time} />,
      };
    }
    return column;
  }) as any;
  columns = [
    ...columns,
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (record: API.DictionaryTypeResponseDto) => {
        return (
          <Space size="small">
            <AuthButton
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.DICTIONARY_UPDATE]}
            >
              编辑
            </AuthButton>
            <AuthButton
              type="link"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleManageItems(record)}
              perms={[PERM.DICTIONARY_UPDATE]}
            >
              管理字典项
            </AuthButton>
            <AuthButton
              danger
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              perms={[PERM.DICTIONARY_DELETE]}
            >
              删除
            </AuthButton>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <TablePro
        rowKey={'typeId'}
        ref={tableProRef}
        columns={columns as any}
        request={fetchDictionaryTypeList}
        scroll={{ x: 1200 }}
        toolbarRender={() => {
          return (
            <AuthButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              perms={[PERM.DICTIONARY_CREATE]}
            >
              新增字典类型
            </AuthButton>
          );
        }}
      />
      {/* 字典类型新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
    </PageContainer>
  );
};

export default DictionaryPage;
