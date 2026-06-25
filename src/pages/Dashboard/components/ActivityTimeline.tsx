import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Spin, Tag, Timeline, Typography } from 'antd';
import React from 'react';
import { styled } from 'umi';
import type { ActivityLog } from '../model';

const { Text } = Typography;

interface ActivityTimelineProps {
  logs: ActivityLog[];
  loading?: boolean;
}

const TimelineWrapper = styled.div`
  padding: 8px 0;
  .ant-timeline-item-content {
    margin-inline-start: 24px;
  }
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--gvray-bg-elevated);
  transition: background 0.2s;
  &:hover {
    background: var(--gvray-primary-1);
  }
`;

const ActivityLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActivityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ActivityRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IpText = styled(Text)`
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
`;

const getActionIcon = (action: string) => {
  if (action.includes('删除'))
    return <DeleteOutlined style={{ color: 'var(--gvray-error-color)' }} />;
  if (
    action.includes('修改') ||
    action.includes('编辑') ||
    action.includes('更新')
  )
    return <EditOutlined style={{ color: 'var(--gvray-warning-color)' }} />;
  if (action.includes('登录'))
    return <LoginOutlined style={{ color: 'var(--gvray-primary-color)' }} />;
  if (action.includes('权限'))
    return (
      <SafetyCertificateOutlined style={{ color: 'var(--gvray-info-color)' }} />
    );
  if (
    action.includes('新增') ||
    action.includes('创建') ||
    action.includes('注册')
  )
    return <UserAddOutlined style={{ color: 'var(--gvray-success-color)' }} />;
  return (
    <EditOutlined style={{ color: 'var(--gvray-text-color-placeholder)' }} />
  );
};

const getTimelineDotColor = (status: string): string => {
  return status === '成功'
    ? 'var(--gvray-success-color)'
    : 'var(--gvray-error-color)';
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  logs,
  loading,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px 0',
          color: 'var(--gvray-text-color-placeholder)',
        }}
      >
        暂无操作记录
      </div>
    );
  }

  return (
    <TimelineWrapper>
      <Timeline
        items={logs.map((log) => ({
          color: getTimelineDotColor(log.status),
          children: (
            <ActivityItem>
              <ActivityLeft>
                <span style={{ fontSize: 16 }}>
                  {getActionIcon(log.action)}
                </span>
                <ActivityInfo>
                  <Text strong style={{ fontSize: 13 }}>
                    {log.user}{' '}
                    <Text type="secondary" style={{ fontWeight: 400 }}>
                      {log.action}
                    </Text>
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {log.time}
                  </Text>
                </ActivityInfo>
              </ActivityLeft>
              <ActivityRight>
                <IpText type="secondary">{log.ip}</IpText>
                {log.status === '成功' ? (
                  <Tag
                    icon={<CheckCircleOutlined />}
                    color="success"
                    style={{ margin: 0, borderRadius: 12 }}
                  >
                    成功
                  </Tag>
                ) : (
                  <Tag
                    icon={<CloseCircleOutlined />}
                    color="error"
                    style={{ margin: 0, borderRadius: 12 }}
                  >
                    失败
                  </Tag>
                )}
              </ActivityRight>
            </ActivityItem>
          ),
        }))}
      />
    </TimelineWrapper>
  );
};

export default ActivityTimeline;
