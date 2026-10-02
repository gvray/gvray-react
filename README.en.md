# Gvray Admin

English | [简体中文](README.md)

🦄 An enterprise-grade admin system built with **React**, **Umi**, **Ant Design**, and **TypeScript**, focused on **modern frontend architecture** and an **RBAC permission system**. It provides dynamic routing, multi-theme support, internationalization, runtime config, Mock, and OpenAPI out of the box, ready to serve as a Starter Template for enterprise admin projects.

<!--
keywords:
react,
react18,
umi,
umi4,
ant-design,
antd5,
typescript,
zustand,
axios,
react-intl,
rbac,
permission,
access-control,
dashboard,
admin,
admin-template,
starter-template,
boilerplate,
mock,
openapi,
i18n,
theme
-->

## 📸 Project Preview

<p align="center">
  <img src="./docs/screenshots/2026-08-08/light/demo.webp" width="49%" alt="Light Theme" />
  
  <img src="./docs/screenshots/2026-08-08/dark/demo.webp" width="49%" alt="Dark Theme" />
</p>

**Live Demo:**

- [react.gvray.com](https://react.gvray.com) · **Primary**
- [GitHub Pages](https://gvray.github.io/gvray-react) · **Fallback**

## ✨ Core Capabilities

| Capability | Description |
| --- | --- |
| 🔐 RBAC Permission Management | Three-level access control over menus, buttons, and APIs |
| 🔑 Dual-Token Authentication | access + refresh token management with expiry buffer strategy |
| 🧭 Dynamic Routing | Routes and menus generated automatically based on permissions |
| 🎨 Multi-Theme | Light, dark, and other theme switching |
| 🌍 Internationalization | Multi-language support powered by React Intl |
| 📖 Global Dictionary System | `DictionaryLabel` / `DictionarySelect` / `useDict` for one-click backend dictionary mapping |
| 🗂️ State Management | Lightweight Zustand state management with persistence and Immer |
| 🛡️ Global Error Boundary | ErrorBoundary catches render exceptions and shows fallback UI |
| 🌐 Data Requests | `@gvray/request` Axios request pipeline with unified error handling |
| ⚙️ Runtime Config | Adjust selected configs at runtime without rebuilding |
| 🎭 Mock | Seamless switching between Mock and real APIs |
| 📄 OpenAPI | Auto-sync API definitions and TypeScript types |
| 🏗️ TablePro Enhanced Table | Built-in advanced search, pagination, refresh, and useTablePro hook |
| 🐳 Engineering | TypeScript, Docker, and multi-environment config |

## 🎯 Use Cases

A solid foundation for:

- Enterprise admin systems
- SaaS management platforms
- RBAC permission systems
- Mid- and back-office management platforms
- Admin Starter Templates
- Frontend architecture practice projects

## 📖 Documentation

| Doc | Description |
| --- | --- |
| [Roadmap](docs/roadmap.md) | Feature planning and progress |
| [Architecture Documentation](docs/architecture.md) | System architecture design and implementation |
| [Developer Guide](docs/developer-guide.md) | Development guide |
| [Docker Deployment Guide](docs/docker.md) | Dockerized deployment solution |
| [UMI Limitations Analysis](docs/umi-limitations.md) | Umi best practices |
| [Theme Guidelines](docs/theme-guidelines.md) | Theme and styling design specs |
| API Type Sync | OpenAPI → TypeScript auto-generation |
| [Contributing](docs/contributing.md) | Commit conventions and contribution guide |

## 🧩 Core Functional Modules

| Module | Features |
| --- | --- |
| 👤 Identity & Permissions | Login/auth, user management, role management, permission management, menu management |
| 🏢 Organization | Department management, position management |
| ⚙️ System Management | Dictionary management, system config, notices & announcements |
| 📊 System Monitoring | Service monitoring, online users, cache monitoring |
| 📝 Log & Audit | Login logs, operation logs |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- Corepack (bundled with Node.js)

### Install Dependencies

```bash
pnpm install
```

### Start the Project

```bash
# Default dev environment (with built-in Mock data)
pnpm start

# Dev environment (with built-in Mock data)
pnpm start:dev

# Staging environment (connected to gvray-admin backend) — recommended
pnpm start:staging

# Production environment
pnpm start:prod
```

### Test Accounts

| Environment | Username | Password |
| --- | --- | --- |
| Mock (`pnpm start` / `pnpm start:dev`) | `admin` | `123456` |
| Staging (`pnpm start:staging`) | See backend seed data | See backend seed data |

> 💡 It is recommended to start the **gvray-admin** backend first, then use the `staging` environment to experience the full feature set.

For more configuration, see:

- `.env.dev`
- `.env.staging`
- `.env.prod`
- [Developer Guide](docs/developer-guide.md)

Backend repository:

👉 https://github.com/gvray/gvray-admin

## 🌱 Project Ecosystem

| Repo | Tech Stack |
| --- | --- |
| **[gvray-admin](https://github.com/gvray/gvray-admin)** | NestJS + Prisma |
| **[gvray-react](https://github.com/gvray/gvray-react)** | React + Umi |
| **[gvray-vite](https://github.com/gvray/gvray-vite)** | React + Vite |
| **[gvray-vue](https://github.com/gvray/gvray-vue)** | Vue3 + Vite + Element Plus |
| **[gvray-next](https://github.com/gvray/gvray-next)** | Next.js |

## ❤️ Support the Project

If this project helps you, a **⭐ Star** is always appreciated.

Your support is the biggest motivation for continuous iteration and improvement.
