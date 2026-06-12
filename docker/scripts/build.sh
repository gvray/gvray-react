#!/bin/bash

# ==========================================
# Docker 镜像构建脚本
# 支持多架构构建和版本管理
# ==========================================

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
IMAGE_NAME="react-umi-admin"
REGISTRY="${DOCKER_REGISTRY:-docker.io}"
NAMESPACE="${DOCKER_NAMESPACE:-gvray}"
VERSION="${VERSION:-latest}"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# 完整镜像名称
FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}"

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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    print_info "Docker 版本: $(docker --version)"
}

# 检查是否支持 buildx
check_buildx() {
    if docker buildx version &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 清理旧的构建缓存
clean_cache() {
    print_info "清理 Docker 构建缓存..."
    docker builder prune -f --filter "until=24h" || true
}

# 构建镜像
build_image() {
    local platform="${1:-linux/amd64}"
    local push="${2:-false}"

    print_info "开始构建 Docker 镜像..."
    print_info "镜像名称: ${FULL_IMAGE_NAME}:${VERSION}"
    print_info "平台架构: ${platform}"
    print_info "Git Commit: ${GIT_COMMIT}"
    print_info "Git Branch: ${GIT_BRANCH}"

    # 检查是否支持 buildx
    if check_buildx && [[ "${platform}" == *","* || "${push}" == "true" ]]; then
        # 使用 buildx（支持多架构和直接推送）
        print_info "使用 docker buildx build"

        BUILD_ARGS=(
            --build-arg "BUILD_DATE=${BUILD_DATE}"
            --build-arg "GIT_COMMIT=${GIT_COMMIT}"
            --build-arg "GIT_BRANCH=${GIT_BRANCH}"
            --build-arg "VERSION=${VERSION}"
            --platform "${platform}"
            --tag "${FULL_IMAGE_NAME}:${GIT_COMMIT}"
            --tag "${FULL_IMAGE_NAME}:latest"
        )

        # 指定了具体版本号时，额外添加版本标签
        if [ "${VERSION}" != "latest" ]; then
            BUILD_ARGS+=(--tag "${FULL_IMAGE_NAME}:${VERSION}")
        fi

        # 如果需要推送，添加 push 参数
        if [ "${push}" = "true" ]; then
            BUILD_ARGS+=(--push)
        else
            BUILD_ARGS+=(--load)
        fi

        docker buildx build "${BUILD_ARGS[@]}" --build-arg "BUILD_ENV=${BUILD_ENV}" .
    else
        # 使用普通 docker build
        print_info "使用 docker build"

        local extra_tag=""
        [ "${VERSION}" != "latest" ] && extra_tag="--tag ${FULL_IMAGE_NAME}:${VERSION}"

        docker build \
            --platform "${platform}" \
            --build-arg "BUILD_DATE=${BUILD_DATE}" \
            --build-arg "GIT_COMMIT=${GIT_COMMIT}" \
            --build-arg "GIT_BRANCH=${GIT_BRANCH}" \
            --build-arg "VERSION=${VERSION}" \
            --build-arg "BUILD_ENV=${BUILD_ENV}" \
            --tag "${FULL_IMAGE_NAME}:${GIT_COMMIT}" \
            --tag "${FULL_IMAGE_NAME}:latest" \
            ${extra_tag} \
            .
    fi

    if [ $? -eq 0 ]; then
        print_info "镜像构建成功！"
        print_info "镜像标签:"
        echo "  - ${FULL_IMAGE_NAME}:${GIT_COMMIT}"
        echo "  - ${FULL_IMAGE_NAME}:latest"
        [ "${VERSION}" != "latest" ] && echo "  - ${FULL_IMAGE_NAME}:${VERSION}" || true
    else
        print_error "镜像构建失败！"
        exit 1
    fi
}

# 多架构构建
build_multiarch() {
    print_info "开始多架构构建..."

    # 创建并使用 buildx builder
    docker buildx create --name multiarch-builder --use 2>/dev/null || docker buildx use multiarch-builder
    docker buildx inspect --bootstrap

    # 构建多架构镜像
    build_image "linux/amd64,linux/arm64" "true"

    print_info "多架构镜像构建完成！"
}

# 推送镜像
push_image() {
    print_info "推送镜像到仓库..."

    docker push "${FULL_IMAGE_NAME}:${GIT_COMMIT}"
    docker push "${FULL_IMAGE_NAME}:latest"

    if [ "${VERSION}" != "latest" ]; then
        docker push "${FULL_IMAGE_NAME}:${VERSION}"
    fi

    print_info "镜像推送成功！"
}

# 扫描镜像安全漏洞
scan_image() {
    print_info "扫描镜像安全漏洞..."

    if command -v trivy &> /dev/null; then
        trivy image "${FULL_IMAGE_NAME}:${VERSION}"
    else
        print_warn "Trivy 未安装，跳过安全扫描"
        print_warn "建议安装 Trivy: https://github.com/aquasecurity/trivy"
    fi
}

# 显示本次构建的镜像信息
show_image_info() {
    local push="${1:-false}"
    print_info "镜像信息:"
    local tags=("${GIT_COMMIT}" "latest")
    [ "${VERSION}" != "latest" ] && tags+=("${VERSION}") || true

    if [ "${push}" = "true" ] && check_buildx; then
        # 已通过 buildx 推送到 registry，从远端获取摘要
        printf "%-55s %-15s %s\n" "IMAGE" "TAG" "DIGEST"
        for tag in "${tags[@]}"; do
            local digest
            digest=$(docker buildx imagetools inspect "${FULL_IMAGE_NAME}:${tag}" 2>/dev/null \
                | awk '/^Digest:/{print $2; exit}')
            printf "%-55s %-15s %s\n" "${FULL_IMAGE_NAME}" "${tag}" "${digest:-N/A}"
        done
    else
        printf "%-60s %-15s %-12s %s\n" "REPOSITORY" "TAG" "SIZE" "CREATED AT"
        for tag in "${tags[@]}"; do
            docker images \
                --format "{{.Repository}}|{{.Tag}}|{{.Size}}|{{.CreatedAt}}" \
                2>/dev/null \
                | awk -F'|' -v img="${IMAGE_NAME}" -v t="${tag}" \
                    '$1 ~ img && $2 == t {printf "%-60s %-15s %-12s %s\n", $1, $2, $3, $4; exit}'
        done
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
Docker 镜像构建脚本

用法:
    ./scripts/build.sh [选项]

选项:
    -h, --help              显示帮助信息
    -v, --version VERSION   指定版本号 (默认: latest)
    -e, --env ENV           指定构建环境 dev/staging/prod (默认: prod)
    -p, --push              构建后推送到仓库
    -m, --multiarch         多架构构建 (amd64 + arm64)
    -s, --scan              构建后扫描安全漏洞
    -c, --clean             清理构建缓存

示例:
    # 构建生产环境镜像（默认）
    ./scripts/build.sh

    # 构建开发环境镜像
    ./scripts/build.sh -e dev

    # 构建预发布环境镜像并推送
    ./scripts/build.sh -e staging -v 1.0.0 -p

    # 多架构构建生产环境并推送
    ./scripts/build.sh -e prod -v 1.0.0 -m

    # 构建并扫描安全漏洞
    ./scripts/build.sh -s

环境变量:
    DOCKER_REGISTRY         Docker 仓库地址 (默认: docker.io)
    DOCKER_NAMESPACE        Docker 命名空间 (默认: gvray)
    VERSION                 镜像版本号 (默认: latest)
    BUILD_ENV               构建环境 (默认: prod)

EOF
}

# 主函数
main() {
    local push=false
    local multiarch=false
    local scan=false
    local clean=false
    local build_env="prod"  # 默认构建生产环境

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                VERSION="$2"
                shift 2
                ;;
            -e|--env)
                build_env="$2"
                shift 2
                ;;
            -p|--push)
                push=true
                shift
                ;;
            -m|--multiarch)
                multiarch=true
                push=true
                shift
                ;;
            -s|--scan)
                scan=true
                shift
                ;;
            -c|--clean)
                clean=true
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

    # 清理缓存
    if [ "${clean}" = "true" ]; then
        clean_cache
    fi

    # 设置构建环境变量
    export BUILD_ENV="${build_env}"
    print_info "构建环境: ${BUILD_ENV}"

    # 构建镜像
    if [ "${multiarch}" = "true" ]; then
        build_multiarch
    else
        build_image "linux/amd64" "${push}"

        # 推送镜像（buildx --push 已直接推送，无需再次推送）
        if [ "${push}" = "true" ] && ! check_buildx; then
            push_image
        fi
    fi

    # 安全扫描
    if [ "${scan}" = "true" ]; then
        scan_image
    fi

    # 显示镜像信息
    show_image_info "${push}"

    print_info "构建完成！"
}

# 执行主函数
main "$@"
