/**
 * 服务端运行时配置
 *
 * 数据来源：GET /system/runtime-config（无需登录即可获取）
 * 运营 / 管理员在后台配置的全局参数，前端只读、不持久化。
 */

// ─── 子类型 ─────────────────────────────────────────────

export interface SystemInfo {
  name: string;
  description: string;
  logo: string;
  favicon: string;
  defaultAvatar: string;
}

export interface EnvInfo {
  mode: string;
  apiPrefix: string;
}

export interface UiDefaults {
  theme: string;
  language: string;
  timezone: string;
  sidebarCollapsed: boolean;
  pageSize: number;
  welcomeMessage: string;
  showBreadcrumb: boolean;
}

export interface SecurityPolicy {
  watermarkEnabled: boolean;
  passwordMinLength: number;
  passwordRequireComplexity: boolean;
  loginFailureLockCount: number;
}

export interface Features {
  register: boolean;
  fileUploadMaxSize: number;
  fileUploadAllowedTypes: string;
  ossEnabled: boolean;
  emailEnabled: boolean;
  oauthGithubEnabled: boolean;
}

export interface Capabilities {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
}

// ─── 聚合类型 ───────────────────────────────────────────

export interface ServerConfig {
  system: SystemInfo;
  env: EnvInfo;
  uiDefaults: UiDefaults;
  securityPolicy: SecurityPolicy;
  feature: Features;
  capabilities: Capabilities;
}

// ─── 默认值 ─────────────────────────────────────────────

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  system: {
    name: 'Gvray Admin',
    description: '',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
    defaultAvatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=GavinRay',
  },
  env: {
    mode: 'development',
    apiPrefix: '/api/v1',
  },
  uiDefaults: {
    theme: 'light',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    sidebarCollapsed: false,
    pageSize: 10,
    welcomeMessage: '',
    showBreadcrumb: true,
  },
  securityPolicy: {
    watermarkEnabled: true,
    passwordMinLength: 6,
    passwordRequireComplexity: true,
    loginFailureLockCount: 5,
  },
  feature: {
    register: false,
    fileUploadMaxSize: 10485760,
    fileUploadAllowedTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',
    ossEnabled: false,
    emailEnabled: false,
    oauthGithubEnabled: false,
  },
  capabilities: {
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
  },
};

// ─── 解析函数 ───────────────────────────────────────────

const str = (v: unknown, fallback: string): string =>
  typeof v === 'string' && v ? v : fallback;
const bool = (v: unknown, fallback: boolean): boolean =>
  typeof v === 'boolean' ? v : fallback;
const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' ? v : fallback;

/**
 * 从 runtime-config 的 data 中安全提取 ServerConfig，缺失字段用默认值兜底。
 */
export function resolveServerConfig(raw?: Record<string, any>): ServerConfig {
  if (!raw) return { ...DEFAULT_SERVER_CONFIG };

  const defaults = DEFAULT_SERVER_CONFIG;
  const system = raw.system ?? {};
  const env = raw.env ?? {};
  const uiDefaults = raw.uiDefaults ?? {};
  const securityPolicy = raw.securityPolicy ?? {};
  const feature = raw.feature ?? {};
  const capabilities = raw.capabilities ?? {};

  return {
    system: {
      name: str(system.name, defaults.system.name),
      description: str(system.description, defaults.system.description),
      logo: str(system.logo, defaults.system.logo),
      favicon: str(system.favicon, defaults.system.favicon),
      defaultAvatar: str(system.defaultAvatar, defaults.system.defaultAvatar),
    },
    env: {
      mode: str(env.mode, defaults.env.mode),
      apiPrefix: str(env.apiPrefix, defaults.env.apiPrefix),
    },
    uiDefaults: {
      theme: str(uiDefaults.theme, defaults.uiDefaults.theme),
      language: str(uiDefaults.language, defaults.uiDefaults.language),
      timezone: str(uiDefaults.timezone, defaults.uiDefaults.timezone),
      sidebarCollapsed: bool(
        uiDefaults.sidebarCollapsed,
        defaults.uiDefaults.sidebarCollapsed,
      ),
      pageSize: num(uiDefaults.pageSize, defaults.uiDefaults.pageSize),
      welcomeMessage: str(
        uiDefaults.welcomeMessage,
        defaults.uiDefaults.welcomeMessage,
      ),
      showBreadcrumb: bool(
        uiDefaults.showBreadcrumb,
        defaults.uiDefaults.showBreadcrumb,
      ),
    },
    securityPolicy: {
      watermarkEnabled: bool(
        securityPolicy.watermarkEnabled,
        defaults.securityPolicy.watermarkEnabled,
      ),
      passwordMinLength: num(
        securityPolicy.passwordMinLength,
        defaults.securityPolicy.passwordMinLength,
      ),
      passwordRequireComplexity: bool(
        securityPolicy.passwordRequireComplexity,
        defaults.securityPolicy.passwordRequireComplexity,
      ),
      loginFailureLockCount: num(
        securityPolicy.loginFailureLockCount,
        defaults.securityPolicy.loginFailureLockCount,
      ),
    },
    feature: {
      register: bool(feature.register, defaults.feature.register),
      fileUploadMaxSize: num(
        feature.fileUploadMaxSize,
        defaults.feature.fileUploadMaxSize,
      ),
      fileUploadAllowedTypes: str(
        feature.fileUploadAllowedTypes,
        defaults.feature.fileUploadAllowedTypes,
      ),
      ossEnabled: bool(feature.ossEnabled, defaults.feature.ossEnabled),
      emailEnabled: bool(feature.emailEnabled, defaults.feature.emailEnabled),
      oauthGithubEnabled: bool(
        feature.oauthGithubEnabled,
        defaults.feature.oauthGithubEnabled,
      ),
    },
    capabilities: {
      totalUsers: num(
        capabilities.totalUsers,
        defaults.capabilities.totalUsers,
      ),
      totalRoles: num(
        capabilities.totalRoles,
        defaults.capabilities.totalRoles,
      ),
      totalPermissions: num(
        capabilities.totalPermissions,
        defaults.capabilities.totalPermissions,
      ),
    },
  };
}
