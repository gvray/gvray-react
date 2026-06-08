import {
  AuthButton,
  PageContainer,
  PageLoading,
  PagePlaceholder,
  StatusTag,
} from '@/components';
import { useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import type { DictOption } from '@/types/dict';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  SaveOutlined,
  SearchOutlined,
  TeamOutlined,
  UndoOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Input, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'umi';
import styles from './index.less';
import { useAuthUser } from './model';

const { Text } = Typography;

type RoleDict = {
  role_status: DictOption[];
};

export default function AuthUserPage() {
  const { roleId = '' } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const dict = useDict<RoleDict>(['role_status']);
  const { message } = useFeedback();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const { users, selectedRole, initializeData, submitRoleUsers } =
    useAuthUser(roleId);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roleId) {
      setLoading(true);
      initializeData(roleId).finally(() => setLoading(false));
    }
  }, [initializeData, roleId]);

  // 当角色数据加载完成后，设置初始选中的用户
  useEffect(() => {
    if (selectedRole?.users) {
      setSelectedUserIds(selectedRole.users.map((user: any) => user.userId));
    }
  }, [selectedRole]);

  // 过滤用户数据
  const filteredUsers = users.filter((user: any) => {
    if (!searchText) return true;
    return (
      user.nickname?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  // 返回角色列表页面
  const handleBackToRoles = () => {
    navigate('/system/role');
  };

  // 提交用户分配
  const handleSubmit = async () => {
    if (!selectedRole) return;

    setSubmitting(true);
    try {
      const success = await submitRoleUsers({
        userIds: selectedUserIds,
      });
      if (success) {
        message.success('用户分配成功');
        await initializeData(roleId);
      }
    } catch (error) {
      // error handled by request interceptor
    } finally {
      setSubmitting(false);
    }
  };

  // 重置选择
  const handleReset = () => {
    if (selectedRole?.users) {
      setSelectedUserIds(selectedRole.users.map((user: any) => user.userId));
    }
  };

  // 全选
  const handleSelectAll = () => {
    const filteredIds = filteredUsers.map((user: any) => user.userId);
    setSelectedUserIds(filteredIds);
  };

  // 清空选择
  const handleClearAll = () => {
    setSelectedUserIds([]);
  };

  // 切换用户选中状态
  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // 判断是否有变更
  const hasChanges = () => {
    const originalIds = selectedRole?.users?.map((u: any) => u.userId) || [];
    if (originalIds.length !== selectedUserIds.length) return true;
    return !originalIds.every((id: string) => selectedUserIds.includes(id));
  };

  if (loading) {
    return (
      <PageContainer className={styles.pageContainer}>
        <PageLoading />
      </PageContainer>
    );
  }

  if (!roleId) {
    return (
      <PageContainer className={styles.pageContainer}>
        <PagePlaceholder icon={<TeamOutlined />}>
          请提供角色ID来分配用户
        </PagePlaceholder>
      </PageContainer>
    );
  }

  if (!selectedRole) {
    return (
      <PagePlaceholder icon={<TeamOutlined />}>未找到角色信息</PagePlaceholder>
    );
  }

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.pageWrapper}>
        {/* 左侧边栏 - 角色信息 */}
        <div className={styles.sidebar}>
          {/* 返回按钮 */}
          <div className={styles.backBar} onClick={handleBackToRoles}>
            <ArrowLeftOutlined className={styles.backIcon} />
            <span className={styles.backText}>返回角色列表</span>
          </div>

          <Card>
            <div className={styles.roleHeader}>
              <div className={styles.roleAvatar}>
                {selectedRole.name?.charAt(0)?.toUpperCase() || 'R'}
              </div>
              <div className={styles.roleInfo}>
                <div className="name">{selectedRole.name}</div>
                <span className={styles.roleKey}>{selectedRole.roleKey}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />

            <div className={styles.infoItem}>
              <span className="label">状态</span>
              <StatusTag
                value={selectedRole.status}
                options={dict.role_status}
              />
            </div>
            {selectedRole.remark && (
              <div className={styles.infoItem}>
                <span className="label">描述</span>
                <span
                  className="value"
                  style={{
                    maxWidth: 150,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedRole.remark}
                </span>
              </div>
            )}
          </Card>

          <Card size="small" title="分配统计">
            <div className={styles.statsBox}>
              <div className={`${styles.statItem} ${styles.highlight}`}>
                <div className="number">{selectedUserIds.length}</div>
                <div className="label">已选择</div>
              </div>
              <div className={styles.statItem}>
                <div className="number">{users.length}</div>
                <div className="label">总用户</div>
              </div>
            </div>
          </Card>

          <Card size="small" title="当前已分配">
            {selectedRole.users && selectedRole.users.length > 0 ? (
              <Space wrap size={[4, 8]}>
                {selectedRole.users.map((user: any) => (
                  <Tag key={user.userId} color="green">
                    {user.username}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">暂无用户</Text>
            )}
          </Card>
        </div>

        {/* 右侧主内容区 */}
        <div className={styles.mainContent}>
          {/* 顶部操作栏 */}
          <div className={styles.actionBar}>
            <div className={styles.actionLeft}>
              <div className={styles.titleIcon}>
                <UserOutlined />
              </div>
              <div className={styles.titleContent}>
                <div className="title">选择用户</div>
                <div className="subtitle">
                  当前角色拥有 {selectedRole?.users?.length || 0} 个用户
                </div>
              </div>
            </div>
            <Space wrap>
              <Input
                placeholder="搜索用户名、昵称或邮箱"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
              <Button onClick={handleSelectAll}>全选</Button>
              <Button onClick={handleClearAll}>清空</Button>
              <Button icon={<UndoOutlined />} onClick={handleReset}>
                重置
              </Button>
              <AuthButton
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={submitting}
                disabled={!hasChanges()}
                requirePermissions={['system:role:update']}
              >
                保存分配
              </AuthButton>
            </Space>
          </div>

          {/* 用户卡片网格 */}
          {filteredUsers.length > 0 ? (
            <div className={styles.userGrid}>
              {filteredUsers.map((user: any) => {
                const isSelected = selectedUserIds.includes(user.userId);
                return (
                  <div
                    key={user.userId}
                    className={`${styles.userItem} ${
                      isSelected ? styles.selected : ''
                    }`}
                    onClick={() => toggleUser(user.userId)}
                  >
                    <div className={styles.checkIcon}>
                      {isSelected && <CheckOutlined />}
                    </div>
                    <div className={styles.userHeader}>
                      <div className={styles.userAvatar}>
                        {user.avatar ? (
                          <img src={user.avatar} alt="avatar" />
                        ) : (
                          user.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{user.username}</div>
                        <div className="userAccount">
                          {user.nickname || '-'}
                        </div>
                      </div>
                    </div>
                    <div className={styles.userMeta}>
                      <div className={styles.metaItem}>
                        <span>{user.email || '-'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <UserOutlined className="icon" />
              <div>{searchText ? '未找到匹配的用户' : '暂无可分配的用户'}</div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
