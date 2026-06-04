const routes = [
  { path: '/login', component: 'Login', layout: false, meta: { auth: false } },
  {
    path: '/',
    component: '@/wrappers/RouteGuard',
    routes: [
      {
        path: '/',
        component: 'Dashboard',
        meta: {
          title: '仪表板',
          permissions: [],
        },
      },
      {
        path: '/profile',
        component: 'Profile',
        meta: {
          title: '个人资料',
          permissions: [],
        },
      },
      {
        path: '/docs',
        component: 'Docs',
        meta: {
          title: '文档',
          permissions: [],
        },
      },
      {
        path: '/403',
        component: '403',
      },
    ],
  },
  {
    path: '/system',
    component: '@/wrappers/RouteGuard',
    routes: [
      {
        path: '/system/user',
        component: 'User',
        meta: {
          title: '用户管理',
          permissions: ['system:user'],
        },
      },
      {
        path: '/system/role',
        component: 'Role',
        meta: {
          title: '角色管理',
          permissions: ['system:role'],
        },
      },
      {
        path: '/system/permission',
        component: 'Permission',
        meta: {
          title: '权限管理',
          permissions: ['system:permission'],
        },
      },
      {
        path: '/system/department',
        component: 'Department',
        meta: {
          title: '部门管理',
          permissions: ['system:department'],
        },
      },
      {
        path: '/system/position',
        component: 'Position',
        meta: {
          title: '职位管理',
          permissions: ['system:position'],
        },
      },
      {
        path: '/system/dictionary',
        component: 'Dictionary',
        meta: {
          title: '字典管理',
          permissions: ['system:dictionary'],
        },
      },
      {
        path: '/system/dictionary/items/:typeId',
        component: 'Dictionary/Items',
        meta: {
          title: '字典项管理',
          permissions: ['system:dictionary'],
        },
      },
      {
        path: '/system/config',
        component: 'Config',
        meta: {
          title: '系统配置',
          permissions: ['system:config'],
        },
      },
      {
        path: '/system/log',
        meta: {
          title: '日志管理',
          permissions: ['system:log'],
        },
        routes: [
          {
            path: '/system/log/login',
            component: 'Log/Login',
            meta: {
              title: '登录日志',
              permissions: ['system:log-login'],
            },
          },
          {
            path: '/system/log/operation',
            component: 'Log/Operation',
            meta: {
              title: '操作日志',
              permissions: ['system:log-operation'],
            },
          },
        ],
      },
      // 用户分配角色
      {
        path: '/system/user-auth/role/:userId',
        component: 'User/AuthRole',
        meta: {
          title: '用户分配角色',
          permissions: ['system:user:update'],
        },
      },
      // 角色分配权限
      {
        path: '/system/role-auth/permission/:roleId',
        component: 'Role/AuthPermission',
        meta: {
          title: '角色分配权限',
          permissions: ['system:role:update'],
        },
      },
      // 角色分配用户
      {
        path: '/system/role-auth/user/:roleId',
        component: 'Role/AuthUser',
        meta: {
          title: '角色分配用户',
          permissions: ['system:role:update'],
        },
      },
    ],
  },
  {
    path: '*',
    layout: false,
    routes: [
      {
        path: '*',
        component: '404',
      },
    ],
  },
];

export default routes;
