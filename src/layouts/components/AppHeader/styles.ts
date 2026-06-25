import { Avatar, Layout } from 'antd';
import { styled } from 'umi';

const { Header } = Layout;

export const HeaderWrapper = styled(Header)<{
  $fixed: boolean;
}>`
  padding: 0;
  background: var(--gvray-bg-container);
  /* 用分割线色做底部边框：亮色极淡灰线，暗色微亮线，始终柔和不突兀 */
  border-bottom: 1px solid var(--gvray-border-color-split);
  position: ${({ $fixed }) => ($fixed ? 'sticky' : 'relative')};
  top: 0;
  z-index: 100;
`;

export const HeaderActions = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-inline: 24px;
`;

export const UserAvatar = styled(Avatar)<{
  $backgroundColor?: string;
}>`
  cursor: pointer;

  ${({ $backgroundColor }) =>
    $backgroundColor &&
    `
      background-color: ${$backgroundColor};
    `}
`;
