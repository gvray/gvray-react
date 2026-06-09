import {
  AntIcon,
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
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Modal, Space } from 'antd';
import { useRef } from 'react';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getPermissionColumns } from './columns';
import { usePermissionModel } from './model';

export interface PermissionMeta {
  permissionId: string;
  name: string;
  action: string;
  code?: string;
  children?: PermissionMeta[];
  [key: string]: any;
}

type PermissionDict = {
  permission_action: DictOption[];
  permission_type: DictOption[];
};

const ResourcePage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<PermissionDict>([
    'permission_action',
    'permission_type',
  ]);
  const { message } = useFeedback();
  const { fetchPermissionTree, fetchPermissionDetail, removePermission } =
    usePermissionModel();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (t) => t.show('添加权限'));
  };

  const handleDelete = async (record: API.PermissionResponseDto) => {
    Modal.confirm({
      title: `系统提示`,
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除权限编号为"${record.permissionId}"的数据项？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return removePermission(record.permissionId)
          .then(() => {
            tableReload();
            message.success(`删除成功`);
          })
          .catch((error) => {
            logger.error(error);
          });
      },
    });
  };

  const handleUpdate = async (record: API.PermissionResponseDto) => {
    const permissionId = record.permissionId;
    try {
      const data: any = await fetchPermissionDetail(permissionId);
      callRef(updateFormRef, (t) => t.show('修改权限', data));
    } catch (error) {
      logger.error(error);
    }
  };
  const handleOk = () => {
    tableReload();
  };
  let columns = getPermissionColumns().map((column: any) => {
    if (column.dataIndex === 'icon') {
      return {
        ...column,
        render: (_: any, record: API.PermissionResponseDto) => {
          // TODO: icon类型需要确认
          const icon: any = record?.menuMeta?.icon;
          if (icon) return <AntIcon icon={icon} />;
          if (record?.type === 'API') return <AntIcon icon="ApiOutlined" />;
          if (record?.type === 'BUTTON')
            return <AntIcon icon="ControlOutlined" />;
          return '-';
        },
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'action') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict.permission_action,
        },
        render: (action: string) => (
          <StatusTag value={action} options={dict.permission_action} />
        ),
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'type') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict.permission_type,
        },
        render: (type: string) => (
          <StatusTag value={type} options={dict.permission_type} />
        ),
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'code') {
      return {
        ...column,
        render: (code: string) => code || '-',
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'createdAt') {
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
      render: (record: API.PermissionResponseDto) => {
        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.PERMISSION_UPDATE]}
            >
              修改
            </AuthButton>
            <AuthButton
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              perms={[PERM.PERMISSION_DELETE]}
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
        tree={true}
        ref={tableProRef}
        rowKey={'permissionId'}
        columns={columns as any}
        request={fetchPermissionTree}
        expandable={{
          rowExpandable: (record) =>
            record.children && record.children.length > 0,
          defaultExpandAllRows: true,
        }}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            perms={[PERM.PERMISSION_CREATE]}
          >
            新增权限
          </AuthButton>
        )}
      />
      {/* 权限新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} onOk={handleOk} dict={dict} />
    </PageContainer>
  );
};

export default ResourcePage;
