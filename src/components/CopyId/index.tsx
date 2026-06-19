import { Typography } from 'antd';
import React from 'react';
import { styled } from 'umi';

const { Paragraph } = Typography;

interface CopyIdProps {
  /** ID / UUID 值 */
  id: string;
  className?: string;
  /** 容器宽度，默认 120px */
  $width?: number | string;
}

const Wrapper = styled(Paragraph)<{ $width?: number | string }>`
  width: ${({ $width }) =>
    typeof $width === 'number' ? `${$width}px` : $width || '120px'};
  margin-bottom: 0 !important;
`;

/**
 * 可复制 ID 单元格
 * 替代 Paragraph ellipsis copyable style={{ width: '...' }}
 */
const CopyId: React.FC<CopyIdProps> = ({ id, className, $width }) => {
  return (
    <Wrapper ellipsis copyable className={className} $width={$width}>
      {id}
    </Wrapper>
  );
};

export default CopyId;
