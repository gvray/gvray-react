import { ApartmentOutlined, ApiOutlined, TagOutlined } from '@ant-design/icons';
import { Card, Select, Spin, Tabs, Tag, Tooltip, Tree, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useMemo } from 'react';
import styles from './index.less';
import type { PermNode } from './model';
import { useProfilePermissionsModel } from './model';

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

function permToTreeData(nodes: PermNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.permissionId,
    title: (
      <span className={styles.permissionNodeTitle}>
        <Tag
          color={TYPE_COLOR[node.type] ?? 'default'}
          className={styles.inlineTag}
        >
          {TYPE_LABEL[node.type] ?? node.type}
        </Tag>
        <Text strong className={styles.permissionName}>
          {node.name}
        </Text>
        <Text type="secondary" className={styles.permissionCode}>
          {node.code}
        </Text>
        <Tag color="cyan" className={styles.permissionAction}>
          {node.action}
        </Tag>
      </span>
    ),
    children: node.children?.length ? permToTreeData(node.children) : undefined,
  }));
}

const TabPermissions: React.FC = () => {
  const model = useProfilePermissionsModel();
  const treeData = useMemo(() => permToTreeData(model.tree), [model.tree]);

  if (model.loading) {
    return (
      <div className={styles.centerLoading}>
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
      <div className={styles.roleList}>
        {model.permData?.roles?.length ? (
          model.permData.roles.map((role: API.UserRoleSimpleDto) => (
            <Tooltip
              key={role.roleId}
              title={role.description || role.name}
              styles={{ body: { maxWidth: 280 } }}
            >
              <Tag color="blue" className={styles.roleTag}>
                {role.name}
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
          className={styles.permissionFilter}
          value={model.typeFilter}
          onChange={model.setTypeFilter}
          options={ALL_TYPES.map((type) => ({
            value: type,
            label: (
              <Tag color={TYPE_COLOR[type]} className={styles.inlineTag}>
                {TYPE_LABEL[type]}
              </Tag>
            ),
          }))}
        />
      }
    >
      {model.permData?.isSuperAdmin && (
        <div className={styles.superAdminTip}>
          <Tag color="red">超级管理员</Tag>
          <Text type="secondary">拥有全部权限 (*:*:*)</Text>
        </div>
      )}
      <div className={styles.treeScroll}>
        {treeData.length > 0 ? (
          <Tree
            treeData={treeData}
            expandedKeys={model.expandedKeys}
            onExpand={(keys) => model.setExpandedKeys(keys as string[])}
            selectable={false}
            showLine={{ showLeafIcon: false }}
          />
        ) : (
          <Text type="secondary">暂无权限数据</Text>
        )}
      </div>
    </Card>
  );

  return (
    <Tabs
      className={styles.innerTabs}
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
        model.permData?.isSuperAdmin ? (
          <Tooltip title="拥有系统全部权限">
            <Tag color="red">超级管理员</Tag>
          </Tooltip>
        ) : undefined
      }
    />
  );
};

export default TabPermissions;
