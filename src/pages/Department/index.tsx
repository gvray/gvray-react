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
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Modal, Space } from 'antd';
import { useRef } from 'react';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getDepartmentColumns } from './columns';
import { useDepartmentModel } from './model';

type DepartmentDict = {
  common_status: DictOption[];
};
const DepartmentPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const { removeDepartment, fetchDepartmentTree } = useDepartmentModel();
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<DepartmentDict>(['common_status']);
  const { message } = useFeedback();

  const handleAdd = async () => {
    callRef(updateFormRef, (t) => t.show('添加部门'));
  };

  const handleDelete = async (record: API.DepartmentResponseDto) => {
    Modal.confirm({
      title: `系统提示`,
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除部门“${record.name}”？`,
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        try {
          await removeDepartment(record.departmentId);
          callRef(tableProRef, (t) => t.reload());
          message.success('删除成功');
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.DepartmentResponseDto) => {
    callRef(updateFormRef, (t) => t.show('修改部门', record.departmentId));
  };
  const handleOk = () => {
    callRef(tableProRef, (t) => t.reload());
  };
  let columns = getDepartmentColumns().map((column: any) => {
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
      fixed: 'right',
      width: 180,
      render: (record: API.DepartmentResponseDto) => {
        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.DEPARTMENT_UPDATE]}
            >
              修改
            </AuthButton>
            <AuthButton
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              perms={[PERM.DEPARTMENT_DELETE]}
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
        rowKey={'departmentId'}
        columns={columns as any}
        request={fetchDepartmentTree}
        expandable={{ defaultExpandAllRows: true }}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            perms={[PERM.DEPARTMENT_CREATE]}
          >
            新增部门
          </AuthButton>
        )}
      />
      {/* 部门新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
    </PageContainer>
  );
};

export default DepartmentPage;
