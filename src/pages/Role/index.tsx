import {
  AuthButton,
  CopyId,
  DateTimeFormat,
  PageContainer,
  TablePro,
} from '@/components';
import StatusTag from '@/components/StatusTag';
import { TableProRef } from '@/components/TablePro';
import { PERM } from '@/constants';
import { useAuth, useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import type { DictOption } from '@/types/dict';
import { callRef, logger } from '@/utils';
import {
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  MoreOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Modal, Space } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from 'umi';
import { getRoleColumns } from './columns';
import AuthDataScopeModal from './components/AuthDataScopeModal';
import { useRoleModel } from './model';
import UpdateForm, { UpdateFormRef } from './UpdateForm';

type RoleDict = {
  common_status: DictOption[];
};

const RolePage = () => {
  const navigate = useNavigate();
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<RoleDict>(['common_status']);
  const { message } = useFeedback();
  const { permissions } = useAuth();
  const { fetchRoleList, fetchRoleDetail, removeRole } = useRoleModel();

  // 权限检查辅助函数
  const hasPermission = (requiredPerms: string[]) => {
    if (!requiredPerms || requiredPerms.length === 0) return true;
    if (!permissions || permissions.length === 0) return false;
    if (permissions.includes('*:*:*')) return true;
    return requiredPerms.every((p) => permissions.includes(p));
  };

  // 数据权限弹窗状态
  const [dataPermissionVisible, setDataPermissionVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<API.RoleResponseDto | null>(
    null,
  );

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (t) => t.show('添加角色'));
  };

  const handleDelete = async (record: API.RoleResponseDto) => {
    Modal.confirm({
      title: `系统提示`,
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除角色编号为"${record.roleId}"的数据项？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return removeRole(record.roleId)
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

  const handleUpdate = async (record: API.RoleResponseDto) => {
    const roleId = record.roleId;
    try {
      const data = await fetchRoleDetail(roleId);
      callRef(updateFormRef, (t) => t.show('修改角色', data));
    } catch (error) {
      logger.error(error);
    }
  };

  const handleOk = () => {
    tableReload();
  };

  const handleAuthUser = (record: API.RoleResponseDto) => {
    navigate(`/system/role-auth/user/${record.roleId}`);
  };

  const handleAuthPermission = (record: API.RoleResponseDto) => {
    navigate(`/system/role-auth/permission/${record.roleId}`);
  };

  const handleAuthDataPermission = (record: API.RoleResponseDto) => {
    setCurrentRole(record);
    setDataPermissionVisible(true);
  };

  const handleDataPermissionSuccess = () => {
    tableReload();
  };

  const handleDataPermissionCancel = () => {
    setDataPermissionVisible(false);
    setCurrentRole(null);
  };

  // 更多操作菜单
  const getMoreMenu = (record: API.RoleResponseDto): MenuProps['items'] => {
    const menuItems = [
      {
        key: 'permission',
        icon: <KeyOutlined />,
        label: '分配权限',
        onClick: () => handleAuthPermission(record),
        permission: PERM.ROLE_UPDATE_PERMISSIONS,
      },
      {
        key: 'dataPermission',
        icon: <DatabaseOutlined />,
        label: '数据权限',
        onClick: () => handleAuthDataPermission(record),
        permission: PERM.ROLE_UPDATE_DATA_SCOPE,
      },
      {
        key: 'user',
        icon: <UserOutlined />,
        label: '分配用户',
        onClick: () => handleAuthUser(record),
        permission: PERM.ROLE_UPDATE_USERS,
      },
    ];

    return (
      menuItems
        .filter((item) => hasPermission([item.permission]))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ permission, ...item }) => item)
    );
  };

  let columns = getRoleColumns().map((column: any) => {
    if (column.dataIndex === 'roleId') {
      return {
        ...column,
        render: (roleId: string) => <CopyId id={roleId} />,
      };
    }
    if (column.dataIndex === 'status') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict['common_status'],
        },
        render: (status: number) => (
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
      render: (record: API.RoleResponseDto) => {
        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.ROLE_UPDATE]}
            >
              修改
            </AuthButton>

            <AuthButton
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              perms={[PERM.ROLE_DELETE]}
            >
              删除
            </AuthButton>
            <Dropdown
              menu={{ items: getMoreMenu(record) }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button type="link" icon={<MoreOutlined />}>
                更多
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer title="角色管理">
      <TablePro
        rowKey={'roleId'}
        toolbarRender={() => (
          <>
            <AuthButton
              type="primary"
              onClick={handleAdd}
              perms={[PERM.ROLE_CREATE]}
            >
              新增角色
            </AuthButton>
          </>
        )}
        ref={tableProRef}
        columns={columns as any}
        request={fetchRoleList}
      />
      {/* 角色新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} onOk={handleOk} dict={dict} />

      {/* 数据权限分配弹窗 */}
      {currentRole && (
        <AuthDataScopeModal
          visible={dataPermissionVisible}
          roleId={currentRole.roleId}
          roleName={currentRole.name || ''}
          onCancel={handleDataPermissionCancel}
          onSuccess={handleDataPermissionSuccess}
        />
      )}
    </PageContainer>
  );
};
export default RolePage;
