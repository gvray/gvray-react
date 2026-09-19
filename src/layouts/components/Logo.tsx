import { publicAsset } from '@/utils';
import React from 'react';
import { styled, useNavigate } from 'umi';

interface LogoProps {
  collapsed?: boolean;
  title?: string;
}

const LogoWrapper = styled.div<{
  $collapsed?: boolean;
}>`
  margin: ${(props) => (props.$collapsed ? '12px 8px' : '12px 10px 2px 10px')};
  border-radius: ${(props) => (props.$collapsed ? '24px' : '8px')};
  /* 颜色由 ThemeTokenInjector 注入的 --gvray-sider-text 变量控制 */
  color: var(--gvray-sider-text);
  line-height: 32px;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  font-size: ${(props) => (props.$collapsed ? '16px' : '20px')};
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};
  gap: 8px;
  height: 48px;
  min-width: 48px;
  padding-left: ${(props) => (props.$collapsed ? '0' : '8px')};
  .logo-img {
    width: 1.8em;
    height: 1.8em;
  }
  .logo-title {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
`;

const Logo: React.FC<LogoProps> = ({ collapsed, title }) => {
  const navigate = useNavigate();
  return (
    <LogoWrapper
      $collapsed={collapsed}
      onClick={() => {
        navigate('/');
      }}
    >
      <img className="logo-img" src={publicAsset('logo.svg')} alt="Logo" />
      {!collapsed && <strong className="logo-title">{title}</strong>}
    </LogoWrapper>
  );
};

export default Logo;
