import {
  AuthButton,
  DateTimeFormat,
  PageContainer,
  TablePro,
} from '@/components';
import StatusTag from '@/components/StatusTag';
import { TableProRef } from '@/components/TablePro';
import { PERM } from '@/constants';
import useDict from '@/hooks/useDict';
import type { DictOption } from '@/types/dict';
import { callRef, logger } from '@/utils';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Modal, Space, Typography, message } from 'antd';
import { useRef } from 'react';
import { useNavigate } from 'umi';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getUserColumns } from './columns';
import { useUserModel } from './model';

const { Paragraph } = Typography;

type UserDict = {
  common_status: DictOption[];
  user_gender: DictOption[];
};

const UserPage = () => {
  const navigate = useNavigate();
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<UserDict>(['common_status', 'user_gender']);
  const { fetchUserList, fetchUserDetail, removeUser } = useUserModel();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (t) => t.show('添加用户'));
  };

  const handleDelete = async (record: API.UserResponseDto) => {
    Modal.confirm({
      title: `系统提示`,
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除用户编号为"${record.userId}"的数据项？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return removeUser(record.userId)
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

  const handleUpdate = async (record: API.UpdateUserDto) => {
    const userId = record.userId;
    if (!userId) {
      return;
    }
    try {
      const res: any = await fetchUserDetail(userId);
      const data = {
        ...res,
        positionIds: res.positions?.map((item: any) => item.positionId),
        roleIds: res.roles?.map((item: any) => item.roleId),
        departmentId: res.department?.departmentId,
      };
      callRef(updateFormRef, (t) => t.show('修改用户', data));
    } catch (error) {
      logger.error(error);
    }
  };

  const handleOk = () => {
    tableReload();
  };

  const handleAuthRole = (userId: string) => {
    navigate(`/system/user-auth/role/${userId}`);
  };

  let columns = getUserColumns().map((column: any) => {
    if (column.dataIndex === 'userId') {
      return {
        ...column,
        render: (userId: string) => (
          <Paragraph ellipsis copyable style={{ width: '100px' }}>
            {userId}
          </Paragraph>
        ),
      };
    }
    if (column.dataIndex === 'status') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict['common_status'],
        },
        render: (status: string) => (
          <StatusTag value={status} options={dict['common_status']} />
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
      render: (record: API.UserResponseDto) => {
        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.USER_UPDATE]}
            >
              修改
            </AuthButton>
            <AuthButton
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              perms={[PERM.USER_DELETE]}
            >
              删除
            </AuthButton>
            <AuthButton
              type="link"
              icon={<UserOutlined />}
              onClick={() => handleAuthRole(record.userId)}
              perms={[PERM.USER_UPDATE_ROLES]}
            >
              分配角色
            </AuthButton>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <TablePro
        rowKey={'userId'}
        toolbarRender={() => (
          <>
            <AuthButton
              type="primary"
              onClick={handleAdd}
              perms={[PERM.USER_CREATE]}
            >
              新增用户
            </AuthButton>
          </>
        )}
        ref={tableProRef}
        columns={columns}
        request={fetchUserList}
      />
      {/* 用户新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
    </PageContainer>
  );
};
export default UserPage;
