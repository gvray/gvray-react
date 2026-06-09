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
  EyeOutlined,
} from '@ant-design/icons';
import { Modal, Space, Tag, Typography } from 'antd';
import { useRef, useState } from 'react';
import UpdateForm, { UpdateFormRef } from './UpdateForm';
import { getConfigColumns } from './columns';
import ConfigValueViewer from './components/ConfigValueViewer';
import { useConfigModel } from './model';

const { Text } = Typography;

const ConfigPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<{
    config_group: DictOption[];
    config_status: DictOption[];
    config_type: DictOption[];
  }>(['config_group', 'config_status', 'config_type']);
  const { fetchConfigList, fetchConfigDetail, removeConfig } = useConfigModel();
  const [viewVisible, setViewVisible] = useState(false);
  const [currentConfig, setCurrentConfig] =
    useState<API.ConfigResponseDto | null>(null);
  const { message } = useFeedback();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (f) => f.show('添加配置'));
  };

  const handleDelete = (record: API.ConfigResponseDto) => {
    Modal.confirm({
      title: '系统提示',
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除配置"${record.name}"的数据项？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return removeConfig(record.configId)
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

  const handleUpdate = async (record: API.ConfigResponseDto) => {
    try {
      const data: any = await fetchConfigDetail(record.configId);
      callRef(updateFormRef, (f) => f.show('修改配置', data));
    } catch (error) {
      logger.error(error);
    }
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
          <div>
            <Text strong>{name}</Text>
            {record.description && (
              <div
                style={{
                  fontSize: 12,
                  color: '#999',
                  marginTop: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}
              >
                {record.description}
              </div>
            )}
          </div>
        ),
      };
    }
    if (column.dataIndex === 'key') {
      return {
        ...column,
        render: (key: string) => (
          <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {key}
          </Tag>
        ),
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
          value: dict['config_group'],
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
          value: dict.config_status,
        },
        render: (status: string | number) => (
          <StatusTag value={status} options={dict.config_status} />
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
      width: 200,
      fixed: 'right',
      render: (record: any) => (
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
    },
  ];

  return (
    <PageContainer>
      <TablePro
        rowKey="configId"
        toolbarRender={() => (
          <AuthButton
            type="primary"
            onClick={handleAdd}
            perms={[PERM.CONFIG_CREATE]}
          >
            新增配置
          </AuthButton>
        )}
        ref={tableProRef}
        columns={columns}
        request={fetchConfigList}
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
