import { useAuthStore } from '@/stores';

const useAuth = () => {
  const { profile, permissions } = useAuthStore();

  return {
    isLogin: !!profile,
    profile,
    permissions,
  };
};

export default useAuth;
