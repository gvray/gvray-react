import AntIcon from '@/components/AntIcon';
import { useAuthStore, useSettingStore } from '@/stores';
import type { SiderTheme } from '@/types/settings';
import { runtimeConfig } from '@/utils/runtime-config';
import { AppstoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { ConfigProvider, Layout, Menu, Skeleton } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { history, styled, useLocation } from 'umi';
import Logo from '../Logo';
import CollapseTrigger from './CollapseTrigger';

const { Sider } = Layout;

const SiderWrapper = styled.div`
  position: relative;
  height: 100vh;
`;

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

interface SideNavProps {
  collapsed: boolean;
  theme?: SiderTheme;
  width?: number;
  collapsedWidth?: number;
  showLogo?: boolean;
}

/**
 * 菜单转换
 */
const transformMenuItems = (
  menuData: any[],
): NonNullable<MenuProps['items']> => {
  return (menuData || [])
    .filter((item: any) => item.hidden !== true)
    .map((item: any) => ({
      key: item.path || item.key,
      icon: item.icon ? <AntIcon icon={item.icon} /> : undefined,
      label: item.name || item.label,
      children: item.children?.length
        ? transformMenuItems(item.children)
        : undefined,
    }));
};

const SideNav: React.FC<SideNavProps> = ({
  collapsed,
  theme = 'dark',
  width = 220,
  collapsedWidth = 64,
  showLogo = true,
}) => {
  const menus = useAuthStore((s) => s.menus);
  const siteName = runtimeConfig.get().system.name;
  const toggleCollapsed = useSettingStore((s) => s.toggleCollapsed);

  const location = useLocation();

  const isDark = theme === 'dark';
  const loading = menus === undefined;

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  /**
   * menus -> menu items
   */
  const items = useMemo(() => {
    return transformMenuItems(menus || []);
  }, [menus]);

  /**
   * 路由变化同步菜单状态（展开 + 高亮）
   */
  useEffect(() => {
    const pathname = location.pathname;

    setSelectedKeys([pathname]);

    const segments = pathname.split('/').filter(Boolean);

    const keys: string[] = [];
    let path = '';

    for (let i = 0; i < segments.length - 1; i++) {
      path += `/${segments[i]}`;
      keys.push(path);
    }

    setOpenKeys(keys);
  }, [location.pathname]);

  /**
   * 点击菜单跳转
   */
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelectedKeys([e.key]);
    history.push(e.key);
  };

  /**
   * 暗色主题 token
   */
  const darkSiderTokens = useMemo(() => {
    if (!isDark) return undefined;

    return {
      components: {
        Menu: {
          darkItemBg: '#001529',
          darkSubMenuItemBg: '#000c17',
          darkItemSelectedBg: '#1677ff',
        },
      },
    };
  }, [isDark]);

  const siderContent = (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={width}
      collapsedWidth={collapsedWidth}
      theme={theme}
      style={siderStyle}
    >
      {showLogo && (
        <Logo theme={theme} title={siteName} collapsed={collapsed} />
      )}

      <Skeleton loading={loading} active round style={{ padding: 15 }}>
        {!loading && items.length === 0 ? (
          collapsed ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 24,
              }}
            >
              <AppstoreOutlined
                style={{
                  fontSize: 20,
                  color: isDark ? 'rgba(255,255,255,0.25)' : '#d9d9d9',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 16px',
                color: isDark ? 'rgba(255,255,255,0.45)' : '#999',
                textAlign: 'center',
              }}
            >
              <AppstoreOutlined
                style={{
                  fontSize: 40,
                  color: isDark ? 'rgba(255,255,255,0.2)' : '#d9d9d9',
                  marginBottom: 12,
                }}
              />
              <div style={{ fontSize: 14, marginBottom: 4 }}>暂无可用菜单</div>
              <div
                style={{
                  fontSize: 12,
                  color: isDark ? 'rgba(255,255,255,0.3)' : '#bfbfbf',
                }}
              >
                当前账号暂无菜单权限
              </div>
            </div>
          )
        ) : (
          <Menu
            mode="inline"
            theme={theme}
            inlineIndent={10}
            items={items}
            openKeys={openKeys}
            selectedKeys={selectedKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            onClick={handleMenuClick}
          />
        )}
      </Skeleton>
    </Sider>
  );

  return (
    <SiderWrapper>
      {isDark ? (
        <ConfigProvider theme={darkSiderTokens}>{siderContent}</ConfigProvider>
      ) : (
        siderContent
      )}

      <CollapseTrigger
        collapsed={collapsed}
        dark={isDark}
        onToggle={toggleCollapsed}
      />
    </SiderWrapper>
  );
};

export default SideNav;
