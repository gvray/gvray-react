import { PageContainer } from '@/components';
import { useAuthStore } from '@/stores';
import {
  BellOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ExclamationCircleFilled,
  HistoryOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Progress,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import dayjs from 'dayjs';
import { styled } from 'umi';
import styles from './index.less';
import TabLoginLog from './TabLoginLog';
import TabNotifications from './TabNotifications';
import TabPermissions from './TabPermissions';
import TabPreferences from './TabPreferences';
import TabProfile from './TabProfile';
import TabSecurity from './TabSecurity';

const { Title, Text } = Typography;

// ─── Styled helpers ─────────────────────────────────────

const FlexLayout = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const PanelCard = styled(Card)`
  border-radius: 16px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

// ─── Component ──────────────────────────────────────────

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);

  const handleAvatarChange = (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功！');
    }
  };

  // ─── Completeness ─────────────────────────────────────
  const completenessChecks = [
    { label: '设置头像', done: !!profile?.avatar, icon: <CameraOutlined /> },
    { label: '绑定邮箱', done: !!profile?.email, icon: <MailOutlined /> },
    { label: '绑定手机', done: !!profile?.phone, icon: <PhoneOutlined /> },
    { label: '设置昵称', done: !!profile?.nickname, icon: <IdcardOutlined /> },
    { label: '安全设置', done: true, icon: <SafetyCertificateOutlined /> },
  ];
  const doneCount = completenessChecks.filter((c) => c.done).length;
  const completenessPercent = Math.round(
    (doneCount / completenessChecks.length) * 100,
  );

  // ─── Stats ────────────────────────────────────────────
  const roleCount = profile?.roles?.length ?? 0;
  const daysSinceJoin = profile?.createdAt
    ? dayjs().diff(dayjs(profile.createdAt), 'day')
    : 0;

  // ─── Tab items ────────────────────────────────────────
  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> 基本信息
        </span>
      ),
      children: <TabProfile profile={profile} />,
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined /> 安全中心
        </span>
      ),
      children: <TabSecurity />,
    },
    {
      key: 'permissions',
      label: (
        <span>
          <SafetyCertificateOutlined /> 我的权限
        </span>
      ),
      children: <TabPermissions />,
    },
    {
      key: 'preferences',
      label: (
        <span>
          <SettingOutlined /> 系统偏好
        </span>
      ),
      children: <TabPreferences />,
    },
    {
      key: 'loginLog',
      label: (
        <span>
          <HistoryOutlined /> 登录记录
        </span>
      ),
      children: <TabLoginLog />,
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> 消息通知
        </span>
      ),
      children: <TabNotifications />,
    },
  ];

  const isOnline = profile?.status === 1;

  return (
    <PageContainer className={styles.profilePage}>
      <FlexLayout className="profile-flex">
        <PanelCard className={styles.leftPanel}>
          {/* ── Avatar Hero ── */}
          <div className={styles.avatarHero}>
            <div className={styles.heroBg} />
            <div className={styles.avatarWrap}>
              <Avatar
                size={96}
                src={
                  profile?.avatar ||
                  'https://api.dicebear.com/9.x/bottts/svg?seed=GavinRay'
                }
                icon={<UserOutlined />}
                className={styles.avatarRing}
              />
              <div
                className={styles.onlineDot}
                style={{ background: isOnline ? '#52c41a' : '#d9d9d9' }}
              />
              <div className={styles.avatarUploadBtn}>
                <Upload showUploadList={false} onChange={handleAvatarChange}>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                  />
                </Upload>
              </div>
            </div>
            <div className={styles.nameRow}>
              <Title level={4} className={styles.userName}>
                {profile?.nickname || profile?.username || '用户名'}
              </Title>
              <Text className={styles.userBio}>
                专注于系统管理和用户体验优化
              </Text>
              <div className={styles.roleTags}>
                {profile?.roles?.map((r) => (
                  <Tooltip key={r.roleId} title={r.description || r.name}>
                    <Tag color="blue">{r.description || r.name}</Tag>
                  </Tooltip>
                ))}
                <Tag color={isOnline ? 'green' : 'default'}>
                  {isOnline ? '在线' : '离线'}
                </Tag>
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{roleCount}</div>
              <div className={styles.statLabel}>角色</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{daysSinceJoin}</div>
              <div className={styles.statLabel}>在职天数</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{completenessPercent}%</div>
              <div className={styles.statLabel}>完善度</div>
            </div>
          </div>

          <div className={styles.sectionDivider} />

          {/* ── Info Section ── */}
          <div className={styles.infoSection}>
            <div className={styles.infoSectionTitle}>联系信息</div>
            <div className={styles.infoRow}>
              <MailOutlined className={styles.infoIcon} />
              <span className={styles.infoLabel}>邮箱</span>
              <span className={styles.infoValue}>
                {profile?.email || '未绑定'}
                {profile?.email ? (
                  <CheckCircleFilled
                    style={{ color: '#52c41a', marginLeft: 6, fontSize: 12 }}
                  />
                ) : (
                  <ExclamationCircleFilled
                    style={{ color: '#faad14', marginLeft: 6, fontSize: 12 }}
                  />
                )}
              </span>
            </div>
            <div className={styles.infoRow}>
              <PhoneOutlined className={styles.infoIcon} />
              <span className={styles.infoLabel}>手机</span>
              <span className={styles.infoValue}>
                {profile?.phone || '未绑定'}
                {profile?.phone ? (
                  <CheckCircleFilled
                    style={{ color: '#52c41a', marginLeft: 6, fontSize: 12 }}
                  />
                ) : (
                  <ExclamationCircleFilled
                    style={{ color: '#faad14', marginLeft: 6, fontSize: 12 }}
                  />
                )}
              </span>
            </div>
            <div className={styles.infoRow}>
              <TeamOutlined className={styles.infoIcon} />
              <span className={styles.infoLabel}>部门</span>
              <span className={styles.infoValue}>
                {profile?.department?.name || '未设置'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <UserOutlined className={styles.infoIcon} />
              <span className={styles.infoLabel}>岗位</span>
              <span className={styles.infoValue}>
                {profile?.positions?.[0]?.name || '未设置'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <CalendarOutlined className={styles.infoIcon} />
              <span className={styles.infoLabel}>注册</span>
              <span className={styles.infoValue}>
                {profile?.createdAt
                  ? dayjs(profile.createdAt).format('YYYY-MM-DD')
                  : '-'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <ClockCircleOutlined className={styles.infoIcon} />
              <span className={styles.infoLabel}>最近登录</span>
              <span className={styles.infoValue}>
                {profile?.updatedAt
                  ? dayjs(profile.updatedAt).format('YYYY-MM-DD')
                  : '-'}
              </span>
            </div>
          </div>

          <div className={styles.sectionDivider} />

          {/* ── Completeness ── */}
          <div className={styles.completenessSection}>
            <div className={styles.completenessHeader}>
              <span>资料完善度</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {doneCount}/{completenessChecks.length}
              </Text>
            </div>
            <Progress
              percent={completenessPercent}
              strokeColor={{ from: '#667eea', to: '#764ba2' }}
            />
            <div className={styles.completenessItems}>
              {completenessChecks.map((item) => (
                <div key={item.label} className={styles.completenessItem}>
                  <span
                    className={styles.itemIcon}
                    style={{
                      color: item.done ? '#52c41a' : 'rgba(0,0,0,0.25)',
                    }}
                  >
                    {item.done ? <CheckCircleFilled /> : item.icon}
                  </span>
                  <span className={styles.itemLabel}>{item.label}</span>
                  {item.done ? (
                    <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                      已完成
                    </Tag>
                  ) : (
                    <Tag style={{ margin: 0, fontSize: 11 }}>待完善</Tag>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PanelCard>
        <PanelCard className={styles.rightPanel}>
          <Tabs defaultActiveKey="profile" items={tabItems} />
        </PanelCard>
      </FlexLayout>
    </PageContainer>
  );
}
