import {
  AuthButton,
  CellName,
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
  EyeOutlined,
} from '@ant-design/icons';
import { Modal, Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import { getConfigColumns } from './columns';
import ConfigValueViewer from './components/ConfigValueViewer';
import './index.less';
import { useConfigModel } from './model';
import UpdateForm, { UpdateFormRef } from './UpdateForm';

const ConfigPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const { fetchConfigList, fetchConfigDetail, removeConfig } = useConfigModel();
  const dict = useDict<{
    config_group: DictOption[];
    common_status: DictOption[];
    config_type: DictOption[];
  }>(['config_group', 'common_status', 'config_type']);
  const { message } = useFeedback();

  const [viewVisible, setViewVisible] = useState(false);
  const [currentConfig, setCurrentConfig] =
    useState<API.ConfigResponseDto | null>(null);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (f) => f.show('添加配置'));
  };

  const handleDelete = (record: API.ConfigResponseDto) => {
    Modal.confirm({
      title: `系统提示`,
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除配置"${record.name}"的数据项？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return removeConfig(record.configId)
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

  const handleUpdate = (record: API.ConfigResponseDto) => {
    callRef(updateFormRef, (f) => f.show('修改配置', record.configId));
  };

  const handleView = async (record: API.ConfigResponseDto) => {
    setViewVisible(true);
    try {
      const data = await fetchConfigDetail(record.configId);
      setCurrentConfig(data);
    } catch (error) {
      logger.error(error);
    }
  };

  const handleOk = () => {
    tableReload();
  };

  // 构建列定义
  let columns = getConfigColumns().map((column: any) => {
    if (column.dataIndex === 'name') {
      return {
        ...column,
        render: (name: string, record: API.ConfigResponseDto) => (
          <CellName name={name} description={record.description} />
        ),
      };
    }
    if (column.dataIndex === 'key') {
      return {
        ...column,
        render: (key: string) => <Tag color="blue">{key}</Tag>,
      };
    }
    if (column.dataIndex === 'type') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict.config_type,
        },
        render: (type: string) => (
          <Tag>
            {dict.config_type?.find((d) => d.value === String(type))?.label ||
              type}
          </Tag>
        ),
      };
    }
    if (column.dataIndex === 'group') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT',
          value: dict.config_group,
        },
        render: (group: string) => {
          const label =
            dict['config_group']?.find((d) => String(d.value) === group)
              ?.label || group;
          return <Tag>{label}</Tag>;
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
        render: (time: string) => <DateTimeFormat value={time} />,
      };
    }
    return column;
  });

  const actionColumn: any = {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
    render: (record: API.ConfigResponseDto) => (
      <Space size={0}>
        <AuthButton
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          perms={[PERM.CONFIG_VIEW]}
        >
          查看
        </AuthButton>
        <AuthButton
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleUpdate(record)}
          perms={[PERM.CONFIG_UPDATE]}
        >
          修改
        </AuthButton>
        <AuthButton
          danger
          type="link"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
          perms={[PERM.CONFIG_DELETE]}
        >
          删除
        </AuthButton>
      </Space>
    ),
  };

  columns.push(actionColumn);

  return (
    <PageContainer>
      <TablePro
        rowKey="configId"
        ref={tableProRef}
        columns={columns}
        request={fetchConfigList}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            onClick={handleAdd}
            perms={[PERM.CONFIG_CREATE]}
          >
            新增配置
          </AuthButton>
        )}
      />
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
      {currentConfig && (
        <ConfigValueViewer
          config={currentConfig}
          visible={viewVisible}
          dict={dict}
          onClose={() => {
            setViewVisible(false);
            setCurrentConfig(null);
          }}
        />
      )}
    </PageContainer>
  );
};

export default ConfigPage;
