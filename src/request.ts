import { createClient } from '@gvray/request';
import { httpConfig } from './httpConfig';
import { refreshToken } from './services/auth';
import { tokenManager } from './utils';

// 创建并初始化请求客户端
const client = createClient({
  timeout: __APP_API_TIMEOUT__,
  baseURL: __APP_API_URL__,
  errorConfig: httpConfig.errorConfig,
  requestInterceptors: httpConfig.requestInterceptors,
  responseInterceptors: httpConfig.responseInterceptors,
  preset: {
    bearerAuth: {
      getToken: () => Promise.resolve(tokenManager.getAccessToken()),
    },
    requestAuthRefresh: {
      getToken: () => Promise.resolve(tokenManager.getAccessToken()), // null = expired
      refreshToken: async () => {
        const token = tokenManager.getRefreshToken();
        if (!token) {
          return null; // 无 refresh token，无法刷新，需重新登录
        }
        const res = await refreshToken({ refreshToken: token });
        const { access_token, refresh_token } = res.data;
        tokenManager.setRefreshToken(refresh_token);
        return access_token;
      },
      setToken: (token) => tokenManager.setAccessToken(token),
      exclude: ['/auth/login', '/auth/refresh'],
    },
    logging: true, // 开启请求日志，生产环境建议关闭
  },
});

// 导出客户端实例，确保模块被正确加载
export default client;
