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
import { Modal, Space, Tag } from 'antd';
import { useCallback, useRef, useState } from 'react';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getMenuColumns } from './columns';
import { useMenuModel } from './model';

type MenuDict = {
  common_status: DictOption[];
};

const MenuPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<MenuDict>(['common_status']);
  const { message } = useFeedback();
  const { fetchMenuTree, removeMenu } = useMenuModel();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleRequest = useCallback(
    async (params?: any) => {
      const result = await fetchMenuTree(params);
      const data = result.data as any;
      const items = data?.items ?? data;
      if (Array.isArray(items)) {
        const firstLevelKeys = items
          .filter(
            (item: API.MenuTreeNodeDto) =>
              item.children && item.children.length > 0,
          )
          .map((item: API.MenuTreeNodeDto) => item.menuId);
        setExpandedRowKeys(firstLevelKeys);
      }
      return result;
    },
    [fetchMenuTree],
  );

  const handleAdd = () => {
    callRef(updateFormRef, (t) => t.show('添加菜单'));
  };

  const handleDelete = (record: API.MenuTreeNodeDto) => {
    Modal.confirm({
      title: '系统提示',
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除菜单"${record.name}"？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return removeMenu(record.menuId)
          .then(() => {
            tableReload();
            message.success('删除成功');
          })
          .catch((error) => {
            logger.error(error);
          });
      },
    });
  };

  const handleUpdate = (record: API.MenuTreeNodeDto) => {
    callRef(updateFormRef, (t) => t.show('修改菜单', record.menuId));
  };

  const handleOk = () => {
    tableReload();
  };

  let columns = getMenuColumns().map((column: any) => {
    if ('dataIndex' in column && column.dataIndex === 'icon') {
      return {
        ...column,
        render: (_: any, record: API.MenuTreeNodeDto) => {
          const icon = record?.icon;
          if (icon) {
            const iconName =
              typeof icon === 'string' ? icon : (icon as any)?.icon;
            return <AntIcon icon={iconName || 'FileOutlined'} />;
          }
          return '-';
        },
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'type') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: [
            { label: '目录', value: 'CATALOG' },
            { label: '菜单', value: 'MENU' },
          ],
        },
        render: (type: string) => (
          <Tag color={type === 'CATALOG' ? 'processing' : 'green'}>
            {type === 'CATALOG' ? '目录' : '菜单'}
          </Tag>
        ),
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'status') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict.common_status,
        },
        render: (status: string) => (
          <StatusTag value={status} options={dict.common_status} />
        ),
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'hidden') {
      return {
        ...column,
        render: (hidden: boolean) => (
          <Tag color={hidden ? 'default' : 'green'}>{hidden ? '是' : '否'}</Tag>
        ),
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'path') {
      return {
        ...column,
        render: (path: any) => {
          const pathStr = typeof path === 'string' ? path : path?.path;
          return pathStr || '-';
        },
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
      render: (record: API.MenuTreeNodeDto) => {
        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.MENU_UPDATE]}
            >
              修改
            </AuthButton>
            <AuthButton
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              perms={[PERM.MENU_DELETE]}
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
        tree
        ref={tableProRef}
        rowKey="menuId"
        columns={columns as any}
        request={handleRequest}
        expandable={{
          rowExpandable: (record) =>
            Boolean(record.children && record.children.length > 0),
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
        }}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            perms={[PERM.MENU_CREATE]}
          >
            新增菜单
          </AuthButton>
        )}
      />
      <UpdateForm ref={updateFormRef} onOk={handleOk} dict={dict} />
    </PageContainer>
  );
};

export default MenuPage;
