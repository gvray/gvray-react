import { assignRoleUsers, getRoleById } from '@/services/role';
import { queryUserList } from '@/services/user';
import { usePreferences } from '@/stores';
import { useCallback, useState } from 'react';

export const useAuthUser = (roleId?: string) => {
  const { pageSize } = usePreferences();
  const [users, setUsers] = useState<API.UserResponseDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<API.RoleResponseDto | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const fetchUserList = useCallback(
    async (params?: { keyword?: string; page?: number; append?: boolean }) => {
      const currentPage = params?.page || 1;
      setUserLoading(true);
      try {
        const { data } = await queryUserList({
          page: currentPage,
          pageSize,
          keyword: params?.keyword,
        });
        const items = data?.items || [];
        const totalCount = data?.total || 0;
        let nextLength = items.length;

        setUsers((prev) => {
          const nextUsers = params?.append ? [...prev, ...items] : items;
          nextLength = nextUsers.length;
          return nextUsers;
        });
        setPage(currentPage);
        setTotal(totalCount);
        setHasMore(nextLength < totalCount);
      } finally {
        setUserLoading(false);
      }
    },
    [pageSize],
  );

  const fetchRoleDetail = useCallback(async (roleId: string) => {
    const res = await getRoleById(roleId);
    setSelectedRole(res.data);
    return res.data;
  }, []);

  const initializeData = useCallback(
    async (roleId?: string) => {
      if (!roleId) return;
      await Promise.all([fetchUserList(), fetchRoleDetail(roleId)]);
    },
    [fetchUserList, fetchRoleDetail],
  );

  const loadMoreUsers = useCallback(
    (keyword?: string) => {
      if (!hasMore || userLoading) return;
      return fetchUserList({ keyword, page: page + 1, append: true });
    },
    [fetchUserList, hasMore, page, userLoading],
  );

  const submitRoleUsers = useCallback(
    async (values: { userIds: string[] }) => {
      if (!roleId) return false;
      await assignRoleUsers(roleId, { userIds: values.userIds });
      await fetchRoleDetail(roleId);
      return true;
    },
    [roleId, fetchRoleDetail],
  );

  return {
    users,
    total,
    hasMore,
    userLoading,
    selectedRole,
    fetchUserList,
    fetchRoleDetail,
    initializeData,
    loadMoreUsers,
    submitRoleUsers,
  };
};
