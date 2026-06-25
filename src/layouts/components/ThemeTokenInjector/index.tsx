import { theme } from 'antd';
import React, { useLayoutEffect } from 'react';

interface ThemeTokenInjectorProps {
  children: React.ReactNode;
}

/**
 * 将 antd Design Token 注入到 :root CSS 变量
 * 供 Less / styled-components 通过 var(--gvray-xxx) 消费主题色
 * 支持主题切换和昼夜模式
 *
 * ⚠️ 设计原则：
 * 1. Less 文件 → 用 var(--gvray-xxx)
 * 2. styled-components → 用 var(--gvray-xxx)（静态样式，性能好）
 * 3. ECharts / Canvas / Watermark → 用 theme.useToken()（canvas 无法解析 CSS 变量）
 *
 * 💡 包裹位置：必须在 ConfigProvider 内部（需要 useToken），在 AppLayout 外部（越早注入越好）。
 *    使用 useLayoutEffect 确保在浏览器 paint 前注入，避免首次渲染闪烁。
 */
const ThemeTokenInjector: React.FC<ThemeTokenInjectorProps> = ({
  children,
}) => {
  const { token } = theme.useToken();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const vars: string[] = [];

    const setVar = (name: string, value: string | number) => {
      const cssVarName = `--gvray-${name}`;
      root.style.setProperty(cssVarName, String(value));
      vars.push(cssVarName);
    };

    // 主色系
    setVar('primary-color', token.colorPrimary);
    setVar('primary-color-hover', token.colorPrimaryHover);
    setVar('primary-color-active', token.colorPrimaryActive);
    setVar('primary-color-outline', token.colorPrimaryBg);

    // 功能色
    setVar('success-color', token.colorSuccess);
    setVar('success-color-bg', token.colorSuccessBg);
    setVar('success-color-border', token.colorSuccessBorder);
    setVar('warning-color', token.colorWarning);
    setVar('warning-color-bg', token.colorWarningBg);
    setVar('warning-color-border', token.colorWarningBorder);
    setVar('error-color', token.colorError);
    setVar('error-color-bg', token.colorErrorBg);
    setVar('error-color-border', token.colorErrorBorder);
    setVar('info-color', token.colorInfo);
    setVar('info-color-bg', token.colorInfoBg);
    setVar('info-color-border', token.colorInfoBorder);

    // 文本色
    setVar('text-color', token.colorText);
    setVar('text-color-secondary', token.colorTextSecondary);
    setVar('text-color-disabled', token.colorTextDisabled);
    setVar('text-color-placeholder', token.colorTextPlaceholder);
    setVar('heading-color', token.colorTextHeading);
    setVar('text-label', token.colorTextLabel);
    setVar('text-description', token.colorTextDescription);

    // 背景色
    setVar('bg-color', token.colorBgBase);
    setVar('bg-container', token.colorBgContainer);
    setVar('bg-elevated', token.colorBgElevated);
    setVar('bg-layout', token.colorBgLayout);
    setVar('bg-spotlight', token.colorBgSpotlight);
    setVar('bg-mask', token.colorBgMask);

    // 边框 / 分割线
    setVar('border-color', token.colorBorder);
    setVar('border-color-secondary', token.colorBorderSecondary);
    setVar('border-color-split', token.colorSplit);

    // 填充色
    setVar('fill-color', token.colorFill);
    setVar('fill-color-secondary', token.colorFillSecondary);
    setVar('fill-color-tertiary', token.colorFillTertiary);
    setVar('fill-color-quaternary', token.colorFillQuaternary);

    // 尺寸
    setVar('border-radius', `${token.borderRadius}px`);
    setVar('border-radius-lg', `${token.borderRadiusLG}px`);
    setVar('border-radius-sm', `${token.borderRadiusSM}px`);
    setVar('border-radius-xs', `${token.borderRadiusXS}px`);

    // 阴影
    setVar('box-shadow', token.boxShadow);
    setVar('box-shadow-secondary', token.boxShadowSecondary);
    setVar('box-shadow-tertiary', token.boxShadowTertiary);

    // 主色衍生（背景/边框/悬浮）
    setVar('primary-1', token.colorPrimaryBg);
    setVar('primary-2', token.colorPrimaryBgHover);
    setVar('primary-3', token.colorPrimaryBorder);
    setVar('primary-4', token.colorPrimaryBorderHover);
    setVar('primary-5', token.colorPrimaryHover);
    setVar('primary-6', token.colorPrimary);
    setVar('primary-7', token.colorPrimaryActive);

    // 链接色
    setVar('link-color', token.colorLink);
    setVar('link-hover-color', token.colorLinkHover);
    setVar('link-active-color', token.colorLinkActive);

    // 图标色
    setVar('icon-color', token.colorIcon);
    setVar('icon-color-hover', token.colorIconHover);

    return () => {
      // 组件卸载时清理所有注入的变量
      vars.forEach((name) => {
        root.style.removeProperty(name);
      });
    };
  }, [token]);

  return <>{children}</>;
};

export default ThemeTokenInjector;
