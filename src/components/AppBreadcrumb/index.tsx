import routes from '@/../config/routes';
import { useSettingStore } from '@/stores';
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import React, { useMemo } from 'react';
import { Link, useLocation } from 'umi';

interface RouteItem {
  path: string;
  meta?: { title?: string };
  routes?: RouteItem[];
  [key: string]: any;
}

interface BreadcrumbItem {
  title: React.ReactNode;
  /** 仅当路由有 component 时才设置，避免点击目录路由跳到空白页 */
  path?: string;
}

/**
 * 根据当前 pathname 从路由配置中构建面包屑链。
 * 支持嵌套路由和动态路由参数（如 :userId）。
 */
function buildBreadcrumbs(
  pathname: string,
  routeList: RouteItem[],
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [];

  const walk = (list: RouteItem[], segments: BreadcrumbItem[]): boolean => {
    for (const route of list) {
      if (!route.path) continue;

      // 跳过通配符路由（如 '*'）
      if (route.path === '*' || route.path.includes('*')) continue;

      // 动态路由匹配
      const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      const isExact = regex.test(pathname);
      const isPrefix = pathname.startsWith(route.path.replace(/:[^/]+/g, ''));

      if (isExact || isPrefix) {
        if (route.meta?.title) {
          segments.push({
            title: route.meta.title,
            // 只有有 component 的中间节点才可点击，目录节点不可点击
            path: !isExact && route.component ? route.path : undefined,
          });
        }

        if (isExact) {
          crumbs.push(...segments);
          return true;
        }

        if (route.routes && walk(route.routes, segments)) {
          return true;
        }

        // 回溯
        if (route.meta?.title) {
          segments.pop();
        }
      }
    }
    return false;
  };

  walk(routeList as RouteItem[], []);
  return crumbs;
}

const AppBreadcrumb: React.FC = () => {
  const { showBreadcrumb } = useSettingStore();
  const location = useLocation();

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(location.pathname, routes as RouteItem[]),
    [location.pathname],
  );

  if (!showBreadcrumb || breadcrumbs.length === 0) return null;

  const items = [
    {
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      ),
    },
    ...breadcrumbs.map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      return {
        title:
          !isLast && crumb.path ? (
            <Link to={crumb.path}>{crumb.title}</Link>
          ) : (
            crumb.title
          ),
      };
    }),
  ];

  return <Breadcrumb items={items} />;
};

export default AppBreadcrumb;
