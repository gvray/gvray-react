import { AuthButton, Icon, PageContainer, TablePro } from '@/components';
import { TableProRef } from '@/components/TablePro';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import { callRef, logger } from '@/utils';
import { formatFileSize as formatBytes } from '@gvray/formatkit';
import {
  Card,
  Col,
  Empty,
  Input,
  Modal,
  Row,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
  theme,
} from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getCacheKeyColumns } from './columns';
import styles from './index.less';
import { useCacheMonitorModel } from './model';

const { Title, Text } = Typography;

const CacheMonitorPage: React.FC = () => {
  const { token } = theme.useToken();
  const tableProRef = useRef<TableProRef>(null);
  const { message } = useFeedback();
  const {
    health,
    stats,
    statsLoading,
    error,
    autoRefresh,
    setAutoRefresh,
    refresh,
    fetchCacheKeys,
    handleClearCache,
  } = useCacheMonitorModel();

  const [pattern, setPattern] = useState('');
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearPattern, setClearPattern] = useState('');
  const [clearLoading, setClearLoading] = useState(false);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleSearch = () => {
    tableReload();
  };

  const handleDeleteKey = (record: API.CacheKeyInfoDto) => {
    Modal.confirm({
      title: '系统提示',
      content: `是否确认删除缓存 key "${record.key}"？`,
      okText: '确认',
      okButtonProps: { danger: true },
      cancelText: '取消',
      async onOk() {
        try {
          await handleClearCache(record.key);
          message.success('删除成功');
          tableReload();
          refresh();
        } catch (err) {
          logger.error(err);
          message.error('删除失败');
        }
      },
    });
  };

  const doClearCache = async (pattern?: string) => {
    setClearLoading(true);
    try {
      const result = await handleClearCache(pattern);
      message.success(`清理成功，共删除 ${result?.deleted ?? 0} 个 key`);
      setClearModalOpen(false);
      setClearPattern('');
      tableReload();
      refresh();
    } catch (err) {
      logger.error(err);
      message.error('清理失败');
    } finally {
      setClearLoading(false);
    }
  };

  const handleClearCacheByPattern = async () => {
    const trimmed = clearPattern.trim();
    const pattern = trimmed || '*';
    if (!trimmed) {
      Modal.confirm({
        title: '危险操作',
        content: '您即将清空所有缓存，此操作不可恢复，是否继续？',
        okText: '确认清空',
        okButtonProps: { danger: true },
        cancelText: '取消',
        async onOk() {
          await doClearCache(pattern);
        },
      });
      return;
    }
    await doClearCache(pattern);
  };

  const columns = useMemo(
    () =>
      getCacheKeyColumns().map((column: any) => {
        if (column.dataIndex === 'ttl') {
          return {
            ...column,
            render: (ttl: number) => {
              if (typeof ttl !== 'number') return '-';
              if (ttl === -1) return <Tag>永久</Tag>;
              if (ttl === -2) return <Tag color="red">已过期</Tag>;
              const hours = Math.floor(ttl / 3600);
              const minutes = Math.floor((ttl % 3600) / 60);
              const seconds = ttl % 60;
              if (hours > 0) {
                return `${hours}h ${minutes}m ${seconds}s`;
              }
              if (minutes > 0) {
                return `${minutes}m ${seconds}s`;
              }
              return `${seconds}s`;
            },
          };
        }
        if (column.dataIndex === 'size') {
          return {
            ...column,
            render: (size: number) =>
              typeof size === 'number' ? formatBytes(size) : '-',
          };
        }
        return column;
      }),
    [],
  );

  const actionColumn = useMemo(
    () => ({
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (record: API.CacheKeyInfoDto) => (
        <Space size={0}>
          <AuthButton
            danger
            type="link"
            icon={<Icon name="DeleteOutlined" />}
            onClick={() => handleDeleteKey(record)}
            perms={[PERM.MONITOR_CACHE_CLEAR]}
          >
            删除
          </AuthButton>
        </Space>
      ),
    }),
    [],
  );

  const requestCacheKeys = useCallback(
    async (params?: Record<string, any>) => {
      const searchPattern = pattern.trim() || params?.key || '*';
      const res = await fetchCacheKeys({
        pattern: searchPattern,
        page: params?.page,
        pageSize: params?.pageSize,
      });
      return {
        data: {
          items: res.data?.items ?? [],
          total: res.data?.total ?? 0,
        },
      };
    },
    [pattern, fetchCacheKeys],
  );

  if (error && !stats) {
    return (
      <PageContainer>
        <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Space>
            <Icon name="ReloadOutlined" spin={statsLoading} />
            <a onClick={refresh}>重新加载</a>
          </Space>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.pageWrapper}>
        {/* ── 顶部工具栏 ── */}
        <div className={styles.toolbar}>
          <Title level={4} style={{ margin: 0 }}>
            缓存监控
          </Title>
          <Space>
            {health !== null && (
              <Tag color={health ? 'success' : 'error'}>
                {health ? 'Redis 正常' : 'Redis 异常'}
              </Tag>
            )}
            <a className={styles.actionLink} onClick={refresh}>
              <Icon name="ReloadOutlined" spin={statsLoading} /> 刷新
            </a>
            <Space size={4}>
              <Text style={{ fontSize: 13 }}>自动刷新</Text>
              <Switch
                size="small"
                checked={autoRefresh}
                onChange={setAutoRefresh}
              />
            </Space>
          </Space>
        </div>

        {/* ── 统计卡片 ── */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card
              loading={statsLoading}
              className={styles.statCard}
              bodyStyle={{ padding: 16 }}
            >
              <Statistic
                title="命中率"
                value={stats ? Math.round(stats.hitRate * 100) : 0}
                suffix="%"
                valueStyle={{
                  color:
                    stats && stats.hitRate >= 0.9
                      ? '#52c41a'
                      : stats && stats.hitRate >= 0.7
                      ? '#faad14'
                      : '#ff4d4f',
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card
              loading={statsLoading}
              className={styles.statCard}
              bodyStyle={{ padding: 16 }}
            >
              <Statistic
                title="命中次数"
                value={stats?.hits ?? 0}
                valueStyle={{ color: token.colorText }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card
              loading={statsLoading}
              className={styles.statCard}
              bodyStyle={{ padding: 16 }}
            >
              <Statistic
                title="未命中次数"
                value={stats?.misses ?? 0}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card
              loading={statsLoading}
              className={styles.statCard}
              bodyStyle={{ padding: 16 }}
            >
              <Statistic
                title="总 Key 数"
                value={stats?.totalKeys ?? 0}
                valueStyle={{ color: token.colorText }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card
              loading={statsLoading}
              className={styles.statCard}
              bodyStyle={{ padding: 16 }}
            >
              <Statistic
                title="已用内存"
                value={stats ? formatBytes(stats.usedMemory) : '0 B'}
                valueStyle={{ color: token.colorText, fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card
              loading={statsLoading}
              className={styles.statCard}
              bodyStyle={{ padding: 16 }}
            >
              <Statistic
                title="清理次数"
                value={stats?.evictions ?? 0}
                valueStyle={{ color: token.colorText }}
              />
            </Card>
          </Col>
        </Row>

        {/* ── 缓存键列表 ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              title="缓存键列表"
              className={styles.detailCard}
              extra={
                <Space>
                  <Input
                    placeholder="Key 匹配模式，如 sys:dict:*"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 280 }}
                    prefix={<Icon name="SearchOutlined" />}
                    allowClear
                  />
                  <AuthButton
                    type="primary"
                    icon={<Icon name="SearchOutlined" />}
                    onClick={handleSearch}
                    perms={[PERM.MONITOR_CACHE_LIST]}
                  >
                    搜索
                  </AuthButton>
                  <AuthButton
                    danger
                    icon={<Icon name="DeleteOutlined" />}
                    onClick={() => setClearModalOpen(true)}
                    perms={[PERM.MONITOR_CACHE_CLEAR]}
                  >
                    清理缓存
                  </AuthButton>
                </Space>
              }
            >
              <TablePro
                rowKey="key"
                ref={tableProRef}
                options={false}
                columns={[...columns, actionColumn]}
                request={requestCacheKeys}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* ── 清理缓存 Modal ── */}
      <Modal
        title="清理缓存"
        open={clearModalOpen}
        onCancel={() => {
          setClearModalOpen(false);
          setClearPattern('');
        }}
        onOk={handleClearCacheByPattern}
        confirmLoading={clearLoading}
        okButtonProps={{ danger: true }}
        okText="确认清理"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>请输入要清理的 key 匹配模式：</Text>
          <Input
            placeholder="如 sys:dict:* 或不填清空全部"
            value={clearPattern}
            onChange={(e) => setClearPattern(e.target.value)}
            onPressEnter={handleClearCacheByPattern}
            allowClear
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            留空将清空所有缓存，请谨慎操作！
          </Text>
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default CacheMonitorPage;
