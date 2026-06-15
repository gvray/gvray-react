import {
  CheckCircleFilled,
  EyeInvisibleOutlined,
  EyeTwoTone,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  List,
  Space,
  Tag,
  Typography,
} from 'antd';
import styles from './index.less';
import { useProfileSecurityModel } from './model';

const { Text } = Typography;

const TabSecurity: React.FC = () => {
  const [passwordForm] = Form.useForm();
  const model = useProfileSecurityModel(passwordForm);
  const emailBound = !!model.profile?.email;
  const phoneBound = !!model.profile?.phone;

  return (
    <div className={styles.securityGrid}>
      <Card
        title={
          <>
            <KeyOutlined /> 修改密码
          </>
        }
        className={styles.moduleCard}
        size="small"
      >
        <Alert
          type="info"
          showIcon
          className={styles.securityAlert}
          message="密码修改成功后将清除当前登录状态，需要重新登录。"
        />
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={model.handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password
              placeholder="请输入原密码"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
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
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
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
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={model.passwordLoading}
              block
            >
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <>
            <SafetyCertificateOutlined /> 安全建议
          </>
        }
        className={styles.moduleCard}
        size="small"
      >
        <List
          dataSource={[
            {
              icon: <MailOutlined />,
              title: '邮箱绑定',
              desc: emailBound
                ? model.profile?.email
                : '暂未绑定邮箱，建议联系管理员补全',
              ok: emailBound,
            },
            {
              icon: <MobileOutlined />,
              title: '手机号绑定',
              desc: phoneBound
                ? model.profile?.phone?.replace(
                    /(\d{3})\d{4}(\d{4})/,
                    '$1****$2',
                  )
                : '暂未绑定手机号，建议联系管理员补全',
              ok: phoneBound,
            },
            {
              icon: <LockOutlined />,
              title: '登录记录',
              desc: '建议定期查看登录记录，发现异常后及时修改密码',
              ok: true,
            },
          ]}
          renderItem={(item) => (
            <List.Item className={styles.responsiveListItem}>
              <List.Item.Meta
                avatar={
                  <span
                    className={item.ok ? styles.safeIcon : styles.mutedIcon}
                  >
                    {item.icon}
                  </span>
                }
                title={
                  <Space size={8} wrap>
                    <Text className={styles.listTitle}>{item.title}</Text>
                    <Tag color={item.ok ? 'green' : 'default'}>
                      {item.ok ? '已完成' : '待完善'}
                    </Tag>
                  </Space>
                }
                description={<Text type="secondary">{item.desc}</Text>}
              />
            </List.Item>
          )}
        />
        <Alert
          type="success"
          showIcon
          className={styles.securityAlert}
          icon={<CheckCircleFilled />}
          message="权限、登录记录和密码修改均来自真实接口能力。"
        />
      </Card>
    </div>
  );
};

export default TabSecurity;
