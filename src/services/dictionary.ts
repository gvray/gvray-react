import { request, RuntimeControlFields } from '@gvray/request';

// ─── 字典类型 ───────────────────────────────────────────

/** 获取字典类型列表 */
export function queryDictionaryTypeList(
  params?: API.DictionariesFindAllDictionaryTypesParams,
) {
  return request<
    API.Response<API.PaginatedResponse<API.DictionaryTypeResponseDto>>
  >('/system/dictionaries/types', {
    method: 'GET',
    params,
  });
}

/** 获取字典类型详情 */
export function getDictionaryTypeById(typeId: string) {
  return request<API.Response<API.DictionaryTypeResponseDto>>(
    `/system/dictionaries/types/${typeId}`,
    {
      method: 'GET',
    },
  );
}

/** 创建字典类型 */
export function createDictionaryType(data: API.CreateDictionaryTypeDto) {
  return request<API.Response<API.DictionaryTypeResponseDto>>(
    '/system/dictionaries/types',
    {
      method: 'POST',
      data,
    },
  );
}

/** 更新字典类型 */
export function updateDictionaryType(
  typeId: string,
  data: API.UpdateDictionaryTypeDto,
) {
  return request<API.Response<API.DictionaryTypeResponseDto>>(
    `/system/dictionaries/types/${typeId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

/** 删除字典类型 */
export function deleteDictionaryType(typeId: string) {
  return request<API.Response<void>>(`/system/dictionaries/types/${typeId}`, {
    method: 'DELETE',
  });
}

/** 批量删除字典类型 */
export function batchDeleteDictionaryTypes(
  data: API.BatchDeleteDictionaryTypesDto,
) {
  return request<API.Response<void>>(
    '/system/dictionaries/types/batch-delete',
    {
      method: 'POST',
      data,
    },
  );
}

// ─── 字典项 ─────────────────────────────────────────────

/** 获取字典项列表 */
export function queryDictionaryItemList(
  params?: API.DictionariesFindAllDictionaryItemsParams,
  options?: RuntimeControlFields,
) {
  return request<
    API.Response<API.PaginatedResponse<API.DictionaryItemResponseDto>>
  >('/system/dictionaries/items', {
    method: 'GET',
    params,
    ...options,
  });
}

/** 获取字典项详情 */
export function getDictionaryItemById(itemId: string) {
  return request<API.Response<API.DictionaryItemResponseDto>>(
    `/system/dictionaries/items/${itemId}`,
    {
      method: 'GET',
    },
  );
}

/** 创建字典项 */
export function createDictionaryItem(data: API.CreateDictionaryItemDto) {
  return request<API.Response<API.DictionaryItemResponseDto>>(
    '/system/dictionaries/items',
    {
      method: 'POST',
      data,
    },
  );
}

/** 更新字典项 */
export function updateDictionaryItem(
  itemId: string,
  data: API.UpdateDictionaryItemDto,
) {
  return request<API.Response<API.DictionaryItemResponseDto>>(
    `/system/dictionaries/items/${itemId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

/** 删除字典项 */
export function deleteDictionaryItem(itemId: string) {
  return request<API.Response<void>>(`/system/dictionaries/items/${itemId}`, {
    method: 'DELETE',
  });
}

/** 批量删除字典项 */
export function batchDeleteDictionaryItems(
  data: API.BatchDeleteDictionaryItemsDto,
) {
  return request<API.Response<void>>(
    '/system/dictionaries/items/batch-delete',
    {
      method: 'POST',
      data,
    },
  );
}

/** 根据类型编码批量获取字典项 */
export function getDictionaryItemsByTypeCodes(
  params: API.DictionariesGetDictionaryItemsByTypeCodesParams,
  options?: RuntimeControlFields,
) {
  return request<API.Response<Record<string, API.DictionaryItemResponseDto[]>>>(
    '/system/dictionaries/types/batch',
    {
      method: 'GET',
      params,
      ...options,
    },
  );
}
