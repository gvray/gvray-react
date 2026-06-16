import { sleep } from '@gvray/eskit';
import { Request, Response } from 'express';

let menuData = [
  {
    menuId: 'menu-system-001',
    parentMenuId: null,
    name: '系统管理',
    type: 'CATALOG',
    path: '/system',
    icon: 'SettingOutlined',
    hidden: false,
    sort: 0,
    status: 'enabled',
    permissionCode: null,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
    children: [
      {
        menuId: 'menu-user-001',
        parentMenuId: 'menu-system-001',
        name: '用户管理',
        type: 'MENU',
        path: '/system/user',
        icon: 'UserOutlined',
        hidden: false,
        sort: 1,
        status: 'enabled',
        permissionCode: 'system:user:list',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-01-15T08:00:00.000Z',
        children: [],
      },
      {
        menuId: 'menu-role-001',
        parentMenuId: 'menu-system-001',
        name: '角色管理',
        type: 'MENU',
        path: '/system/role',
        icon: 'TeamOutlined',
        hidden: false,
        sort: 2,
        status: 'enabled',
        permissionCode: 'system:role:list',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-01-15T08:00:00.000Z',
        children: [],
      },
      {
        menuId: 'menu-perm-001',
        parentMenuId: 'menu-system-001',
        name: '权限管理',
        type: 'MENU',
        path: '/system/permission',
        icon: 'SafetyCertificateOutlined',
        hidden: false,
        sort: 3,
        status: 'enabled',
        permissionCode: 'system:permission:list',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-01-15T08:00:00.000Z',
        children: [],
      },
      {
        menuId: 'menu-menu-001',
        parentMenuId: 'menu-system-001',
        name: '菜单管理',
        type: 'MENU',
        path: '/system/menu',
        icon: 'MenuOutlined',
        hidden: false,
        sort: 4,
        status: 'enabled',
        permissionCode: 'system:menu:list',
        createdAt: '2026-06-16T08:00:00.000Z',
        updatedAt: '2026-06-16T08:00:00.000Z',
        children: [],
      },
      {
        menuId: 'menu-dept-001',
        parentMenuId: 'menu-system-001',
        name: '部门管理',
        type: 'MENU',
        path: '/system/department',
        icon: 'ApartmentOutlined',
        hidden: false,
        sort: 5,
        status: 'enabled',
        permissionCode: 'system:department:list',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-01-15T08:00:00.000Z',
        children: [],
      },
    ],
  },
  {
    menuId: 'menu-docs-001',
    parentMenuId: null,
    name: '开发文档',
    type: 'MENU',
    path: '/docs',
    icon: 'FileTextOutlined',
    hidden: false,
    sort: 99,
    status: 'enabled',
    permissionCode: null,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
    children: [],
  },
];

function findMenuById(list: any[], menuId: string): any | undefined {
  for (const item of list) {
    if (item.menuId === menuId) return item;
    if (item.children?.length) {
      const found = findMenuById(item.children, menuId);
      if (found) return found;
    }
  }
  return undefined;
}

function removeMenuById(list: any[], menuId: string): boolean {
  for (let i = 0; i < list.length; i++) {
    if (list[i].menuId === menuId) {
      list.splice(i, 1);
      return true;
    }
    if (list[i].children?.length) {
      const removed = removeMenuById(list[i].children, menuId);
      if (removed) return true;
    }
  }
  return false;
}

function updateMenuInList(list: any[], menuId: string, data: any): boolean {
  for (let i = 0; i < list.length; i++) {
    if (list[i].menuId === menuId) {
      list[i] = { ...list[i], ...data, menuId };
      return true;
    }
    if (list[i].children?.length) {
      const updated = updateMenuInList(list[i].children, menuId, data);
      if (updated) return true;
    }
  }
  return false;
}

function addMenuToList(list: any[], parentId: string | null, data: any) {
  if (!parentId) {
    list.push(data);
    return;
  }
  for (const item of list) {
    if (item.menuId === parentId) {
      if (!item.children) item.children = [];
      item.children.push(data);
      return;
    }
    if (item.children?.length) {
      addMenuToList(item.children, parentId, data);
    }
  }
}

function flattenMenus(list: any[]): any[] {
  const result: any[] = [];
  for (const item of list) {
    const { children, ...rest } = item;
    result.push(rest);
    if (children?.length) {
      result.push(...flattenMenus(children));
    }
  }
  return result;
}

export default {
  'GET /api/system/menus/tree': async (_req: Request, res: Response) => {
    await sleep(300);
    res.json({
      success: true,
      code: 200,
      message: '获取菜单树成功',
      data: menuData,
    });
  },

  'GET /api/system/menus/parent-list': async (_req: Request, res: Response) => {
    await sleep(200);
    res.json({
      success: true,
      code: 200,
      message: '获取菜单父级列表成功',
      data: flattenMenus(menuData),
    });
  },

  'GET /api/system/menus/:menuId': async (req: Request, res: Response) => {
    await sleep(200);
    const { menuId } = req.params;
    const menu = findMenuById(menuData, menuId);
    if (menu) {
      res.json({
        success: true,
        code: 200,
        message: '获取菜单详情成功',
        data: { ...menu, parentMenuId: menu.parentMenuId },
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        message: '菜单不存在',
      });
    }
  },

  'POST /api/system/menus': async (req: Request, res: Response) => {
    await sleep(300);
    const data = req.body;
    const newMenu = {
      ...data,
      menuId: `menu-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [],
    };
    addMenuToList(menuData, data.parentMenuId, newMenu);
    res.json({
      success: true,
      code: 200,
      message: '创建菜单成功',
      data: newMenu,
    });
  },

  'PATCH /api/system/menus/:menuId': async (req: Request, res: Response) => {
    await sleep(300);
    const { menuId } = req.params;
    const data = req.body;
    const updated = updateMenuInList(menuData, menuId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    if (updated) {
      res.json({
        success: true,
        code: 200,
        message: '更新菜单成功',
        data: { menuId, ...data },
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        message: '菜单不存在',
      });
    }
  },

  'DELETE /api/system/menus/:menuId': async (req: Request, res: Response) => {
    await sleep(200);
    const { menuId } = req.params;
    const removed = removeMenuById(menuData, menuId);
    if (removed) {
      res.json({
        success: true,
        code: 200,
        message: '删除菜单成功',
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        message: '菜单不存在',
      });
    }
  },
};
