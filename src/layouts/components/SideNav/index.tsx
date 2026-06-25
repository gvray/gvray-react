import AntIcon from '@/components/AntIcon';
import type { SiderTheme } from '@/constants/runtime-settings';
import { useAuthStore, useSettingStore } from '@/stores';
import { runtimeConfig } from '@/utils/runtime-config';
import type { MenuProps } from 'antd';
import { Layout, Menu, Skeleton } from 'antd';
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
  sidebarTheme: SiderTheme;
  width?: number;
  collapsedWidth?: number;
  showLogo?: boolean;
}

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
  sidebarTheme,
  width = 220,
  collapsedWidth = 64,
  showLogo = true,
}) => {
  const menus = useAuthStore((s) => s.menus);
  const siteName = runtimeConfig.get().system.name;
  const toggleSidebarCollapsed = useSettingStore(
    (s) => s.toggleSidebarCollapsed,
  );

  const location = useLocation();

  const isDark = sidebarTheme === 'dark';
  const loading = menus === undefined;

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

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

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelectedKeys([e.key]);
    history.push(e.key);
  };

  const items = useMemo(() => {
    return transformMenuItems(menus || []);
  }, [menus]);

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <SiderWrapper>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={width}
        collapsedWidth={collapsedWidth}
        theme={sidebarTheme}
        style={{
          ...siderStyle,
        }}
      >
        {showLogo && (
          <Logo theme={sidebarTheme} title={siteName} collapsed={collapsed} />
        )}

        <Skeleton loading={loading} active round style={{ padding: 15 }}>
          <Menu
            mode="inline"
            theme={sidebarTheme}
            inlineIndent={10}
            items={items}
            openKeys={openKeys}
            selectedKeys={selectedKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            onClick={handleMenuClick}
          />
        </Skeleton>
      </Sider>

      <CollapseTrigger
        collapsed={collapsed}
        dark={isDark}
        onToggle={toggleSidebarCollapsed}
      />
    </SiderWrapper>
  );
};

export default SideNav;
