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
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Space, Typography } from 'antd';
import React, { useRef } from 'react';
import { getLoginLogColumns } from './columns';
import { useLoginLog } from './model';

const { Paragraph } = Typography;

const LoginLog: React.FC = () => {
  const tableProRef = useRef<TableProRef>(null);
  const {
    fetchLoginLogList,
    batchRemoveLoginLogs,
    clearLoginLogs,
    selectedRows,
    setSelectedRows,
  } = useLoginLog();
  const [deleting, setDeleting] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);
  const dict = useDict<{
    common_status: DictOption[];
  }>(['common_status']);
  const { message } = useFeedback();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleSelectionChange = (keys: React.Key[]) => {
    setSelectedRows(keys);
  };

  // 获取表格列配置并添加渲染函数
  const columns = getLoginLogColumns().map((column) => {
    if (column.dataIndex === 'userId') {
      return {
        ...column,
        render: (userId: string) => {
          return (
            <Paragraph ellipsis copyable style={{ width: '100px' }}>
              {userId}
            </Paragraph>
          );
        },
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
        render: (time: string) => {
          return <DateTimeFormat value={time} />;
        },
      };
    }
    return column;
  });

  const handleDelete = async () => {
    Modal.confirm({
      title: '系统提示',
      icon: <ExclamationCircleOutlined />,
      content: '是否确认删除选中的登录日志？此操作不可恢复！',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        setDeleting(true);
        return batchRemoveLoginLogs(selectedRows as number[])
          .then(() => {
            setSelectedRows([]);
            message.success('删除成功');
            tableReload();
          })
          .catch((error) => {
            logger.error(error);
          })
          .finally(() => setDeleting(false));
      },
    });
  };

  const handleClear = async () => {
    Modal.confirm({
      title: '系统提示',
      icon: <ExclamationCircleOutlined />,
      content: '是否确认清理所有登录日志？此操作不可恢复！',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        setClearing(true);
        return clearLoginLogs()
          .then(() => {
            message.success('清理成功');
            tableReload();
          })
          .catch((error) => {
            logger.error(error);
          })
          .finally(() => setClearing(false));
      },
    });
  };

  return (
    <PageContainer>
      <TablePro
        rowKey="id"
        toolbarRender={() => (
          <Space>
            <AuthButton
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
              disabled={selectedRows.length === 0}
              perms={[PERM.LOG_LOGIN_DELETE]}
            >
              删除
            </AuthButton>
            <AuthButton
              danger
              icon={<DeleteOutlined />}
              onClick={handleClear}
              loading={clearing}
              perms={[PERM.LOG_LOGIN_CLEAR]}
            >
              清空
            </AuthButton>
          </Space>
        )}
        ref={tableProRef}
        columns={columns}
        request={fetchLoginLogList}
        onSelectionChange={
          handleSelectionChange as (
            keys: React.Key[],
            rows?: API.LoginLogResponseDto[],
          ) => void
        }
      />
    </PageContainer>
  );
};

export default LoginLog;
