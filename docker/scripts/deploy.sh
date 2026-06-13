#!/bin/bash

# ==========================================
# Docker 部署脚本
# 支持多环境部署和回滚
# ==========================================

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
IMAGE_NAME="gvray-react"
REGISTRY="${DOCKER_REGISTRY:-docker.io}"
NAMESPACE="${DOCKER_NAMESPACE:-gvray}"
VERSION="${VERSION:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-gvray-react-web}"
ENVIRONMENT="${ENVIRONMENT:-production}"
PLATFORM="${PLATFORM:-linux/amd64}"

# 完整镜像名称
FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}"

# 打印信息
print_info() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

print_warn() {
    printf "${YELLOW}[WARN]${NC} %s\n" "$1"
}

print_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
}

print_step() {
    printf "${BLUE}[STEP]${NC} %s\n" "$1"
}

# 检查 Docker 是否运行
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker 未运行，请启动 Docker"
        exit 1
    fi
}

# 拉取最新镜像
pull_image() {
    print_step "拉取镜像: ${FULL_IMAGE_NAME}"
    
    if docker pull --platform "${PLATFORM}" "${FULL_IMAGE_NAME}"; then
        print_info "镜像拉取成功"
    else
        print_error "镜像拉取失败"
        exit 1
    fi
}

# 备份当前容器
backup_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_step "备份当前容器..."

        local backup_name="${CONTAINER_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
        docker rename "${CONTAINER_NAME}" "${backup_name}" || true
        docker stop "${backup_name}" || true

        print_info "容器已备份为: ${backup_name}"
    fi
}

# 停止并删除旧容器
stop_old_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_step "停止旧容器..."
        docker stop "${CONTAINER_NAME}" || true
        docker rm "${CONTAINER_NAME}" || true
        print_info "旧容器已删除"
    fi
}

# 启动新容器
start_container() {
    print_step "启动新容器..."

    docker run -d \
        --name "${CONTAINER_NAME}" \
        --platform "${PLATFORM}" \
        --restart unless-stopped \
        -p 8080:80 \
        -e TZ=Asia/Shanghai \
        -e NODE_ENV="${ENVIRONMENT}" \
        -v "$(pwd)/logs/nginx:/var/log/nginx" \
        --health-cmd="curl -f http://localhost/health || exit 1" \
        --health-interval=30s \
        --health-timeout=3s \
        --health-retries=3 \
        --health-start-period=10s \
        "${FULL_IMAGE_NAME}"

    print_info "容器已启动: ${CONTAINER_NAME}"
}

# 等待容器健康
wait_for_health() {
    print_step "等待容器健康检查..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "unknown")

        if [ "$health_status" = "healthy" ]; then
            print_info "容器健康检查通过"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo ""
    print_error "容器健康检查超时"
    return 1
}

# 清理旧备份
cleanup_backups() {
    print_step "清理旧备份..."

    # 保留最近 3 个备份
    local backups=$(docker ps -a --format '{{.Names}}' | grep "^${CONTAINER_NAME}_backup_" | sort -r | tail -n +4)

    if [ -n "$backups" ]; then
        echo "$backups" | xargs -r docker rm -f
        print_info "已清理旧备份"
    else
        print_info "无需清理"
    fi
}

# 回滚到上一个版本
rollback() {
    print_warn "开始回滚..."

    # 查找最新的备份
    local latest_backup=$(docker ps -a --format '{{.Names}}' | grep "^${CONTAINER_NAME}_backup_" | sort -r | head -n 1)

    if [ -z "$latest_backup" ]; then
        print_error "未找到备份容器，无法回滚"
        exit 1
    fi

    print_info "找到备份: ${latest_backup}"

    # 停止当前容器
    docker stop "${CONTAINER_NAME}" || true
    docker rm "${CONTAINER_NAME}" || true

    # 恢复备份
    docker rename "${latest_backup}" "${CONTAINER_NAME}"
    docker start "${CONTAINER_NAME}"

    print_info "回滚完成"
}

# 查看容器日志
show_logs() {
    print_step "查看容器日志..."
    docker logs -f --tail=100 "${CONTAINER_NAME}"
}

# 查看容器状态
show_status() {
    print_step "容器状态:"
    docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    print_step "容器资源使用:"
    docker stats --no-stream "${CONTAINER_NAME}" 2>/dev/null || print_warn "容器未运行"
}

# 使用 docker-compose 部署
deploy_with_compose() {
    print_step "使用 docker-compose 部署..."

    if [ ! -f "docker-compose.yml" ]; then
        print_error "未找到 docker-compose.yml 文件"
        exit 1
    fi

    # 导出变量供 docker-compose.yml 使用
    export DOCKER_REGISTRY DOCKER_NAMESPACE VERSION PLATFORM

    # 拉取镜像
    docker-compose pull

    # 启动服务（使用 registry 镜像，不重新构建）
    docker-compose up -d --no-build

    # 查看状态
    docker-compose ps

    print_info "部署完成"
}

# 显示帮助信息
show_help() {
    cat << EOF
Docker 部署脚本

用法:
    ./scripts/deploy.sh [选项] [命令]

命令:
    deploy              部署应用 (默认)
    rollback            回滚到上一个版本
    status              查看容器状态
    logs                查看容器日志
    compose             使用 docker-compose 部署
    stop                停止容器
    restart             重启容器

选项:
    -h, --help              显示帮助信息
    -v, --version VER       指定版本号 (默认: latest)
    -e, --env ENV           指定环境 (默认: production)
    -P, --platform PLAT     指定目标平台 (默认: linux/amd64)

示例:
    # 部署最新版本
    ./scripts/deploy.sh

    # 部署指定版本
    ./scripts/deploy.sh -v 1.0.0

    # 回滚到上一个版本
    ./scripts/deploy.sh rollback

    # 查看容器状态
    ./scripts/deploy.sh status

    # 使用 docker-compose 部署
    ./scripts/deploy.sh compose

环境变量:
    DOCKER_REGISTRY     Docker 仓库地址
    DOCKER_NAMESPACE    Docker 命名空间
    VERSION             镜像版本号
    CONTAINER_NAME      容器名称
    ENVIRONMENT         部署环境
    PLATFORM            目标平台 (默认: linux/amd64)

EOF
}

# 主函数
main() {
    local command="deploy"

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                VERSION="$2"
                FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}"
                shift 2
                ;;
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -P|--platform)
                PLATFORM="$2"
                shift 2
                ;;
            deploy|rollback|status|logs|compose|stop|restart)
                command="$1"
                shift
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # 检查环境
    check_docker

    # 执行命令
    case $command in
        deploy)
            print_info "开始部署: ${FULL_IMAGE_NAME}"
            pull_image
            backup_container
            stop_old_container
            start_container

            if wait_for_health; then
                cleanup_backups
                print_info "部署成功！"
                show_status
            else
                print_error "部署失败，开始回滚..."
                rollback
                exit 1
            fi
            ;;
        rollback)
            rollback
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        compose)
            deploy_with_compose
            ;;
        stop)
            docker stop "${CONTAINER_NAME}"
            print_info "容器已停止"
            ;;
        restart)
            docker restart "${CONTAINER_NAME}"
            print_info "容器已重启"
            ;;
    esac
}

# 执行主函数
main "$@"
