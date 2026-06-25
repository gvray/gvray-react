import { PageContainer } from '@/components';

export default function DocsPage() {
  return (
    <PageContainer>
      <div style={{ fontSize: 14, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>数据源说明</div>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>开发环境（dev，端口 9527）：默认启用本地 Mock</li>
          <li>
            测试环境（staging，端口 9528）：连接后端 gvray-admin，提供全量数据
          </li>
        </ul>
        <div style={{ fontWeight: 600, margin: '12px 0 8px' }}>环境变量</div>
        <pre
          style={{
            background: 'var(--gvray-fill-color)',
            padding: 12,
            borderRadius: 6,
            fontSize: 13,
            overflowX: 'auto',
          }}
        >
          {`.env.dev
APP_ENV=dev
APP_API_URL=/api
APP_MOCK_ENABLED=true

.env.staging
APP_ENV=staging
APP_API_URL=http://localhost:8001
APP_MOCK_ENABLED=false`}
        </pre>
        <div style={{ marginTop: 8 }}>
          <span>
            Mock 目录：~/mock（仅覆盖登录/用户模块），其余模块需连接后端。
          </span>
        </div>
      </div>
    </PageContainer>
  );
}
