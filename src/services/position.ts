import { request } from '@gvray/request';

/** 获取岗位列表 */
export function queryPositionList(params?: API.PositionsFindAllParams) {
  return request<API.Response<API.PaginatedResponse<API.PositionResponseDto>>>(
    '/system/positions',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取岗位详情 */
export function getPositionById(positionId: string) {
  return request<API.Response<API.PositionResponseDto>>(
    `/system/positions/${positionId}`,
    {
      method: 'GET',
    },
  );
}

/** 创建岗位 */
export function createPosition(data: API.CreatePositionDto) {
  return request<API.Response<API.PositionResponseDto>>('/system/positions', {
    method: 'POST',
    data,
  });
}

/** 更新岗位 */
export function updatePosition(
  positionId: string,
  data: API.UpdatePositionDto,
) {
  return request<API.Response<API.PositionResponseDto>>(
    `/system/positions/${positionId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

/** 删除岗位 */
export function deletePosition(positionId: string) {
  return request<API.Response<void>>(`/system/positions/${positionId}`, {
    method: 'DELETE',
  });
}

/** 批量删除岗位 */
export function batchDeletePositions(data: API.BatchDeletePositionsDto) {
  return request<API.Response<void>>('/system/positions/batch-delete', {
    method: 'POST',
    data,
  });
}

/** 获取岗位选项列表 */
export function queryPositionOptions() {
  return request<API.Response<API.PositionResponseDto[]>>(
    '/system/positions/options',
    {
      method: 'GET',
      skipErrorHandler: true,
    },
  );
}
