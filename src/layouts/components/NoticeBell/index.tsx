import { Icon } from '@/components';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import useAuth from '@/hooks/useAuth';
import {
  getUnreadNoticeCount,
  markAllNoticesRead,
  markNoticeRead,
  queryNoticeList,
} from '@/services/notice';
import { ACCESS_TOKEN_KEY, logger } from '@/utils';
import { sleep } from '@gvray/eskit';
import { Badge, Button, Drawer, Empty, Popover, Spin, Tabs, Tag } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import storetify from 'storetify';
import { styled, useNavigate } from 'umi';

const TYPE_TAG: Record<string, { label: string; color: string }> = {
  notice: { label: '通知', color: 'blue' },
  announcement: { label: '通告', color: 'red' },
};

const POLLING_INTERVAL = 60_000;

/* ── styled ── */

const Trigger = styled.div`
  cursor: pointer;
  min-width: 28px;
  height: 28px;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  font-size: 16px;

  .ant-badge {
    display: inline-flex;
    align-items: center;
    line-height: 1;
    vertical-align: middle;
  }
`;

const Panel = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gvray-color-split);
  flex-shrink: 0;
`;

const PanelTitle = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: var(--gvray-color-text);
`;

const PanelActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TabsWrap = styled.div`
  .ant-tabs-nav {
    margin-bottom: 0;
    padding: 0 12px;
  }
  .ant-tabs-content {
    height: 360px;
    overflow: hidden;
  }
  .ant-tabs-tabpane {
    height: 100%;
    overflow-y: auto;
  }
`;

const NoticeItem = styled.div<{ $unread: boolean }>`
  position: relative;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid var(--gvray-color-split);
  background: ${({ $unread }) =>
    $unread ? 'var(--gvray-color-bg-base)' : 'transparent'};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--gvray-color-bg-elevated);

    .notice-action {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const NoticeDot = styled.div`
  position: absolute;
  left: 6px;
  top: 18px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gvray-color-primary);
`;

const NoticeBody = styled.div`
  padding-left: 6px;
`;

const NoticeRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const NoticeTitle = styled.span<{ $unread: boolean }>`
  font-size: 14px;
  font-weight: ${({ $unread }) => ($unread ? 600 : 400)};
  color: var(--gvray-color-text);
  line-height: 1.4;
  flex: 1;
  word-break: break-all;
`;

const NoticeContent = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: var(--gvray-color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
`;

const NoticeMeta = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const NoticeTime = styled.span`
  font-size: 12px;
  color: var(--gvray-color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NoticeAction = styled(Button)`
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  padding: 0;
  height: auto;
  font-size: 12px;
`;

const EmptyWrap = styled.div`
  padding: 40px 0;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const DetailTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--gvray-color-text);
  line-height: 1.4;
  flex: 1;
  word-break: break-all;
`;

const DetailMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const DetailTime = styled.span`
  font-size: 13px;
  color: var(--gvray-color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DetailContent = styled.div`
  font-size: 14px;
  line-height: 1.8;
  color: var(--gvray-color-text);
  white-space: pre-wrap;
  word-break: break-all;
  padding: 16px;
  background: var(--gvray-color-bg-base);
  border-radius: 8px;
  border: 1px solid var(--gvray-color-split);
`;

/* ── component ── */

const NoticeBell: React.FC = () => {
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const { message } = useFeedback();

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<API.NoticeResponseDto[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailNotice, setDetailNotice] =
    useState<API.NoticeResponseDto | null>(null);
  const pollingRef = useRef(false);

  const canManage =
    permissions?.includes('*:*:*') || permissions?.includes(PERM.NOTICE_LIST);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNoticeCount();
      setUnreadCount(res.data.count);
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }, []);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queryNoticeList({
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setNotices(res.data?.items || []);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const runPolling = useCallback(async () => {
    pollingRef.current = true;
    while (pollingRef.current) {
      const success = await fetchUnreadCount();
      if (!success) {
        // 失败（如 token 过期且 count 接口不触发刷新）：停止轮询，
        // 待 access token 被其他交互接口刷新后，由订阅恢复。
        pollingRef.current = false;
        break;
      }
      await sleep(POLLING_INTERVAL);
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    runPolling();
    return () => {
      pollingRef.current = false;
    };
  }, [fetchUnreadCount, runPolling]);

  // 轮询因失败停止后，监听 access token 写入（refresh 成功/登录）以恢复轮询。
  // 直接用 storetify 原生 subscribe，组件卸载时 unsubscribe。
  useEffect(() => {
    const listener = (e: { newValue: unknown }) => {
      if (typeof e.newValue === 'string' && !pollingRef.current) {
        runPolling();
      }
    };
    storetify.subscribe(ACCESS_TOKEN_KEY, listener);
    return () => {
      storetify.unsubscribe(ACCESS_TOKEN_KEY, listener);
    };
  }, [runPolling]);

  useEffect(() => {
    if (open) {
      fetchNotices();
      fetchUnreadCount();
    }
  }, [open, fetchNotices, fetchUnreadCount]);

  const handleMarkRead = async (noticeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await markNoticeRead(noticeId);
      setNotices((prev) =>
        prev.map((n) => (n.noticeId === noticeId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      logger.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNoticesRead();
      setNotices((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      message.success('全部标记为已读');
    } catch (error) {
      logger.error(error);
    }
  };

  const handleGoManage = () => {
    setOpen(false);
    navigate('/system/notice');
  };

  const handleOpenDetail = (notice: API.NoticeResponseDto) => {
    setOpen(false);
    if (!notice.isRead) {
      handleMarkRead(notice.noticeId);
    }
    setDetailNotice(notice);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setDetailNotice(null);
  };

  const unreadList = notices.filter((n) => !n.isRead);

  const formatTime = (time: string) => {
    try {
      const d = new Date(time);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes} 分钟前`;
      if (hours < 24) return `${hours} 小时前`;
      if (days < 7) return `${days} 天前`;
      return d.toLocaleDateString();
    } catch {
      return time;
    }
  };

  const formatFullTime = (time: string) => {
    try {
      return new Date(time).toLocaleString();
    } catch {
      return time;
    }
  };

  const renderList = (list: API.NoticeResponseDto[], emptyText: string) => {
    if (list.length === 0) {
      return (
        <EmptyWrap>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
        </EmptyWrap>
      );
    }
    return (
      <>
        {list.map((item) => {
          const typeCfg = TYPE_TAG[item.type];
          const isUnread = !item.isRead;
          return (
            <NoticeItem
              key={item.noticeId}
              $unread={isUnread}
              onClick={() => handleOpenDetail(item)}
            >
              {isUnread && <NoticeDot />}
              <NoticeBody>
                <NoticeRow>
                  <NoticeTitle $unread={isUnread}>{item.title}</NoticeTitle>
                  {typeCfg && (
                    <Tag
                      color={typeCfg.color}
                      style={{
                        margin: 0,
                        fontSize: 11,
                        lineHeight: '18px',
                        padding: '0 6px',
                      }}
                    >
                      {typeCfg.label}
                    </Tag>
                  )}
                </NoticeRow>
                <NoticeContent>{item.content}</NoticeContent>
                <NoticeMeta>
                  <NoticeTime>
                    <Icon name="ClockCircleOutlined" style={{ fontSize: 11 }} />
                    {formatTime(item.createdAt)}
                  </NoticeTime>
                  {isUnread && (
                    <NoticeAction
                      className="notice-action"
                      type="link"
                      size="small"
                      icon={<Icon name="CheckOutlined" />}
                      onClick={(e) => handleMarkRead(item.noticeId, e)}
                    >
                      标记已读
                    </NoticeAction>
                  )}
                </NoticeMeta>
              </NoticeBody>
            </NoticeItem>
          );
        })}
      </>
    );
  };

  const popoverContent = (
    <Panel>
      <PanelHeader>
        <PanelTitle>通知公告</PanelTitle>
        <PanelActions>
          {unreadCount > 0 && (
            <Button
              type="text"
              size="small"
              icon={<Icon name="CheckCircleOutlined" />}
              onClick={handleMarkAllRead}
            >
              全部已读
            </Button>
          )}
          {canManage && (
            <Button type="text" size="small" onClick={handleGoManage}>
              管理
              <Icon name="RightOutlined" style={{ fontSize: 10 }} />
            </Button>
          )}
        </PanelActions>
      </PanelHeader>
      <Spin spinning={loading}>
        <TabsWrap>
          <Tabs
            size="small"
            items={[
              {
                key: 'unread',
                label: `未读 (${unreadList.length})`,
                children: renderList(unreadList, '暂无未读通知'),
              },
              {
                key: 'all',
                label: '全部',
                children: renderList(notices, '暂无通知公告'),
              },
            ]}
          />
        </TabsWrap>
      </Spin>
    </Panel>
  );

  const detailTypeCfg = detailNotice ? TYPE_TAG[detailNotice.type] : null;

  return (
    <>
      <Popover
        content={popoverContent}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
        arrow={{ pointAtCenter: true }}
      >
        <Trigger>
          <Badge
            count={unreadCount}
            overflowCount={99}
            size="small"
            offset={[2, 0]}
          >
            <Icon name="gvray-notification" size={18} />
          </Badge>
        </Trigger>
      </Popover>

      <Drawer
        title="通知详情"
        open={detailVisible}
        onClose={handleCloseDetail}
        width={520}
        closeIcon={<Icon name="CloseOutlined" />}
      >
        {detailNotice && (
          <>
            <DetailHeader>
              <DetailTitle>{detailNotice.title}</DetailTitle>
              {detailTypeCfg && (
                <Tag color={detailTypeCfg.color}>{detailTypeCfg.label}</Tag>
              )}
            </DetailHeader>
            <DetailMeta>
              <DetailTime>
                <Icon name="ClockCircleOutlined" />
                {formatFullTime(detailNotice.createdAt)}
              </DetailTime>
              <Tag
                color={detailNotice.status === 'enabled' ? 'green' : 'default'}
              >
                {detailNotice.status === 'enabled' ? '启用' : '禁用'}
              </Tag>
            </DetailMeta>
            <DetailContent>{detailNotice.content}</DetailContent>
          </>
        )}
      </Drawer>
    </>
  );
};

export default NoticeBell;
