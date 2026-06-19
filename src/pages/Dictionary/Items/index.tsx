import {
  AuthButton,
  CopyId,
  DateTimeFormat,
  PageContainer,
  StatusTag,
  TablePro,
} from '@/components';
import { TableProRef } from '@/components/TablePro';
import { useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import type { DictOption } from '@/types/dict';
import { callRef, logger } from '@/utils';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Modal, Space, Tag, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import { useParams } from 'umi';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getDictionaryItemColumns } from './columns';
import './index.less';
import { useDictionaryItems } from './model';

const { Text } = Typography;

type DictionaryDict = {
  common_status: DictOption[];
};

const DictionaryItemsPage = () => {
  const { typeId } = useParams();
  const {
    typeDetail,
    fetchDictionaryTypeDetail,
    fetchDictionaryItemList,
    removeDictionaryItem,
  } = useDictionaryItems();
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);

  const dict = useDict<DictionaryDict>(['common_status']);
  const { message } = useFeedback();

  useEffect(() => {
    if (typeId) {
      fetchDictionaryTypeDetail(typeId);
    }
  }, [typeId, fetchDictionaryTypeDetail]);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (t) => t.show('添加字典项'));
  };

  const handleDelete = async (record: API.DictionaryItemResponseDto) => {
    Modal.confirm({
      title: `删除确认`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            确定要删除字典项 <strong>&quot;{record.label}&quot;</strong> 吗？
          </p>
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      async onOk() {
        try {
          await removeDictionaryItem(record.itemId);
          tableReload();
          message.success(`字典项"${record.label}"删除成功`);
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.DictionaryItemResponseDto) => {
    callRef(updateFormRef, (t) => t.show('修改字典项', record.itemId));
  };

  const handleOk = () => {
    tableReload();
  };

  let columns = getDictionaryItemColumns().map((column: any) => {
    if (column.dataIndex === 'itemId') {
      return {
        ...column,
        render: (itemId: string) => <CopyId id={itemId} />,
      };
    }
    if (column.dataIndex === 'label') {
      return {
        ...column,
        render: (label: string) => <Text>{label}</Text>,
      };
    }
    if (column.dataIndex === 'value') {
      return {
        ...column,
        render: (value: string) => <Tag color="purple">{value}</Tag>,
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
          value: dict.common_status,
        },
        render: (status: string | number) => (
          <StatusTag value={status} options={dict.common_status} />
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
  });
  columns = [
    ...columns,
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (record: API.DictionaryItemResponseDto) => {
        return (
          <Space size="small">
            <AuthButton
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
            >
              编辑
            </AuthButton>
            <AuthButton
              danger
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              删除
            </AuthButton>
          </Space>
        );
      },
    },
  ];

  if (!typeId) {
    return (
      <PageContainer>
        <Card>
          <div
            style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}
          >
            请提供字典类型ID
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="dict-items-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
          className="dict-items-back"
        />
        <div className="dict-items-title">
          <span>{typeDetail?.name || '字典项管理'}</span>
        </div>
        <Text type="secondary" className="dict-items-desc">
          编码：{typeDetail?.code} · 描述：
          {typeDetail?.description || '暂无描述'}
        </Text>
      </div>

      <Card>
        {typeDetail?.code && (
          <TablePro
            toolbarRender={() => {
              return (
                <AuthButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  新增字典项
                </AuthButton>
              );
            }}
            rowKey={'itemId'}
            ref={tableProRef}
            columns={columns as any}
            request={(params) =>
              fetchDictionaryItemList(typeDetail?.code, params)
            }
          />
        )}
      </Card>

      {/* 字典项新增修改弹出层 */}
      <UpdateForm
        ref={updateFormRef}
        onOk={handleOk}
        typeCode={typeDetail?.code}
        dict={dict}
      />
    </PageContainer>
  );
};

export default DictionaryItemsPage;
