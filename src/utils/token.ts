import storetify from 'storetify';

// 从环境变量获取 token key
export const ACCESS_TOKEN_KEY = `${__APP_API_TOKEN_KEY__}_access`;
const REFRESH_TOKEN_KEY = `${__APP_API_TOKEN_KEY__}_refresh`;
const APP_API_TIMEOUT =
  (__APP_API_TIMEOUT__ ? __APP_API_TIMEOUT__ : 60000) / 1000; // 秒
const BUFFER_TIME = APP_API_TIMEOUT + 5; // 5 秒缓冲时间

/**
 * Token 管理工具
 */
export const tokenManager = {
  /**
   * 设置 access token 和过期时间
   */
  setAccessToken(token: string, expiresIn: number) {
    const adjustedExpiresIn =
      expiresIn && expiresIn > BUFFER_TIME
        ? expiresIn - BUFFER_TIME
        : expiresIn;
    storetify.set(ACCESS_TOKEN_KEY, token, adjustedExpiresIn);
  },

  /**
   * 获取 access token
   */
  getAccessToken(): string | null {
    const token = storetify.get(ACCESS_TOKEN_KEY);
    return typeof token === 'string' ? token : null;
  },

  /**
   * 检查 access token 是否过期
   */
  isAccessTokenExpired(): boolean {
    return this.getAccessToken() === null;
  },

  /**
   * 设置 refresh token 和过期时间
   */
  setRefreshToken(token: string, expiresIn: number) {
    const adjustedExpiresIn =
      expiresIn && expiresIn > BUFFER_TIME
        ? expiresIn - BUFFER_TIME
        : expiresIn;
    storetify.set(REFRESH_TOKEN_KEY, token, adjustedExpiresIn);
  },

  /**
   * 获取 refresh token
   */
  getRefreshToken(): string | null {
    const token = storetify.get(REFRESH_TOKEN_KEY);
    return typeof token === 'string' ? token : null;
  },

  /**
   * 检查 refresh token 是否过期
   */
  isRefreshTokenExpired(): boolean {
    return this.getRefreshToken() === null;
  },

  /**
   * 同时设置 access token 和 refresh token（后端登录返回）
   */
  setTokens(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
  ) {
    this.setAccessToken(accessToken, accessTokenExpiresIn);
    this.setRefreshToken(refreshToken, refreshTokenExpiresIn);
  },

  /**
   * 检查是否已登录（有 access token 或 refresh token 且未过期）
   * 只要 refresh token 还在，就可以通过刷新接口续期 access token
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null || this.getRefreshToken() !== null;
  },

  /**
   * 清除所有 token
   */
  clearTokens() {
    storetify.remove(ACCESS_TOKEN_KEY);
    storetify.remove(REFRESH_TOKEN_KEY);
  },
};
