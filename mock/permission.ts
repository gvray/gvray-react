import { sleep } from '@gvray/eskit';
import { Request, Response } from 'express';

let permissionData = [
  // system domain
  {
    permissionId: 'perm-system-user-list',
    name: '用户列表',
    code: 'system:user:list',
    action: 'list',
    httpMethod: 'GET',
    origin: 'SYSTEM',
    description: '查看用户列表',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-user-create',
    name: '创建用户',
    code: 'system:user:create',
    action: 'create',
    httpMethod: 'POST',
    origin: 'SYSTEM',
    description: '创建新用户',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-user-update',
    name: '修改用户',
    code: 'system:user:update',
    action: 'update',
    httpMethod: 'PATCH',
    origin: 'SYSTEM',
    description: '修改用户信息',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-user-delete',
    name: '删除用户',
    code: 'system:user:delete',
    action: 'delete',
    httpMethod: 'DELETE',
    origin: 'SYSTEM',
    description: '删除用户',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-role-list',
    name: '角色列表',
    code: 'system:role:list',
    action: 'list',
    httpMethod: 'GET',
    origin: 'SYSTEM',
    description: '查看角色列表',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-role-create',
    name: '创建角色',
    code: 'system:role:create',
    action: 'create',
    httpMethod: 'POST',
    origin: 'SYSTEM',
    description: '创建新角色',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-role-update',
    name: '修改角色',
    code: 'system:role:update',
    action: 'update',
    httpMethod: 'PATCH',
    origin: 'SYSTEM',
    description: '修改角色信息',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-role-delete',
    name: '删除角色',
    code: 'system:role:delete',
    action: 'delete',
    httpMethod: 'DELETE',
    origin: 'SYSTEM',
    description: '删除角色',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-dept-list',
    name: '部门列表',
    code: 'system:department:list',
    action: 'list',
    httpMethod: 'GET',
    origin: 'SYSTEM',
    description: '查看部门列表',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-system-dept-create',
    name: '创建部门',
    code: 'system:department:create',
    action: 'create',
    httpMethod: 'POST',
    origin: 'SYSTEM',
    description: '创建新部门',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  // log domain
  {
    permissionId: 'perm-log-login-list',
    name: '登录日志列表',
    code: 'system:log-login:list',
    action: 'list',
    httpMethod: 'GET',
    origin: 'SYSTEM',
    description: '查看登录日志',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    permissionId: 'perm-log-operation-list',
    name: '操作日志列表',
    code: 'system:log-operation:list',
    action: 'list',
    httpMethod: 'GET',
    origin: 'SYSTEM',
    description: '查看操作日志',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  // menu domain
  {
    permissionId: 'perm-menu-list',
    name: '菜单列表',
    code: 'system:menu:list',
    action: 'list',
    httpMethod: 'GET',
    origin: 'SYSTEM',
    description: '查看菜单列表',
    createdAt: '2026-06-16T08:00:00.000Z',
    updatedAt: '2026-06-16T08:00:00.000Z',
  },
  {
    permissionId: 'perm-menu-create',
    name: '创建菜单',
    code: 'system:menu:create',
    action: 'create',
    httpMethod: 'POST',
    origin: 'SYSTEM',
    description: '创建新菜单',
    createdAt: '2026-06-16T08:00:00.000Z',
    updatedAt: '2026-06-16T08:00:00.000Z',
  },
  {
    permissionId: 'perm-menu-update',
    name: '修改菜单',
    code: 'system:menu:update',
    action: 'update',
    httpMethod: 'PATCH',
    origin: 'SYSTEM',
    description: '修改菜单信息',
    createdAt: '2026-06-16T08:00:00.000Z',
    updatedAt: '2026-06-16T08:00:00.000Z',
  },
  {
    permissionId: 'perm-menu-delete',
    name: '删除菜单',
    code: 'system:menu:delete',
    action: 'delete',
    httpMethod: 'DELETE',
    origin: 'SYSTEM',
    description: '删除菜单',
    createdAt: '2026-06-16T08:00:00.000Z',
    updatedAt: '2026-06-16T08:00:00.000Z',
  },
];

export default {
  'GET /api/system/permissions': async (req: Request, res: Response) => {
    await sleep(300);
    res.json({
      success: true,
      code: 200,
      message: '获取权限列表成功',
      data: {
        items: permissionData,
        total: permissionData.length,
        page: 1,
        pageSize: permissionData.length,
      },
    });
  },

  'GET /api/system/permissions/:permissionId': async (
    req: Request,
    res: Response,
  ) => {
    await sleep(200);
    const { permissionId } = req.params;
    const perm = permissionData.find((p) => p.permissionId === permissionId);
    if (perm) {
      res.json({
        success: true,
        code: 200,
        message: '获取权限详情成功',
        data: perm,
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        message: '权限不存在',
      });
    }
  },

  'PATCH /api/system/permissions/:permissionId': async (
    req: Request,
    res: Response,
  ) => {
    await sleep(300);
    const { permissionId } = req.params;
    const data = req.body;
    const idx = permissionData.findIndex(
      (p) => p.permissionId === permissionId,
    );
    if (idx >= 0) {
      permissionData[idx] = {
        ...permissionData[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      res.json({
        success: true,
        code: 200,
        message: '更新权限成功',
        data: permissionData[idx],
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        message: '权限不存在',
      });
    }
  },

  'POST /api/system/permissions/scan': async (_req: Request, res: Response) => {
    await sleep(1500);
    // 模拟扫描新增一个权限
    const newPerm = {
      permissionId: `perm-scan-${Date.now()}`,
      name: '扫描新增权限',
      code: `system:scan:${Date.now()}`,
      action: 'scan',
      httpMethod: 'GET',
      origin: 'SYSTEM',
      description: '通过扫描自动发现的权限',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    permissionData.push(newPerm);
    res.json({
      success: true,
      code: 200,
      message: `权限扫描完成，新增 1 个权限`,
    });
  },
};
