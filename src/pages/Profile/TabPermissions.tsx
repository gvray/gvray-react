import { queryProfilePermissions } from '@/services/profile';
import { ApartmentOutlined, ApiOutlined, TagOutlined } from '@ant-design/icons';
import { listToTree } from '@gvray/eskit';
import { Card, Select, Spin, Tabs, Tag, Tooltip, Tree, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const { Text } = Typography;

const TYPE_COLOR: Record<string, string> = {
  DIRECTORY: 'default',
  MENU: 'blue',
  BUTTON: 'orange',
  API: 'purple',
};

const TYPE_LABEL: Record<string, string> = {
  DIRECTORY: '目录',
  MENU: '菜单',
  BUTTON: '按钮',
  API: '接口',
};

const ALL_TYPES = Object.keys(TYPE_LABEL);

type PermNode = API.UserPermissionSimpleDto & { children?: PermNode[] };

function permToTreeData(nodes: PermNode[]): DataNode[] {
  return nodes.map((n) => ({
    key: n.permissionId,
    title: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Tag color={TYPE_COLOR[n.type] ?? 'default'} style={{ margin: 0 }}>
          {TYPE_LABEL[n.type] ?? n.type}
        </Tag>
        <Text strong style={{ fontSize: 13 }}>
          {n.name}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {n.code}
        </Text>
        <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>
          {n.action}
        </Tag>
      </span>
    ),
    children: n.children?.length ? permToTreeData(n.children) : undefined,
  }));
}

function collectKeys(nodes: PermNode[]): string[] {
  const keys: string[] = [];
  for (const n of nodes) {
    keys.push(n.permissionId);
    if (n.children?.length) keys.push(...collectKeys(n.children));
  }
  return keys;
}

const TabPermissions: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [permData, setPermData] =
    useState<API.UserPermissionsResponseDto | null>(null);

  useEffect(() => {
    queryProfilePermissions()
      .then((res) => {
        if (res?.data) setPermData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const tree = useMemo<PermNode[]>(() => {
    if (!permData?.permissions) return [];
    const list: PermNode[] = typeFilter.length
      ? permData.permissions.filter((p: API.UserPermissionSimpleDto) =>
          typeFilter.includes(p.type),
        )
      : (permData.permissions as PermNode[]);

    return listToTree(list, {
      idKey: 'permissionId',
      parentKey: 'parentPermissionId',
      keepEmptyChildren: false,
    });
  }, [permData, typeFilter]);

  const treeData = useMemo(() => {
    setExpandedKeys(collectKeys(tree));
    return permToTreeData(tree);
  }, [tree]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin />
      </div>
    );
  }

  const RolesTab = (
    <Card
      className={styles.moduleCard}
      size="small"
      title={
        <>
          <TagOutlined /> 我的角色
        </>
      }
    >
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0' }}
      >
        {permData?.roles?.length ? (
          permData.roles.map((r: API.UserRoleSimpleDto) => (
            <Tooltip key={r.roleId} title={r.roleKey}>
              <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>
                {r.description ? String(r.description) : r.name}
              </Tag>
            </Tooltip>
          ))
        ) : (
          <Text type="secondary">暂无角色</Text>
        )}
      </div>
    </Card>
  );

  const PermissionsTab = (
    <Card
      className={styles.moduleCard}
      size="small"
      title={
        <>
          <ApiOutlined /> 权限列表
        </>
      }
      extra={
        <Select
          mode="multiple"
          allowClear
          placeholder="按类型筛选"
          style={{ minWidth: 200 }}
          value={typeFilter}
          onChange={setTypeFilter}
          options={ALL_TYPES.map((t) => ({
            value: t,
            label: (
              <Tag color={TYPE_COLOR[t]} style={{ margin: 0 }}>
                {TYPE_LABEL[t]}
              </Tag>
            ),
          }))}
        />
      }
    >
      {permData?.isSuperAdmin && (
        <div style={{ marginBottom: 12 }}>
          <Tag color="red">超级管理员</Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>
            拥有全部权限 (*:*:*)
          </Text>
        </div>
      )}
      {treeData.length > 0 ? (
        <Tree
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys as string[])}
          selectable={false}
          showLine={{ showLeafIcon: false }}
        />
      ) : (
        <Text type="secondary">暂无权限数据</Text>
      )}
    </Card>
  );

  return (
    <Tabs
      items={[
        {
          key: 'roles',
          label: (
            <span>
              <ApartmentOutlined /> 我的角色
            </span>
          ),
          children: RolesTab,
        },
        {
          key: 'permissions',
          label: (
            <span>
              <ApiOutlined /> 权限列表
            </span>
          ),
          children: PermissionsTab,
        },
      ]}
      tabBarExtraContent={
        permData?.isSuperAdmin ? (
          <Tooltip title="拥有系统全部权限">
            <Tag color="red">超级管理员</Tag>
          </Tooltip>
        ) : undefined
      }
    />
  );
};

export default TabPermissions;
