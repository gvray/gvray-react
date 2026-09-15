import { queryConfigList } from '@/services/config';
import { safeJsonParse } from '@gvray/eskit';
import { useCallback, useEffect, useState } from 'react';

// 配置管理hooks

// 根据键获取配置值的hook
export const useConfigValue = (key: string) => {
  const [value, setValue] = useState<string | undefined>();

  useEffect(() => {
    queryConfigList({ key } as any)
      .then((res: any) => {
        const items = res?.data?.items ?? res?.data ?? [];
        const config = Array.isArray(items)
          ? items.find((c: any) => c.key === key)
          : undefined;
        setValue(config?.value);
      })
      .catch(() => {});
  }, [key]);

  return value;
};

// 根据分组获取配置的hook
export const useConfigsByGroup = (group: string) => {
  const [groupConfigs, setGroupConfigs] = useState<any[]>([]);

  useEffect(() => {
    queryConfigList({ group } as any)
      .then((res: any) => {
        const items = res?.data?.items ?? res?.data ?? [];
        setGroupConfigs(Array.isArray(items) ? items : []);
      })
      .catch(() => {});
  }, [group]);

  return groupConfigs;
};

// 根据类型获取配置的hook
export const useConfigsByType = (type: string) => {
  const [typeConfigs, setTypeConfigs] = useState<any[]>([]);

  useEffect(() => {
    queryConfigList({ type } as any)
      .then((res: any) => {
        const items = res?.data?.items ?? res?.data ?? [];
        setTypeConfigs(Array.isArray(items) ? items : []);
      })
      .catch(() => {});
  }, [type]);

  return typeConfigs;
};

// 获取启用配置的hook
export const useEnabledConfigs = () => {
  const [enabledConfigs, setEnabledConfigs] = useState<any[]>([]);

  useEffect(() => {
    queryConfigList({ status: 1 } as any)
      .then((res: any) => {
        const items = res?.data?.items ?? res?.data ?? [];
        setEnabledConfigs(Array.isArray(items) ? items : []);
      })
      .catch(() => {});
  }, []);

  return enabledConfigs;
};

// 配置缓存hook
export const useConfigCache = () => {
  const [cache, setCache] = useState<Map<string, any>>(new Map());

  const getCachedValue = useCallback(
    (key: string) => {
      return cache.get(key);
    },
    [cache],
  );

  const setCachedValue = useCallback((key: string, value: any) => {
    setCache((prev) => new Map(prev).set(key, value));
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  const removeCachedValue = useCallback((key: string) => {
    setCache((prev) => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  return {
    getCachedValue,
    setCachedValue,
    clearCache,
    removeCachedValue,
  };
};

// 配置验证hook
export const useConfigValidation = () => {
  const validateConfigKey = useCallback((key: string) => {
    const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return pattern.test(key);
  }, []);

  const validateConfigValue = useCallback((value: string, type: string) => {
    switch (type) {
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return value === 'true' || value === 'false';
      case 'json':
        return safeJsonParse(value) !== undefined;
      default:
        return true;
    }
  }, []);

  const validateConfigName = useCallback((name: string) => {
    return name.length > 0 && name.length <= 100;
  }, []);

  return {
    validateConfigKey,
    validateConfigValue,
    validateConfigName,
  };
};
