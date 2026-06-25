import { AuthButton } from '@/components';
import BackButton from '@/components/BackButton';
import PageContainer from '@/components/PageContainer';
import PageLoading from '@/components/PageLoading';
import PagePlaceholder from '@/components/PagePlaceholder';
import StatusTag from '@/components/StatusTag';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import {
  CheckOutlined,
  SaveOutlined,
  TeamOutlined,
  UndoOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Tag, Typography } from 'antd';
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

  useEffect(() => {
    if (selectedUser?.roles) {
      setSelectedRoleIds(selectedUser.roles.map((role) => role.roleId));
    }
  }, [selectedUser]);

  const handleBackToUsers = () => {
    navigate('/system/user');
  };

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

  const handleReset = () => {
    if (selectedUser?.roles) {
      setSelectedRoleIds(selectedUser.roles.map((role) => role.roleId));
    }
  };

  const handleSelectAll = () => {
    setSelectedRoleIds(roles.map((role) => role.roleId));
  };

  const handleClearAll = () => {
    setSelectedRoleIds([]);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

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
        <div className={styles.sidebar}>
          <Card className={styles.userCard}>
            <div className={styles.userHeader}>
              <BackButton
                tooltipTitle="返回用户列表"
                onClick={handleBackToUsers}
              />
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {selectedUser.nickname || selectedUser.username}
                </div>
                <div className={styles.userAccount}>
                  @{selectedUser.username}
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.infoItem}>
              <span className="label">邮箱</span>
              <span className={styles.infoValue}>
                {selectedUser.email || '-'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className="label">状态</span>
              <StatusTag
                value={selectedUser.status}
                options={dict['user_status']}
              />
            </div>
          </Card>

          <Card size="small" title="分配统计" className={styles.statsCard}>
            <div className={styles.statsBox}>
              <div className={`${styles.statItem} ${styles.highlight}`}>
                <div className="number">{selectedRoleIds.length}</div>
                <div className="label">已选择</div>
              </div>
              <div className={styles.statItem}>
                <div className="number">{roles.length}</div>
                <div className="label">总角色</div>
              </div>
            </div>
          </Card>

          <Card size="small" title="当前已分配" className={styles.assignedCard}>
            {selectedUser.roles && selectedUser.roles.length > 0 ? (
              <Space wrap size={[4, 8]}>
                {selectedUser.roles.map((role) => (
                  <Tag key={role.roleId} color="processing">
                    {role.name}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">暂无角色</Text>
            )}
          </Card>
        </div>

        <div className={styles.mainContent}>
          <Space className={styles.actionBar} wrap align="center">
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
              保存
            </AuthButton>
          </Space>

          <div className={styles.contentBody}>
            {roles.length > 0 ? (
              <div className={styles.roleGrid}>
                {roles.map((role) => {
                  const isSelected = selectedRoleIds.includes(role.roleId);
                  return (
                    <div
                      key={role.roleId}
                      className={`${styles.roleItem} ${
                        isSelected ? styles.selected : ''
                      }`}
                      onClick={() => toggleRole(role.roleId)}
                    >
                      <div className={styles.checkIcon}>
                        {isSelected && <CheckOutlined />}
                      </div>
                      <div className={styles.roleName}>{role.name}</div>
                      <div className={styles.roleKey}>{role.roleKey}</div>
                      {role.remark && (
                        <div className={styles.roleDesc}>{role.remark}</div>
                      )}
                    </div>
                  );
                })}
              </div>
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
