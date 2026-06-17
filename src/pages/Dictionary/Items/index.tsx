import {
  AuthButton,
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
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Card, Col, Modal, Row, Space, Tag, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import { useParams } from 'umi';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getDictionaryItemColumns } from './columns';
import { useDictionaryItems } from './model';

const { Title, Text, Paragraph } = Typography;

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
    fetchDictionaryItemDetail,
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

  const handleAdd = async () => {
    callRef(updateFormRef, (t) =>
      t.show('添加字典项', {
        typeCode: typeDetail?.code,
      }),
    );
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

  const handleUpdate = async (record: API.DictionaryItemResponseDto) => {
    const itemId = record.itemId;
    try {
      const msg: any = await fetchDictionaryItemDetail(itemId);
      callRef(updateFormRef, (t) =>
        t.show('修改字典项', {
          ...msg,
          typeId,
        }),
      );
    } catch (error) {
      logger.error(error);
    }
  };

  const handleOk = () => {
    tableReload();
  };

  let columns = getDictionaryItemColumns().map((column: any) => {
    if (column.dataIndex === 'itemId') {
      return {
        ...column,
        render: (itemId: string) => (
          <Paragraph ellipsis copyable style={{ width: '100px' }}>
            {itemId}
          </Paragraph>
        ),
      };
    }
    if (column.dataIndex === 'label') {
      return {
        ...column,
        render: (label: string) => (
          <Text style={{ fontSize: '13px' }}>{label}</Text>
        ),
      };
    }
    if (column.dataIndex === 'value') {
      return {
        ...column,
        render: (value: string) => (
          <Tag color="purple" style={{ fontFamily: 'monospace' }}>
            {value}
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
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                <BookOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                {typeDetail?.name || '字典项管理'}
              </Title>
              <Text type="secondary">
                编码：{typeDetail?.code} | 描述：
                {typeDetail?.description || '暂无描述'}
              </Text>
            </div>
          </Col>
          <Col>
            <AuthButton
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.history.back()}
              style={{ padding: 0, marginBottom: 8 }}
            >
              返回字典类型列表
            </AuthButton>
          </Col>
        </Row>
      </Card>

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
