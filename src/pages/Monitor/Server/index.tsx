import { Charts, PageContainer } from '@/components';
import { formatBytes, formatUptime, getUsageColor } from '@/utils';
import {
  DashboardOutlined,
  FieldTimeOutlined,
  NodeIndexOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { EChartsOption } from 'echarts';
import React, { useMemo } from 'react';
import styles from './index.less';
import { useServerMonitor } from './model';

const { Title, Text } = Typography;

// ─── ECharts 配置工厂 ───────────────────────────────────

/** 环形仪表盘（CPU / 内存使用率） */
const createGaugeOption = (
  value: number,
  name: string,
  token: { colorFillSecondary: string; colorTextSecondary: string },
): EChartsOption => {
  const color = getUsageColor(value);
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        radius: '90%',
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: { color },
        },
        axisLine: {
          lineStyle: { width: 10, color: [[1, token.colorFillSecondary]] },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        data: [
          {
            value: Math.round(value),
            name,
            title: {
              offsetCenter: ['0%', '-20%'],
              fontSize: 12,
              color: token.colorTextSecondary,
            },
            detail: {
              offsetCenter: ['0%', '15%'],
              fontSize: 28,
              fontWeight: 700,
              color,
              formatter: '{value}%',
            },
          },
        ],
        detail: { valueAnimation: true },
      },
    ],
  };
};

/** CPU 每核心使用率柱状图 */
const createCpuBarOption = (
  data: number[],
  token: { colorTextSecondary: string; colorFillSecondary: string },
): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const list = params as { name: string; value: number }[];
        if (!Array.isArray(list) || list.length === 0) return '';
        const item = list[0];
        return `核心 ${item.name}: ${item.value}%`;
      },
    },
    grid: { left: 8, right: 8, bottom: 24, top: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((_, i) => `#${i + 1}`),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: token.colorTextSecondary, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: token.colorTextSecondary,
        fontSize: 10,
        formatter: '{value}%',
      },
      splitLine: {
        lineStyle: { color: token.colorFillSecondary, type: 'dashed' },
      },
    },
    series: [
      {
        type: 'bar',
        data: data.map((v) => ({
          value: v,
          itemStyle: { color: getUsageColor(v), borderRadius: [3, 3, 0, 0] },
        })),
        barWidth: '60%',
      },
    ],
  };
};

/** 内存饼图 */
const createMemoryPieOption = (
  used: number,
  free: number,
  token: { colorTextSecondary: string; colorBgContainer: string },
): EChartsOption => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number };
        return `${p.name}: ${formatBytes(p.value)} (${p.percent}%)`;
      },
    },
    legend: {
      orient: 'vertical',
      right: 16,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: { fontSize: 12, color: token.colorTextSecondary },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: token.colorBgContainer,
          borderWidth: 3,
        },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: { shadowBlur: 16 },
        },
        data: [
          {
            value: used,
            name: '已用',
            itemStyle: { color: '#f5576c' },
          },
          {
            value: free,
            name: '空闲',
            itemStyle: { color: '#43e97b' },
          },
        ],
      },
    ],
  };
};

// ─── 表格列定义 ─────────────────────────────────────────

const diskColumns = [
  { title: '挂载点', dataIndex: 'mount', key: 'mount' },
  { title: '文件系统', dataIndex: 'fsType', key: 'fsType', width: 120 },
  {
    title: '总容量',
    dataIndex: 'total',
    key: 'total',
    width: 120,
    render: (v: number) => formatBytes(v),
  },
  {
    title: '已用',
    dataIndex: 'used',
    key: 'used',
    width: 120,
    render: (v: number) => formatBytes(v),
  },
  {
    title: '空闲',
    dataIndex: 'free',
    key: 'free',
    width: 120,
    render: (v: number) => formatBytes(v),
  },
  {
    title: '使用率',
    dataIndex: 'usagePercent',
    key: 'usagePercent',
    width: 180,
    render: (v: number) => (
      <Progress
        percent={Math.round(v)}
        size="small"
        strokeColor={getUsageColor(v)}
      />
    ),
  },
];

const networkColumns = [
  { title: '接口', dataIndex: 'iface', key: 'iface', width: 120 },
  { title: 'IPv4', dataIndex: 'ip4', key: 'ip4', width: 160 },
  { title: 'MAC', dataIndex: 'mac', key: 'mac', width: 160 },
  {
    title: '状态',
    dataIndex: 'operstate',
    key: 'operstate',
    width: 100,
    render: (v: string) =>
      v === 'up' ? (
        <Tag color="success">UP</Tag>
      ) : (
        <Tag color="error">DOWN</Tag>
      ),
  },
  {
    title: '接收',
    dataIndex: 'rxBytes',
    key: 'rxBytes',
    width: 120,
    render: (v: number) => formatBytes(v),
  },
  {
    title: '发送',
    dataIndex: 'txBytes',
    key: 'txBytes',
    width: 120,
    render: (v: number) => formatBytes(v),
  },
];

// ─── 主组件 ─────────────────────────────────────────────

const ServerMonitorPage: React.FC = () => {
  const { token } = theme.useToken();
  const { data, loading, error, autoRefresh, setAutoRefresh, refresh } =
    useServerMonitor();

  // 概览卡片数据
  const overviewCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'cpu',
        title: 'CPU 使用率',
        icon: <DashboardOutlined />,
        value: data.cpu.usagePercent,
        option: createGaugeOption(data.cpu.usagePercent, 'CPU', token),
      },
      {
        key: 'memory',
        title: '内存使用率',
        icon: <DashboardOutlined />,
        value: data.memory.usagePercent,
        option: createGaugeOption(data.memory.usagePercent, '内存', token),
      },
      {
        key: 'osUptime',
        title: '系统运行时间',
        icon: <FieldTimeOutlined />,
        value: formatUptime(data.os.uptime),
        isText: true,
        sub: `${data.os.platform} · ${data.os.arch}`,
      },
      {
        key: 'processUptime',
        title: 'Node 进程运行时间',
        icon: <NodeIndexOutlined />,
        value: formatUptime(data.process.uptime),
        isText: true,
        sub: `PID: ${data.process.pid}`,
      },
    ];
  }, [data]);

  if (error && !data) {
    return (
      <PageContainer>
        <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Space>
            <ReloadOutlined spin={loading} />
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
            服务监控
          </Title>
          <Space>
            {data && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                数据更新时间：{new Date(data.timestamp).toLocaleString()}
              </Text>
            )}
            <a className={styles.actionLink} onClick={refresh}>
              <ReloadOutlined spin={loading} /> 刷新
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

        {/* ── 第一行：概览卡片 ── */}
        <Row gutter={[16, 16]}>
          {overviewCards.map((card) => (
            <Col xs={24} sm={12} lg={6} key={card.key}>
              <Card
                loading={loading}
                className={styles.overviewCard}
                bodyStyle={{ padding: 16 }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>{card.icon}</span>
                  <span className={styles.cardTitle}>{card.title}</span>
                </div>
                {'isText' in card ? (
                  <div className={styles.cardTextWrap}>
                    <div className={styles.cardTextValue}>{card.value}</div>
                    {card.sub && (
                      <div className={styles.cardTextSub}>{card.sub}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 160 }}>
                    <Charts options={card.option} />
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── 第二行：CPU 详情 + 内存详情 ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={16}>
            <Card
              loading={loading}
              title="CPU 监控"
              className={styles.detailCard}
            >
              {data && (
                <div>
                  {/* 负载均衡 */}
                  <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                    {[
                      { label: '1 分钟负载', value: data.cpu.loadAverage1m },
                      { label: '5 分钟负载', value: data.cpu.loadAverage5m },
                      { label: '15 分钟负载', value: data.cpu.loadAverage15m },
                    ].map((item) => (
                      <Col span={8} key={item.label}>
                        <div className={styles.loadItem}>
                          <div className={styles.loadLabel}>{item.label}</div>
                          <div className={styles.loadValue}>
                            {item.value.toFixed(2)}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  {/* 核心数 */}
                  <div className={styles.coreInfo}>
                    <Text type="secondary">
                      逻辑核心：{data.cpu.cores} | 物理核心：
                      {data.cpu.physicalCores}
                    </Text>
                  </div>
                  {/* 每核心使用率柱状图 */}
                  <div style={{ height: 220 }}>
                    <Charts
                      options={createCpuBarOption(data.cpu.perCoreUsage, token)}
                    />
                  </div>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              loading={loading}
              title="内存监控"
              className={styles.detailCard}
            >
              {data && (
                <div>
                  <div style={{ height: 260 }}>
                    <Charts
                      options={createMemoryPieOption(
                        data.memory.used,
                        data.memory.free,
                        token,
                      )}
                    />
                  </div>
                  <div className={styles.memoryLegend}>
                    <div className={styles.memoryItem}>
                      <span
                        className={styles.memoryDot}
                        style={{ background: '#f5576c' }}
                      />
                      <span>已用：{formatBytes(data.memory.used)}</span>
                    </div>
                    <div className={styles.memoryItem}>
                      <span
                        className={styles.memoryDot}
                        style={{ background: '#43e97b' }}
                      />
                      <span>空闲：{formatBytes(data.memory.free)}</span>
                    </div>
                    <div className={styles.memoryItem}>
                      <span
                        className={styles.memoryDot}
                        style={{ background: '#999' }}
                      />
                      <span>总计：{formatBytes(data.memory.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* ── 第三行：磁盘监控 ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              loading={loading}
              title="磁盘监控"
              className={styles.detailCard}
            >
              {data && (
                <Table
                  dataSource={data.disk}
                  columns={diskColumns}
                  rowKey="mount"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* ── 第四行：网络监控 ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              loading={loading}
              title="网络监控"
              className={styles.detailCard}
            >
              {data && (
                <Table
                  dataSource={data.network}
                  columns={networkColumns}
                  rowKey="iface"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* ── 第五行：Node 进程监控 ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              loading={loading}
              title="Node 进程监控"
              className={styles.detailCard}
            >
              {data && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <div className={styles.processItem}>
                      <div className={styles.processLabel}>PID</div>
                      <div className={styles.processValue}>
                        {data.process.pid}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <div className={styles.processItem}>
                      <div className={styles.processLabel}>Node 版本</div>
                      <div className={styles.processValue}>
                        {data.process.nodeVersion}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <div className={styles.processItem}>
                      <div className={styles.processLabel}>进程 CPU</div>
                      <div className={styles.processValue}>
                        <Tag color={getUsageColor(data.process.cpuPercent)}>
                          {data.process.cpuPercent.toFixed(1)}%
                        </Tag>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <div className={styles.processItem}>
                      <div className={styles.processLabel}>RSS</div>
                      <div className={styles.processValue}>
                        {formatBytes(data.process.rss)}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <div className={styles.processItem}>
                      <div className={styles.processLabel}>堆内存</div>
                      <div className={styles.processValue}>
                        <Progress
                          percent={Math.round(
                            (data.process.heapUsed /
                              Math.max(data.process.heapTotal, 1)) *
                              100,
                          )}
                          size="small"
                          format={(p) => `${p}%`}
                          strokeColor={getUsageColor(
                            (data.process.heapUsed /
                              Math.max(data.process.heapTotal, 1)) *
                              100,
                          )}
                        />
                        <div className={styles.processSub}>
                          {formatBytes(data.process.heapUsed)} /{' '}
                          {formatBytes(data.process.heapTotal)}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <div className={styles.processItem}>
                      <div className={styles.processLabel}>External</div>
                      <div className={styles.processValue}>
                        {formatBytes(data.process.external)}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default ServerMonitorPage;
