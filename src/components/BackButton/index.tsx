import { ArrowLeftOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';
import { styled } from 'umi';

interface BackButtonProps {
  /** 点击回调 */
  onClick?: () => void;
  /** Tooltip 提示文字，默认 "返回" */
  tooltipTitle?: string;
}

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    var(--gvray-primary-color) 0%,
    var(--gvray-primary-color-hover) 100%
  );
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgb(from var(--gvray-primary-color) r g b / 0.35);
  }
`;

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  tooltipTitle = '返回',
}) => {
  return (
    <Tooltip title={tooltipTitle}>
      <Button onClick={onClick}>
        <ArrowLeftOutlined />
      </Button>
    </Tooltip>
  );
};

export default BackButton;
