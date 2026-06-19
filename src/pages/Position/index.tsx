import {
  AuthButton,
  CopyId,
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
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Modal, Space } from 'antd';
import { useRef } from 'react';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getPositionColumns } from './columns';
import { usePosition } from './model';

type PositionDict = {
  common_status: DictOption[];
};

const PositionPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const { fetchPositionList, removePosition } = usePosition();

  const dict = useDict<PositionDict>(['common_status']);
  const { message } = useFeedback();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = async () => {
    callRef(updateFormRef, (t) => t.show('添加岗位'));
  };

  const handleDelete = async (record: API.PositionResponseDto) => {
    Modal.confirm({
      title: `系统提示`,
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除岗位“${record.name}”？`,
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        try {
          await removePosition(String(record.positionId));
          tableReload();
          message.success('删除成功');
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.PositionResponseDto) => {
    callRef(updateFormRef, (t) => t.show('修改岗位', record.positionId));
  };

  const handleOk = () => {
    tableReload();
  };

  let columns = getPositionColumns().map((column: any) => {
    if (column.dataIndex === 'positionId') {
      return {
        ...column,
        render: (positionId: string) => <CopyId id={positionId} />,
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
      render: (record: API.PositionResponseDto) => {
        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.POSITION_UPDATE]}
            >
              修改
            </AuthButton>
            <AuthButton
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              perms={[PERM.POSITION_DELETE]}
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
        rowKey={'positionId'}
        toolbarRender={() => (
          <>
            <AuthButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              perms={[PERM.POSITION_CREATE]}
            >
              新增岗位
            </AuthButton>
          </>
        )}
        ref={tableProRef}
        columns={columns}
        request={fetchPositionList}
      />
      {/* 岗位新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
    </PageContainer>
  );
};
export default PositionPage;
