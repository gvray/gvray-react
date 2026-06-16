import {
  AuthButton,
  DateTimeFormat,
  PageContainer,
  TablePro,
} from '@/components';
import { TableProRef } from '@/components/TablePro';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import { callRef, logger } from '@/utils';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import { Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getPermissionColumns } from './columns';
import {
  getDefaultExpandedKeys,
  type PermissionTreeNode,
  usePermissionModel,
} from './model';

const PermissionPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const { message } = useFeedback();
  const {
    scanning,
    fetchPermissionList,
    fetchPermissionDetail,
    syncPermissions,
  } = usePermissionModel();

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleSync = async () => {
    try {
      await syncPermissions();
      message.success('权限扫描同步成功');
      tableReload();
    } catch (error) {
      logger.error(error);
    }
  };

  const handleUpdate = async (record: PermissionTreeNode) => {
    if (record.isVirtual) return;
    try {
      const data = await fetchPermissionDetail(record.permissionId);
      callRef(updateFormRef, (t) => t.show('修改权限描述', data));
    } catch (error) {
      logger.error(error);
    }
  };

  const handleOk = () => {
    tableReload();
  };

  const columns = getPermissionColumns().map((column: any) => {
    if ('dataIndex' in column && column.dataIndex === 'name') {
      return {
        ...column,
        render: (_: string, record: PermissionTreeNode) => {
          if (record.nodeType === 'DOMAIN') {
            return (
              <Tag color="purple" style={{ fontWeight: 600 }}>
                {record.name}
              </Tag>
            );
          }
          if (record.nodeType === 'RESOURCE') {
            return (
              <Tag color="blue" style={{ fontWeight: 600 }}>
                {record.name}
              </Tag>
            );
          }
          return <span>{record.name}</span>;
        },
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'code') {
      return {
        ...column,
        render: (code: string, record: PermissionTreeNode) => {
          if (record.isVirtual) {
            return <Tag>{code}</Tag>;
          }
          return <code>{code}</code>;
        },
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'origin') {
      return {
        ...column,
        render: (origin: string, record: PermissionTreeNode) => {
          if (record.isVirtual) return '-';
          return (
            <Tag color={origin === 'SYSTEM' ? 'blue' : 'green'}>
              {origin === 'SYSTEM' ? '系统' : '用户'}
            </Tag>
          );
        },
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'updatedAt') {
      return {
        ...column,
        render: (time: string, record: PermissionTreeNode) => {
          if (record.isVirtual || !time) return '-';
          return <DateTimeFormat value={time} />;
        },
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'action') {
      return {
        ...column,
        render: (action: string, record: PermissionTreeNode) => {
          if (record.isVirtual) return '-';
          return action || '-';
        },
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'description') {
      return {
        ...column,
        render: (desc: string, record: PermissionTreeNode) => {
          if (record.isVirtual) return '-';
          return desc || '-';
        },
      };
    }
    return column;
  });

  const actionColumn = {
    title: '操作',
    key: 'action',
    width: 100,
    render: (record: PermissionTreeNode) => {
      if (record.isVirtual) return null;
      return (
        <Space size={0}>
          <AuthButton
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            perms={[PERM.PERMISSION_UPDATE]}
          >
            编辑
          </AuthButton>
        </Space>
      );
    },
  };

  return (
    <PageContainer>
      <TablePro
        tree
        ref={tableProRef}
        rowKey="permissionId"
        columns={[...columns, actionColumn] as any}
        request={async (params) => {
          const result = await fetchPermissionList(params);
          setExpandedKeys(getDefaultExpandedKeys(result.data));
          return result;
        }}
        expandable={{
          rowExpandable: (record) =>
            Boolean(record.children && record.children.length > 0),
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) => setExpandedKeys(keys as string[]),
        }}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            icon={<SyncOutlined spin={scanning} />}
            onClick={handleSync}
            loading={scanning}
            perms={[PERM.PERMISSION_SCAN]}
          >
            扫描同步
          </AuthButton>
        )}
      />
      <UpdateForm ref={updateFormRef} onOk={handleOk} />
    </PageContainer>
  );
};

export default PermissionPage;
