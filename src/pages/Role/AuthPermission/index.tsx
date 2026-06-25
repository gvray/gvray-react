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
  FolderOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  SaveOutlined,
  SearchOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  Space,
  Tag,
  Tooltip,
  Tree,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useIntl, useNavigate, useParams } from 'umi';
import styles from './index.less';
import { useAuthPermission } from './model';

const { Text } = Typography;

type RoleDict = {
  common_status: DictOption[];
};

const ACTION_MAP: Record<string, { label: string; color: string }> = {
  list: { label: '列表', color: 'green' },
  view: { label: '查看', color: 'green' },
  detail: { label: '详情', color: 'green' },
  create: { label: '新增', color: 'blue' },
  update: { label: '修改', color: 'orange' },
  delete: { label: '删除', color: 'red' },
  export: { label: '导出', color: 'cyan' },
  import: { label: '导入', color: 'purple' },
  scan: { label: '扫描', color: 'geekblue' },
};

const METHOD_COLOR: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  PATCH: 'gold',
  DELETE: 'red',
};

interface TreeNode {
  key: string;
  title: ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
  checkable?: boolean;
  selectable?: boolean;
}

const getActionFromCode = (code?: string) => {
  const parts = code?.split(':').filter(Boolean) || [];
  return parts[parts.length - 1] || '';
};

const getActionTag = (code?: string) => {
  const action = getActionFromCode(code);
  if (!action) return null;
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

const getMethodTag = (method?: string) => {
  if (!method) return null;
  return (
    <Tag
      color={METHOD_COLOR[method] || 'default'}
      style={{ margin: 0, fontSize: 11, lineHeight: '18px', padding: '0 4px' }}
    >
      {method}
    </Tag>
  );
};

export default function AuthPermissionPage() {
  const { roleId = '' } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const intl = useIntl();
  const dict = useDict<RoleDict>(['common_status']);
  const { message } = useFeedback();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { permissions, selectedRole, initializeData, submitRolePermissions } =
    useAuthPermission();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const permissionIdSet = useMemo(() => {
    return new Set(permissions.map((p: any) => p.permissionId));
  }, [permissions]);

  useEffect(() => {
    if (roleId) {
      setLoading(true);
      initializeData(roleId).finally(() => setLoading(false));
    }
  }, [initializeData, roleId]);

  useEffect(() => {
    if (selectedRole?.permissions) {
      const permissionIds = selectedRole.permissions.map(
        (permission: any) => permission.permissionId,
      );
      setSelectedPermissionIds(permissionIds);
    }
  }, [selectedRole]);

  const filteredPermissions = useMemo(() => {
    if (!searchText) return permissions;
    const kw = searchText.toLowerCase();
    return permissions.filter((p: any) => {
      return (
        p.name?.toLowerCase().includes(kw) ||
        p.code?.toLowerCase().includes(kw) ||
        p.description?.toLowerCase().includes(kw) ||
        p.httpMethod?.toLowerCase().includes(kw)
      );
    });
  }, [permissions, searchText]);

  const permissionTreeData = useMemo(() => {
    const domainMap = new Map<
      string,
      {
        key: string;
        name: string;
        resources: Map<
          string,
          { key: string; name: string; children: TreeNode[] }
        >;
      }
    >();

    const getLabel = (id: string, fallback: string) => {
      const msg = intl.formatMessage({ id });
      return msg === id ? fallback : msg;
    };

    filteredPermissions.forEach((permission: any) => {
      const parts = permission.code?.split(':').filter(Boolean) || [];
      const domain = parts[0] || 'other';
      const resource = parts.length >= 2 ? parts[1] : 'default';
      const resourceKey = `${domain}:${resource}`;

      if (!domainMap.has(domain)) {
        domainMap.set(domain, {
          key: `_domain_${domain}`,
          name: getLabel(`permission.domain.${domain}`, domain),
          resources: new Map(),
        });
      }

      const domainNode = domainMap.get(domain)!;
      if (!domainNode.resources.has(resourceKey)) {
        domainNode.resources.set(resourceKey, {
          key: `_resource_${resourceKey}`,
          name: getLabel(`permission.resource.${resourceKey}`, resourceKey),
          children: [],
        });
      }

      domainNode.resources.get(resourceKey)!.children.push({
        key: permission.permissionId,
        title: (
          <span className={styles.treeNodeLabel}>
            <span className={styles.nodeIcon}>
              <KeyOutlined />
            </span>
            <span className={styles.nodeName}>{permission.name}</span>
            {getActionTag(permission.code)}
            {getMethodTag(permission.httpMethod)}
            <Tooltip title={permission.code}>
              <span className={styles.nodePermission}>{permission.code}</span>
            </Tooltip>
            {permission.description && (
              <Tooltip title={permission.description}>
                <InfoCircleOutlined
                  style={{
                    color: 'var(--gvray-text-color-placeholder)',
                    fontSize: 12,
                    cursor: 'help',
                  }}
                />
              </Tooltip>
            )}
          </span>
        ),
        isLeaf: true,
      });
    });

    return Array.from(domainMap.values()).map((domain) => ({
      key: domain.key,
      title: (
        <span className={styles.treeNodeLabel}>
          <span className={styles.nodeIcon}>
            <FolderOutlined />
          </span>
          <span className={styles.nodeName}>{domain.name}</span>
        </span>
      ),
      checkable: false,
      selectable: false,
      children: Array.from(domain.resources.values()).map((resource) => ({
        key: resource.key,
        title: (
          <span className={styles.treeNodeLabel}>
            <span className={styles.nodeIcon}>
              <FolderOutlined />
            </span>
            <span className={styles.nodeName}>{resource.name}</span>
          </span>
        ),
        checkable: false,
        selectable: false,
        children: resource.children,
      })),
    }));
  }, [filteredPermissions, intl]);

  useEffect(() => {
    const keys: string[] = [];
    permissionTreeData.forEach((domain) => {
      keys.push(domain.key);
      domain.children?.forEach((resource) => keys.push(resource.key));
    });
    setExpandedKeys(keys);
  }, [permissionTreeData]);

  const handleTreeCheck = (keys: any) => {
    const checked = Array.isArray(keys) ? keys : keys.checked || [];
    setSelectedPermissionIds(
      checked.filter((key: string) => permissionIdSet.has(key)),
    );
  };

  const handleBackToRoles = () => {
    navigate('/system/role');
  };

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

  const handleReset = () => {
    if (selectedRole?.permissions) {
      const permissionIds = selectedRole.permissions.map(
        (permission: any) => permission.permissionId,
      );
      setSelectedPermissionIds(permissionIds);
    }
  };

  const handleSelectAll = () => {
    setSelectedPermissionIds(permissions.map((p: any) => p.permissionId));
  };

  const handleClearAll = () => {
    setSelectedPermissionIds([]);
  };

  const hasChanges = () => {
    const originalIds =
      selectedRole?.permissions?.map((p: any) => p.permissionId) || [];
    if (originalIds.length !== selectedPermissionIds.length) return true;
    return !originalIds.every((id: string) =>
      selectedPermissionIds.includes(id),
    );
  };

  const stats = useMemo(() => {
    const domains = new Set<string>();
    const resources = new Set<string>();
    permissions.forEach((p: any) => {
      const parts = p.code?.split(':').filter(Boolean) || [];
      const domain = parts[0] || 'other';
      const resource =
        parts.length >= 2 ? `${domain}:${parts[1]}` : `${domain}:default`;
      domains.add(domain);
      resources.add(resource);
    });
    return {
      domains: domains.size,
      resources: resources.size,
      total: permissions.length,
      selected: selectedPermissionIds.length,
    };
  }, [permissions, selectedPermissionIds.length]);

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

          <Card size="small" title="权限概览" className={styles.statsCard}>
            <div className={styles.statsGrid}>
              <div className={`${styles.statItem} ${styles.purple}`}>
                <div className="number">{stats.selected}</div>
                <div className="label">已选择</div>
              </div>
              <div className={styles.statItem}>
                <div className="number">{stats.total}</div>
                <div className="label">权限点</div>
              </div>
            </div>
            <div
              style={{
                borderTop: '1px solid var(--gvray-border-color)',
                margin: '10px 0',
              }}
            />
            <div className={styles.statsGrid}>
              <div className={`${styles.statItem} ${styles.orange}`}>
                <div className="number">{stats.domains}</div>
                <div className="label">权限域</div>
              </div>
              <div className={`${styles.statItem} ${styles.blue}`}>
                <div className="number">{stats.resources}</div>
                <div className="label">资源分组</div>
              </div>
            </div>
          </Card>

          <Card size="small" title="当前已分配" className={styles.assignedCard}>
            {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
              <Space wrap size={[4, 6]}>
                {selectedRole.permissions.slice(0, 12).map((p: any) => (
                  <Tag
                    key={p.permissionId}
                    color="blue"
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

        <div className={styles.mainContent}>
          <Space className={styles.actionBar} wrap align="center">
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
              perms={[PERM.ROLE_UPDATE_PERMISSIONS]}
            >
              保存
            </AuthButton>
          </Space>

          <div className={styles.contentBody}>
            {permissionTreeData.length > 0 ? (
              <Tree
                checkable
                expandedKeys={expandedKeys}
                checkedKeys={selectedPermissionIds}
                onExpand={(keys) => setExpandedKeys(keys as string[])}
                onCheck={handleTreeCheck}
                treeData={permissionTreeData}
                showLine={{ showLeafIcon: false }}
                showIcon={false}
                blockNode
              />
            ) : (
              <div className={styles.emptyState}>
                <FolderOutlined className="icon" />
                <div>暂无权限数据</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
