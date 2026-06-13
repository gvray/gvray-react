# 开发指南（Developer Guide）

本文档面向项目开发者，涵盖环境搭建、项目结构、开发规范、常用命令与扩展机制，帮助你快速上手并高效参与开发。

---

## 1. 环境准备

### 1.1 必备工具

| 工具    | 版本要求   | 说明                                  |
| ------- | ---------- | ------------------------------------- |
| Node.js | >= 20.x    | 建议使用 `.nvmrc` 统一版本            |
| pnpm    | >= 8.x     | 推荐通过 `corepack enable` 启用       |
| IDE     | -          | 推荐 Cursor / VSCode                  |
| 浏览器  | 现代浏览器 | Chrome 79+ / Firefox 78+ / Safari 14+ |

### 1.2 推荐 VSCode 插件

- ESLint
- Prettier - Code formatter
- stylelint
- TypeScript Importer
- Ant Design Snippets

### 1.3 克隆与安装

```bash
git clone https://github.com/gvray/gvray-react.git
cd gvray-react
pnpm install
```

> `postinstall` 会自动执行 `umi setup`，完成框架初始化。

---

## 2. 环境变量与多环境配置

### 2.1 环境文件

项目根目录下按环境维护 `.env` 文件：

| 文件           | 环境 | 说明                            |
| -------------- | ---- | ------------------------------- |
| `.env.dev`     | 开发 | 默认使用 Mock，端口 9527        |
| `.env.staging` | 测试 | 连接后端 gvray-admin，端口 9528 |
| `.env.prod`    | 生产 | 生产环境配置，端口 9529         |
| `.env.example` | 模板 | 环境变量模板，用于缺失检查      |

### 2.2 环境变量说明

| 变量名              | 类型    | 说明                               |
| ------------------- | ------- | ---------------------------------- |
| `APP_ENV`           | string  | 当前环境标识：dev / staging / prod |
| `APP_API_URL`       | string  | API 请求前缀，如 `/api`            |
| `APP_API_TIMEOUT`   | number  | 请求超时时间（ms）                 |
| `APP_API_TOKEN_KEY` | string  | Token 存储 key                     |
| `APP_MOCK_ENABLED`  | boolean | 是否启用 Mock 数据                 |
| `APP_VERSION`       | string  | 应用版本号                         |
| `APP_BUILD_TIME`    | string  | 构建时间                           |
| `APP_CDN_URL`       | string  | CDN 地址（可选）                   |
| `APP_SENTRY_DSN`    | string  | Sentry DSN（可选）                 |
| `APP_TRACKING_ID`   | string  | 统计追踪 ID（可选）                |

### 2.3 加载机制

环境变量通过 `scripts/load-env.ts` 加载：

1. 根据 `--mode` 参数读取对应 `.env.{mode}` 文件
2. 使用 `dotenv` 注入到 `process.env`
3. 通过 `config/define.ts` 映射为全局常量（`__APP_ENV__`、`__APP_API_URL__` 等）
4. 启动时自动打印环境变量表格，并与 `.env.example` 对比检查缺失项

---

## 3. 常用命令

### 3.1 开发

```bash
pnpm start              # 等同于 pnpm start:dev
pnpm start:dev          # 开发环境，端口 9527（Mock 模式）
pnpm start:staging      # 测试环境，端口 9528（连接后端）
pnpm start:prod         # 生产环境，端口 9529
```

底层调用 `tsx scripts/dev.ts --mode <env> --port <port>`，支持参数：

- `--mode`：环境名称，对应 `.env.{mode}` 和 `config/config.{mode}.ts`
- `--port`：开发服务器端口
- `--mock`：手动覆盖 Mock 开关

### 3.2 构建

```bash
pnpm build              # 构建所有环境（dev + staging + prod）
pnpm build:dev          # 仅构建 dev
pnpm build:staging      # 仅构建 staging
pnpm build:prod         # 仅构建 prod
```

产物输出到 `dist/{env}/` 目录。

### 3.3 代码质量

```bash
pnpm lint               # 运行 ESLint + Prettier + TSC 检查
pnpm lint:fix           # ESLint 自动修复
pnpm lint:prettier      # Prettier 格式化
```

### 3.4 API 类型生成

```bash
pnpm gen:api            # 从 OpenAPI 文档生成 TypeScript 类型
```

从后端 Swagger/OpenAPI JSON 自动生成 `src/types/api.d.ts`，包含：

- 所有 Schema → TypeScript interface
- Query 参数类型
- 通用分页 / 响应类型

### 3.5 其他

```bash
pnpm analyze            # Webpack Bundle 分析
pnpm clean              # 清理 dist 和 node_modules
```

---

## 4. 项目结构

```
gvray-react/
├── config/                    # Umi 配置
│   ├── config.ts              # 主配置（路由、主题、插件等）
│   ├── config.dev.ts          # 开发环境覆盖配置
│   ├── config.staging.ts      # 测试环境覆盖配置
│   ├── config.prod.ts         # 生产环境覆盖配置
│   ├── define.ts              # 全局常量定义（环境变量 → 编译常量）
│   ├── env.ts                 # 多环境扩展变量
│   ├── plugins.ts             # Umi 插件列表
│   └── routes.ts              # 路由配置
├── docs/                      # 项目文档
├── mock/                      # Mock 数据（Express 风格）
├── public/                    # 静态资源
├── scripts/                   # 构建 & 工具脚本
│   ├── dev.ts                 # 开发服务器启动脚本
│   ├── build.ts               # 构建脚本
│   ├── load-env.ts            # 环境变量加载器
│   └── gen-api-types.ts       # OpenAPI 类型生成器
├── src/
│   ├── app.tsx                # Umi 运行时配置（getInitialState）
│   ├── global.less            # 全局样式
│   ├── global.ts              # 全局脚本
│   ├── request.ts             # 网络请求客户端初始化
│   ├── requestErrorConfig.ts  # 请求错误处理配置
│   ├── themeConfig.ts         # 主题配置
│   ├── components/            # 全局公共组件
│   │   ├── AuthButton/        # 权限按钮
│   │   ├── Charts/            # 图表组件
│   │   ├── ErrorBoundary/     # 全局错误边界
│   │   ├── IconSelector/      # 图标选择器
│   │   ├── NavigationProgress/# 路由进度条（NProgress）
│   │   ├── PageContainer/     # 页面容器（含 Helmet 标题管理）
│   │   ├── PermissionTree/    # 权限树
│   │   ├── StatusTag/         # 状态标签
│   │   ├── TablePro/          # 增强表格
│   │   └── index.ts           # 统一导出
│   ├── constants/             # 全局常量
│   ├── hocs/                  # 高阶组件（withAuth 等）
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useAuth/           # 鉴权 Hook
│   │   ├── useConfig.ts       # 系统配置 Hook
│   │   ├── useDict/           # 字典 Hook
│   │   ├── useRouteMeta/      # 路由元信息 Hook
│   │   ├── useTheme/          # 主题 Hook
│   │   ├── useThemeColor/     # 主题色 Hook
│   │   └── useThemeMode/      # 主题模式 Hook
│   ├── layouts/               # 布局组件
│   │   ├── index.tsx          # 主布局（Header + Sider + Content）
│   │   └── components/        # 布局子组件（SideMenu、Logo、ThemeSetting）
│   ├── locales/               # 国际化资源
│   │   ├── zh-CN.ts           # 中文
│   │   └── en-US.ts           # 英文
│   ├── pages/                 # 页面组件
│   ├── services/              # API 服务层
│   ├── stores/                # Zustand 状态管理
│   │   ├── useSettingsStore.ts
│   │   ├── useTabsStore.ts
│   │   └── useThemeStore.ts
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   └── wrappers/              # 路由包装器（RouteGuard）
└── package.json
```

---

## 5. 路由与权限

### 5.1 路由配置

路由定义在 `config/routes.ts`，采用 Umi 约定式配置：

```ts
{
  path: '/system/user',
  component: 'User',
  meta: {
    title: '用户管理',
    permissions: ['system:user:view'],
  },
}
```

- **`meta.title`**：页面标题，`PageContainer` 组件通过 `useRouteTitle()` 读取并设置 `<title>`
- **`meta.permissions`**：页面所需权限码，`RouteGuard` 和 `withAuth` HOC 会进行校验

### 5.2 路由守卫

所有需要鉴权的路由包裹在 `@/wrappers/RouteGuard` 中：

1. 检查用户登录状态（Token 有效性）
2. 未登录则重定向到 `/login`
3. 渲染 `NavigationProgress`（NProgress 路由进度条）
4. 渲染子路由 `<Outlet />`

### 5.3 权限控制

- **页面级**：`withAuth` HOC 检查 `meta.permissions`，无权限显示 403
- **按钮级**：`<AuthButton>` 组件根据权限码控制按钮渲染
- **菜单级**：动态菜单根据用户权限过滤

---

## 6. 网络请求

### 6.1 请求客户端

基于 `@gvray/request`（axios 封装）初始化，配置在 `src/request.ts`：

- `baseURL`：由 `__APP_API_URL__` 全局常量控制
- `timeout`：由 `__APP_API_TIMEOUT__` 控制
- 拦截器：在 `src/requestErrorConfig.ts` 中配置请求/响应拦截

### 6.2 服务层

`src/services/` 按业务模块组织 API 调用：

| 文件              | 模块     |
| ----------------- | -------- |
| `auth.ts`         | 登录鉴权 |
| `user.ts`         | 用户管理 |
| `role.ts`         | 角色管理 |
| `permission.ts`   | 权限管理 |
| `department.ts`   | 部门管理 |
| `position.ts`     | 岗位管理 |
| `dictionary.ts`   | 字典管理 |
| `config.ts`       | 系统配置 |
| `resource.ts`     | 资源管理 |
| `dashboard.ts`    | 仪表盘   |
| `loginLog.ts`     | 登录日志 |
| `operationLog.ts` | 操作日志 |

---

## 7. Mock 数据

### 7.1 使用方式

Mock 文件位于 `mock/` 目录，采用 Express 风格定义：

```ts
export default {
  'POST /api/auth/login': async (req: Request, res: Response) => {
    await sleep(800);
    res.json({ success: true, code: 200, data: { ... } });
  },
};
```

### 7.2 开关控制

- `.env.dev` 中 `APP_MOCK_ENABLED=true` 启用 Mock
- `.env.staging` 中 `APP_MOCK_ENABLED=false` 关闭 Mock，连接真实后端
- Mock 文件中**不能使用** `@/` 路径别名（Node.js 环境不支持），需用相对路径如 `../src/constants`

### 7.3 覆盖范围

当前 Mock 覆盖：登录、用户、角色、权限、部门、岗位、字典、资源、仪表盘等模块。如需全量真实数据，请启动后端 [gvray-admin](https://github.com/gvray/gvray-admin)。

---

## 8. 状态管理

项目使用 **Zustand** 作为轻量状态管理方案，Store 位于 `src/stores/`：

| Store                 | 职责                           |
| --------------------- | ------------------------------ |
| `useSettingsStore.ts` | 全局设置（侧边栏折叠等）       |
| `useTabsStore.ts`     | 多标签页状态管理               |
| `useThemeStore.ts`    | 主题状态（暗黑/浅色/自定义色） |

同时通过 Umi 内置的 `initialState` + `useModel` 管理用户信息等全局初始数据。

---

## 9. 主题与样式

### 9.1 主题定制

- 主题配置入口：`src/themeConfig.ts`
- 运行时通过 Ant Design `ConfigProvider` 动态切换主题算法（亮色/暗色/紧凑）
- 主题色通过 `useThemeStore` 管理，支持实时切换

### 9.2 样式方案

- **全局样式**：`src/global.less`
- **页面样式**：CSS Modules（`.less` 文件）
- **组件样式**：`styled-components`（CSS-in-JS）
- **主题变量**：通过 Ant Design Token 系统统一管理

---

## 10. 国际化

国际化资源位于 `src/locales/`：

```
src/locales/
├── zh-CN.ts       # 中文入口
├── zh-CN/         # 中文子模块
├── en-US.ts       # 英文入口
└── en-US/         # 英文子模块
```

通过 Umi 内置 `locale` 插件实现，默认语言为 `zh-CN`。使用 `useIntl()` 或 `<FormattedMessage>` 在组件中引用翻译。

---

## 11. 公共组件

所有公共组件通过 `src/components/index.ts` 统一导出：

| 组件                 | 说明                                 |
| -------------------- | ------------------------------------ |
| `PageContainer`      | 页面容器，集成权限校验 + Helmet 标题 |
| `ErrorBoundary`      | 全局错误边界，捕获渲染异常           |
| `NavigationProgress` | 路由切换进度条（NProgress）          |
| `AuthButton`         | 权限按钮，根据权限码控制渲染         |
| `TablePro`           | 增强表格组件                         |
| `Charts`             | ECharts 图表封装                     |
| `IconSelector`       | Ant Design 图标选择器                |
| `PermissionTree`     | 权限树组件                           |
| `StatusTag`          | 状态标签（启用/禁用等）              |
| `DateTimeFormat`     | 日期时间格式化组件                   |
| `AntIcon`            | 动态 Ant Design 图标渲染             |

---

## 12. 自定义 Hooks

通过 `src/hooks/index.ts` 统一导出：

| Hook                  | 说明               |
| --------------------- | ------------------ |
| `useAuth`             | 登录鉴权逻辑       |
| `useAppTheme`         | 主题管理           |
| `useThemeMode`        | 主题模式切换       |
| `useRouteMeta`        | 获取当前路由元信息 |
| `useRouteTitle`       | 获取当前路由标题   |
| `useRoutePermissions` | 获取当前路由权限码 |
| `useConfigValue`      | 读取系统配置值     |
| `useConfigsByGroup`   | 按分组读取配置     |
| `useConfigsByType`    | 按类型读取配置     |
| `useEnabledConfigs`   | 读取已启用配置     |
| `useConfigCache`      | 配置缓存           |
| `useConfigValidation` | 配置校验           |

---

## 13. 新增页面流程

1. **创建页面组件**：在 `src/pages/` 下新建目录和 `index.tsx`
2. **注册路由**：在 `config/routes.ts` 中添加路由配置，设置 `meta.title` 和 `meta.permissions`
3. **添加 API 服务**：在 `src/services/` 中新建对应服务文件
4. **添加 Mock**（可选）：在 `mock/` 中添加对应 Mock 数据
5. **添加菜单**：在后端或 Mock 中注册菜单项
6. **使用 PageContainer**：页面根组件使用 `<PageContainer>` 包裹，自动获得权限校验和标题管理

```tsx
import { PageContainer } from '@/components';

const MyPage: React.FC = () => {
  return <PageContainer>{/* 页面内容 */}</PageContainer>;
};

export default MyPage;
```

---

## 14. 调试技巧

- **环境变量检查**：启动时控制台会打印环境变量表格，确认配置正确
- **Mock 调试**：Mock 文件修改后自动热更新，无需重启
- **TypeScript 检查**：`npx tsc --noEmit` 快速检查类型错误
- **Bundle 分析**：`pnpm analyze` 查看打包体积分布
- **React DevTools**：推荐安装 React Developer Tools 浏览器扩展
- **网络请求**：所有请求错误会通过 `requestErrorConfig.ts` 统一处理并弹出提示

---

## 15. 注意事项

- **Mock 文件中不能使用 `@/` 别名**：Mock 运行在 Node.js 环境，需使用相对路径（如 `../src/constants`）
- **环境变量必须以 `APP_` 开头**：非 `APP_` 前缀的变量不会被 dotenv 加载到 define 中
- **路由 `meta` 是自定义扩展**：Umi 原生不支持 `meta`，通过 `useRouteMeta` Hook 解析
- **pnpm 严格模式**：项目使用 pnpm，不要混用 npm/yarn 安装依赖
- **Node.js 版本**：确保使用 Node.js 20+，低版本可能导致构建脚本异常

## 16.命名规范

| 层 | 作用 | 命名关注点 |
| --- | --- | --- |
| **Service** | 调用后端 API，REST 风格 | 用后端 API 风格：`createUser` / `updateUser` / `deleteUser` / `queryUsersList` |
| **Model / Store** | 管理前端状态、业务逻辑 | 用业务动作语义：`addUser` / `editUser` / `removeUser` / `fetchUsersList` |
| **UI / Component** | 页面事件触发、Prop 绑定 | handle + Model 方法：`handleAddUser` / `handleUpdateUser` / `handleDeleteUser` |

## 17.分支管理

- feature/\* → 每个新功能或 bug 修复
- develop → 测试环境，集成所有 feature
- release/\* → 准备发版，冻结功能，做最终测试
- main → 生产环境，始终稳定
- hotfix/\* → 紧急修复生产环境 bug
