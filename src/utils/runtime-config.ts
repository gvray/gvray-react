import {
  DEFAULT_RUNTIME_CONFIG,
  type AppRuntimeConfig,
  type AppRuntimeUiConfig,
} from '@/constants/runtime-settings';

/**
 * 运行时配置单例。
 *
 * 数据在应用启动时（getInitialState）通过 API 获取一次，
 * 登录成功后（loadInitData）可能刷新一次。
 * 由于运行时配置在会话期间不会变，不放进 reactive store，
 * 组件/工具函数直接读取即可（getInitialState 阻塞渲染，确保挂载时已就绪）。
 */
/** 把后端返回的 ui 字段名做标准化：defaultXxxYyy → xxxYyy */
function normalizeUi(raw: unknown): Partial<AppRuntimeUiConfig> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const targetKey = key.startsWith('default')
      ? key.replace(/^default/, '').replace(/^[A-Z]/, (c) => c.toLowerCase())
      : key;
    result[targetKey] = value;
  }
  return result as Partial<AppRuntimeUiConfig>;
}

class RuntimeConfig {
  private _config: AppRuntimeConfig = { ...DEFAULT_RUNTIME_CONFIG };

  set(raw: Record<string, unknown> | undefined) {
    if (!raw) {
      this._config = { ...DEFAULT_RUNTIME_CONFIG };
      return;
    }
    const merge = <T extends object>(a: T, b: unknown): T => ({
      ...a,
      ...((b as Partial<T>) || {}),
    });
    this._config = {
      ...DEFAULT_RUNTIME_CONFIG,
      ...(raw as Partial<AppRuntimeConfig>),
      feature: merge(DEFAULT_RUNTIME_CONFIG.feature, raw.feature),
      oauth: merge(DEFAULT_RUNTIME_CONFIG.oauth, raw.oauth),
      security: merge(DEFAULT_RUNTIME_CONFIG.security, raw.security),
      storage: merge(DEFAULT_RUNTIME_CONFIG.storage, raw.storage),
      system: merge(DEFAULT_RUNTIME_CONFIG.system, raw.system),
      ui: merge(DEFAULT_RUNTIME_CONFIG.ui, normalizeUi(raw.ui)),
      user: merge(DEFAULT_RUNTIME_CONFIG.user, raw.user),
    };
  }

  get(): Readonly<AppRuntimeConfig> {
    return this._config;
  }
}

export const runtimeConfig = new RuntimeConfig();
