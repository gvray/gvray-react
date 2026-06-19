import { deleteUser, getUserById, queryUserList } from '@/services/user';
import { useCallback } from 'react';

export const useUserModel = () => {
  const fetchUserList = useCallback(async (params?: API.UsersFindAllParams) => {
    return queryUserList(params);
  }, []);
  const fetchUserDetail = useCallback(async (userId: string) => {
    const { data } = await getUserById(userId);
    return data;
  }, []);
  const removeUser = useCallback(async (userId: string) => {
    await deleteUser(userId);
  }, []);
  return {
    fetchUserList,
    fetchUserDetail,
    removeUser,
  };
};
