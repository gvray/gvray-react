import React from 'react';
import { styled, useNavigate } from 'umi';

interface LogoProps {
  theme?: 'light' | 'dark';
  collapsed?: boolean;
  title?: string;
}

const LogoWrapper = styled.div<{
  $themeMode?: 'light' | 'dark';
  $collapsed?: boolean;
}>`
  margin: ${(props) => (props.$collapsed ? '12px 8px' : '12px 10px 2px 10px')};
  border-radius: ${(props) => (props.$collapsed ? '24px' : '8px')};
  /* 文字颜色必须跟随 sidebar theme，而非全局 CSS 变量 */
  color: ${(props) =>
    props.$themeMode === 'dark'
      ? 'rgba(255,255,255,0.85)'
      : 'var(--gvray-text-color)'};
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

const Logo: React.FC<LogoProps> = ({ theme = 'light', collapsed, title }) => {
  const navigate = useNavigate();
  return (
    <LogoWrapper
      $themeMode={theme}
      $collapsed={collapsed}
      onClick={() => {
        navigate('/');
      }}
    >
      <img className="logo-img" src="/logo.svg" alt="Logo" />
      {!collapsed && <strong className="logo-title">{title}</strong>}
    </LogoWrapper>
  );
};

export default Logo;
