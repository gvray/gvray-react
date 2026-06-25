import { THEME_MODE_LABELS, ThemeMode } from '@/constants';
import {
  deleteProfileSettings,
  queryProfileSettings,
  updateProfileSettings,
} from '@/services/profile';
import { useSettingStore } from '@/stores';
import { runtimeConfig } from '@/utils/runtime-config';
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
    setTheme,
    setLanguage,
    setPageSize,
    setShowBreadcrumb,
    setSidebarCollapsed,
    setSidebarTheme,
    setShowLogo,
    setFixedHeader,
    setShowFooter,
    setColorWeak,
    setUniqueOpened,
    setEnableNotification,
    reset,
  } = useSettingStore();

  const {
    theme,
    language,
    pageSize,
    showBreadcrumb,
    sidebarCollapsed,
    sidebarTheme,
    showLogo,
    fixedHeader,
    showFooter,
    colorWeak,
    uniqueOpened,
    enableNotification,
  } = useSettingStore();

  const serverConfig = runtimeConfig.get();

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
        useSettingStore.getState().patchSettings(res.data as any);
      })
      .catch(() => {
        // silent
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers（本地更新 + 排队同步）──────────────────────

  const handleThemeMode = (v: ThemeMode) => {
    setTheme(v);
    queueSync({ theme: v });
  };

  const handleLanguage = (v: string) => {
    setLanguage(v);
    queueSync({ language: v });
  };

  const handleSiderCollapsed = (v: boolean) => {
    setSidebarCollapsed(v);
    queueSync({ sidebarCollapsed: v });
  };

  const handleHeaderFixed = (v: boolean) => {
    setFixedHeader(v);
    queueSync({ fixedHeader: v });
  };

  const handleShowLogo = (v: boolean) => {
    setShowLogo(v);
    queueSync({ showLogo: v });
  };

  const handleSiderTheme = (v: boolean) => {
    const mode = v ? 'dark' : 'light';
    setSidebarTheme(mode);
    queueSync({ sidebarTheme: v ? 'dark' : 'light' });
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
    setShowFooter(v);
    queueSync({ showFooter: v });
  };

  const handleColorWeak = (v: boolean) => {
    setColorWeak(v);
    queueSync({ colorWeak: v });
  };

  const handleUniqueOpened = (v: boolean) => {
    setUniqueOpened(v);
    queueSync({ uniqueOpened: v });
  };

  const handleEnableNotification = (v: boolean) => {
    setEnableNotification(v);
    queueSync({ enableNotification: v });
  };

  const handleReset = () => {
    reset();
    deleteProfileSettings().catch(() => {
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
                desc: '切换浅色 / 深色主题',
                extra: (
                  <Select
                    value={theme}
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
                desc: '界面显示语言',
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
                desc: '默认折叠侧边导航',
                extra: (
                  <Switch
                    checked={sidebarCollapsed}
                    onChange={handleSiderCollapsed}
                  />
                ),
              },
              {
                title: '固定顶栏',
                desc: '页面滚动时固定头部',
                extra: (
                  <Switch checked={fixedHeader} onChange={handleHeaderFixed} />
                ),
              },
              {
                title: '显示 Logo',
                desc: '侧边栏顶部显示 Logo',
                extra: <Switch checked={showLogo} onChange={handleShowLogo} />,
              },
              {
                title: '侧边栏深色',
                desc: '侧边导航栏深浅主题',
                extra: (
                  <Switch
                    checked={sidebarTheme === 'dark'}
                    onChange={handleSiderTheme}
                  />
                ),
              },
              {
                title: '显示面包屑',
                desc: '页面顶部导航路径',
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
                  avatar={
                    <LayoutOutlined
                      style={{ color: 'var(--gvray-text-color-placeholder)' }}
                    />
                  }
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
                desc: '每页显示条数',
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
                desc: '页面底部版权信息',
                extra: (
                  <Switch checked={showFooter} onChange={handleShowFooter} />
                ),
              },
              {
                title: '色弱模式',
                desc: '适配色弱用户的配色方案',
                extra: (
                  <Switch checked={colorWeak} onChange={handleColorWeak} />
                ),
              },
              {
                title: '侧边栏独占展开',
                desc: '侧边栏只展开一个子菜单',
                extra: (
                  <Switch
                    checked={uniqueOpened}
                    onChange={handleUniqueOpened}
                  />
                ),
              },
              {
                title: '启用通知',
                desc: '接收系统通知消息',
                extra: (
                  <Switch
                    checked={enableNotification}
                    onChange={handleEnableNotification}
                  />
                ),
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <SettingOutlined
                      style={{ color: 'var(--gvray-text-color-placeholder)' }}
                    />
                  }
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
