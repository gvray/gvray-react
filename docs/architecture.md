# 🚧 architecture.md

## 项目架构设计总览

这个项目 **Gvray Admin** 聚焦通用后台架构与工程实践，旨在构建一个可复用、高可维护、可扩展的现代前端管理系统。核心架构基于 **React 18 + Umi 4 + Ant Design 5**，配合灵活的状态管理、动态路由和权限控制方案，支持中大型业务系统的稳健演进。([GitHub][1])

整体架构可以按逻辑层拆分：

```
UI Layer (React + Antd)
       ↓
Routes & Layout (Umi 约定式 + 自定义 Layout)
       ↓
State Management (Zustand / ReduxToolkit)
       ↓
Network Layer (axios 请求封装)
       ↓
Business Domain Modules (RBAC / 用户体系 / 系统配置)
```

组件库与风格统一规范则通过 `Ant Design + CSS-in-JS / CSS Modules / Tailwind` 组合方案实现。([GitHub][2])

---

## 技术选型与设计理由

**React + Umi**

React 提供灵活的声明式组件模型；Umi 提供约定式路由、插件化扩展和工程框架能力，适合中大型后台项目。([GitHub][1])

**状态管理：Zustand 优先**

对比 Redux Toolkit、MobX 等方案，项目倾向使用 **Zustand** 作为轻量状态管理核心（相关讨论见 Issue #5）。([GitHub][3])

**网络请求方案**

基础请求封装采用 axios 封装方案，并讨论过使用 react-query/swr 等现代数据获取库（Issue #6）。([GitHub][4])

**本地代理与多环境支持**

项目在开发阶段通过代理配置支持跨域 mock 与后端联调，同时定义多环境构建变量（Issue #34、Issue #33）。([GitHub][5])

**国际化**

项目在 `~/src/locales` 支持多语言国际化资源，相关预设由 Issue #7 跟踪。([GitHub][6])

**样式方案探索**

讨论过多种样式管理方式，包括 CSS Modules、Tailwind、CSS-in-JS 等（Issue #17）。([GitHub][2])

---

## 核心模块与 Issue 对应关系

| 核心子系统 | 功能简介 | Issue 参考 |  |
| --- | --- | --- | --- |
| 全局状态管理 | 模块化状态与 UI 状态集中管理 | #5 | ([GitHub][3]) |
| 国际化支持 | 多语言支持框架定义与实现 | #7 | ([GitHub][6]) |
| 网络请求封装 | axios + 拦截器抽象 | #6 | ([GitHub][4]) |
| 编码规范与开发体验 | ESLint/Stylelint/Prettier + CI | #12 | ([GitHub][7]) |
| 调试方案 | 远程调试与环境诊断流程文档 | #13 | ([GitHub][8]) |
| 样式管理方案 | 方案权衡与实践风格标准 | #17 | ([GitHub][2]) |
| 多环境构建 | 环境变量体系与构建配置 | #33 | ([GitHub][9]) |
| 本地代理 | 前端本地跨域代理实践 | #34 | ([GitHub][5]) |
| 主题与色彩管理 | 全局主题与昼夜模式规划 | #25、#26 | ([GitHub][9]) |
| 异常处理模块 | 全局异常捕获 & 业务级错误提示 | #24 | ([GitHub][9]) |
| 用户体验优化 | 加载骨架屏与首屏白屏处理 | #28、#29 | ([GitHub][9]) |
| 多页签支持 | 多标签页导航管理 | #30 | ([GitHub][9]) |
| 权限与路由体系 | RBAC 权限路由扩展 | #31、#32 | ([GitHub][9]) |

> 注：上表的具体 Issue 链接均可用 `#编号` 在 GitHub 上直接访问。

---

## 核心架构设计讨论

### 状态管理选型

项目通过 **Issue #5** 讨论了多种状态管理方案，最终倾向使用 Zustand 作为主力状态存储，并保留 Redux Toolkit 作为大型状态逻辑的补充。([GitHub][3])

### 请求策略与缓存

Issue #6 探讨了 axios、umi-request、react-query/swr 的优劣，说明当前架构选取了更直观的 axios 封装，但未来可演进为数据缓存 + 请求复用方案。([GitHub][4])

### 多环境可配置化

通过 Issue #33 设计了多环境构建的变量体系，使得开发、联调、生产等环境可以解耦（本地 proxy、API 前缀等）。([GitHub][9])

### 样式管理与统一风格

项目在 Issue #17 内讨论了 CSS Modules、Tailwind、CSS-in-JS 的使用取舍，形成最终可配置的样式方案供后续维护。([GitHub][2])

---

## 架构风险与制约因素

- **Umi 框架局限**：Umi 的黑盒机制对插件扩展有一定限制，但约定式体系虽简洁却影响可控性，需要明确配置边界。([GitHub][1])
- **状态管理复杂性**：Zustand 对新手更友好，但大型业务状态交互仍需慎重设计。
- **请求层可升级性**：当前封装较基础，未引入数据缓存逻辑，未来考虑引入 TanStack Query 类库提升体验。

---

如果你还要我把下面这些 **Issue 进一步归类成优先级/状态**（比如 “已完成 / 进行中 / 待规划”），我也可以帮你生成更细化的版本。

[1]: https://github.com/gvray/gvray-react?utm_source=chatgpt.com 'gvray/gvray-react: 🦄 基于React + ...'
[2]: https://github.com/GavinBirkhoff/gvray-react/issues/17?utm_source=chatgpt.com '样式管理方案· Issue #17 · gvray/gvray-react'
[3]: https://github.com/gvray/gvray-react/issues/5?utm_source=chatgpt.com '全局状态管理· Issue #5 · gvray/gvray-react'
[4]: https://github.com/GavinBirkhoff/gvray-react/issues/6?utm_source=chatgpt.com '请求方案· Issue #6 · gvray/gvray-react'
[5]: https://github.com/GavinBirkhoff/gvray-react/issues/34?utm_source=chatgpt.com '本地代理#34 - gvray/gvray-react'
[6]: https://github.com/GavinBirkhoff/gvray-react/issues/7?utm_source=chatgpt.com '国际化(多语言) · Issue #7 · gvray/gvray-react'
[7]: https://github.com/GavinBirkhoff/gvray-react/issues/12?utm_source=chatgpt.com '编码规范#12 - gvray/gvray-react'
[8]: https://github.com/GavinBirkhoff/gvray-react/issues/13?utm_source=chatgpt.com '调试· Issue #13 · gvray/gvray-react'
[9]: https://github.com/GavinBirkhoff/gvray-react/issues?utm_source=chatgpt.com 'Issues · gvray/gvray-react'
