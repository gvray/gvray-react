import {
  deleteDictionaryItem,
  getDictionaryItemById,
  getDictionaryTypeById,
  queryDictionaryItemList,
} from '@/services/dictionary';
import { useCallback, useState } from 'react';

export const useDictionaryItems = () => {
  const [typeDetail, setTypeDetail] =
    useState<API.DictionaryTypeResponseDto | null>(null);

  const fetchDictionaryTypeDetail = useCallback(async (typeId: string) => {
    const { data } = await getDictionaryTypeById(typeId);
    setTypeDetail(data);
    return data;
  }, []);

  const fetchDictionaryItemList = useCallback(
    async (
      typeCode: string,
      params?: API.DictionariesFindAllDictionaryItemsParams,
    ) => {
      return queryDictionaryItemList(
        { ...params, typeCode },
        { skipErrorHandler: true },
      );
    },
    [],
  );

  const fetchDictionaryItemDetail = useCallback(async (itemId: string) => {
    const { data } = await getDictionaryItemById(itemId);
    return data;
  }, []);

  const removeDictionaryItem = useCallback(async (itemId: string) => {
    await deleteDictionaryItem(itemId);
  }, []);

  return {
    typeDetail,
    fetchDictionaryTypeDetail,
    fetchDictionaryItemList,
    fetchDictionaryItemDetail,
    removeDictionaryItem,
  };
};
