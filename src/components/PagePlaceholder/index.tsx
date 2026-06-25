import React from 'react';

export type PagePlaceholderProps = {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  minHeight?: number;
  className?: string;
  style?: React.CSSProperties;
};

const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  icon,
  children,
  minHeight = 240,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--gvray-text-color-placeholder)',
        padding: '24px 16px',
        textAlign: 'center',
        ...style,
      }}
    >
      {icon ? (
        <div
          style={{
            fontSize: 48,
            color: 'var(--gvray-text-color-placeholder)',
            marginBottom: 16,
          }}
        >
          {icon}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default PagePlaceholder;
