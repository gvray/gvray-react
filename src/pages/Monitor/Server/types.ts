export interface ServerMetricsResponse {
  /** 数据采集时间 */
  timestamp: string;
  /** 操作系统信息 */
  os: {
    platform: string;
    hostname: string;
    uptime: number;
    release: string;
    arch: string;
    nodeVersion: string;
    env: string;
  };
  /** CPU 信息 */
  cpu: {
    usagePercent: number;
    loadAverage1m: number;
    loadAverage5m: number;
    loadAverage15m: number;
    cores: number;
    physicalCores: number;
    perCoreUsage: number[];
  };
  /** 内存信息 */
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  /** 磁盘信息 */
  disk: Array<{
    mount: string;
    fsType: string;
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  }>;
  /** 网络信息 */
  network: Array<{
    iface: string;
    ip4: string;
    mac: string;
    operstate: string;
    rxBytes: number;
    txBytes: number;
  }>;
  /** 进程信息 */
  process: {
    pid: number;
    uptime: number;
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    cpuPercent: number;
    nodeVersion: string;
  };
}
