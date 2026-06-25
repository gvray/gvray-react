import { THEME_MODE_LABELS } from '@/constants';
import type { ThemeMode } from '@/constants/theme';
import { updateProfileSettings } from '@/services/profile';
import { useSettingStore } from '@/stores';
import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import React from 'react';
import { styled } from 'umi';

const ICON_MAP: Record<ThemeMode, React.ReactNode> = {
  light: <SunOutlined />,
  dark: <MoonOutlined />,
  system: <DesktopOutlined />,
};

const Trigger = styled.div`
  cursor: pointer;
  height: 42px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
`;

const ThemeModeSwitch: React.FC = () => {
  const theme = useSettingStore((s) => s.theme);
  const setTheme = useSettingStore((s) => s.setTheme);

  const items: MenuProps['items'] = (
    Object.entries(THEME_MODE_LABELS) as [ThemeMode, string][]
  ).map(([key, label]) => ({
    key,
    label,
    icon: ICON_MAP[key],
  }));

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    const mode = key as ThemeMode;
    setTheme(mode);
    updateProfileSettings({ theme: mode }).catch(() => {});
  };

  return (
    <Dropdown
      menu={{ items, selectedKeys: [theme], onClick: handleClick }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Trigger>
        {ICON_MAP[theme]}
        <span>{THEME_MODE_LABELS[theme]}</span>
      </Trigger>
    </Dropdown>
  );
};

export default ThemeModeSwitch;
