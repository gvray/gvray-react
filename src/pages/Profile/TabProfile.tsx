import { useAuthStore } from '@/stores';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Card,
  Descriptions,
  Divider,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import styles from './index.less';
import { getAccountStatusMeta } from './model';

const { Text } = Typography;

interface TabProfileProps {
  profile?: API.CurrentUserResponseDto;
}

const TabProfile: React.FC<TabProfileProps> = ({ profile }) => {
  const storeProfile = useAuthStore((s) => s.profile);
  const currentProfile = profile ?? storeProfile;
  const statusMeta = getAccountStatusMeta(currentProfile?.status);
  const emailBound = !!currentProfile?.email;
  const phoneBound = !!currentProfile?.phone;

  return (
    <>
      <Alert
        type="info"
        showIcon
        className={styles.profileNotice}
        message="账号基础资料由系统维护，若需变更请联系管理员。"
      />

      <Card
        className={styles.moduleCard}
        title={
          <>
            <IdcardOutlined /> 基本信息
          </>
        }
      >
        <Descriptions
          column={{ xs: 1, sm: 1, md: 2 }}
          colon={false}
          labelStyle={{ color: 'var(--ant-color-text-secondary)', width: 100 }}
        >
          <Descriptions.Item label="用户名">
            <span className={styles.readonlyField}>
              {currentProfile?.username || '-'} <LockOutlined />
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="昵称">
            {currentProfile?.nickname || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="用户 ID" span={2}>
            <Text copyable type="secondary">
              {currentProfile?.userId || '-'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="部门">
            <span className={styles.readonlyField}>
              {currentProfile?.department?.name || '未设置'} <LockOutlined />
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="岗位">
            <span className={styles.readonlyField}>
              {currentProfile?.positions?.[0]?.name || '未设置'}{' '}
              <LockOutlined />
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="角色" span={2}>
            <Space size={4} wrap>
              {currentProfile?.roles?.map((role) => (
                <Tooltip
                  key={role.roleId}
                  title={String(role.description || role.name)}
                  styles={{ body: { maxWidth: 280 } }}
                >
                  <Tag color="blue">{role.name}</Tag>
                </Tooltip>
              ))}
              {!currentProfile?.roles?.length && (
                <Text type="secondary">暂无角色</Text>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="账号状态">
            <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            <span className={styles.readonlyField}>
              {currentProfile?.createdAt
                ? new Date(currentProfile.createdAt).toLocaleString()
                : '-'}{' '}
              <LockOutlined />
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            <span className={styles.readonlyField}>
              {currentProfile?.updatedAt
                ? new Date(currentProfile.updatedAt).toLocaleString()
                : '-'}{' '}
              <LockOutlined />
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        className={styles.moduleCard}
        title={
          <>
            <MailOutlined /> 联系方式
          </>
        }
      >
        <div className={styles.contactRow}>
          <MailOutlined className={styles.contactLargeIcon} />
          <div className={styles.contactContent}>
            <div className={styles.contactTitle}>邮箱</div>
            <Text type="secondary" className={styles.contactDesc}>
              <span className={styles.contactText}>
                {currentProfile?.email || '未绑定'}
              </span>
              {emailBound ? (
                <CheckCircleFilled className={styles.verifiedIcon} />
              ) : (
                <ExclamationCircleFilled className={styles.unverifiedIcon} />
              )}
            </Text>
          </div>
          <Tag color={emailBound ? 'green' : 'default'}>
            {emailBound ? '已绑定' : '未绑定'}
          </Tag>
        </div>

        <Divider className={styles.contactDivider} />

        <div className={styles.contactRow}>
          <MobileOutlined className={styles.contactLargeIcon} />
          <div className={styles.contactContent}>
            <div className={styles.contactTitle}>手机号</div>
            <Text type="secondary" className={styles.contactDesc}>
              <span className={styles.contactText}>
                {currentProfile?.phone
                  ? currentProfile.phone.replace(
                      /(\d{3})\d{4}(\d{4})/,
                      '$1****$2',
                    )
                  : '未绑定'}
              </span>
              {phoneBound ? (
                <CheckCircleFilled className={styles.verifiedIcon} />
              ) : (
                <ExclamationCircleFilled className={styles.unverifiedIcon} />
              )}
            </Text>
          </div>
          <Tag color={phoneBound ? 'green' : 'default'}>
            {phoneBound ? '已绑定' : '未绑定'}
          </Tag>
        </div>
      </Card>
    </>
  );
};

export default TabProfile;
