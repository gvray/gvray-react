import { request } from '@gvray/request';

/** 获取配置列表 */
export function queryConfigList(params?: API.ConfigsFindAllParams) {
  return request<API.Response<API.PaginatedResponse<API.ConfigResponseDto>>>(
    '/system/configs',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取配置详情 */
export function getConfigById(configId: string) {
  return request<API.Response<API.ConfigResponseDto>>(
    `/system/configs/${configId}`,
    {
      method: 'GET',
    },
  );
}

/** 创建配置 */
export function createConfig(data: API.CreateConfigDto) {
  return request<API.Response<API.ConfigResponseDto>>('/system/configs', {
    method: 'POST',
    data,
  });
}

/** 更新配置 */
export function updateConfig(configId: string, data: API.UpdateConfigDto) {
  return request<API.Response<API.ConfigResponseDto>>(
    `/system/configs/${configId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

/** 删除配置 */
export function deleteConfig(configId: string) {
  return request<API.Response<void>>(`/system/configs/${configId}`, {
    method: 'DELETE',
  });
}

/** 批量删除配置 */
export function batchDeleteConfigs(data: API.BatchDeleteConfigsDto) {
  return request<API.Response<void>>('/system/configs/batch-delete', {
    method: 'POST',
    data,
  });
}

/** 根据键名批量获取配置 */
export function getConfigsByKeys(params: API.ConfigsGetConfigsByKeysParams) {
  return request<API.Response<API.ConfigResponseDto[]>>(
    '/system/configs/by-keys',
    {
      method: 'GET',
      params,
    },
  );
}
