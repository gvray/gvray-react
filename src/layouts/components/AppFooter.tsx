import { Layout } from 'antd';
import React from 'react';
import { styled } from 'umi';

const { Footer } = Layout;

interface AppFooterProps {
  visible?: boolean;
  text?: string;
  copyright?: string;
  icp?: string;
}

const AppFooterRoot = styled(Footer)`
  margin-bottom: 20px;
  padding: 0;
  color: var(--gvray-text-color-secondary);
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

const AppFooter: React.FC<AppFooterProps> = ({
  visible = false,
  text,
  copyright,
  icp,
}) => {
  if (!visible || (!text && !copyright && !icp)) return null;

  return (
    <AppFooterRoot>
      {text && <span>{text}</span>}
      {text && (copyright || icp) && <span>|</span>}
      {copyright && <span>{copyright}</span>}
      {copyright && icp && <span>|</span>}
      {icp && <span>{icp}</span>}
    </AppFooterRoot>
  );
};

export default AppFooter;
