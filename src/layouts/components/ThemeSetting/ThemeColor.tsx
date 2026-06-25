import { CheckOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';
import { styled } from 'umi';

const ThemeColors = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 196px;
`;

const ColorDot = styled.button<{ $color: string; $active: boolean }>`
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  background-color: ${({ $color }) => $color};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }

  ${({ $active }) =>
    $active &&
    `
      box-shadow: 0 0 0 2px var(--gvray-bg-container), 0 0 0 4px var(--gvray-primary-color);
    `}
`;

interface ThemeColorProps {
  colorList: { color: string; label: string }[];
  value: string;
  onChange?: (theme: { label: string; color: string }) => void;
}

const ThemeColor: React.FC<ThemeColorProps> = ({
  colorList,
  value,
  onChange,
}) => {
  return (
    <ThemeColors>
      {colorList.map(({ color, label }) => (
        <Tooltip key={color} title={label}>
          <ColorDot
            type="button"
            $color={color}
            $active={value === color}
            onClick={() => onChange?.({ color, label })}
            aria-label={`选择主题色 ${label}`}
          >
            {value === color && <CheckOutlined />}
          </ColorDot>
        </Tooltip>
      ))}
    </ThemeColors>
  );
};

export default ThemeColor;
