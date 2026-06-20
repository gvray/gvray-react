import { PageContainer } from '@/components';
import {
  BellOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  IdcardOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Card,
  Progress,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import styles from './index.less';
import { useProfilePageModel } from './model';
import TabLoginLog from './TabLoginLog';
import TabNotifications from './TabNotifications';
import TabPermissions from './TabPermissions';
import TabPreferences from './TabPreferences';
import TabProfile from './TabProfile';
import TabSecurity from './TabSecurity';

const { Title, Text } = Typography;

const TAB_META: Array<{
  key: string;
  icon: ReactNode;
  label: string;
  children: ReactNode;
}> = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '基本信息',
    children: <TabProfile />,
  },
  {
    key: 'security',
    icon: <LockOutlined />,
    label: '安全中心',
    children: <TabSecurity />,
  },
  {
    key: 'permissions',
    icon: <SafetyCertificateOutlined />,
    label: '我的权限',
    children: <TabPermissions />,
  },
  {
    key: 'loginLog',
    icon: <HistoryOutlined />,
    label: '登录记录',
    children: <TabLoginLog />,
  },
  {
    key: 'notifications',
    icon: <BellOutlined />,
    label: '消息通知',
    children: <TabNotifications />,
  },
  {
    key: 'preferences',
    icon: <SettingOutlined />,
    label: '系统偏好',
    children: <TabPreferences />,
  },
];

export default function ProfilePage() {
  const model = useProfilePageModel();
  const departmentName = model.profile?.department?.name || '未设置部门';
  const positionName = model.profile?.positions?.[0]?.name || '未设置岗位';

  const tabItems = TAB_META.map((item) => ({
    key: item.key,
    label: (
      <span className={styles.tabLabel}>
        {item.icon}
        {item.label}
      </span>
    ),
    children: item.children,
  }));

  return (
    <PageContainer className={styles.profilePage}>
      <div className={styles.profileShell}>
        <section className={styles.profileOverview}>
          <section className={styles.profileHero}>
            <div className={styles.heroIdentity}>
              <Avatar
                size={72}
                src={model.avatarSrc}
                icon={<UserOutlined />}
                className={styles.avatarRing}
              />

              <div className={styles.heroMain}>
                <Space size={10} wrap className={styles.heroTitleRow}>
                  <Title level={3} className={styles.userName}>
                    {model.displayName}
                  </Title>
                  <Tag color={model.accountStatusColor}>
                    {model.accountStatusLabel}
                  </Tag>
                  {model.profile?.isSuperAdmin && (
                    <Tag color="red">超级管理员</Tag>
                  )}
                </Space>
                <div className={styles.heroMetaLine}>
                  <span>@{model.profile?.username || '-'}</span>
                  <span>{model.profile?.userId || '-'}</span>
                  <span>{departmentName}</span>
                  <span>{positionName}</span>
                </div>
                <div className={styles.roleTags}>
                  {model.profile?.roles?.slice(0, 3).map((role) => (
                    <Tooltip
                      key={role.roleId}
                      title={String(role.description || role.name)}
                      styles={{ body: { maxWidth: 280 } }}
                    >
                      <Tag color="blue">{role.name}</Tag>
                    </Tooltip>
                  ))}
                  {(model.profile?.roles?.length ?? 0) > 3 && (
                    <Tooltip
                      title={model.profile?.roles
                        ?.slice(3)
                        .map((role) => role.description || role.name)
                        .join('、')}
                    >
                      <Tag>+{(model.profile?.roles?.length ?? 0) - 3}</Tag>
                    </Tooltip>
                  )}
                  {!model.profile?.roles?.length && <Tag>暂无角色</Tag>}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.profileSummary}>
            <Card className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <div className={styles.summaryIcon}>
                  <IdcardOutlined />
                </div>
                <div className={styles.summaryMeta}>
                  <Text type="secondary">资料与状态</Text>
                  <div className={styles.summaryTitle}>
                    {model.completenessPercent}% 完整
                  </div>
                </div>
              </div>
              <Progress
                percent={model.completenessPercent}
                showInfo={false}
                strokeColor={{ from: '#1677ff', to: '#722ed1' }}
              />
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>资料项</span>
                  <Text type="secondary">
                    {model.doneCount}/{model.completenessChecks.length} 已完成
                  </Text>
                </div>
                <div className={styles.summaryRow}>
                  <span>账号状态</span>
                  <Tag color={model.accountStatusColor}>
                    {model.accountStatusLabel}
                  </Tag>
                </div>
                <div className={styles.summaryRow}>
                  <span>更新时间</span>
                  <Text type="secondary">
                    <ClockCircleOutlined />{' '}
                    {model.profile?.updatedAt
                      ? new Date(model.profile.updatedAt).toLocaleDateString()
                      : '-'}
                  </Text>
                </div>
              </div>
            </Card>

            <Card className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <div className={styles.summaryIcon}>
                  <TeamOutlined />
                </div>
                <div className={styles.summaryMeta}>
                  <Text type="secondary">联系与组织</Text>
                  <div className={styles.summaryTitle}>{departmentName}</div>
                </div>
              </div>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>部门</span>
                  <Text type="secondary">{departmentName}</Text>
                </div>
                <div className={styles.summaryRow}>
                  <span>岗位</span>
                  <Text type="secondary">{positionName}</Text>
                </div>
                <div className={styles.summaryRow}>
                  <span>维护</span>
                  <Text type="secondary">基础资料由系统维护</Text>
                </div>
              </div>
            </Card>
          </section>
        </section>

        <main className={styles.profileMain}>
          <Card className={styles.tabsCard}>
            <Tabs
              className={styles.responsiveTabs}
              defaultActiveKey="profile"
              items={tabItems}
            />
          </Card>
        </main>
      </div>
    </PageContainer>
  );
}
