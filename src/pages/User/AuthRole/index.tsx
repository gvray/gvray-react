import { AuthButton } from '@/components';
import PageContainer from '@/components/PageContainer';
import PageLoading from '@/components/PageLoading';
import PagePlaceholder from '@/components/PagePlaceholder';
import StatusTag from '@/components/StatusTag';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  SaveOutlined,
  TeamOutlined,
  UndoOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'umi';
import styles from './index.less';
import { useAuthRole } from './model';

const { Text } = Typography;

export default function AuthRolePage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { message } = useFeedback();
  const dict = useDict(['user_status']);
  const { roles, selectedUser, initializeData, submitUserRoles } =
    useAuthRole(userId);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      initializeData(userId).finally(() => setLoading(false));
    }
  }, [initializeData, userId]);

  // 当用户数据加载完成后，设置初始选中的角色
  useEffect(() => {
    if (selectedUser?.roles) {
      setSelectedRoleIds(selectedUser.roles.map((role) => role.roleId));
    }
  }, [selectedUser]);

  // 返回用户列表页面
  const handleBackToUsers = () => {
    navigate('/system/user');
  };

  // 提交角色分配
  const handleSubmit = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      const success = await submitUserRoles({
        roleIds: selectedRoleIds,
      });
      if (success) {
        message.success('角色分配成功');
        await initializeData(userId);
      }
    } catch (error) {
      // error handled by request interceptor
    } finally {
      setSubmitting(false);
    }
  };

  // 重置选择
  const handleReset = () => {
    if (selectedUser?.roles) {
      setSelectedRoleIds(selectedUser.roles.map((role) => role.roleId));
    }
  };

  // 全选
  const handleSelectAll = () => {
    const allRoleIds = roles.map((role) => role.roleId);
    setSelectedRoleIds(allRoleIds);
  };

  // 清空选择
  const handleClearAll = () => {
    setSelectedRoleIds([]);
  };

  // 切换角色选中状态
  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  // 判断是否有变更
  const hasChanges = () => {
    const originalIds = selectedUser?.roles?.map((r) => r.roleId) || [];
    if (originalIds.length !== selectedRoleIds.length) return true;
    return !originalIds.every((id) => selectedRoleIds.includes(id));
  };

  if (loading) {
    return (
      <PageContainer className={styles.pageContainer}>
        <PageLoading />
      </PageContainer>
    );
  }

  if (!userId || !selectedUser) {
    return (
      <PageContainer className={styles.pageContainer}>
        <PagePlaceholder icon={<UserOutlined />}>
          <div>{!userId ? '请提供用户ID来分配角色' : '未找到用户信息'}</div>
        </PagePlaceholder>
      </PageContainer>
    );
  }

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.pageWrapper}>
        {/* 左侧边栏 - 用户信息 */}
        <div className={styles.sidebar}>
          {/* 返回按钮 */}
          <div className={styles.backBar} onClick={handleBackToUsers}>
            <ArrowLeftOutlined className="back-icon" />
            <span className="back-text">返回用户列表</span>
          </div>

          <Card className={styles.userCard}>
            <div className={styles.userHeader}>
              <div className={styles.avatar}>
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt="avatar" />
                ) : (
                  selectedUser.nickname?.charAt(0).toUpperCase() ||
                  selectedUser.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className={styles.userInfo}>
                <div className="name">
                  {selectedUser.nickname || selectedUser.username}
                </div>
                <div className="username">@{selectedUser.username}</div>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div className={styles.infoItem}>
              <span className="label">邮箱</span>
              <span className="value">{selectedUser.email || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className="label">状态</span>
              <StatusTag
                value={selectedUser.status}
                options={dict['user_status']}
              />
            </div>
          </Card>

          <Card size="small" title="分配统计">
            <div className={styles.statsBox}>
              <div className={`${styles.statItem} ${styles.statItemHighlight}`}>
                <div className="number">{selectedRoleIds.length}</div>
                <div className="label">已选择</div>
              </div>
              <div className={styles.statItem}>
                <div className="number">{roles.length}</div>
                <div className="label">总角色</div>
              </div>
            </div>
          </Card>

          <Card size="small" title="当前已分配">
            {selectedUser.roles && selectedUser.roles.length > 0 ? (
              <Space wrap size={[4, 8]}>
                {selectedUser.roles.map((role) => (
                  <Tag key={role.roleId} color="blue">
                    {role.name}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">暂无角色</Text>
            )}
          </Card>
        </div>

        {/* 右侧主内容区 */}
        <div className={styles.mainContent}>
          {/* 顶部操作栏 */}
          <div className={styles.actionBar}>
            <div className={styles.actionLeft}>
              <div className="title-icon">
                <TeamOutlined />
              </div>
              <div className="title-content">
                <div className="title">选择角色</div>
                <div className="subtitle">
                  当前用户拥有 {selectedUser?.roles?.length || 0} 个角色
                </div>
              </div>
            </div>
            <Space wrap>
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
                perms={[PERM.USER_UPDATE_ROLES]}
              >
                保存分配
              </AuthButton>
            </Space>
          </div>

          {/* 角色卡片网格 */}
          <div className={styles.roleGrid}>
            {roles.length > 0 ? (
              roles.map((role) => {
                const isSelected = selectedRoleIds.includes(role.roleId);
                return (
                  <div
                    key={role.roleId}
                    className={`${styles.roleItem} ${
                      isSelected ? styles.roleItemSelected : ''
                    }`}
                    onClick={() => toggleRole(role.roleId)}
                  >
                    <div className="check-icon">
                      {isSelected && <CheckOutlined />}
                    </div>
                    <div className="role-name">{role.name}</div>
                    <div className="role-key">{role.roleKey}</div>
                    {role.remark && (
                      <div className="role-desc">{role.remark}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <TeamOutlined className="icon" />
                <div>暂无可分配的角色</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
