import { LOGIN_PATH } from '@/constants';
import { changePassword } from '@/services/profile';
import { useAuthStore } from '@/stores';
import { logger, tokenManager } from '@/utils';
import {
  ApiOutlined,
  ChromeOutlined,
  CopyOutlined,
  DeleteOutlined,
  DesktopOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  KeyOutlined,
  LockOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Progress,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { history } from 'umi';
import styles from './index.less';

const { Text } = Typography;

// ─── Mock Data ──────────────────────────────────────────

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  loginTime: string;
  current: boolean;
}

const MOCK_SESSIONS: SessionItem[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome 120',
    ip: '192.168.1.100',
    location: '上海',
    loginTime: '2025-02-07 21:30:00',
    current: true,
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari 17',
    ip: '10.0.0.55',
    location: '上海',
    loginTime: '2025-02-07 18:15:00',
    current: false,
  },
  {
    id: '3',
    device: 'Windows PC',
    browser: 'Edge 121',
    ip: '172.16.0.22',
    location: '北京',
    loginTime: '2025-02-06 09:00:00',
    current: false,
  },
];

interface TokenItem {
  id: string;
  name: string;
  scope: string;
  createdAt: string;
  expiresAt: string;
}

const MOCK_TOKENS: TokenItem[] = [
  {
    id: '1',
    name: 'CI/CD Pipeline',
    scope: 'read, write',
    createdAt: '2025-01-15',
    expiresAt: '2025-07-15',
  },
  {
    id: '2',
    name: 'Monitoring Script',
    scope: 'read',
    createdAt: '2025-02-01',
    expiresAt: '2025-08-01',
  },
];

// ─── Component ──────────────────────────────────────────

const TabSecurity: React.FC = () => {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [tokens, setTokens] = useState(MOCK_TOKENS);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleKickSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    message.success('已踢出该设备');
  };

  const handleDeleteToken = (id: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
    message.success('Token 已删除');
  };

  const handleChangePassword = async (values: API.ChangePasswordDto) => {
    try {
      setPasswordLoading(true);
      const res = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success(res.message || '密码修改成功，请重新登录');
      passwordForm.resetFields();
      tokenManager.clearTokens();
      clearAuth();
      history.push(LOGIN_PATH);
    } catch (error) {
      logger.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─── Card 1: Password Security ────────────────────────
  const PasswordCard = () => (
    <Card
      title={
        <>
          <KeyOutlined /> 密码安全
        </>
      }
      className={styles.moduleCard}
      size="small"
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">当前密码强度：</Text>
        <Text strong className={styles.strengthStrong}>
          强
        </Text>
        <Progress percent={85} showInfo={false} style={{ marginTop: 8 }} />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            上次修改时间：2025-01-20 14:30
          </Text>
        </div>
      </div>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handleChangePassword}
      >
        <Form.Item
          name="oldPassword"
          label="原密码"
          rules={[{ required: true, message: '请输入原密码' }]}
        >
          <Input.Password
            placeholder="请输入原密码"
            iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度至少8位' },
          ]}
        >
          <Input.Password
            placeholder="请输入新密码（至少8位）"
            iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value)
                  return Promise.resolve();
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="请再次输入新密码"
            iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={passwordLoading}
            block
          >
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // ─── Card 2: Login Security ───────────────────────────
  const LoginSecurityCard = () => (
    <Card
      title={
        <>
          <LockOutlined /> 登录安全
        </>
      }
      className={styles.moduleCard}
      size="small"
    >
      <List
        dataSource={[
          {
            title: '二步验证',
            desc: '使用验证器 App 进行二次验证',
            status: false,
          },
          {
            title: '短信验证',
            desc: '登录时发送短信验证码',
            status: true,
          },
          {
            title: '异地登录提醒',
            desc: '检测到异地登录时发送通知',
            status: true,
          },
          {
            title: '登录保护',
            desc: '连续失败后锁定账号',
            status: true,
          },
        ]}
        renderItem={(item) => (
          <List.Item
            actions={[<Switch key="sw" defaultChecked={item.status} />]}
          >
            <List.Item.Meta
              avatar={
                <SafetyCertificateOutlined
                  style={{
                    color: item.status ? '#52c41a' : '#d9d9d9',
                    fontSize: 18,
                  }}
                />
              }
              title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
              description={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.desc}
                </Text>
              }
            />
          </List.Item>
        )}
      />
      <Button type="dashed" block style={{ marginTop: 12 }}>
        绑定验证器
      </Button>
    </Card>
  );

  // ─── Card 3: Session Management ───────────────────────
  const sessionColumns: ColumnsType<SessionItem> = [
    {
      title: '设备',
      dataIndex: 'device',
      render: (text: string, record) => (
        <Space size={8}>
          {record.device.includes('iPhone') ||
          record.device.includes('Android') ? (
            <MobileOutlined
              style={{ fontSize: 18, color: 'rgba(0,0,0,0.25)' }}
            />
          ) : record.device.includes('Mac') ? (
            <DesktopOutlined
              style={{ fontSize: 18, color: 'rgba(0,0,0,0.25)' }}
            />
          ) : (
            <ChromeOutlined
              style={{ fontSize: 18, color: 'rgba(0,0,0,0.25)' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>
              {text}{' '}
              {record.current && (
                <Tag color="blue" style={{ marginLeft: 4 }}>
                  当前
                </Tag>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              {record.browser}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'IP / 地点',
      render: (_: unknown, record) => (
        <>
          <div>{record.ip}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.location}
          </Text>
        </>
      ),
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      width: 180,
    },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record) =>
        record.current ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            当前设备
          </Text>
        ) : (
          <Button
            type="link"
            danger
            onClick={() => handleKickSession(record.id)}
          >
            踢出
          </Button>
        ),
    },
  ];

  const SessionCard = () => (
    <Card
      title={
        <>
          <DesktopOutlined /> 会话管理
        </>
      }
      className={styles.moduleCard}
      size="small"
    >
      <Table
        columns={sessionColumns}
        dataSource={sessions}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );

  // ─── Card 4: API Token ────────────────────────────────
  const tokenColumns: ColumnsType<TokenItem> = [
    {
      title: 'Token 名称',
      dataIndex: 'name',
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: '权限范围',
      dataIndex: 'scope',
      render: (s: string) => <Tag>{s}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 120 },
    { title: '过期时间', dataIndex: 'expiresAt', width: 120 },
    {
      title: '操作',
      width: 100,
      render: (_: unknown, record) => (
        <Space>
          <Tooltip title="复制 Token">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => message.success('Token 已复制')}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteToken(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const TokenCard = () => (
    <Card
      title={
        <>
          <ApiOutlined /> API Token
        </>
      }
      className={styles.moduleCard}
      size="small"
      extra={<Button type="primary">创建 Token</Button>}
    >
      <Table
        columns={tokenColumns}
        dataSource={tokens}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );

  return (
    <div className={styles.securityGrid}>
      <div>
        <PasswordCard />
        <div style={{ height: 16 }} />
        <SessionCard />
      </div>
      <div>
        <LoginSecurityCard />
        <div style={{ height: 16 }} />
        <TokenCard />
      </div>
    </div>
  );
};

export default TabSecurity;
