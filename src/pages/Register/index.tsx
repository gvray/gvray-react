import { LOGIN_PATH } from '@/constants';
import LoginBg from '@/pages/Login/components/LoginBg';
import { register } from '@/services/auth';
import { runtimeConfig } from '@/utils/runtime-config';
import {
  LockOutlined,
  MailOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'umi';
import styles from './index.less';

const formItemLayout = {
  labelCol: { sm: { span: 5 } },
  wrapperCol: { sm: { span: 19 } },
};

const RegisterPage: React.FC = () => {
  const { system, feature } = runtimeConfig.get();
  const siteName = system.name;
  const registerEnabled = feature.register;
  const [isRegistering, setRegistering] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (!registerEnabled) {
      navigate(LOGIN_PATH, { replace: true });
    }
  }, [registerEnabled, navigate]);

  const handleSubmit = async (values: any) => {
    setRegistering(true);
    try {
      const res = await register({
        username: values.username,
        nickname: values.nickname,
        email: values.email,
        password: values.password,
      });
      message.success(res.message || '注册成功');
      navigate(LOGIN_PATH);
    } catch (error: any) {
      message.error(error?.message || '注册失败');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className={styles.page}>
      <LoginBg title={siteName}>
        <div className={styles.content}>
          <div className={styles.title}>创建新账号</div>
          <Form
            {...formItemLayout}
            form={form}
            name="register"
            size="large"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              label="用户名"
              colon={false}
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少 3 位' },
                { max: 32, message: '用户名最多 32 位' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="nickname"
              label="昵　称"
              colon={false}
              rules={[
                { required: true, message: '请输入昵称' },
                { max: 32, message: '昵称最多 32 位' },
              ]}
            >
              <Input
                prefix={<SmileOutlined className="site-form-item-icon" />}
                placeholder="昵称"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮　箱"
              colon={false}
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="邮箱（可选）"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密　码"
              colon={false}
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少 6 位' },
                { max: 32, message: '密码最多 32 位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              colon={false}
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="确认密码"
              />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isRegistering}
              >
                {isRegistering ? '注册中...' : '注册'}
              </Button>
            </Form.Item>

            <div className={styles.footer}>
              已有账号？<a onClick={() => navigate(LOGIN_PATH)}>去登录</a>
            </div>
          </Form>
        </div>
      </LoginBg>
    </div>
  );
};

export default RegisterPage;
