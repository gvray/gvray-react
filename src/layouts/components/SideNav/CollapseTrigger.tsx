import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React, { memo } from 'react';
import { styled } from 'umi';

const TriggerWrapper = styled.div`
  position: absolute;
  top: 108px;
  right: 0;
  z-index: 101;
  transform: translateX(50%);
`;

const TriggerButton = styled.button<{
  $dark: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  font-size: 11px;
  transition: color 0.2s ease, box-shadow 0.2s ease;
  color: ${({ $dark }) =>
    $dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)'};
  background: ${({ $dark }) => ($dark ? '#002140' : '#f5f5f5')};
  border: ${({ $dark }) =>
    $dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'};
  box-shadow: ${({ $dark }) =>
    $dark ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.05)'};
  &:hover {
    color: ${({ $dark }) =>
      $dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.12);
  }
`;

export interface CollapseTriggerProps {
  collapsed: boolean;
  dark?: boolean;
  onToggle: () => void;
}

const CollapseTrigger: React.FC<CollapseTriggerProps> = ({
  collapsed,
  dark = false,
  onToggle,
}) => {
  const icon = collapsed ? <RightOutlined /> : <LeftOutlined />;

  return (
    <TriggerWrapper>
      <TriggerButton
        type="button"
        $dark={dark}
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {icon}
      </TriggerButton>
    </TriggerWrapper>
  );
};

export default memo(CollapseTrigger);
