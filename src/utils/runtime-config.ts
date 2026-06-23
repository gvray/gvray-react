import { DEFAULT_SERVER_CONFIG, type ServerConfig } from '@/constants/settings';

/**
 * 运行时配置单例。
 *
 * 数据在应用启动时（getInitialState）通过 API 获取一次，
 * 登录成功后（loadInitData）可能刷新一次。
 * 由于运行时配置在会话期间不会变，不放进 reactive store，
 * 组件/工具函数直接读取即可（getInitialState 阻塞渲染，确保挂载时已就绪）。
 */
class RuntimeConfig {
  private _config: ServerConfig = { ...DEFAULT_SERVER_CONFIG };

  set(raw: Record<string, unknown> | undefined) {
    if (!raw) {
      this._config = { ...DEFAULT_SERVER_CONFIG };
      return;
    }
    const merge = <T extends object>(a: T, b: unknown): T => ({
      ...a,
      ...((b as Partial<T>) || {}),
    });
    this._config = {
      ...DEFAULT_SERVER_CONFIG,
      ...(raw as Partial<ServerConfig>),
      feature: merge(DEFAULT_SERVER_CONFIG.feature, raw.feature),
      oauth: merge(DEFAULT_SERVER_CONFIG.oauth, raw.oauth),
      security: merge(DEFAULT_SERVER_CONFIG.security, raw.security),
      storage: merge(DEFAULT_SERVER_CONFIG.storage, raw.storage),
      system: merge(DEFAULT_SERVER_CONFIG.system, raw.system),
      ui: merge(DEFAULT_SERVER_CONFIG.ui, raw.ui),
      user: merge(DEFAULT_SERVER_CONFIG.user, raw.user),
    };
  }

  get(): Readonly<ServerConfig> {
    return this._config;
  }
}

export const runtimeConfig = new RuntimeConfig();
