import {
  THEME_MODE_LABELS,
  ThemeMode,
  ThemeModeWithoutSystem,
} from '@/constants';
import {
  queryProfileSettings,
  updateProfileSettings,
} from '@/services/profile';
import { useAppStore, usePreferences } from '@/stores';
import {
  LayoutOutlined,
  ReloadOutlined,
  SettingOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { debounce } from '@gvray/eskit';
import {
  Button,
  Card,
  Col,
  List,
  Popconfirm,
  Row,
  Select,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { useCallback, useEffect, useRef } from 'react';
import styles from './index.less';

const { Text } = Typography;

const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
];

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 条/页' },
  { value: 20, label: '20 条/页' },
  { value: 50, label: '50 条/页' },
];

const TabPreferences: React.FC = () => {
  const {
    serverConfig,
    userSettings,
    setThemeMode,
    setLanguage,
    setPageSize,
    setShowBreadcrumb,
    setSider,
    setHeader,
    setContent,
    setAccessibility,
    resetPreferences,
  } = useAppStore();

  const {
    themeMode,
    language,
    pageSize,
    showBreadcrumb,
    sider,
    header,
    content,
    accessibility,
  } = usePreferences();

  const uiDefaults = serverConfig.uiDefaults;

  // ── 服务端同步 ──────────────────────────────────────────

  const pendingRef = useRef<Record<string, unknown>>({});

  const flushSettings = useCallback(
    debounce(() => {
      const settings = { ...pendingRef.current };
      pendingRef.current = {};
      if (Object.keys(settings).length === 0) return;
      updateProfileSettings(settings).catch(() => {
        // silent
      });
    }, 500),
    [],
  );

  /** 变更后排队同步到服务端（嵌套字段做一层浅合并） */
  const queueSync = useCallback(
    (patch: Record<string, unknown>) => {
      const prev = pendingRef.current;
      const next: Record<string, unknown> = { ...prev };
      for (const [key, val] of Object.entries(patch)) {
        if (
          typeof val === 'object' &&
          val !== null &&
          !Array.isArray(val) &&
          typeof prev[key] === 'object' &&
          prev[key] !== null &&
          !Array.isArray(prev[key])
        ) {
          next[key] = { ...(prev[key] as Record<string, unknown>), ...val };
        } else {
          next[key] = val;
        }
      }
      pendingRef.current = next;
      flushSettings();
    },
    [flushSettings],
  );

  /** 初始化时拉取服务端偏好设置（扁平 schema） */
  useEffect(() => {
    queryProfileSettings()
      .then((res) => {
        if (!res.data) return;
        const s = res.data as Record<string, unknown>;
        if (s.theme) setThemeMode(s.theme as ThemeModeWithoutSystem);
        if (s.language) setLanguage(s.language as string);
        if (typeof s.pageSize === 'number') setPageSize(s.pageSize);
        if (typeof s.showBreadcrumb === 'boolean')
          setShowBreadcrumb(s.showBreadcrumb);
        if (typeof s.sidebarCollapsed === 'boolean')
          setSider({ collapsed: s.sidebarCollapsed });
        if (typeof s.sidebarDark === 'boolean')
          setSider({ theme: s.sidebarDark ? 'dark' : 'light' });
        if (typeof s.showLogo === 'boolean') setSider({ showLogo: s.showLogo });
        if (typeof s.fixedHeader === 'boolean')
          setHeader({ fixed: s.fixedHeader });
        if (typeof s.showFooter === 'boolean')
          setContent({ showFooter: s.showFooter });
        if (typeof s.colorWeak === 'boolean')
          setAccessibility({ colorWeak: s.colorWeak });
      })
      .catch(() => {
        // silent
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── UI helpers ──────────────────────────────────────────

  /** 判断某个偏好字段是否被用户修改过 */
  const isModified = (key: string): boolean => {
    const parts = key.split('.');
    let val: any = userSettings;
    for (const p of parts) {
      if (val === null || val === undefined) return false;
      val = val[p];
    }
    return val !== undefined;
  };

  /** 服务端默认值标签 */
  const ServerDefault: React.FC<{ label: string }> = ({ label }) => (
    <Tag color="blue" style={{ fontSize: 11, marginLeft: 6 }}>
      默认: {label}
    </Tag>
  );

  /** 用户已修改标签 */
  const ModifiedTag: React.FC = () => (
    <Tag color="orange" style={{ fontSize: 11, marginLeft: 6 }}>
      已修改
    </Tag>
  );

  // ── Handlers（本地更新 + 排队同步）──────────────────────

  const handleThemeMode = (v: ThemeMode) => {
    setThemeMode(v as ThemeModeWithoutSystem);
    queueSync({ theme: v });
  };

  const handleLanguage = (v: string) => {
    setLanguage(v);
    queueSync({ language: v });
  };

  const handleSiderCollapsed = (v: boolean) => {
    setSider({ collapsed: v });
    queueSync({ sidebarCollapsed: v });
  };

  const handleHeaderFixed = (v: boolean) => {
    setHeader({ fixed: v });
    queueSync({ fixedHeader: v });
  };

  const handleShowLogo = (v: boolean) => {
    setSider({ showLogo: v });
    queueSync({ showLogo: v });
  };

  const handleSiderTheme = (v: boolean) => {
    const mode = v ? 'dark' : 'light';
    setSider({ theme: mode });
    queueSync({ sidebarDark: v });
  };

  const handleShowBreadcrumb = (v: boolean) => {
    setShowBreadcrumb(v);
    queueSync({ showBreadcrumb: v });
  };

  const handlePageSize = (v: number) => {
    setPageSize(v);
    queueSync({ pageSize: v });
  };

  const handleShowFooter = (v: boolean) => {
    setContent({ showFooter: v });
    queueSync({ showFooter: v });
  };

  const handleColorWeak = (v: boolean) => {
    setAccessibility({ colorWeak: v });
    queueSync({ colorWeak: v });
  };

  const handleGrayMode = (v: boolean) => {
    setAccessibility({ grayMode: v });
    queueSync({ grayMode: v });
  };

  const handleReset = () => {
    resetPreferences();
    updateProfileSettings({}).catch(() => {
      // silent
    });
  };

  return (
    <Row gutter={[16, 16]}>
      {/* 外观与布局 */}
      <Col xs={24} xxl={12}>
        <Card
          title={
            <>
              <SkinOutlined /> 外观与布局
            </>
          }
          size="small"
          className={styles.prefCard}
        >
          <List
            dataSource={[
              {
                title: '主题模式',
                desc: (
                  <>
                    切换浅色 / 深色主题
                    <ServerDefault
                      label={
                        THEME_MODE_LABELS[uiDefaults.theme as ThemeMode] ||
                        uiDefaults.theme
                      }
                    />
                    {isModified('themeMode') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Select
                    value={themeMode}
                    onChange={handleThemeMode}
                    style={{ width: 110 }}
                    options={Object.entries(THEME_MODE_LABELS).map(
                      ([value, label]) => ({ value, label }),
                    )}
                  />
                ),
              },
              {
                title: '语言',
                desc: (
                  <>
                    界面显示语言
                    <ServerDefault
                      label={
                        LANGUAGE_OPTIONS.find(
                          (o) => o.value === uiDefaults.language,
                        )?.label || uiDefaults.language
                      }
                    />
                    {isModified('language') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Select
                    value={language}
                    onChange={handleLanguage}
                    style={{ width: 110 }}
                    options={LANGUAGE_OPTIONS}
                  />
                ),
              },
              {
                title: '侧边栏折叠',
                desc: (
                  <>
                    默认折叠侧边导航
                    <ServerDefault
                      label={uiDefaults.sidebarCollapsed ? '折叠' : '展开'}
                    />
                    {isModified('sider.collapsed') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Switch
                    checked={sider.collapsed}
                    onChange={handleSiderCollapsed}
                  />
                ),
              },
              {
                title: '固定顶栏',
                desc: (
                  <>
                    页面滚动时固定头部
                    {isModified('header.fixed') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Switch checked={header.fixed} onChange={handleHeaderFixed} />
                ),
              },
              {
                title: '显示 Logo',
                desc: (
                  <>
                    侧边栏顶部显示 Logo
                    {isModified('sider.showLogo') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Switch checked={sider.showLogo} onChange={handleShowLogo} />
                ),
              },
              {
                title: '侧边栏深色',
                desc: (
                  <>
                    侧边导航栏深浅主题
                    {isModified('sider.theme') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Switch
                    checked={sider.theme === 'dark'}
                    onChange={handleSiderTheme}
                  />
                ),
              },
              {
                title: '显示面包屑',
                desc: (
                  <>
                    页面顶部导航路径
                    <ServerDefault
                      label={uiDefaults.showBreadcrumb ? '显示' : '隐藏'}
                    />
                    {isModified('showBreadcrumb') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Switch
                    checked={showBreadcrumb}
                    onChange={handleShowBreadcrumb}
                  />
                ),
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<LayoutOutlined style={{ color: '#8c8c8c' }} />}
                  title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.desc}
                    </Text>
                  }
                />
                {item.extra}
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {/* 数据与功能 */}
      <Col xs={24} xxl={12}>
        <Card
          title={
            <>
              <SettingOutlined /> 数据与功能
            </>
          }
          size="small"
          className={styles.prefCard}
        >
          <List
            dataSource={[
              {
                title: '默认分页数',
                desc: (
                  <>
                    每页显示条数
                    <ServerDefault label={`${uiDefaults.pageSize} 条/页`} />
                    {isModified('pageSize') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Select
                    value={pageSize}
                    onChange={handlePageSize}
                    style={{ width: 110 }}
                    options={PAGE_SIZE_OPTIONS}
                  />
                ),
              },
              {
                title: '显示页脚',
                desc: (
                  <>
                    页面底部版权信息
                    {isModified('content.showFooter') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Switch
                    checked={content.showFooter}
                    onChange={handleShowFooter}
                  />
                ),
              },
              {
                title: '色弱模式',
                desc: (
                  <>
                    适配色弱用户的配色方案
                    {isModified('accessibility.colorWeak') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Switch
                    checked={accessibility.colorWeak}
                    onChange={handleColorWeak}
                  />
                ),
              },
              {
                title: '灰色模式',
                desc: (
                  <>
                    全站灰色（特殊纪念日）
                    {isModified('accessibility.grayMode') && <ModifiedTag />}
                  </>
                ),
                extra: (
                  <Switch
                    checked={accessibility.grayMode}
                    onChange={handleGrayMode}
                  />
                ),
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<SettingOutlined style={{ color: '#8c8c8c' }} />}
                  title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.desc}
                    </Text>
                  }
                />
                {item.extra}
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {/* 重置 */}
      <Col xs={24} xxl={12}>
        <Card
          title={
            <>
              <ReloadOutlined /> 恢复默认
            </>
          }
          size="small"
          className={styles.prefCard}
        >
          <div style={{ padding: '12px 0' }}>
            <Text
              type="secondary"
              style={{ display: 'block', marginBottom: 12 }}
            >
              将所有偏好设置恢复为服务端下发的默认值（{serverConfig.system.name}
              ）。 此操作不可撤销。
            </Text>
            {uiDefaults.welcomeMessage && (
              <Text
                type="secondary"
                italic
                style={{ display: 'block', marginBottom: 16, fontSize: 12 }}
              >
                {uiDefaults.welcomeMessage}
              </Text>
            )}
            <Popconfirm
              title="确认恢复默认设置？"
              description="所有偏好将重置为服务端默认值"
              onConfirm={handleReset}
              okText="确认"
              cancelText="取消"
            >
              <Button icon={<ReloadOutlined />}>恢复默认设置</Button>
            </Popconfirm>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default TabPreferences;
