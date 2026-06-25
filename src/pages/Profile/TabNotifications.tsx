import {
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Empty,
  List,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import styles from './index.less';
import type { NotifItem } from './model';
import { useProfileNotificationsModel } from './model';

const { Text } = Typography;

const TYPE_CONFIG = {
  system: {
    icon: <InfoCircleOutlined />,
    color: 'var(--gvray-primary-color)',
    label: '系统',
  },
  approval: {
    icon: <CheckCircleOutlined />,
    color: 'var(--gvray-success-color)',
    label: '审批',
  },
  security: {
    icon: <ExclamationCircleOutlined />,
    color: 'var(--gvray-warning-color)',
    label: '安全',
  },
};

const TabNotifications: React.FC = () => {
  const model = useProfileNotificationsModel();

  const renderList = (items: NotifItem[]) => {
    if (items.length === 0) {
      return (
        <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    }
    return (
      <List
        dataSource={items}
        renderItem={(item) => {
          const cfg = TYPE_CONFIG[item.type];
          return (
            <List.Item
              className={`${styles.notifItem} ${
                !item.read ? styles.notifUnread : ''
              }`}
              onClick={() => model.markAsRead(item.id)}
              actions={[
                !item.read && (
                  <Button
                    type="link"
                    key="read"
                    onClick={(event) => {
                      event.stopPropagation();
                      model.markAsRead(item.id);
                    }}
                  >
                    标为已读
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!item.read}>
                    <span
                      className={styles.notifIcon}
                      style={{ color: cfg.color }}
                    >
                      {cfg.icon}
                    </span>
                  </Badge>
                }
                title={
                  <Space wrap size={6}>
                    <Text strong={!item.read} className={styles.listTitle}>
                      {item.title}
                    </Text>
                    <Tag color={cfg.color} className={styles.notifTag}>
                      {cfg.label}
                    </Tag>
                  </Space>
                }
                description={
                  <>
                    <Text type="secondary" className={styles.notifContent}>
                      {item.content}
                    </Text>
                    <div className={styles.notifTime}>{item.time}</div>
                  </>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <Card
      className={styles.moduleCard}
      size="small"
      title={
        <Space>
          <BellOutlined /> 消息通知
          {model.unreadCount > 0 && <Badge count={model.unreadCount} />}
        </Space>
      }
      extra={
        model.unreadCount > 0 && (
          <Button type="link" onClick={model.markAllRead}>
            全部标为已读
          </Button>
        )
      }
    >
      <Tabs
        className={styles.innerTabs}
        items={[
          {
            key: 'all',
            label: `全部 (${model.notifications.length})`,
            children: renderList(model.notifications),
          },
          {
            key: 'system',
            label: (
              <span>
                <InfoCircleOutlined /> 系统 ({model.systemNotifs.length})
              </span>
            ),
            children: renderList(model.systemNotifs),
          },
          {
            key: 'approval',
            label: (
              <span>
                <CheckCircleOutlined /> 审批 ({model.approvalNotifs.length})
              </span>
            ),
            children: renderList(model.approvalNotifs),
          },
          {
            key: 'security',
            label: (
              <span>
                <SafetyCertificateOutlined /> 安全 (
                {model.securityNotifs.length})
              </span>
            ),
            children: renderList(model.securityNotifs),
          },
        ]}
      />
    </Card>
  );
};

export default TabNotifications;
