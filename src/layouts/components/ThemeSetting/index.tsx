import { ColorPrimary, PRIMARY_COLOR_LABELS } from '@/constants';
import { useSettingStore } from '@/stores';
import { logger } from '@/utils';
import React, { useState } from 'react';
import { styled } from 'umi';
import ThemeColor from './ThemeColor';

interface ThemeSettingProps {
  onChange?: (theme: { label: string; color: string }) => void;
}

const ThemeSettingWrapper = styled.div`
  position: relative;
  width: 40px;
  text-align: center;
  .bar {
    cursor: pointer;
    font-weight: bold;
    height: 100%;
  }
  .box {
    position: absolute;
    padding: 8px 12px;
    list-style-type: none;
    background-color: #ffffff;
    background-clip: padding-box;
    border-radius: 8px;
    outline: none;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    top: 58px;
    right: 0px;
    z-index: 9;
  }
`;
const ThemeSetting: React.FC<ThemeSettingProps> = ({ onChange }) => {
  const { colorPrimary } = useSettingStore();
  const setColorPrimary = useSettingStore((s) => s.setColorPrimary);
  const [isVisible, setIsVisible] = useState(false);
  const themeSelectHandle = (selected: { label: string; color: string }) => {
    logger.info(`主题切换为：${selected.label} ${selected.color}`);
    setColorPrimary(selected.color as ColorPrimary);
    onChange?.(selected);
  };

  return (
    <ThemeSettingWrapper
      onMouseEnter={() => {
        setIsVisible(true);
      }}
      onMouseLeave={() => {
        setIsVisible(false);
      }}
    >
      <span className="bar">主题</span>
      {isVisible && (
        <div className="box">
          <ThemeColor
            value={colorPrimary}
            colorList={Object.entries(PRIMARY_COLOR_LABELS).map(
              ([color, label]) => {
                return {
                  color,
                  label,
                };
              },
            )}
            onChange={themeSelectHandle}
          />
        </div>
      )}
    </ThemeSettingWrapper>
  );
};

export default ThemeSetting;
