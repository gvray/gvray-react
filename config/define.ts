import env from './env';

export default {
  __APP_ENV__: process.env.APP_ENV,
  __APP_API_URL__: process.env.APP_API_URL,
  __APP_API_ORIGIN__: process.env.APP_API_ORIGIN || '',
  __APP_API_TOKEN_KEY__: process.env.APP_API_TOKEN_KEY,
  __APP_API_TIMEOUT__: parseInt(process.env.APP_API_TIMEOUT || ''),
  __APP_VERSION__: process.env.APP_VERSION,
  __APP_BUILD_TIME__: process.env.APP_BUILD_TIME,
  __APP_CDN_URL__: process.env.APP_CDN_URL,
  __APP_SENTRY_DSN__: process.env.APP_SENTRY_DSN,
  __APP_TRACKING_ID__: process.env.APP_TRACKING_ID,
  __APP_MOCK_ENABLED__: Boolean(process.env.APP_MOCK_ENABLED),
  __APP_LOGGING_ENABLED__:
    process.env.APP_LOGGING_ENABLED !== undefined
      ? process.env.APP_LOGGING_ENABLED === 'true'
      : process.env.APP_ENV !== 'prod',
  __APP_DEFAULT_LANGUAGE__: process.env.APP_DEFAULT_LANGUAGE || 'zh-CN',
  __APP_DEFAULT_AVATAR_URL__: process.env.APP_DEFAULT_AVATAR_URL || '',
  __APP_AES_KEY__: process.env.APP_AES_KEY || '',
  __APP_AES_IV__: process.env.APP_AES_IV || '',
  ...env,
};
