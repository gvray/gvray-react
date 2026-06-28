import { ColorPrimary, PRIMARY_COLOR_LABELS } from '@/constants';
import { updateProfileSettings } from '@/services/profile';
import { useSettingStore } from '@/stores';
import { FormatPainterOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import React from 'react';
import { styled } from 'umi';
import ThemeColor from './ThemeColor';

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

interface ThemeSettingProps {
  onChange?: (theme: { label: string; color: string }) => void;
}

const ThemeSetting: React.FC<ThemeSettingProps> = ({ onChange }) => {
  const { colorPrimary } = useSettingStore();
  const setColorPrimary = useSettingStore((s) => s.setColorPrimary);

  const themeSelectHandle = (selected: { label: string; color: string }) => {
    setColorPrimary(selected.color as ColorPrimary);
    updateProfileSettings({ colorPrimary: selected.color }).catch(() => {
      // silent
    });
    onChange?.(selected);
  };

  const colorList = Object.entries(PRIMARY_COLOR_LABELS).map(
    ([color, label]) => ({ color, label }),
  );

  return (
    <Popover
      placement="bottomRight"
      trigger="click"
      arrow={false}
      styles={{ body: { padding: '8px 12px' } }}
      content={
        <ThemeColor
          value={colorPrimary}
          colorList={colorList}
          onChange={themeSelectHandle}
        />
      }
    >
      <Trigger>
        <FormatPainterOutlined />
        <span>主题</span>
      </Trigger>
    </Popover>
  );
};

export default ThemeSetting;
