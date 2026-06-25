import { ApiOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Card, Input, Spin, Tag, Tooltip, Tree, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useMemo } from 'react';
import type { PermissionTreeNode } from '../Permission/model';
import styles from './index.less';
import { useProfilePermissionsModel } from './model';

const { Text } = Typography;

function permTreeToData(nodes: PermissionTreeNode[]): DataNode[] {
  return nodes.map((node) => {
    const isDomain = node.nodeType === 'DOMAIN';
    const isResource = node.nodeType === 'RESOURCE';
    const action = isDomain || isResource ? '' : node.code?.split(':')[2] || '';
    const description =
      !isDomain && !isResource && node.description
        ? String(node.description)
        : '';
    return {
      key: node.permissionId,
      title: (
        <span className={styles.permissionNodeTitle}>
          {isDomain && (
            <Tag color="default" className={styles.inlineTag}>
              域
            </Tag>
          )}
          {isResource && (
            <Tag color="processing" className={styles.inlineTag}>
              资源
            </Tag>
          )}
          {!isDomain && !isResource && (
            <Tag color="cyan" className={styles.inlineTag}>
              {action || '权限'}
            </Tag>
          )}
          <Text
            strong={isDomain}
            type={isResource ? 'secondary' : undefined}
            className={styles.permissionName}
          >
            {node.name}
          </Text>
          {node.code && !isDomain && (
            <Text type="secondary" className={styles.permissionCode}>
              {node.code}
            </Text>
          )}
          {description && (
            <Tooltip title={description} styles={{ body: { maxWidth: 320 } }}>
              <InfoCircleOutlined className={styles.permissionDescIcon} />
            </Tooltip>
          )}
        </span>
      ),
      children: node.children?.length
        ? permTreeToData(node.children)
        : undefined,
    };
  });
}

const TabPermissions: React.FC = () => {
  const model = useProfilePermissionsModel();
  const treeData = useMemo(() => permTreeToData(model.tree), [model.tree]);

  if (model.loading) {
    return (
      <div className={styles.centerLoading}>
        <Spin />
      </div>
    );
  }

  return (
    <Card
      className={styles.moduleCard}
      size="small"
      title={
        <>
          <ApiOutlined /> 权限列表
        </>
      }
      extra={
        <Input.Search
          allowClear
          placeholder="搜索名称或权限代码"
          className={styles.permissionFilter}
          value={model.keyword}
          onChange={(e) => model.setKeyword(e.target.value)}
        />
      }
    >
      {model.permData?.isSuperAdmin && (
        <div className={styles.superAdminTip}>
          <Text type="secondary">拥有系统全部权限 (*:*:*)</Text>
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
};

export default TabPermissions;
