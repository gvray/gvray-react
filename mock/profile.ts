import { Request, Response } from 'express';

let profileData = {
  userId: '41a39361-ba24-4a9e-acbf-bc941914c03b',
  username: 'super_admin',
  nickname: '超级管理员',
  avatar: '',
  email: 'super@example.com',
  phone: '13900139000',
  gender: 'unknown',
  updatedAt: '2026-03-01T13:58:20.485Z',
};

let settingsData = {
  theme: 'light',
  primaryColor: '#1890ff',
  colorWeak: false,
  fixedHeader: false,
  showLogo: true,
  sidebarDark: false,
  sidebarCollapsed: false,
  uniqueOpened: true,
  showBreadcrumb: true,
  showFooter: true,
  language: 'zh-CN',
  pageSize: 10,
  timezone: 'Asia/Shanghai',
  enableNotification: true,
};

export default {
  'GET /api/profile': async (_req: Request, res: Response) => {
    res.send({
      success: true,
      code: 200,
      message: '获取当前用户个人资料',
      data: { ...profileData },
    });
  },

  'PATCH /api/profile': async (req: Request, res: Response) => {
    profileData = { ...profileData, ...req.body };
    res.send({
      success: true,
      code: 200,
      message: '更新个人资料成功',
      data: { ...profileData },
    });
  },

  'GET /api/profile/login-logs': async (req: Request, res: Response) => {
    const { page = 1, pageSize = 10 } = req.query;
    const items = Array.from({ length: Number(pageSize) }, (_, i) => ({
      id: (Number(page) - 1) * Number(pageSize) + i + 1,
      account: 'super_admin',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      status: i % 3 === 0 ? 0 : 1,
      loginType: 'password',
      failReason: i % 3 === 0 ? '密码错误' : undefined,
      location: '北京市',
      device: 'PC',
      browser: 'Chrome',
      os: 'macOS',
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    }));
    res.send({
      success: true,
      code: 200,
      message: '获取登录日志成功',
      data: {
        items,
        total: 100,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  },

  'GET /api/profile/permissions': async (_req: Request, res: Response) => {
    res.send({
      success: true,
      code: 200,
      message: '获取当前用户权限',
      data: {
        roles: [
          {
            roleId: 'ce0d34f9-cbbc-4ac5-a4c4-f9c82e695957',
            name: '超级管理员',
            roleKey: 'super_admin',
            description: '超级管理员角色，拥有所有权限',
          },
        ],
        permissions: [
          {
            permissionId: 'a3335fb2-c745-4c8d-924b-c38c8c376101',
            name: '系统管理',
            code: 'menu:system',
            description: '系统管理菜单权限',
          },
          {
            permissionId: '618cf983-c05a-4419-9267-46bcb5395c3e',
            name: '用户管理',
            code: 'menu:system:user',
            description: '用户管理菜单权限',
          },
        ],
        isSuperAdmin: true,
      },
    });
  },

  'GET /api/profile/settings': async (_req: Request, res: Response) => {
    res.send({
      success: true,
      code: 200,
      message: '获取偏好设置成功',
      data: { ...settingsData },
    });
  },

  'PATCH /api/profile/settings': async (req: Request, res: Response) => {
    settingsData = { ...settingsData, ...req.body.settings };
    res.send({
      success: true,
      code: 200,
      message: '更新偏好设置成功',
      data: { ...settingsData },
    });
  },

  'POST /api/profile/change-password': async (req: Request, res: Response) => {
    const { oldPassword } = req.body;
    if (oldPassword !== '123456') {
      res.send({
        success: false,
        code: 400,
        message: '原密码错误',
      });
      return;
    }
    res.send({
      success: true,
      code: 200,
      message: '密码修改成功',
    });
  },
};
