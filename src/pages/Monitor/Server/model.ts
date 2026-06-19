import { queryServerMetrics } from '@/services/monitor';
import { logger } from '@/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ServerMetricsResponse } from './types';

export const useServerMonitor = () => {
  const [data, setData] = useState<ServerMetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await queryServerMetrics();
      if (res.data) {
        setData(res.data);
      } else {
        setError('暂无监控数据');
      }
    } catch (err) {
      logger.error(err);
      setError('获取监控数据失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchData();
      }, 5000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoRefresh, fetchData]);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    autoRefresh,
    setAutoRefresh,
    refresh,
  };
};
