# Docker 部署文档

## 📦 概述

本项目提供了完整的 Docker 化解决方案，支持：

- ✅ 多阶段构建，优化镜像大小
- ✅ 多架构支持（amd64 + arm64）
- ✅ 生产级 Nginx 配置
- ✅ 健康检查和自动重启
- ✅ 一键构建和部署脚本
- ✅ Docker Compose 编排
- ✅ 安全扫描和优化

## 🚀 快速开始

### 方式一：使用 pnpm scripts（推荐）

```bash
# 构建镜像
pnpm docker:build

# 运行容器
pnpm docker:run

# 查看日志
pnpm docker:logs

# 停止容器
pnpm docker:stop

# 使用 docker-compose
pnpm docker:compose:up
pnpm docker:compose:logs
pnpm docker:compose:down
```

### 方式二：使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方式三：使用脚本（DevOps/高级功能）

```bash
# 构建镜像
./docker/scripts/build.sh

# 部署应用
./docker/scripts/deploy.sh

# 查看帮助
./docker/scripts/build.sh --help
./docker/scripts/deploy.sh --help
```

## 🏗️ 构建镜像

### 基础构建

```bash
# 构建本地镜像
pnpm docker:build

# 或使用脚本（高级功能）
./docker/scripts/build.sh
```

### 指定版本构建

```bash
# 构建指定版本
./docker/scripts/build.sh -v 1.0.0

# 构建并推送到仓库
./docker/scripts/build.sh -v 1.0.0 -p
```

### 多架构构建

```bash
# 构建 amd64 + arm64 架构（需要使用脚本）
./docker/scripts/build.sh -m
```

### 安全扫描

```bash
# 构建并扫描安全漏洞（需要使用脚本）
./docker/scripts/build.sh -s
```

## 📦 部署应用

### 单容器部署

```bash
# 运行容器
pnpm docker:run

# 或使用脚本部署（支持更多功能）
./docker/scripts/deploy.sh -v 1.0.0
```

### Docker Compose 部署

```bash
# 启动所有服务
pnpm docker:compose:up

# 或直接使用 docker-compose
docker-compose up -d
```

### 回滚操作

```bash
# 回滚到上一个版本（需要使用脚本）
./docker/scripts/deploy.sh rollback
```

## 🔧 配置说明

### 环境变量

在部署时可以通过环境变量进行配置：

```bash
# Docker 仓库配置
export DOCKER_REGISTRY=docker.io
export DOCKER_NAMESPACE=your-namespace

# 版本配置
export VERSION=1.0.0

# 容器配置
export CONTAINER_NAME=gvray-react-web
export ENVIRONMENT=production
```

### Nginx 配置

Nginx 配置文件位于 `docker/` 目录：

- `nginx.conf` - 主配置文件
- `default.conf` - 站点配置文件

主要特性：

- ✅ Gzip 压缩
- ✅ 静态资源缓存
- ✅ API 代理配置
- ✅ 安全头设置
- ✅ SPA 路由支持

### 端口映射

默认端口映射：

- 前端应用：`8080:80`
- 后端 API（如需要）：`3000:3000`

修改端口：

```bash
# 修改 docker-compose.yml
ports:
  - "8888:80"  # 改为 8888 端口
```

## 监控和日志

### 查看容器状态

```bash
# 查看容器日志
pnpm docker:logs

# 或使用 docker-compose
pnpm docker:compose:logs

# 查看资源使用
docker stats gvray-react-web

# 健康检查
curl http://localhost:8080/health
```

### 查看日志

```bash
# 实时查看日志
pnpm docker:logs

# 查看最近 100 行日志
docker logs --tail=100 gvray-react-web

# 查看 Nginx 访问日志
tail -f logs/nginx/access.log

# 查看 Nginx 错误日志
tail -f logs/nginx/error.log
```

### 进入容器

```bash
# 进入容器 shell
docker exec -it gvray-react-web sh
```

## 🔒 安全最佳实践

### 1. 使用非 root 用户

Dockerfile 已配置使用非 root 用户运行：

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs
```

### 2. 安全扫描

定期扫描镜像安全漏洞：

```bash
# 使用脚本构建并扫描
./docker/scripts/build.sh -s

# 或手动扫描
trivy image gvray-react:latest
```

### 3. 最小化镜像

使用多阶段构建，最终镜像基于 `nginx:alpine`：

- 基础镜像：~50MB
- 应用代码：~10-20MB
- 总大小：~60-70MB

### 4. 安全头配置

Nginx 已配置安全响应头：

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🚀 CI/CD 集成

### GitHub Actions 示例

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker Image
        run: |
          ./docker/scripts/build.sh -v ${{ github.ref_name }} -p

      - name: Deploy
        run: |
          ./docker/scripts/deploy.sh -v ${{ github.ref_name }}
```

### GitLab CI 示例

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - ./docker/scripts/build.sh -v $CI_COMMIT_TAG -p

deploy:
  stage: deploy
  script:
    - ./docker/scripts/deploy.sh -v $CI_COMMIT_TAG
  only:
    - tags
```

## 🛠️ 故障排查

### 容器无法启动

```bash
# 查看容器日志
docker logs gvray-react-web

# 检查容器状态
docker inspect gvray-react-web

# 查看健康检查状态
docker inspect --format='{{.State.Health.Status}}' gvray-react-web
```

### 健康检查失败

```bash
# 手动测试健康检查
curl http://localhost:8080/health

# 进入容器检查
docker exec -it gvray-react-web sh
curl http://localhost/health
```

### 镜像构建失败

```bash
# 清理构建缓存
docker builder prune -f

# 重新构建
pnpm docker:build

# 查看详细日志
docker build --no-cache --progress=plain .
```

### 端口冲突

```bash
# 查看端口占用
lsof -i :8080

# 修改端口映射
docker run -p 8888:80 gvray-react:latest
```

## 📚 常用命令速查

| 命令                                 | 说明              |
| ------------------------------------ | ----------------- |
| `pnpm docker:build`                  | 构建镜像          |
| `pnpm docker:run`                    | 运行容器          |
| `pnpm docker:logs`                   | 查看日志          |
| `pnpm docker:stop`                   | 停止容器          |
| `pnpm docker:compose:up`             | 启动所有服务      |
| `pnpm docker:compose:down`           | 停止所有服务      |
| `pnpm docker:compose:logs`           | 查看 compose 日志 |
| `docker exec -it gvray-react-web sh` | 进入容器          |
| `docker stats gvray-react-web`       | 查看资源使用      |

## 🔗 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [多阶段构建最佳实践](https://docs.docker.com/build/building/multi-stage/)

## 📝 注意事项

1. **生产环境部署前**，请修改以下配置：

   - Docker 仓库地址和命名空间
   - 容器名称和端口映射
   - 环境变量配置
   - Nginx 配置（根据实际需求）

2. **API 代理配置**：

   - 如需代理后端 API，修改 `docker/default.conf` 中的 `upstream` 配置
   - 取消注释 `location /api/` 部分

3. **数据持久化**：

   - 日志文件已挂载到 `./logs/nginx`
   - 如需持久化其他数据，添加相应的 volume 配置

4. **资源限制**：
   - 生产环境建议添加资源限制（CPU、内存）
   - 在 `docker-compose.yml` 中添加 `deploy.resources` 配置
