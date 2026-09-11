import { request } from '@gvray/request';

/** 获取通知列表 */
export function queryNoticeList(params?: API.NoticesFindAllParams) {
  return request<API.Response<API.PaginatedResponse<API.NoticeResponseDto>>>(
    '/system/notices',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取通知详情 */
export function getNoticeById(noticeId: string) {
  return request<API.Response<API.NoticeResponseDto>>(
    `/system/notices/${noticeId}`,
    {
      method: 'GET',
    },
  );
}

/** 创建通知 */
export function createNotice(data: API.CreateNoticeDto) {
  return request<API.Response<API.NoticeResponseDto>>('/system/notices', {
    method: 'POST',
    data,
  });
}

/** 更新通知 */
export function updateNotice(noticeId: string, data: API.UpdateNoticeDto) {
  return request<API.Response<API.NoticeResponseDto>>(
    `/system/notices/${noticeId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

/** 删除通知 */
export function deleteNotice(noticeId: string) {
  return request<API.Response<void>>(`/system/notices/${noticeId}`, {
    method: 'DELETE',
  });
}

/** 批量删除通知 */
export function batchDeleteNotices(data: API.BatchDeleteNoticesDto) {
  return request<API.Response<void>>('/system/notices/batch-delete', {
    method: 'POST',
    data,
  });
}

/** 获取未读通知数量 */
export function getUnreadNoticeCount() {
  return request<API.Response<{ count: number }>>(
    '/system/notices/unread/count',
    {
      method: 'GET',
      // 后台轮询：token 过期时不触发全局 401 弹窗，静默失败由轮询自行重试。
      // 等其他交互接口刷新 token 后，下一轮轮询自然恢复。
      skipErrorHandler: true,
    },
  );
}

/** 标记通知已读 */
export function markNoticeRead(noticeId: string) {
  return request<API.Response<void>>(`/system/notices/${noticeId}/read`, {
    method: 'POST',
  });
}

/** 标记全部通知已读 */
export function markAllNoticesRead() {
  return request<API.Response<void>>('/system/notices/read-all', {
    method: 'POST',
  });
}
