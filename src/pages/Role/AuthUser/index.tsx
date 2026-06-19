import {
  AuthButton,
  PageContainer,
  PageLoading,
  PagePlaceholder,
  StatusTag,
} from '@/components';
import { PERM } from '@/constants';
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
import { debounce } from '@gvray/eskit';
import { Button, Card, Input, Space, Tag, Tooltip, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'umi';
import styles from './index.less';
import { useAuthUser } from './model';

const { Text } = Typography;

type RoleDict = {
  common_status: DictOption[];
};

export default function AuthUserPage() {
  const { roleId = '' } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const dict = useDict<RoleDict>(['common_status']);
  const { message } = useFeedback();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const {
    users,
    total,
    hasMore,
    userLoading,
    selectedRole,
    initializeData,
    fetchUserList,
    loadMoreUsers,
    submitRoleUsers,
  } = useAuthUser(roleId);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roleId) {
      setLoading(true);
      initializeData(roleId).finally(() => setLoading(false));
    }
  }, [initializeData, roleId]);

  useEffect(() => {
    if (selectedRole?.users) {
      setSelectedUserIds(selectedRole.users.map((user: any) => user.userId));
    }
  }, [selectedRole]);

  const debouncedSearch = useMemo(
    () => debounce((keyword: string) => fetchUserList({ keyword }), 300),
    [fetchUserList],
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleBackToRoles = () => {
    navigate('/system/role');
  };

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

  const handleReset = () => {
    if (selectedRole?.users) {
      setSelectedUserIds(selectedRole.users.map((user: any) => user.userId));
    }
  };

  const handleSelectAll = () => {
    setSelectedUserIds(users.map((user: any) => user.userId));
  };

  const handleClearAll = () => {
    setSelectedUserIds([]);
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

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
      <PageContainer className={styles.pageContainer}>
        <PagePlaceholder icon={<TeamOutlined />}>
          未找到角色信息
        </PagePlaceholder>
      </PageContainer>
    );
  }

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.pageWrapper}>
        <div className={styles.sidebar}>
          <Card className={styles.roleCard}>
            <div className={styles.roleHeader}>
              <Tooltip title="返回角色列表">
                <div className={styles.backButton} onClick={handleBackToRoles}>
                  <ArrowLeftOutlined />
                </div>
              </Tooltip>
              <div className={styles.roleInfo}>
                <div className={styles.roleName}>{selectedRole.name}</div>
                <span className={styles.roleKey}>{selectedRole.roleKey}</span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.infoItem}>
              <span className="label">状态</span>
              <StatusTag
                value={selectedRole.status}
                options={dict.common_status}
              />
            </div>
            {selectedRole.remark && (
              <div className={styles.infoItem}>
                <span className="label">描述</span>
                <Tooltip title={selectedRole.remark}>
                  <span className={styles.remarkText}>
                    {selectedRole.remark}
                  </span>
                </Tooltip>
              </div>
            )}
          </Card>

          <Card size="small" title="分配统计" className={styles.statsCard}>
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

          <Card size="small" title="当前已分配" className={styles.assignedCard}>
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

        <div className={styles.mainContent}>
          <Space className={styles.actionBar} wrap align="center">
            <Input
              placeholder="搜索用户名、昵称或邮箱"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
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
              perms={[PERM.ROLE_UPDATE_USERS]}
            >
              保存
            </AuthButton>
          </Space>

          <div className={styles.contentBody}>
            {users.length > 0 ? (
              <>
                <div className={styles.userGrid}>
                  {users.map((user: any) => {
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
                            <div className={styles.userName}>
                              {user.username}
                            </div>
                            <div className={styles.userAccount}>
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
                {hasMore && (
                  <div className={styles.loadMore}>
                    <Button
                      loading={userLoading}
                      onClick={() => loadMoreUsers(searchText)}
                    >
                      加载更多（{users.length}/{total}）
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <UserOutlined className="icon" />
                <div>
                  {searchText ? '未找到匹配的用户' : '暂无可分配的用户'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
