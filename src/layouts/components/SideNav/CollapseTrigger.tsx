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
    $dark
      ? 'var(--gvray-text-color-secondary)'
      : 'var(--gvray-text-color-placeholder)'};
  background: ${({ $dark }) =>
    $dark ? 'var(--gvray-bg-container)' : 'var(--gvray-bg-elevated)'};
  border: 1px solid var(--gvray-border-color);
  box-shadow: var(--gvray-box-shadow);
  &:hover {
    color: var(--gvray-text-color);
    box-shadow: var(--gvray-box-shadow-secondary);
  }
  &:focus-visible {
    box-shadow: 0 0 0 2px var(--gvray-primary-color-outline),
      var(--gvray-box-shadow-secondary);
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
