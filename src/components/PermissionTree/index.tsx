import { Tree, TreeProps } from 'antd';
import { styled } from 'umi';

interface PermissionTreeProps {
  treeData: any;
  value: string[];
  onChange: (value: string[]) => void;
}

const PermissionTreeWrapper = styled.div`
  border: 1px solid var(--gvray-border-color);
  border-radius: 4px;
  padding: 10px;
`;
const PermissionTree: React.FC<PermissionTreeProps> = ({
  value,
  onChange,
  treeData = [],
}) => {
  //   console.log(value);
  const handleCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
    const checkedNodeKeys = info.checkedNodes
      .filter((item: any) => item.permissionId)
      .map((item: any) => item.permissionId);
    onChange?.(checkedNodeKeys);
  };

  return (
    <PermissionTreeWrapper>
      <Tree
        checkable={true}
        checkedKeys={value}
        treeData={treeData}
        onCheck={handleCheck}
      />
    </PermissionTreeWrapper>
  );
};

export default PermissionTree;
