/**
 * 服务端运行时配置
 *
 * 数据来源：GET /runtime-config（无需登录即可获取）
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

const pick = <T extends string | boolean | number>(
  val: unknown,
  fallback: T,
): T => {
  if (typeof val === typeof fallback && val !== undefined) return val as T;
  return fallback;
};

/**
 * 从 runtime-config 的 data 中安全提取 ServerConfig，缺失字段用默认值兜底。
 */
export function resolveServerConfig(raw?: Record<string, any>): ServerConfig {
  const d = DEFAULT_SERVER_CONFIG;
  if (!raw) return { ...d };

  const s = raw.system ?? {};
  const e = raw.env ?? {};
  const u = raw.uiDefaults ?? {};
  const sp = raw.securityPolicy ?? {};
  const f = raw.feature ?? {};
  const c = raw.capabilities ?? {};

  return {
    system: {
      name: pick(s.name, d.system.name),
      description: pick(s.description, d.system.description),
      logo: pick(s.logo, d.system.logo),
      favicon: pick(s.favicon, d.system.favicon),
      defaultAvatar: pick(s.defaultAvatar, d.system.defaultAvatar),
    },
    env: {
      mode: pick(e.mode, d.env.mode),
      apiPrefix: pick(e.apiPrefix, d.env.apiPrefix),
    },
    uiDefaults: {
      theme: pick(u.theme, d.uiDefaults.theme),
      language: pick(u.language, d.uiDefaults.language),
      timezone: pick(u.timezone, d.uiDefaults.timezone),
      sidebarCollapsed: pick(u.sidebarCollapsed, d.uiDefaults.sidebarCollapsed),
      pageSize: pick(u.pageSize, d.uiDefaults.pageSize),
      welcomeMessage: pick(u.welcomeMessage, d.uiDefaults.welcomeMessage),
      showBreadcrumb: pick(u.showBreadcrumb, d.uiDefaults.showBreadcrumb),
    },
    securityPolicy: {
      watermarkEnabled: pick(
        sp.watermarkEnabled,
        d.securityPolicy.watermarkEnabled,
      ),
      passwordMinLength: pick(
        sp.passwordMinLength,
        d.securityPolicy.passwordMinLength,
      ),
      passwordRequireComplexity: pick(
        sp.passwordRequireComplexity,
        d.securityPolicy.passwordRequireComplexity,
      ),
      loginFailureLockCount: pick(
        sp.loginFailureLockCount,
        d.securityPolicy.loginFailureLockCount,
      ),
    },
    feature: {
      register: pick(f.register, d.feature.register),
      fileUploadMaxSize: pick(f.fileUploadMaxSize, d.feature.fileUploadMaxSize),
      fileUploadAllowedTypes: pick(
        f.fileUploadAllowedTypes,
        d.feature.fileUploadAllowedTypes,
      ),
      ossEnabled: pick(f.ossEnabled, d.feature.ossEnabled),
      emailEnabled: pick(f.emailEnabled, d.feature.emailEnabled),
      oauthGithubEnabled: pick(
        f.oauthGithubEnabled,
        d.feature.oauthGithubEnabled,
      ),
    },
    capabilities: {
      totalUsers: pick(c.totalUsers, d.capabilities.totalUsers),
      totalRoles: pick(c.totalRoles, d.capabilities.totalRoles),
      totalPermissions: pick(
        c.totalPermissions,
        d.capabilities.totalPermissions,
      ),
    },
  };
}
