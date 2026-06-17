import { getDictionaryItemsByTypeCodes } from '@/services/dictionary';
import { useDictStore } from '@/stores/useDictStore';
import { logger } from '@/utils';
import { useEffect, useState } from 'react';

const useDict = <T = Record<string, API.DictionaryItemResponseDto[]>>(
  codes: string[],
) => {
  const [dict, setDict] = useState<T>({} as T);
  const codeString = codes.join(',');

  useEffect(() => {
    const fetchDict = async () => {
      const missingCodes: string[] = [];
      const cachedDict: Record<string, API.DictionaryItemResponseDto[]> = {};

      for (const code of codes) {
        const cached = useDictStore.getState().getDict(code);
        if (cached) {
          cachedDict[code] = cached;
        } else if (!useDictStore.getState().isLoading(code)) {
          missingCodes.push(code);
        }
      }

      // 如果有缓存的，先设置上去
      if (Object.keys(cachedDict).length > 0) {
        setDict((prev) => ({ ...prev, ...cachedDict } as T));
      }

      // 未缓存的发请求
      if (missingCodes.length === 0) return;

      missingCodes.forEach((code) => useDictStore.getState().markLoading(code));

      try {
        const res = await getDictionaryItemsByTypeCodes({
          typeCodes: missingCodes.join(','),
        });
        if (res.data) {
          for (const [code, items] of Object.entries(res.data)) {
            useDictStore.getState().setDict(code, items);
          }
          setDict((prev) => ({ ...prev, ...res.data } as T));
        }
      } catch (error) {
        logger.error(error);
      }
    };

    fetchDict();
  }, [codeString]);

  return dict;
};

export default useDict;
