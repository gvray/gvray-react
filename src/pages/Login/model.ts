import { login } from '@/services/auth';
import { decrypt, encrypt, loadAuthData, tokenManager } from '@/utils';
import { useCallback, useEffect, useState } from 'react';
import storetify from 'storetify';

export type LoginTab = 'account' | 'phone';

export interface RememberData {
  account?: string;
  password?: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  message?: string;
}

export function useLoginModel() {
  const [activeTab, setActiveTab] = useState<LoginTab>('account');
  const [isLogging, setIsLogging] = useState(false);
  const [countdown, setCountdown] = useState(0);

  /* ---------- 倒计时 ---------- */
  const startCountdown = useCallback((seconds = 60) => {
    setCountdown(seconds);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  /* ---------- 记住密码 ---------- */
  const loadRemember = useCallback((): RememberData | undefined => {
    const { account, password, rememberMe } =
      (storetify('rememberMe') as any) || {};
    if (!account) return undefined;
    return {
      account,
      password: password ? decrypt(password) : undefined,
      rememberMe: Boolean(rememberMe),
    };
  }, []);

  const saveRemember = useCallback(
    (values: { account: string; password: string; rememberMe: boolean }) => {
      storetify(
        'rememberMe',
        {
          account: values.account,
          password: encrypt(values.password),
          rememberMe: values.rememberMe,
        },
        60 * 60 * 24 * 30,
      );
    },
    [],
  );

  const clearRemember = useCallback(() => {
    storetify('rememberMe', undefined);
  }, []);

  /* ---------- 账号登录 ---------- */
  const loginByAccount = useCallback(
    async (values: any): Promise<LoginResult> => {
      setIsLogging(true);

      if (values.rememberMe) {
        saveRemember({
          account: values.account,
          password: values.password,
          rememberMe: values.rememberMe,
        });
      } else {
        clearRemember();
      }

      try {
        const res = await login({ ...values, rememberMe: undefined });
        tokenManager.setTokens(
          res.data.access_token,
          res.data.refresh_token,
          res.data.access_token_expires_in,
          res.data.refresh_token_expires_in,
        );

        const ok = await loadAuthData();
        if (!ok) {
          return { success: false, message: '获取用户信息失败，请重试' };
        }

        return { success: true, message: res.message };
      } catch (error: any) {
        tokenManager.clearTokens();
        return {
          success: false,
          message: error?.details?.status === 401 ? error.message : undefined,
        };
      } finally {
        setIsLogging(false);
      }
    },
    [saveRemember, clearRemember],
  );

  /* ---------- 手机号登录 ---------- */
  const loginByPhone = useCallback(
    async (values: any): Promise<LoginResult> => {
      // TODO: 手机号登录功能开发中
      console.log('手机号登录:', values);
      return { success: false };
    },
    [],
  );

  return {
    activeTab,
    setActiveTab,
    isLogging,
    countdown,
    startCountdown,
    loadRemember,
    loginByAccount,
    loginByPhone,
  };
}
