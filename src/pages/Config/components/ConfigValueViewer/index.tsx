import { DateTimeFormat, StatusTag } from '@/components';
import { useFeedback } from '@/hooks';
import type { DictOption } from '@/types/dict';
import { logger } from '@/utils';
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';
import { copyText } from '@gvray/domkit';
import { Button, Descriptions, Modal, Tag, Typography } from 'antd';
import React from 'react';
import { styled } from 'umi';
const { Text } = Typography;

const ValueSection = styled.div`
  margin-top: 16px;
`;

const ValueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ValueBox = styled.div`
  padding: 12px;
  background-color: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #e1e4e8;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 260px;
  overflow: auto;
  line-height: 1.6;
`;

interface ConfigValueViewerProps {
  config: API.ConfigResponseDto;
  visible: boolean;
  onClose: () => void;
  dict: Record<string, DictOption[]>;
}

const ConfigValueViewer: React.FC<ConfigValueViewerProps> = ({
  config,
  visible,
  onClose,
  dict,
}) => {
  const { message } = useFeedback();

  const handleCopy = () => {
    copyText(config.value)
      .then(() => message.success('已复制'))
      .catch((error) => {
        logger.error(error);
      });
  };

  const groupLabel =
    dict.config_group?.find((d) => String(d.value) === config.group)?.label ||
    config.group;

  const typeLabel =
    dict.config_type?.find((d) => String(d.value) === String(config.type))
      ?.label || config.type;

  return (
    <Modal
      title={
        <>
          <EyeOutlined style={{ marginRight: 8 }} />
          查看配置详情
        </>
      }
      open={visible}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={680}
      destroyOnHidden
    >
      <Descriptions column={2} bordered size="small" style={{ marginTop: 16 }}>
        <Descriptions.Item label="配置名称" span={2}>
          <Text strong>{config.name}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="配置键">
          <Tag color="blue" style={{ fontFamily: 'monospace' }}>
            {config.key}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="配置类型">
          <Tag>{typeLabel}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="配置分组">
          <Tag>{groupLabel}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="排序权重">{config.sort}</Descriptions.Item>
        <Descriptions.Item label="是否公开">
          <Tag color={config.isPublic ? 'green' : 'default'}>
            {config.isPublic ? '公开' : '私有'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <StatusTag value={config.status} options={dict.common_status} />
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          <DateTimeFormat value={config.createdAt} />
        </Descriptions.Item>
        {config.description && (
          <Descriptions.Item label="描述" span={2}>
            {config.description}
          </Descriptions.Item>
        )}
        {config.remark && (
          <Descriptions.Item label="备注" span={2}>
            {config.remark}
          </Descriptions.Item>
        )}
      </Descriptions>

      <ValueSection>
        <ValueHeader>
          <Text strong>配置值</Text>
          <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>
            复制
          </Button>
        </ValueHeader>
        <ValueBox>
          {config.type === 'json'
            ? (() => {
                try {
                  return JSON.stringify(JSON.parse(config.value), null, 2);
                } catch {
                  return config.value;
                }
              })()
            : config.value}
        </ValueBox>
      </ValueSection>
    </Modal>
  );
};

export default ConfigValueViewer;
