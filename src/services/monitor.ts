import type { ServerMetricsResponse } from '@/pages/Monitor/Server/types';
import { request } from '@gvray/request';

/** 查询服务器监控指标 */
export function queryServerMetrics() {
  return request<API.Response<ServerMetricsResponse>>(
    '/system/monitors/server-metrics',
    { method: 'GET' },
  );
}
