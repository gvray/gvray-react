import { useSettingStore } from '@/stores';
import { logger } from '@/utils';
import { useEffect, useRef, useState } from 'react';

export const useTablePro = (
  request: (params: any) => Promise<any>,
  isTree?: boolean,
) => {
  const { pageSize: defaultPageSize } = useSettingStore();
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState(() => ({
    page: 1,
    pageSize: defaultPageSize || 10,
  }));
  const [etag, setEtag] = useState(Date.now());

  // 高级搜索
  const [showSearch, setShowSearch] = useState(true);
  // 高级搜索参数
  const paramsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!defaultPageSize) return;
    setPagination((prev) => {
      if (prev.pageSize === defaultPageSize) return prev;
      return { ...prev, page: 1, pageSize: defaultPageSize };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPageSize]);

  const handleList = async (paginationParams?: Record<string, any>) => {
    try {
      setLoading(true);
      const { data } = await request({
        ...paramsRef.current,
        ...(isTree ? {} : paginationParams ?? pagination),
      });
      setListData([...(data.items ?? data)]);
      if (data.total !== undefined) {
        setTotal(data.total ?? data.length);
      }
    } catch (error) {
      logger.error(error);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };
  const handleReload = () => {
    setEtag(Date.now());
  };

  const handleResetPage = () => {
    setPagination((pre) => ({ ...pre, page: 1 }));
    setEtag(Date.now());
  };

  // 高级搜索
  const handleAdvancedQuery = (values: Record<string, any>) => {
    const newParams = { ...paramsRef.current, ...values };
    paramsRef.current = newParams;
    handleResetPage();
  };

  useEffect(() => {
    handleList();
  }, [pagination.page, pagination.pageSize, etag]);

  return {
    showSearch,
    setShowSearch,
    paramsRef,
    loading,
    listData,
    total,
    pagination,
    etag,
    handleList,
    handleReload,
    handleResetPage,
    handleAdvancedQuery,
    setPagination,
    setEtag,
  };
};
