import { request } from '@gvray/request';

/** 获取运行时配置（无需登录） */
export function getRuntimeConfig() {
  return request<API.Response<Record<string, unknown>>>(
    '/public/runtime-config',
    {
      method: 'GET',
    },
  );
}
