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
import { callRef } from '@/utils';
import { Descriptions, Modal, Spin, Tooltip } from 'antd';
import React from 'react';
import { getOperationLogColumns } from './columns';
import styles from './index.less';
import { useOperationLog } from './model';

const OperationLogPage: React.FC = () => {
  const tableProRef = React.useRef<TableProRef>(null);
  const {
    fetchOperationLogList,
    fetchOperationLogDetail,
    batchRemoveOperationLogs,
    clearOperationLogs,
    selectedRowKeys,
    setSelectedRowKeys,
  } = useOperationLog();
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detail, setDetail] = React.useState<Record<string, unknown> | null>(
    null,
  );
  const dict = useDict<{
    operation_status: DictOption[];
  }>(['operation_status']);
  const { message } = useFeedback();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleSelectionChange = (keys: React.Key[]) => {
    setSelectedRowKeys(keys);
  };

  const handleViewDetail = async (record: any) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await fetchOperationLogDetail(record.id);
      setDetail(data);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetail(null);
  };

  const handleBatchDelete = () => {
    if (!selectedRowKeys.length) {
      Modal.warning({
        title: '提示',
        content: '请先选择要删除的记录',
      });
      return;
    }
    const rows = tableProRef.current?.getSelectedRows() || [];
    Modal.confirm({
      title: '批量删除确认',
      width: 520,
      content: (
        <div>
          确认删除以下 {selectedRowKeys.length} 条记录？
          <div className={styles.styledDiv}>
            {rows.map((r) => (
              <div key={r.id}>
                ID: {r.id}，用户：{r.username}，操作：{r.action}
              </div>
            ))}
          </div>
        </div>
      ),
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        const ids = selectedRowKeys.map((k) => String(k));
        return batchRemoveOperationLogs(ids).then(() => {
          setSelectedRowKeys([]);
          message.success('选中的操作日志已删除');
          tableReload();
        });
      },
    });
  };

  const handleClear = () => {
    Modal.confirm({
      title: '清空日志确认',
      content: '确认清空所有操作日志吗？该操作不可恢复。',
      okText: '清空',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        return clearOperationLogs().then(() => {
          message.success('操作日志已清空');
          tableReload();
        });
      },
    });
  };
  let columns = getOperationLogColumns().map((column) => {
    if ('dataIndex' in column && column.dataIndex === 'status') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict.operation_status,
        },
        render: (status: string | number) => (
          <StatusTag value={status} options={dict.operation_status} />
        ),
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'path') {
      return {
        ...column,
        ellipsis: true,
        render: (text: string) => (
          <Tooltip placement="topLeft" title={text}>
            <span>{text}</span>
          </Tooltip>
        ),
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'createdAt') {
      return {
        ...column,
        render: (createdAt: string) => {
          return <DateTimeFormat value={createdAt} />;
        },
      };
    }
    return column;
  });
  columns = [
    ...columns,
    {
      title: '操作',
      render: (_: string, record: any) => (
        <>
          <AuthButton
            type="link"
            onClick={() => handleViewDetail(record)}
            perms={[PERM.LOG_OPERATION_VIEW]}
          >
            详情
          </AuthButton>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <Modal
        open={detailOpen}
        title="日志详情"
        onCancel={() => {
          handleCloseDetail();
        }}
        footer={null}
        width={640}
      >
        {detailLoading ? (
          <div className={styles.loadingWrapper}>
            <Spin />
          </div>
        ) : detail ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="ID">
              {String(detail.id ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="用户">
              {String(detail.username ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="模块">
              {String(detail.module ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="操作">
              {String(detail.action ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {detail.status === 1 ? '成功' : '失败'}
            </Descriptions.Item>
            <Descriptions.Item label="路径">
              {String(detail.path ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="方法">
              {String(detail.method ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="IP地址">
              {String(detail.ipAddress ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="地点">
              {String(detail.location ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="UA">
              {String(detail.userAgent ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="信息">
              {String(detail.message ?? '')}
            </Descriptions.Item>
            <Descriptions.Item label="时间">
              <DateTimeFormat value={detail.createdAt as string} />
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
      <TablePro
        toolbarRender={() => (
          <>
            <AuthButton
              danger
              disabled={!selectedRowKeys.length}
              onClick={handleBatchDelete}
              perms={[PERM.LOG_OPERATION_DELETE]}
            >
              删除
            </AuthButton>
            <AuthButton
              danger
              onClick={handleClear}
              perms={[PERM.LOG_OPERATION_CLEAR]}
            >
              清空
            </AuthButton>
          </>
        )}
        ref={tableProRef}
        columns={columns}
        request={fetchOperationLogList}
        rowKey="id"
        onSelectionChange={handleSelectionChange}
      />
    </PageContainer>
  );
};

export default OperationLogPage;
