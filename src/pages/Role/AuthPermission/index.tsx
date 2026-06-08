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
  ApiOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ControlOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  MenuOutlined,
  SaveOutlined,
  SearchOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Tree,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'umi';
import styles from './index.less';
import { useAuthPermission } from './model';

const { Text } = Typography;

type RoleDict = {
  role_status: DictOption[];
};

const ACTION_MAP: Record<string, { label: string; color: string }> = {
  view: { label: '查看', color: 'green' },
  create: { label: '新增', color: 'blue' },
  update: { label: '修改', color: 'orange' },
  delete: { label: '删除', color: 'red' },
  export: { label: '导出', color: 'cyan' },
  import: { label: '导入', color: 'purple' },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  DIRECTORY: <FolderOutlined style={{ color: '#faad14' }} />,
  MENU: <MenuOutlined style={{ color: '#1890ff' }} />,
  BUTTON: <ControlOutlined style={{ color: '#52c41a' }} />,
  API: <ApiOutlined style={{ color: '#722ed1' }} />,
};

const getActionTag = (action: string) => {
  const info = ACTION_MAP[action] || { label: action, color: 'default' };
  return (
    <Tag
      color={info.color}
      style={{ margin: 0, fontSize: 11, lineHeight: '18px', padding: '0 4px' }}
    >
      {info.label}
    </Tag>
  );
};
interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
}

export default function AuthPermissionPage() {
  const { roleId = '' } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const dict = useDict<RoleDict>(['role_status']);
  const { message } = useFeedback();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );
  const [searchText, setSearchText] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('func');
  const { permissions, selectedRole, initializeData, submitRolePermissions } =
    useAuthPermission();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roleId) {
      setLoading(true);
      initializeData(roleId).finally(() => setLoading(false));
    }
  }, [initializeData, roleId]);

  // 当角色数据加载完成后，设置初始选中的权限
  useEffect(() => {
    if (selectedRole?.permissions) {
      const permissionIds = selectedRole.permissions.map(
        (permission: any) => permission.permissionId,
      );
      setSelectedPermissionIds(permissionIds);
      setCheckedKeys(permissionIds);
    }
  }, [selectedRole]);

  // ---- 数据分类 ----
  const { funcPermissions, apiPermissions, typeCounts } = useMemo(() => {
    const func: any[] = [];
    const api: any[] = [];
    const counts = { DIRECTORY: 0, MENU: 0, BUTTON: 0, API: 0 };

    permissions.forEach((p: any) => {
      const t = p.type || 'BUTTON';
      if (counts[t as keyof typeof counts] !== undefined) {
        counts[t as keyof typeof counts]++;
      }
      if (t === 'API') {
        api.push(p);
      } else {
        func.push(p);
      }
    });

    return { funcPermissions: func, apiPermissions: api, typeCounts: counts };
  }, [permissions]);

  // ---- 搜索过滤 ----
  const filterList = (list: any[]) => {
    if (!searchText) return list;
    const kw = searchText.toLowerCase();
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(kw) ||
        p.code?.toLowerCase().includes(kw) ||
        p.description?.toLowerCase().includes(kw) ||
        p.action?.toLowerCase().includes(kw),
    );
  };

  const filteredFunc = filterList(funcPermissions);
  const filteredApi = filterList(apiPermissions);

  // ---- 构建功能权限树 (DIRECTORY > MENU > BUTTON) ----
  const funcTreeData = useMemo(() => {
    // 建立 parentPermissionId -> children 映射
    const idMap = new Map<string, any>();
    const roots: any[] = [];

    filteredFunc.forEach((p) =>
      idMap.set(p.permissionId, { ...p, _children: [] }),
    );

    filteredFunc.forEach((p) => {
      const node = idMap.get(p.permissionId)!;
      const parentId = p.parentPermissionId;
      if (parentId && idMap.has(parentId)) {
        idMap.get(parentId)!._children.push(node);
      } else {
        roots.push(node);
      }
    });

    const buildNode = (item: any): TreeNode => {
      return {
        key: item.permissionId,
        title: (
          <span className={styles.treeNodeLabel}>
            <span className={styles.nodeIcon}>
              {TYPE_ICON[item.type] || TYPE_ICON.BUTTON}
            </span>
            <span className={styles.nodeName}>{item.name}</span>
            {getActionTag(item.action)}
            {item.permission && (
              <span className={styles.nodePermission}>{item.permission}</span>
            )}
          </span>
        ),
        children:
          item._children && item._children.length > 0
            ? item._children.map(buildNode)
            : undefined,
        isLeaf: !item._children || item._children.length === 0,
      };
    };

    return roots.map(buildNode);
  }, [filteredFunc, selectedPermissionIds]);

  // ---- API 权限按父级菜单分组 ----
  const apiGroups = useMemo(() => {
    const groupMap = new Map<string, { name: string; items: any[] }>();

    filteredApi.forEach((p) => {
      const parentId = p.parentPermissionId || '__ungrouped__';
      // 尝试找到父级名称
      const parent = permissions.find(
        (pp: any) => pp.permissionId === parentId,
      );
      const groupName = parent?.name || '其他接口';

      if (!groupMap.has(parentId)) {
        groupMap.set(parentId, { name: groupName, items: [] });
      }
      groupMap.get(parentId)!.items.push(p);
    });

    return Array.from(groupMap.entries()).map(([key, val]) => ({
      key,
      ...val,
    }));
  }, [filteredApi, permissions]);

  // ---- 展开控制 ----
  useEffect(() => {
    if (activeTab === 'func') {
      // 收集所有非叶子节点 key
      const collectParentKeys = (list: any[]): string[] => {
        const keys: string[] = [];
        const idMap = new Map<string, any>();
        list.forEach((p) => idMap.set(p.permissionId, p));
        list.forEach((p) => {
          if (list.some((c) => c.parentPermissionId === p.permissionId)) {
            keys.push(p.permissionId);
          }
        });
        return keys;
      };
      setExpandedKeys(collectParentKeys(filteredFunc));
    }
  }, [searchText, filteredFunc, activeTab]);

  const handleExpand = (keys: any) => {
    setExpandedKeys(keys as string[]);
  };

  // ---- 选中处理 ----
  const handleTreeCheck = (keys: any) => {
    // keys 可能是 { checked, halfChecked } 或 string[]
    const checked = Array.isArray(keys) ? keys : keys.checked || [];
    const newIds = new Set(selectedPermissionIds);

    // 先移除当前 tab 的所有 id，再加入新选中的
    funcPermissions.forEach((p: any) => newIds.delete(p.permissionId));
    checked.forEach((k: string) => newIds.add(k));

    const result = Array.from(newIds);
    setSelectedPermissionIds(result);
    setCheckedKeys(result);
  };

  const toggleApiPermission = (permissionId: string) => {
    const newIds = selectedPermissionIds.includes(permissionId)
      ? selectedPermissionIds.filter((id) => id !== permissionId)
      : [...selectedPermissionIds, permissionId];
    setSelectedPermissionIds(newIds);
    setCheckedKeys(newIds);
  };

  const toggleApiGroup = (groupItems: any[], checked: boolean) => {
    const groupIds = groupItems.map((p) => p.permissionId);
    let newIds: string[];
    if (checked) {
      newIds = [...new Set([...selectedPermissionIds, ...groupIds])];
    } else {
      const removeSet = new Set(groupIds);
      newIds = selectedPermissionIds.filter((id) => !removeSet.has(id));
    }
    setSelectedPermissionIds(newIds);
    setCheckedKeys(newIds);
  };

  // 返回角色列表页面
  const handleBackToRoles = () => {
    navigate('/system/role');
  };

  // 提交权限分配
  const handleSubmit = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      const success = await submitRolePermissions({
        roleId: selectedRole.roleId,
        permissionIds: selectedPermissionIds,
      });
      if (success) {
        message.success('权限分配成功');
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
    if (selectedRole?.permissions) {
      const permissionIds = selectedRole.permissions.map(
        (permission: any) => permission.permissionId,
      );
      setSelectedPermissionIds(permissionIds);
      setCheckedKeys(permissionIds);
    }
  };

  // 全选
  const handleSelectAll = () => {
    const allIds = permissions.map((p: any) => p.permissionId);
    setSelectedPermissionIds(allIds);
    setCheckedKeys(allIds);
  };

  // 清空选择
  const handleClearAll = () => {
    setSelectedPermissionIds([]);
    setCheckedKeys([]);
  };

  // 判断是否有变更
  const hasChanges = () => {
    const originalIds =
      selectedRole?.permissions?.map((p: any) => p.permissionId) || [];
    if (originalIds.length !== selectedPermissionIds.length) return true;
    return !originalIds.every((id: string) =>
      selectedPermissionIds.includes(id),
    );
  };

  // ---- 统计 ----
  const selectedFuncCount = funcPermissions.filter((p: any) =>
    selectedPermissionIds.includes(p.permissionId),
  ).length;
  const selectedApiCount = apiPermissions.filter((p: any) =>
    selectedPermissionIds.includes(p.permissionId),
  ).length;

  // ---- 渲染 ----
  // 功能权限 tree 的 checkedKeys 只取功能类
  const funcCheckedKeys = checkedKeys.filter((k) =>
    funcPermissions.some((p: any) => p.permissionId === k),
  );

  if (loading) {
    return (
      <PageContainer className={styles.pageContainer}>
        <PageLoading />
      </PageContainer>
    );
  }

  if (!roleId || !selectedRole) {
    return (
      <PageContainer className={styles.pageContainer}>
        <PagePlaceholder icon={<KeyOutlined />}>
          {!roleId ? '请提供角色ID来分配权限' : '未找到角色信息'}
        </PagePlaceholder>
      </PageContainer>
    );
  }

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.pageWrapper}>
        {/* 左侧边栏 */}
        <div className={styles.sidebar}>
          <div className={styles.backBar} onClick={handleBackToRoles}>
            <ArrowLeftOutlined className={styles.backIcon} />
            <span className={styles.backText}>返回角色列表</span>
          </div>

          <Card className={styles.roleCard}>
            <div className={styles.roleHeader}>
              <div className={styles.roleAvatar}>
                <KeyOutlined />
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
                <Tooltip title={selectedRole.remark}>
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
                </Tooltip>
              </div>
            )}
          </Card>

          <Card size="small" title="权限概览">
            <div className={styles.statsGrid}>
              <div className={`${styles.statItem} ${styles.purple}`}>
                <div className="number">{selectedPermissionIds.length}</div>
                <div className="label">已选择</div>
              </div>
              <div className={styles.statItem}>
                <div className="number">{permissions.length}</div>
                <div className="label">总权限</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', margin: '10px 0' }} />
            <div className={styles.statsGrid}>
              <div className={`${styles.statItem} ${styles.orange}`}>
                <div className="number">{typeCounts.DIRECTORY}</div>
                <div className="label">目录</div>
              </div>
              <div className={`${styles.statItem} ${styles.blue}`}>
                <div className="number">{typeCounts.MENU}</div>
                <div className="label">菜单</div>
              </div>
              <div className={`${styles.statItem} ${styles.green}`}>
                <div className="number">{typeCounts.BUTTON}</div>
                <div className="label">按钮</div>
              </div>
              <div className={`${styles.statItem} ${styles.purple}`}>
                <div className="number">{typeCounts.API}</div>
                <div className="label">接口</div>
              </div>
            </div>
          </Card>

          <Card size="small" title="当前已分配">
            {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
              <Space wrap size={[4, 6]}>
                {selectedRole.permissions.slice(0, 12).map((p: any) => (
                  <Tag
                    key={p.permissionId}
                    color={p.type === 'API' ? 'purple' : 'blue'}
                    style={{ margin: 0, fontSize: 11 }}
                  >
                    {p.name}
                  </Tag>
                ))}
                {selectedRole.permissions.length > 12 && (
                  <Tag style={{ margin: 0, fontSize: 11 }}>
                    +{selectedRole.permissions.length - 12}
                  </Tag>
                )}
              </Space>
            ) : (
              <Text type="secondary" style={{ fontSize: 13 }}>
                暂无权限
              </Text>
            )}
          </Card>
        </div>

        {/* 右侧主内容区 */}
        <div className={styles.mainContent}>
          <div className={styles.actionBar}>
            <div className={styles.actionLeft}>
              <div className={styles.titleIcon}>
                <KeyOutlined />
              </div>
              <div className={styles.titleContent}>
                <div className="title">权限配置</div>
                <div className="subtitle">
                  当前角色拥有 {selectedRole?.permissions?.length || 0} 项权限
                </div>
              </div>
            </div>
            <Space wrap>
              <Input
                placeholder="搜索权限"
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
                requirePermissions={['system:permission:update']}
              >
                保存
              </AuthButton>
            </Space>
          </div>

          <div className={styles.contentBody}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              tabBarExtraContent={
                <Space size={16}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                    {activeTab === 'func'
                      ? `${selectedFuncCount} / ${funcPermissions.length}`
                      : `${selectedApiCount} / ${apiPermissions.length}`}{' '}
                    项已选
                  </Text>
                  {searchText && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      匹配{' '}
                      {activeTab === 'func'
                        ? filteredFunc.length
                        : filteredApi.length}{' '}
                      项
                    </Text>
                  )}
                </Space>
              }
              items={[
                {
                  key: 'func',
                  label: (
                    <span>
                      <MenuOutlined style={{ marginRight: 6 }} />
                      功能权限
                      <Badge
                        count={selectedFuncCount}
                        style={{ marginLeft: 6, backgroundColor: '#722ed1' }}
                        overflowCount={999}
                      />
                    </span>
                  ),
                  children: (
                    <div className={styles.tabContent}>
                      <div className={styles.treeWrapper}>
                        {funcTreeData.length > 0 ? (
                          <Tree
                            checkable
                            expandedKeys={expandedKeys}
                            checkedKeys={funcCheckedKeys}
                            onExpand={handleExpand}
                            onCheck={handleTreeCheck}
                            treeData={funcTreeData}
                            showLine={{ showLeafIcon: false }}
                            showIcon={false}
                            blockNode
                          />
                        ) : (
                          <div className={styles.emptyState}>
                            <FolderOutlined className="icon" />
                            <div>暂无功能权限数据</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'api',
                  label: (
                    <span>
                      <ApiOutlined style={{ marginRight: 6 }} />
                      接口权限
                      <Badge
                        count={selectedApiCount}
                        style={{ marginLeft: 6, backgroundColor: '#722ed1' }}
                        overflowCount={999}
                      />
                    </span>
                  ),
                  children: (
                    <div className={styles.tabContent}>
                      <div className={styles.apiListWrapper}>
                        {apiGroups.length > 0 ? (
                          apiGroups.map((group) => {
                            const groupCheckedCount = group.items.filter(
                              (p: any) =>
                                selectedPermissionIds.includes(p.permissionId),
                            ).length;
                            const allChecked =
                              groupCheckedCount === group.items.length;
                            const indeterminate =
                              groupCheckedCount > 0 && !allChecked;

                            return (
                              <div className={styles.apiGroup} key={group.key}>
                                <div
                                  className={styles.groupHeader}
                                  onClick={() =>
                                    toggleApiGroup(group.items, !allChecked)
                                  }
                                >
                                  <Checkbox
                                    checked={allChecked}
                                    indeterminate={indeterminate}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) =>
                                      toggleApiGroup(
                                        group.items,
                                        e.target.checked,
                                      )
                                    }
                                  />
                                  <ApiOutlined style={{ color: '#722ed1' }} />
                                  <span className="group-name">
                                    {group.name}
                                  </span>
                                  <span className={styles.groupCount}>
                                    {groupCheckedCount}/{group.items.length}
                                  </span>
                                </div>
                                {group.items.map((p: any) => {
                                  const isChecked =
                                    selectedPermissionIds.includes(
                                      p.permissionId,
                                    );
                                  return (
                                    <div
                                      key={p.permissionId}
                                      className={`${styles.apiItem} ${
                                        isChecked ? styles.checked : ''
                                      }`}
                                      onClick={() =>
                                        toggleApiPermission(p.permissionId)
                                      }
                                    >
                                      <Checkbox checked={isChecked} />
                                      <div className="api-main">
                                        <span className="api-name">
                                          {p.name}
                                        </span>
                                        {getActionTag(p.action)}
                                        <Tooltip title={p.code}>
                                          <span className="api-code">
                                            {p.code}
                                          </span>
                                        </Tooltip>
                                        {p.description && (
                                          <Tooltip title={p.description}>
                                            <InfoCircleOutlined
                                              style={{
                                                color: '#bbb',
                                                fontSize: 12,
                                                cursor: 'help',
                                              }}
                                            />
                                          </Tooltip>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })
                        ) : (
                          <div className={styles.emptyState}>
                            <ApiOutlined className="icon" />
                            <div>暂无接口权限数据</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
