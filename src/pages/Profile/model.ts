import { LOGIN_PATH } from '@/constants';
import { queryLoginLogList } from '@/services/loginLog';
import { changePassword, queryProfilePermissions } from '@/services/profile';
import { useAuthStore, usePreferences } from '@/stores';
import { logger, tokenManager } from '@/utils';
import { FormInstance, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useIntl } from 'umi';
import {
  buildPermissionTree,
  type PermissionTreeNode,
} from '../Permission/model';

export type LoginLogDateRange = [Dayjs | null, Dayjs | null] | null;

const DEFAULT_AVATAR = 'https://api.dicebear.com/9.x/bottts/svg?seed=GavinRay';

const STATUS_MAP: Record<
  API.CurrentUserResponseDto['status'],
  { label: string; color: string }
> = {
  enabled: { label: '正常', color: 'green' },
  disabled: { label: '停用', color: 'default' },
  pending: { label: '待激活', color: 'gold' },
  banned: { label: '封禁', color: 'red' },
};

export function getAccountStatusMeta(
  status?: API.CurrentUserResponseDto['status'],
) {
  return status ? STATUS_MAP[status] : { label: '未知', color: 'default' };
}

export function collectPermissionKeys(nodes: PermissionTreeNode[]): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    keys.push(node.permissionId);
    if (node.children?.length)
      keys.push(...collectPermissionKeys(node.children));
  }
  return keys;
}

export function useProfilePageModel() {
  const profile = useAuthStore((s) => s.profile);
  const statusMeta = getAccountStatusMeta(profile?.status);

  const completenessChecks = useMemo(
    () => [
      { key: 'avatar', label: '头像', done: !!profile?.avatar },
      { key: 'email', label: '邮箱', done: !!profile?.email },
      { key: 'phone', label: '手机', done: !!profile?.phone },
      { key: 'nickname', label: '昵称', done: !!profile?.nickname },
      { key: 'department', label: '部门', done: !!profile?.department?.name },
      { key: 'position', label: '岗位', done: !!profile?.positions?.[0]?.name },
    ],
    [profile],
  );

  const doneCount = completenessChecks.filter((item) => item.done).length;
  const completenessPercent = Math.round(
    (doneCount / completenessChecks.length) * 100,
  );

  return {
    profile,
    avatarSrc: profile?.avatar || DEFAULT_AVATAR,
    displayName: profile?.nickname || profile?.username || '用户名',
    accountStatusLabel: statusMeta.label,
    accountStatusColor: statusMeta.color,
    isEnabled: profile?.status === 'enabled',
    completenessChecks,
    doneCount,
    completenessPercent,
  };
}

export function useProfileSecurityModel(passwordForm: FormInstance) {
  const [passwordLoading, setPasswordLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleChangePassword = async (values: API.ChangePasswordDto) => {
    try {
      setPasswordLoading(true);
      const res = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success(res.message || '密码修改成功，请重新登录');
      passwordForm.resetFields();
      tokenManager.clearTokens();
      clearAuth();
      history.push(LOGIN_PATH);
    } catch (error) {
      logger.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return {
    profile,
    passwordLoading,
    handleChangePassword,
  };
}

export function useProfilePermissionsModel() {
  const intl = useIntl();
  const [keyword, setKeyword] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [permData, setPermData] =
    useState<API.UserPermissionsResponseDto | null>(null);

  useEffect(() => {
    queryProfilePermissions()
      .then((res) => {
        if (res?.data) setPermData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const getLabel = useCallback(
    (id: string, fallback: string) => {
      const msg = intl.formatMessage({ id });
      return msg === id ? fallback : msg;
    },
    [intl],
  );

  const tree = useMemo<PermissionTreeNode[]>(() => {
    if (!permData?.permissions) return [];
    const kw = keyword.trim().toLowerCase();
    const filtered = kw
      ? permData.permissions.filter(
          (p) =>
            p.code?.toLowerCase().includes(kw) ||
            p.name?.toLowerCase().includes(kw),
        )
      : permData.permissions;
    // buildPermissionTree expects PermissionResponseDto[]; UserPermissionSimpleDto
    // is a structural subset that buildPermissionTree only reads `code`/`name`/
    // `permissionId` from, so the cast is safe.
    return buildPermissionTree(
      filtered as unknown as API.PermissionResponseDto[],
      getLabel,
    );
  }, [permData, keyword, getLabel]);

  useEffect(() => {
    setExpandedKeys(collectPermissionKeys(tree));
  }, [tree]);

  return {
    keyword,
    setKeyword,
    expandedKeys,
    setExpandedKeys,
    loading,
    permData,
    tree,
  };
}

export interface NotifItem {
  id: string;
  type: 'system' | 'approval' | 'security';
  title: string;
  content: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotifItem[] = [
  {
    id: '1',
    type: 'system',
    title: '系统维护通知',
    content:
      '系统将于本周日凌晨 2:00 - 4:00 进行例行维护，期间部分服务可能不可用。',
    time: '10 分钟前',
    read: false,
  },
  {
    id: '2',
    type: 'security',
    title: '异地登录提醒',
    content:
      '检测到您的账号在北京市有新的登录行为，如非本人操作请及时修改密码。',
    time: '2 小时前',
    read: false,
  },
  {
    id: '3',
    type: 'approval',
    title: '审批通过',
    content: '您提交的《请假申请》已通过审批，审批人：王经理。',
    time: '昨天',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: '功能更新',
    content: '新增数据导出功能，现在支持 Excel 和 CSV 格式一键导出。',
    time: '昨天',
    read: true,
  },
  {
    id: '5',
    type: 'security',
    title: '密码即将过期',
    content: '您的登录密码将在 7 天后过期，建议尽快更换新密码。',
    time: '3 天前',
    read: true,
  },
];

export function useProfileLoginLogModel() {
  const { pageSize } = usePreferences();
  const [data, setData] = useState<API.LoginLogResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState<LoginLogDateRange>(null);

  const fetchData = useCallback(
    async (overrides?: Partial<API.LoginLogsFindAllParams>) => {
      setLoading(true);
      try {
        const range = dateRange;
        const params: API.LoginLogsFindAllParams = {
          page,
          pageSize,
          ...overrides,
        };
        if (statusFilter !== undefined) params.status = statusFilter;
        if (keyword) params.account = keyword;
        if (range?.[0])
          params.createdAtStart = dayjs(range[0]).format('YYYY-MM-DD');
        if (range?.[1])
          params.createdAtEnd = dayjs(range[1]).format('YYYY-MM-DD');
        const res = await queryLoginLogList(params);
        if (res?.data) {
          setData(res.data.items || []);
          setTotal(res.data.total || 0);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [dateRange, keyword, page, pageSize, statusFilter],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    fetchData({ page: 1 });
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleReset = () => {
    setKeyword('');
    setStatusFilter(undefined);
    setDateRange(null);
    setPage(1);
  };

  return {
    data,
    loading,
    total,
    page,
    pageSize,
    setPage,
    statusFilter,
    keyword,
    setKeyword,
    dateRange,
    setDateRange,
    fetchData,
    handleSearch,
    handleStatusChange,
    handleReset,
  };
}

export function useProfileNotificationsModel() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const systemNotifs = notifications.filter((item) => item.type === 'system');
  const approvalNotifs = notifications.filter(
    (item) => item.type === 'approval',
  );
  const securityNotifs = notifications.filter(
    (item) => item.type === 'security',
  );

  return {
    notifications,
    unreadCount,
    systemNotifs,
    approvalNotifs,
    securityNotifs,
    markAsRead,
    markAllRead,
  };
}
