import { Typography } from 'antd';
import React from 'react';
import { styled } from 'umi';

const { Text } = Typography;

interface CellNameProps {
  /** 主名称 */
  name: string;
  /** 可选描述，溢出时自动 Tooltip */
  description?: string;
  className?: string;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 40px;
`;

const DescWrap = styled.div`
  margin-top: 2px;
  min-height: 16px;
`;

const Desc = styled(Text).attrs({ type: 'secondary' })`
  font-size: 12px;
`;

/**
 * 表格名称单元格：主名称 + 可选描述
 * - 描述溢出时自动显示 Tooltip
 * - 无描述时保持占位，避免行高跳动
 */
const CellName: React.FC<CellNameProps> = ({
  name,
  description,
  className,
}) => {
  return (
    <Root className={className}>
      <Text strong>{name}</Text>
      <DescWrap>
        {description && (
          <Desc ellipsis={{ tooltip: description }}>{description}</Desc>
        )}
      </DescWrap>
    </Root>
  );
};

export default CellName;
