import { useFeedback } from '@/hooks';
import { logout } from '@/services/auth';
import { useAuthStore, useSettingStore } from '@/stores';
import { logger, tokenManager } from '@/utils';
import { Dropdown, MenuProps } from 'antd';
import { history } from 'umi';
import { UserAvatar } from './styles';

const UserDropdown = () => {
  const { profile, clearAuth } = useAuthStore();
  const { colorPrimary } = useSettingStore();
  const { message } = useFeedback();

  const handleLogout = async () => {
    try {
      const res = await logout();

      message.success(res.message);

      tokenManager.clearTokens();
      clearAuth();

      history.push('/login');
    } catch (error) {
      logger.error(error);
    }
  };

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    switch (key) {
      case 'profile':
        history.push('/profile');
        break;

      case 'logout':
        await handleLogout();
        break;
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: '个人中心',
    },
    {
      key: 'logout',
      label: '退出登录',
    },
  ];

  const avatarText = profile?.nickname?.[0] ?? profile?.username?.[0];

  return (
    <Dropdown
      menu={{
        items,
        onClick: handleMenuClick,
      }}
      placement="bottomRight"
    >
      <UserAvatar
        src={profile?.avatar || undefined}
        alt={profile?.username}
        $backgroundColor={!profile?.avatar ? colorPrimary : undefined}
      >
        {!profile?.avatar ? avatarText : null}
      </UserAvatar>
    </Dropdown>
  );
};

export default UserDropdown;
