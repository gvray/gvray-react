# 🗺️ Gvray Admin / 前端平台功能 Roadmap

超全能力清单，涵盖已实现、规划中、未来可能功能。状态说明：

- ✅ 已实现
- 🟡 部分实现 / 进行中
- ⬜ 未实现 / 规划中

---

## 🧠 Runtime Core（运行时能力）

| 功能 | 优先级 | 状态 | 说明 | 可落地操作 |
| --- | --- | --- | --- | --- |
| 路由加载进度条（NProgress） | 高 | ✅ | 页面切换时顶部显示进度条 | 安装 nprogress + 全局路由守卫 |
| 全局错误边界（ErrorBoundary） | 高 | ✅ | 捕获 React 渲染错误，显示降级 UI | 封装 ErrorBoundary 组件并包裹根节点 |
| 页面过渡动画 | 高 | 🟡 | 页面间过渡动画比简单 translateX 更流畅 | 集成 framer-motion 或 react-transition-group，路由切换时触发动画 |
| keepAlive 页面缓存 | 高 | ⬜ | 切换路由保留状态 | 路由缓存组件 + 页面 key 管理 |
| 异步路由数据加载 | 高 | ✅ | 页面首次加载前获取必要数据 | 路由级 loader / useEffect + Suspense |
| 用户鉴权 | 高 | ✅ | JWT / Token 管理，登录状态检查 | 登录 / 登出 API，拦截器检查 token |
| 权限管理 | 高 | ✅ | 菜单、按钮、API 权限控制 | RBAC / ABAC 权限体系，动态渲染菜单/按钮 |
| 全局状态管理 | 高 | ✅ | Zustand / Redux Toolkit 模块化状态 | 封装 store，提供 hooks 使用 |
| 网络请求管线 | 高 | ✅ | @gvray/request 封装，统一错误 / 重试 / 取消 | 支持拦截器和全局错误处理 |
| 请求缓存 & 去重 | 中 | ⬜ | 同一请求防重复调用 | request 封装 cache / abortController |
| 页面级缓存 & 数据恢复 | 中 | ⬜ | keepAlive + 数据缓存 | useCache hook + localStorage / sessionStorage |
| 全局 Loading / Skeleton | 中 | 🟡 | 路由或组件异步加载显示 | Suspense + Skeleton / Spin |
| 全局快捷键 | 中 | ⬜ | Ctrl+K 打开搜索，Ctrl+/ 打开快捷键面板 | hotkeys-js / react-hotkeys-hook |
| 全局消息中心 / 通知 | 中 | ⬜ | WebSocket 或 SSE 实时推送通知 | 封装 useNotification hook |
| 全局水印 | 中 | ⬜ | 显示用户名 / 防截图泄露 | Ant Design Watermark / Canvas 实现 |
| 国际化（多语言） | 中 | 🟡 | 切换语言，支持 locale | react-intl / react-i18next，提供语言包 |
| 主题管理 | 中 | 🟡 | 暗黑 / 浅色 / 自定义主题 | CSS Variables + Less / Sass 动态切换 |

---

## 🧱 Platform Infrastructure（平台基础设施）

| 功能 | 优先级 | 状态 | 说明 | 可落地操作 |
| --- | --- | --- | --- | --- |
| UI 组件库集成 | 高 | ✅ | Ant Design 5.x 或 Material UI | 安装组件库 + 按需引入 / 自定义主题 |
| 样式管理 | 高 | ✅ | CSS Modules / CSS-in-JS / Less / Sass | 统一样式方案，支持主题变量和隔离 |
| 微前端架构 | 中 | ⬜ | Qiankun / single-spa 集成 | 主子应用独立构建 + 子应用注册 |
| 开发代理 | 高 | ✅ | 跨域请求 / Mock | vite / webpack devServer proxy 配置 |
| OpenAPI 类型自动同步 | 中 | ✅ | API 类型同步到前端 | openapi-generator / swagger-to-ts |
| 微生成器 / CLI 工具 | 中 | 🟡 | 页面 / 模块 / API 快速生成 | 自定义 generator / plop.js |
| 插件 / 扩展机制 | 中 | ⬜ | 可注入开发插件 | 插件接口 + 动态加载 |
| 站点统计 / 行为分析 | 中 | ⬜ | PV / UV / 点击 / 表单 | 封装埋点 SDK / mixpanel / GA |
| 日志系统 & 操作审计 | 中 | ⬜ | 请求日志 / 用户操作追踪 | request 拦截 + 日志上报 |
| 缓存策略 | 中 | ⬜ | LocalStorage / Session / IndexedDB | 封装缓存 hook / 工具 |
| 本地开发热更新 | 高 | ✅ | HMR 提升开发体验 | Vite / webpack HMR |

---

## 🛠 Engineering / DX（开发体验）

| 功能 | 优先级 | 状态 | 说明 | 可落地操作 |
| --- | --- | --- | --- | --- |
| 多环境构建 & .env | 高 | ✅ | dev / test / prod 配置 | Vite / webpack 环境变量配置 |
| TypeScript 全面支持 | 高 | ✅ | 类型安全开发 | tsconfig.json 配置 + 类型检查 |
| ESLint / Prettier / StyleLint | 高 | ✅ | 统一代码规范 | 配置 lint + husky commit hook lavy |
| Git 提交钩子 | 高 | ✅ | commitlint / husky | commit 格式校验 lavy |
| 单元测试 / 集成测试 | 中 | ⬜ | Jest / Vitest | 编写测试用例 + CI 流程 |
| 构建优化 | 高 | 🟡 | Tree Shaking / Code Splitting / Lazy Loading | Vite / webpack 配置 |
| DevTools / 调试插件 | 中 | ⬜ | 状态 / 权限 / 路由可视化 | 自定义 debug panel |
| PWA / 离线模式 | 低 | ⬜ | Workbox / Service Worker | 注册 SW + 离线缓存策略 |
| 性能监控 | 低 | ⬜ | web-vitals / Lighthouse | 埋点 LCP / FID / CLS / TBT |
| Sentry 错误上报 | 低 | ⬜ | 全局异常捕获并上报 | Sentry SDK 集成 |
| CI/CD 流程 | 高 | ⬜ | 自动化构建 / 测试 / 发布 | GitHub Actions / GitLab CI 配置 |
| 依赖升级 & 安全扫描 | 中 | ⬜ | npm audit / Renovate | 自动化扫描依赖 |

---

## 📊 Observability（可观测性）

| 功能 | 优先级 | 状态 | 说明 | 可落地操作 |
| --- | --- | --- | --- | --- |
| 请求日志 / 操作审计 | 中 | ⬜ | 用户行为追踪 | request 拦截器 + log 收集 |
| 异常监控 & 错误收集 | 中 | ⬜ | Sentry / Rollbar | SDK 集成 + 全局 try/catch |
| 性能分析 & 核心指标采集 | 中 | ⬜ | FCP / LCP / CLS / TBT | web-vitals 集成 |
| 用户行为分析 / 埋点 | 中 | ⬜ | PV / UV / Click / Form | 埋点 SDK + 后端存储 |
| 错误重试与告警通知 | 中 | ⬜ | 网络 / JS 异常 | 封装 retry + webhook / Slack / DingTalk 通知 |

---

## 🧩 高级 UX / 功能粒度

| 功能 | 优先级 | 状态 | 说明 | 可落地操作 |
| --- | --- | --- | --- | --- |
| 表格高级功能 | 中 | 🟡 | 虚拟滚动 / 多列冻结 / 动态列 / 排序 / 筛选 | Ant Design Table / react-virtualized |
| 富文本编辑器 | 中 | ⬜ | Markdown / WYSIWYG / 插件扩展 | react-quill / tiptap / react-markdown |
| 文件上传下载 | 中 | ⬜ | 大文件分片上传 / 下载预览 / 进度条 | Ant Design Upload + axios 分片上传 |
| 可拖拽布局 / Dashboard Widget | 中 | ⬜ | 用户自定义面板布局 | react-grid-layout / dnd-kit |
| 数据可视化 | 中 | ⬜ | 图表 / 仪表盘 | Echarts / Recharts / D3 |
| 动态表单 & 联动表单 | 中 | ⬜ | 表单字段依赖 / 权限控制 | Formily / Ant Design Form |

---

## 🔒 安全与合规

| 功能 | 优先级 | 状态 | 说明 | 可落地操作 |
| --- | --- | --- | --- | --- |
| XSS / CSRF / SQL 注入防护 | 高 | ⬜ | 前端安全基础 | sanitize-html / axios CSRF token |
| 数据脱敏 & 水印 | 中 | ⬜ | 防止敏感信息泄露 | Canvas / Ant Design Watermark |
| CSP 安全策略 | 中 | ⬜ | Content Security Policy | meta / HTTP header 配置 |
| GDPR / 隐私提示 | 中 | ⬜ | 隐私合规 | 弹窗提示 / Cookie 管理 |

---

## 🔮 未来潜在能力

| 功能 | 优先级 | 状态 | 说明 | 可落地操作 |
| --- | --- | --- | --- | --- |
| AI / LLM 助手集成 | 低 | ⬜ | 智能填表 / 搜索 / 建议 | OpenAI API / 本地模型 |
| WebAssembly 模块化 | 低 | ⬜ | 高性能计算 / 图表 / 游戏 | Rust / AssemblyScript 编译 wasm |
| 前端缓存层升级 | 中 | ⬜ | IndexedDB + Service Worker | 封装本地存储策略 + SW 缓存 |
| 前端 DevTools 可视化 | 中 | ⬜ | 状态 / 权限 / 路由 / 日志可视化 | 自定义面板 + Chrome Extension |
