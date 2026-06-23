import { uiToPreferences } from '@/constants/settings';
import { login, queryMe, queryMenus } from '@/services/auth';
import { getDictionaryItemsByTypeCodes } from '@/services/dictionary';
import { getRuntimeConfig } from '@/services/system';
import { useAuthStore, useDictStore, useSettingStore } from '@/stores';
import { decrypt, encrypt, logger, tokenManager } from '@/utils';
import { runtimeConfig } from '@/utils/runtime-config';
import {
  AlipayCircleFilled,
  GithubFilled,
  LockOutlined,
  UserOutlined,
  WechatFilled,
} from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import storetify from 'storetify';
import { FormattedMessage, useNavigate, useSearchParams } from 'umi';
import LoginBg from './components/LoginBg';
import styles from './index.less';

const formItemLayout = {
  labelCol: {
    sm: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 20 },
  },
};

const LoginPage: React.FC = () => {
  const { system, feature } = runtimeConfig.get();
  const siteName = system.name;
  const registerEnabled = feature.register;
  const [isLogging, setLogging] = useState(false);

  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const loadInitData = async () => {
    let runtimeConfigData: Record<string, unknown> | undefined;
    try {
      const res = await getRuntimeConfig();
      runtimeConfigData = res.data;
    } catch (error) {
      logger.error(error);
    }
    const [meRes, menusRes] = await Promise.all([
      queryMe({ skipErrorHandler: true }).catch(() => undefined),
      queryMenus().catch(() => undefined),
    ]);
    const me = meRes?.data;
    const menus = menusRes?.data;

    // 运行时配置 → 单例
    runtimeConfig.set(runtimeConfigData);

    // 初始化 preferences：runtime.ui → me.preferences
    useSettingStore.setState({
      ...uiToPreferences(runtimeConfig.get().ui),
      ...(me?.preferences || {}),
    });

    if (me) {
      useAuthStore.getState().setAuth(me, menus);
    }
  };

  const handleSubmit = async (values: any) => {
    setLogging(true);
    if (values.rememberMe) {
      const { account, password, rememberMe } = values;
      storetify(
        'rememberMe',
        {
          account,
          password: encrypt(password),
          rememberMe,
        },
        60 * 60 * 24 * 30,
      );
    } else {
      storetify('rememberMe', undefined);
    }
    try {
      const res = await login({ ...values, rememberMe: undefined });
      tokenManager.setTokens(
        res.data.access_token,
        res.data.refresh_token,
        res.data.access_token_expires_in,
        res.data.refresh_token_expires_in,
      );
      await loadInitData();

      // 预加载常用字典到全局缓存
      try {
        if (!useDictStore.getState().getDict('common_status')) {
          const dictRes = await getDictionaryItemsByTypeCodes({
            typeCodes: 'common_status',
          });
          if (dictRes.data?.common_status) {
            useDictStore
              .getState()
              .setDict('common_status', dictRes.data.common_status);
          }
        }
      } catch (error) {
        logger.error('预加载 common_status 字典失败', error);
      }

      message.success(res.message);

      // 获取 redirect 参数，登录后跳转回原页面
      const redirect = searchParams.get('redirect');
      // 安全验证：只允许内部路径，防止开放重定向漏洞
      const safeRedirect =
        redirect && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : '/';
      navigate(safeRedirect);
    } catch (error: any) {
      tokenManager.clearTokens();
      // Request 401 no message
      if (error?.details?.status === 401) {
        message.error(error.message);
      }
    } finally {
      setLogging(false);
    }
  };
  const loadRemember = () => {
    const { account, password, rememberMe } =
      (storetify('rememberMe') as any) || {};
    const values = form.getFieldsValue(['account', 'password', 'rememberMe']);
    const loginForm = {
      account: account === undefined ? values.account : account,
      password: password === undefined ? values.password : decrypt(password),
      rememberMe:
        rememberMe === undefined ? values.rememberMe : Boolean(rememberMe),
    };
    form.setFieldsValue(loginForm);
  };
  useEffect(() => {
    loadRemember();
  }, []);

  return (
    <div className={styles.page}>
      <LoginBg title={siteName}>
        <div className={styles.content}>
          <div className={styles.title}>欢迎开启新世界</div>
          <Form
            {...formItemLayout}
            form={form}
            name="login"
            size="large"
            initialValues={{ rememberMe: true }}
            onFinish={async (values) => {
              await handleSubmit(values);
            }}
          >
            <Form.Item
              name="account"
              label={<span>用户名</span>}
              colon={false}
              rules={[
                { required: true, message: '请您输入手机号/用户名/邮箱' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="手机号/用户名/邮箱"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="密　码"
              colon={false}
              rules={[{ required: true, message: '请您输入密码' }]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: '5px' }}>
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox>
                  <FormattedMessage id={'pages.login.rememberMe'} />
                </Checkbox>
              </Form.Item>
            </Form.Item>

            <Form.Item wrapperCol={{ span: 24 }}>
              <Button type="primary" htmlType="submit" block>
                {isLogging ? (
                  <FormattedMessage id={'pages.login.logging'} />
                ) : (
                  <FormattedMessage id={'pages.login.login'} />
                )}
              </Button>
            </Form.Item>

            {registerEnabled && (
              <div
                style={{ textAlign: 'center', marginBottom: 16, fontSize: 14 }}
              >
                还没有账号？
                <a onClick={() => navigate('/register')}>立即注册</a>
              </div>
            )}
          </Form>
          <Space size={20} style={{ fontSize: '28px', color: '#888' }}>
            <span style={{ fontSize: '14px' }}>第三方账号登录</span>
            <GithubFilled />
            <AlipayCircleFilled />
            <WechatFilled />
          </Space>
        </div>
      </LoginBg>
    </div>
  );
};

export default LoginPage;
