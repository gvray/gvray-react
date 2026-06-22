import { sleep } from '@gvray/eskit';
import { Request, Response } from 'express';

export default {
  'POST /api/auth/login': async (req: Request, res: Response) => {
    const { password, account } = req.body;
    await sleep(1000);

    // Dev 环境只支持 admin 登录，返回 super 权限
    if (
      password === '123456' &&
      ['admin', 'admin@example.com'].includes(account)
    ) {
      res.send({
        success: true,
        code: 200,
        message: '登录成功',
        data: {
          access_token: 'mock_access_token_admin',
          refresh_token: 'mock_refresh_token_admin',
          access_token_expires_in: 7200,
          refresh_token_expires_in: 604800,
        },
      });
      return;
    }

    res.send({
      success: false,
      code: 401,
      message: '用户名或密码错误',
    });
  },

  'POST /api/auth/logout': async (_req: Request, res: Response) => {
    res.send({
      success: true,
      code: 200,
      message: '退出成功',
    });
  },

  'GET /api/auth/me': async (_req: Request, res: Response) => {
    res.send({
      success: true,
      code: 200,
      message: '获取当前用户身份信息',
      data: {
        userId: '41a39361-ba24-4a9e-acbf-bc941914c03b',
        username: 'super_admin',
        isSuperAdmin: true,
        permissionCodes: ['*:*:*'],
        roles: [
          {
            roleId: 'ce0d34f9-cbbc-4ac5-a4c4-f9c82e695957',
            name: '超级管理员',
            roleKey: 'super_admin',
            description: '超级管理员角色，拥有所有权限，不允许删除、创建和修改',
            permissions: [],
          },
        ],
        department: null,
        positions: [],
        preferences: {
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
          pageSize: 20,
          timezone: 'Asia/Shanghai',
          enableNotification: true,
        },
        createdAt: '2026-02-22T15:14:51.935Z',
        updatedAt: '2026-03-01T13:58:20.485Z',
      },
    });
  },

  'GET /api/auth/menus': async (_req: Request, res: Response) => {
    await sleep(500);
    res.json({
      success: true,
      code: 200,
      message: '获取菜单成功',
      data: [
        {
          permissionId: 'a3335fb2-c745-4c8d-924b-c38c8c376101',
          parentPermissionId: '00000000-0000-0000-0000-000000000000',
          name: '系统管理',
          code: 'menu:system',
          type: 'DIRECTORY',
          action: 'access',
          meta: {
            path: '/system',
            icon: 'SettingOutlined',
            hidden: false,
            component: null,
            sort: 0,
          },
          children: [
            {
              permissionId: '618cf983-c05a-4419-9267-46bcb5395c3e',
              parentPermissionId: 'a3335fb2-c745-4c8d-924b-c38c8c376101',
              name: '用户管理',
              code: 'menu:system:user',
              type: 'MENU',
              action: 'access',
              meta: {
                path: '/system/user',
                icon: 'UserOutlined',
                hidden: false,
                component: 'menu:system:user',
                sort: 1,
              },
              children: [],
            },
            {
              permissionId: 'menu-role-001',
              parentPermissionId: 'a3335fb2-c745-4c8d-924b-c38c8c376101',
              name: '角色管理',
              code: 'menu:system:role',
              type: 'MENU',
              action: 'access',
              meta: {
                path: '/system/role',
                icon: 'TeamOutlined',
                hidden: false,
                component: 'menu:system:role',
                sort: 2,
              },
              children: [],
            },
            {
              permissionId: 'menu-perm-001',
              parentPermissionId: 'a3335fb2-c745-4c8d-924b-c38c8c376101',
              name: '权限管理',
              code: 'menu:system:permission',
              type: 'MENU',
              action: 'access',
              meta: {
                path: '/system/permission',
                icon: 'SafetyCertificateOutlined',
                hidden: false,
                component: 'menu:system:permission',
                sort: 3,
              },
              children: [],
            },
            {
              permissionId: 'menu-menu-001',
              parentPermissionId: 'a3335fb2-c745-4c8d-924b-c38c8c376101',
              name: '菜单管理',
              code: 'menu:system:menu',
              type: 'MENU',
              action: 'access',
              meta: {
                path: '/system/menu',
                icon: 'MenuOutlined',
                hidden: false,
                component: 'menu:system:menu',
                sort: 4,
              },
              children: [],
            },
            {
              permissionId: 'menu-dept-001',
              parentPermissionId: 'a3335fb2-c745-4c8d-924b-c38c8c376101',
              name: '部门管理',
              code: 'menu:system:department',
              type: 'MENU',
              action: 'access',
              meta: {
                path: '/system/department',
                icon: 'ApartmentOutlined',
                hidden: false,
                component: 'menu:system:department',
                sort: 5,
              },
              children: [],
            },
          ],
        },
        {
          permissionId: 'menu-docs-001',
          parentPermissionId: '00000000-0000-0000-0000-000000000000',
          name: '开发文档',
          code: 'menu:docs',
          type: 'MENU',
          action: 'access',
          meta: {
            path: '/docs',
            icon: 'FileTextOutlined',
            hidden: false,
            component: 'menu:docs',
            sort: 99,
          },
          children: [],
        },
      ],
    });
  },

  'GET /api/public/runtime-config': async (_req: Request, res: Response) => {
    res.send({
      success: true,
      code: 200,
      message: '获取运行时配置成功',
      data: {
        system: {
          name: 'G-ADMIN',
          description:
            '🦄 基于 React + Umi + Ant Design 的现代企业级 RBAC 权限管理系统',
          logo: '/logo.svg',
          favicon: '/favicon.ico',
          defaultAvatar:
            'https://api.dicebear.com/9.x/bottts/svg?seed=GavinRay',
        },
        env: {
          mode: 'development',
          apiPrefix: '/api/v1',
        },
        uiDefaults: {
          theme: 'light',
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          sidebarCollapsed: false,
          pageSize: 10,
          welcomeMessage: '这是你的系统运行概览，祝你工作愉快',
          showBreadcrumb: true,
        },
        securityPolicy: {
          watermarkEnabled: true,
          passwordMinLength: 6,
          passwordRequireComplexity: true,
          loginFailureLockCount: 5,
        },
        features: {
          fileUploadMaxSize: 10485760,
          fileUploadAllowedTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',
          ossEnabled: false,
          emailEnabled: false,
          oauthGithubEnabled: false,
        },
        capabilities: {
          totalUsers: 22,
          totalRoles: 4,
          totalPermissions: 87,
        },
      },
    });
  },
};
