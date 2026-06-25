import { BugOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Result, Space, Typography } from 'antd';
import React, { Component, ErrorInfo } from 'react';
import { history } from 'umi';

const { Paragraph, Text } = Typography;

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // TODO: report to Sentry or other error tracking service
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    history.push('/');
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--gvray-bg-layout)',
            padding: 24,
          }}
        >
          <Result
            icon={<BugOutlined style={{ color: 'var(--gvray-error-color)' }} />}
            title="页面出了点问题"
            subTitle="抱歉，页面渲染时发生了未预期的错误。请尝试刷新页面或返回首页。"
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                >
                  刷新页面
                </Button>
                <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
                  返回首页
                </Button>
              </Space>
            }
          >
            {isDev && this.state.error && (
              <div
                style={{
                  textAlign: 'left',
                  maxWidth: 600,
                  margin: '0 auto',
                  background: 'var(--gvray-error-color-bg)',
                  border: '1px solid var(--gvray-error-color-border)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <Paragraph>
                  <Text strong style={{ color: 'var(--gvray-error-color)' }}>
                    {this.state.error.name}: {this.state.error.message}
                  </Text>
                </Paragraph>
                {this.state.errorInfo?.componentStack && (
                  <Paragraph>
                    <pre
                      style={{
                        fontSize: 12,
                        color: 'var(--gvray-text-color-secondary)',
                        maxHeight: 200,
                        overflow: 'auto',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </Paragraph>
                )}
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
