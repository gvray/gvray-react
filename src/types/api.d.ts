/**
 * 此文件由 scripts/gen-api-types.ts 自动生成
 * 生成时间: 2026-06-24T12:29:15.636Z
 * 数据来源: http://localhost:8001/api-json
 * 请勿手动修改此文件
 */

declare namespace API {
  interface RegisterDto {
    /**
     * 用户邮箱
     * @example test@example.com
     */
    email?: string;
    /**
     * 用户名
     * @example test_user
     */
    username: string;
    /**
     * 昵称
     * @example 测试用户
     */
    nickname: string;
    /**
     * 密码
     * @example 123456
     */
    password: string;
  }

  interface LoginDto {
    /**
     * 用户名/邮箱/手机号
     * @example admin
     */
    account: string;
    /**
     * 密码
     * @example 123456
     */
    password: string;
  }

  interface RefreshTokenDto {
    /**
     * Refresh Token
     * @example a1b2c3d4e5f6...
     */
    refreshToken: string;
  }

  interface PermissionResponseDto {
    id: number;
    /**
     * 权限唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    permissionId: string;
    /** 权限名称 */
    name: string;
    /** 权限代码 */
    code: string;
    /** HTTP 方法 */
    httpMethod: string;
    /** 权限来源 */
    origin: 'USER' | 'SYSTEM';
    /** 权限描述 */
    description?: string;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
  }

  interface CurrentUserRoleResponseDto {
    /** 角色ID */
    id: number;
    /**
     * 角色唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    roleId: string;
    /** 角色名称 */
    name: string;
    /** 角色标识（用于判断是否超管） */
    roleKey?: string;
    /** 角色描述 */
    description?: string;
    /** 角色权限列表 */
    permissions?: PermissionResponseDto[];
  }

  interface CurrentUserDepartmentResponseDto {
    /** 部门ID */
    id: number;
    /**
     * 部门唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    departmentId: string;
    /** 部门名称 */
    name: string;
    /** 部门描述 */
    description?: string;
  }

  interface CurrentUserPositionResponseDto {
    /** 岗位ID */
    id: number;
    /**
     * 岗位唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    positionId: string;
    /** 岗位名称 */
    name: string;
    /** 岗位描述 */
    description?: string;
  }

  interface CurrentUserProfileDto {
    /** 昵称 */
    nickname: string;
    /** 头像 */
    avatar?: Record<string, unknown>;
    /** 邮箱 */
    email?: Record<string, unknown>;
    /** 手机号码 */
    phone?: Record<string, unknown>;
    /** 性别 */
    gender?: Record<string, unknown>;
    /**
     * 用户状态
     * @example enabled
     */
    status: 'disabled' | 'enabled' | 'pending' | 'banned';
  }

  interface CurrentUserResponseDto {
    /** 用户数据库ID */
    id: number;
    /**
     * 用户唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    userId: string;
    /** 用户名 */
    username: string;
    /** 是否为超级管理员 */
    isSuperAdmin?: boolean;
    /** 权限代码聚合（超管动态返回全部权限代码） */
    permissionCodes?: string[];
    /** 用户角色列表（包含权限信息） */
    roles?: CurrentUserRoleResponseDto[];
    /** 所属部门 */
    department?: CurrentUserDepartmentResponseDto;
    /** 所属岗位 */
    positions?: CurrentUserPositionResponseDto[];
    /** 用户偏好设置 */
    preferences?: Record<string, unknown>;
    /** 个人资料 */
    profile?: CurrentUserProfileDto;
  }

  interface AuthMenuResponseDto {
    /** 菜单唯一标识符（UUID） */
    menuId: string;
    /** 父级菜单ID */
    parentMenuId?: Record<string, unknown>;
    /** 菜单名称 */
    name: string;
    /** 菜单类型 */
    type: string;
    /** 绑定权限码 */
    permissionCode?: Record<string, unknown>;
    /** 菜单路径 */
    path?: Record<string, unknown>;
    /** 菜单图标 */
    icon?: Record<string, unknown>;
    /** 是否隐藏 */
    hidden: boolean;
    /** 排序权重 */
    sort: number;
    /** 子节点 */
    children?: AuthMenuResponseDto[];
  }

  interface CreateUserDto {
    /**
     * 用户唯一标识符（UUID）
     * @example 550e8400-e29b-41d4-a716-446655440000
     */
    readonly userId?: string;
    /**
     * 邮箱
     * @example user@example.com
     */
    email?: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /**
     * 手机号码
     * @example 13800138000
     */
    phone?: string;
    /**
     * 用户描述
     * @example 这是一个用户描述
     */
    description?: string;
    /** 密码 */
    password: string;
    /** 头像URL */
    avatar?: string;
    /**
     * 性别
     * @example male
     */
    gender?: 'unknown' | 'male' | 'female' | 'other';
    /**
     * 用户状态
     * @example enabled
     */
    status?: 'disabled' | 'enabled' | 'pending' | 'banned';
    /**
     * 部门ID（UUID）
     * @example 550e8400-e29b-41d4-a716-446655440001
     */
    departmentId?: string;
    /** 岗位ID列表（UUID） */
    positionIds?: string[];
  }

  interface RoleResponseDto {
    id: number;
    /**
     * 角色唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    roleId: string;
    /** 角色标识键 */
    roleKey: string;
    /** 角色名称 */
    name: string;
    /** 角色描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /** 排序权重 */
    sort: number;
    /** 状态：0-禁用，1-启用 */
    status: number;
    /** 权限列表 */
    permissions?: RolePermissionResponseDto[];
    /** 用户列表 */
    users?: RoleUserResponseDto[];
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
  }

  interface DepartmentResponseDto {
    id: number;
    /**
     * 部门唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    departmentId: string;
    /** 部门名称 */
    name: string;
    /** 部门描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /** 负责人 */
    manager?: string;
    /** 联系电话 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 父部门ID */
    parentId: string;
    /** 状态 */
    status: number;
    /** 排序 */
    sort: number;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    children: DepartmentResponseDto[][];
  }

  interface PositionResponseDto {
    id: number;
    /**
     * 岗位唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    positionId: string;
    /** 岗位名称 */
    name: string;
    /** 岗位编码 */
    code: string;
    /** 岗位描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /** 用户列表 */
    users?: PositionUserResponseDto[];
    /** 状态 */
    status: number;
    /** 排序 */
    sort: number;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
  }

  interface UserResponseDto {
    /** 用户数据库ID */
    id: number;
    /**
     * 用户唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    userId: string;
    /** 邮箱 */
    email?: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 手机号码 */
    phone?: string;
    /** 头像URL */
    avatar?: string;
    /**
     * 性别
     * @example male
     */
    gender?: 'unknown' | 'male' | 'female' | 'other';
    /** 用户描述 */
    description?: string;
    /**
     * 用户状态
     * @example enabled
     */
    status: 'disabled' | 'enabled' | 'pending' | 'banned';
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 用户角色列表 */
    roles?: RoleResponseDto[];
    /** 所属部门 */
    department?: DepartmentResponseDto;
    /** 所属岗位列表 */
    positions?: PositionResponseDto[];
  }

  interface UpdateUserDto {
    /**
     * 用户唯一标识符（UUID）
     * @example 550e8400-e29b-41d4-a716-446655440000
     */
    readonly userId?: string;
    /**
     * 邮箱
     * @example user@example.com
     */
    email?: string;
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
    /**
     * 手机号码
     * @example 13800138000
     */
    phone?: string;
    /**
     * 用户描述
     * @example 这是一个用户描述
     */
    description?: string;
    /** 头像URL */
    avatar?: string;
    /**
     * 性别
     * @example male
     */
    gender?: 'unknown' | 'male' | 'female' | 'other';
    /**
     * 用户状态
     * @example enabled
     */
    status?: 'disabled' | 'enabled' | 'pending' | 'banned';
    /**
     * 部门ID（UUID）
     * @example 550e8400-e29b-41d4-a716-446655440001
     */
    departmentId?: string;
    /** 岗位ID列表（UUID） */
    positionIds?: string[];
  }

  interface AssignRolesDto {
    /** 角色ID列表（UUID） */
    roleIds: string[];
  }

  interface BatchDeleteUsersDto {
    /** 待删除用户ID列表 */
    ids: string[];
  }

  interface LoginLogResponseDto {
    /** 日志ID */
    id: number;
    /** 登录用户名/邮箱/手机号 */
    account: string;
    /** 登录IP地址 */
    ipAddress: string;
    /** 用户代理信息 */
    userAgent?: string;
    /** 登录状态：1-成功, 0-失败 */
    status: number;
    /** 登录类型 */
    loginType: string;
    /** 失败原因 */
    failReason?: string;
    /** 登录地点（可选，基于IP解析） */
    location?: string;
    /** 设备信息 */
    device?: string;
    /** 浏览器信息 */
    browser?: string;
    /** 操作系统信息 */
    os?: string;
    /** 创建时间 */
    createdAt: string;
  }

  interface BatchDeleteLoginLogsDto {
    /** 待删除日志ID列表 */
    ids: number[];
  }

  interface CleanLoginLogsDto {
    /**
     * 清理多少天之前的日志（不传则清空全部）
     * @example 7
     */
    days: number;
  }

  interface CreateRoleDto {
    /** 角色名称 */
    name: string;
    /** 角色标识键 */
    roleKey: string;
    /** 角色描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /**
     * 排序权重，数字越小越靠前
     * @example 0
     */
    sort?: number;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /** 权限ID列表 */
    permissionIds?: string[];
  }

  interface RolePermissionResponseDto {
    id: number;
    /**
     * 权限唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    permissionId: string;
    /** 权限名称 */
    name: string;
    /** 权限代码 */
    code: string;
    /** 操作类型 */
    action: string;
  }

  interface RoleUserResponseDto {
    /**
     * 用户唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    userId: string;
    /** 用户名 */
    username: string;
    /** 用户昵称 */
    nickname: string;
    /** 用户邮箱 */
    email: string;
    /** 用户状态：0-禁用，1-启用 */
    status: number;
  }

  interface UpdateRoleDto {
    /** 角色名称 */
    name?: string;
    /** 角色标识键 */
    roleKey?: string;
    /** 角色描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /**
     * 排序权重，数字越小越靠前
     * @example 0
     */
    sort?: number;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /** 权限ID列表 */
    permissionIds?: string[];
  }

  interface AssignPermissionsDto {
    /** 权限ID列表 */
    permissionIds: string[];
  }

  interface AssignUsersDto {
    /** 用户ID列表 */
    userIds: string[];
  }

  interface AssignDataScopeDto {
    /**
     * 数据权限类型：1-仅本人, 2-本部门, 3-本部门及以下, 4-自定义, 5-全部
     * @example 4
     */
    dataScope: number;
    /** 部门ID列表（当dataScope为4-自定义时必填） */
    departmentIds?: string[];
  }

  interface RoleDepartmentDto {
    /** 部门ID */
    departmentId: string;
    /** 部门名称 */
    departmentName: string;
  }

  interface RoleDataScopeResponseDto {
    /** 角色ID */
    roleId: string;
    /** 数据权限范围 */
    dataScope: number;
    /** 关联部门列表 */
    departments: RoleDepartmentDto[];
  }

  interface BatchDeleteRolesDto {
    /** 待删除角色ID列表 */
    ids: string[];
  }

  interface UpdatePermissionDto {
    /** 权限名称 */
    name?: string;
    /** 权限代码（唯一） */
    code?: string;
    /** 操作类型 */
    action?: string;
    /** HTTP 方法 */
    httpMethod?: string;
    /** 权限描述 */
    description?: string;
  }

  interface CreateMenuDto {
    /** 菜单名称 */
    name: string;
    /** 菜单类型 */
    type: 'CATALOG' | 'MENU';
    /** 绑定权限码，如 system:user:list */
    permissionCode?: string;
    /** 菜单路径（唯一） */
    path: string;
    /** 菜单图标 */
    icon?: string;
    /** 是否隐藏 */
    hidden?: boolean;
    /** 排序权重 */
    sort?: number;
    /** 状态 */
    status?: 'enabled' | 'disabled';
    /** 父级菜单ID */
    parentMenuId?: string;
  }

  interface MenuResponseDto {
    id: number;
    /** 菜单唯一标识符（UUID） */
    menuId: string;
    /** 菜单名称 */
    name: string;
    /** 菜单类型 */
    type: 'CATALOG' | 'MENU';
    /** 绑定权限码 */
    permissionCode?: Record<string, unknown>;
    /** 菜单路径 */
    path?: Record<string, unknown>;
    /** 菜单图标 */
    icon?: Record<string, unknown>;
    /** 是否隐藏 */
    hidden: boolean;
    /** 排序权重 */
    sort: number;
    /** 状态 */
    status: string;
    /** 父菜单ID */
    parentMenuId?: Record<string, unknown>;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
  }

  interface MenuTreeNodeDto {
    id: number;
    /** 菜单唯一标识符（UUID） */
    menuId: string;
    /** 菜单名称 */
    name: string;
    /** 菜单类型 */
    type: 'CATALOG' | 'MENU';
    /** 绑定权限码 */
    permissionCode?: Record<string, unknown>;
    /** 菜单路径 */
    path?: Record<string, unknown>;
    /** 菜单图标 */
    icon?: Record<string, unknown>;
    /** 是否隐藏 */
    hidden: boolean;
    /** 排序权重 */
    sort: number;
    /** 状态 */
    status: string;
    /** 父菜单ID */
    parentMenuId?: Record<string, unknown>;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 子菜单列表 */
    children?: MenuTreeNodeDto[];
  }

  interface UpdateMenuDto {
    /** 菜单名称 */
    name?: string;
    /** 菜单类型 */
    type?: 'CATALOG' | 'MENU';
    /** 绑定权限码，如 system:user:list */
    permissionCode?: string;
    /** 菜单路径（唯一） */
    path?: string;
    /** 菜单图标 */
    icon?: string;
    /** 是否隐藏 */
    hidden?: boolean;
    /** 排序权重 */
    sort?: number;
    /** 状态 */
    status?: 'enabled' | 'disabled';
    /** 父级菜单ID */
    parentMenuId?: string;
  }

  interface CreateDepartmentDto {
    /** 部门名称 */
    name: string;
    /** 部门描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /** 负责人 */
    manager?: string;
    /** 联系电话 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 父部门ID（UUID） */
    parentId?: string;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /** 排序 */
    sort?: number;
  }

  interface UpdateDepartmentDto {
    /** 部门名称 */
    name?: string;
    /** 部门描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /** 负责人 */
    manager?: string;
    /** 联系电话 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 父部门ID（UUID） */
    parentId?: string;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /** 排序 */
    sort?: number;
  }

  interface BatchDeleteDepartmentsDto {
    /** 待删除部门ID列表 */
    ids: string[];
  }

  interface CreatePositionDto {
    /** 岗位名称 */
    name: string;
    /** 岗位编码 */
    code: string;
    /** 岗位描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /** 排序 */
    sort?: number;
  }

  interface PositionUserResponseDto {
    id: number;
    /**
     * 用户唯一标识符（UUID）
     * @example a3d7d76e-5a4e-4f0a-93c3-d0b2b27d471e
     */
    userId: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 邮箱 */
    email?: string;
  }

  interface UpdatePositionDto {
    /** 岗位名称 */
    name?: string;
    /** 岗位编码 */
    code?: string;
    /** 岗位描述 */
    description?: string;
    /** 备注信息 */
    remark?: string;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /** 排序 */
    sort?: number;
  }

  interface BatchDeletePositionsDto {
    /** 待删除岗位ID列表 */
    ids: string[];
  }

  interface CreateDictionaryTypeDto {
    /**
     * 字典类型编码
     * @example user_status
     */
    code: string;
    /**
     * 字典类型名称
     * @example 用户状态
     */
    name: string;
    /**
     * 描述
     * @example 用户状态字典类型
     */
    description?: string;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /**
     * 排序权重
     * @example 0
     */
    sort?: number;
    /**
     * 备注信息
     * @example 用户状态字典类型备注
     */
    remark?: string;
  }

  interface DictionaryTypeResponseDto {
    /**
     * 字典类型ID（UUID）
     * @example 550e8400-e29b-41d4-a716-446655440001
     */
    typeId: string;
    /**
     * 字典类型编码
     * @example user_status
     */
    code: string;
    /**
     * 字典类型名称
     * @example 用户状态
     */
    name: string;
    /**
     * 描述
     * @example 用户状态字典类型
     */
    description?: string;
    /**
     * 状态：0-禁用, 1-启用
     * @example 1
     */
    status: number;
    /**
     * 排序权重
     * @example 0
     */
    sort: number;
    /**
     * 备注信息
     * @example 用户状态字典类型备注
     */
    remark?: string;
    /**
     * 创建时间
     * @example 2025-01-01T00:00:00.000Z
     */
    createdAt: string;
    /**
     * 更新时间
     * @example 2025-01-01T00:00:00.000Z
     */
    updatedAt: string;
  }

  interface UpdateDictionaryTypeDto {
    /**
     * 字典类型编码
     * @example user_status
     */
    code?: string;
    /**
     * 字典类型名称
     * @example 用户状态
     */
    name?: string;
    /**
     * 描述
     * @example 用户状态字典类型
     */
    description?: string;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /**
     * 排序权重
     * @example 0
     */
    sort?: number;
    /**
     * 备注信息
     * @example 用户状态字典类型备注
     */
    remark?: string;
  }

  interface BatchDeleteDictionaryTypesDto {
    /** 待删除字典类型ID列表 */
    ids: string[];
  }

  interface CreateDictionaryItemDto {
    /**
     * 字典类型编码
     * @example user_status
     */
    typeCode: string;
    /**
     * 字典项值
     * @example 1
     */
    value: string;
    /**
     * 显示标签
     * @example 启用
     */
    label: string;
    /**
     * 描述
     * @example 用户启用状态
     */
    description?: string;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /**
     * 排序权重
     * @example 0
     */
    sort?: number;
    /**
     * 备注信息
     * @example 用户启用状态备注
     */
    remark?: string;
  }

  interface DictionaryItemResponseDto {
    /**
     * 字典项ID（UUID）
     * @example 550e8400-e29b-41d4-a716-446655440001
     */
    itemId: string;
    /**
     * 字典类型编码
     * @example user_status
     */
    typeCode: string;
    /**
     * 字典项值
     * @example 1
     */
    value: string;
    /**
     * 显示标签
     * @example 启用
     */
    label: string;
    /**
     * 描述
     * @example 用户启用状态
     */
    description?: string;
    /**
     * 状态：0-禁用, 1-启用
     * @example 1
     */
    status: number;
    /**
     * 排序权重
     * @example 0
     */
    sort: number;
    /**
     * 备注信息
     * @example 用户启用状态备注
     */
    remark?: string;
    /**
     * 创建时间
     * @example 2025-01-01T00:00:00.000Z
     */
    createdAt: string;
    /**
     * 更新时间
     * @example 2025-01-01T00:00:00.000Z
     */
    updatedAt: string;
  }

  interface UpdateDictionaryItemDto {
    /**
     * 字典类型编码
     * @example user_status
     */
    typeCode?: string;
    /**
     * 字典项值
     * @example 1
     */
    value?: string;
    /**
     * 显示标签
     * @example 启用
     */
    label?: string;
    /**
     * 描述
     * @example 用户启用状态
     */
    description?: string;
    /**
     * 状态：disabled-禁用, enabled-启用
     * @example enabled
     */
    status?: string;
    /**
     * 排序权重
     * @example 0
     */
    sort?: number;
    /**
     * 备注信息
     * @example 用户启用状态备注
     */
    remark?: string;
  }

  interface BatchDeleteDictionaryItemsDto {
    /** 待删除字典项ID列表 */
    ids: string[];
  }

  interface RuntimeCapabilitiesDto {
    /**
     * 已注册用户总数
     * @example 22
     */
    totalUsers: number;
    /**
     * 可用角色数
     * @example 3
     */
    totalRoles: number;
    /**
     * 权限总数
     * @example 56
     */
    totalPermissions: number;
  }

  interface RuntimeConfigResponseDto {
    /** 系统能力（动态计算） */
    capabilities: RuntimeCapabilitiesDto;
  }

  interface CreateConfigDto {
    /** 配置键 */
    key: string;
    /** 配置值 */
    value: string;
    /** 配置名称 */
    name: string;
    /** 描述 */
    description?: string;
    /** 配置类型 */
    type: string;
    /** 配置分组 */
    group: string;
    /** 状态 */
    status: string;
    /** 排序权重 */
    sort: number;
    /** 备注信息 */
    remark?: string;
    /** 是否对前端公开 */
    isPublic: boolean;
  }

  interface ConfigResponseDto {
    /** 配置ID */
    configId: string;
    /** 配置键 */
    key: string;
    /** 配置值 */
    value: string;
    /** 配置名称 */
    name: string;
    /** 描述 */
    description: string;
    /** 配置类型 */
    type: string;
    /** 配置分组 */
    group: string;
    /** 状态 */
    status: number;
    /** 排序权重 */
    sort: number;
    /** 是否对前端公开 */
    isPublic: boolean;
    /** 备注信息 */
    remark: string;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
  }

  interface UpdateConfigDto {
    /** 配置键 */
    key?: string;
    /** 配置值 */
    value?: string;
    /** 配置名称 */
    name?: string;
    /** 描述 */
    description?: string;
    /** 配置类型 */
    type?: string;
    /** 配置分组 */
    group?: string;
    /** 状态 */
    status?: string;
    /** 排序权重 */
    sort?: number;
    /** 备注信息 */
    remark?: string;
    /** 是否对前端公开 */
    isPublic?: boolean;
  }

  interface BatchDeleteConfigsDto {
    /** 待删除配置ID列表 */
    ids: string[];
  }

  interface OsInfoDto {
    /** 操作系统平台 */
    platform: string;
    /** 主机名 */
    hostname: string;
    /** 系统运行时间（秒） */
    uptime: number;
    /** 操作系统发行版 */
    release: string;
    /** CPU 架构 */
    arch: string;
    /** Node.js 版本 */
    nodeVersion: string;
    /** 运行环境 */
    env: string;
  }

  interface CpuMetricsDto {
    /** CPU 使用率（%） */
    usagePercent: number;
    /** 1 分钟负载 */
    loadAverage1m: number;
    /** 5 分钟负载 */
    loadAverage5m: number;
    /** 15 分钟负载 */
    loadAverage15m: number;
    /** 逻辑核心数 */
    cores: number;
    /** 物理核心数 */
    physicalCores: number;
    /** 每核心使用率（%） */
    perCoreUsage: number[];
  }

  interface MemoryMetricsDto {
    /** 总内存（字节） */
    total: number;
    /** 已用内存（字节） */
    used: number;
    /** 空闲内存（字节） */
    free: number;
    /** 内存使用率（%） */
    usagePercent: number;
  }

  interface DiskMountDto {
    /** 挂载点 */
    mount: string;
    /** 文件系统类型 */
    fsType: string;
    /** 总容量（字节） */
    total: number;
    /** 已用容量（字节） */
    used: number;
    /** 空闲容量（字节） */
    free: number;
    /** 使用率（%） */
    usagePercent: number;
  }

  interface NetworkInterfaceDto {
    /** 接口名称 */
    iface: string;
    /** IPv4 地址 */
    ip4: string;
    /** MAC 地址 */
    mac: string;
    /** 运行状态 */
    operstate: string;
    /** 接收字节数 */
    rxBytes: number;
    /** 发送字节数 */
    txBytes: number;
  }

  interface ProcessMetricsDto {
    /** 进程 ID */
    pid: number;
    /** 进程运行时间（秒） */
    uptime: number;
    /** RSS 内存（字节） */
    rss: number;
    /** 堆内存总量（字节） */
    heapTotal: number;
    /** 已用堆内存（字节） */
    heapUsed: number;
    /** 外部内存（字节） */
    external: number;
    /** 进程 CPU 使用率（%） */
    cpuPercent: number;
    /** Node.js 版本 */
    nodeVersion: string;
  }

  interface ServerMetricsResponseDto {
    /** 数据采集时间戳 */
    timestamp: string;
    /** 操作系统信息 */
    os: OsInfoDto;
    /** CPU 指标 */
    cpu: CpuMetricsDto;
    /** 内存指标 */
    memory: MemoryMetricsDto;
    /** 磁盘指标 */
    disk: DiskMountDto[];
    /** 网络接口指标 */
    network: NetworkInterfaceDto[];
    /** 当前进程指标 */
    process: ProcessMetricsDto;
  }

  interface ProfileResponseDto {
    /** 用户唯一标识符（UUID） */
    userId: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 头像 */
    avatar?: Record<string, unknown>;
    /** 邮箱 */
    email?: Record<string, unknown>;
    /** 手机号码 */
    phone?: Record<string, unknown>;
    /** 性别 */
    gender?: Record<string, unknown>;
    /** 更新时间 */
    updatedAt: string;
  }

  interface UserRoleSimpleDto {
    /** 角色ID */
    roleId: string;
    /** 角色名称 */
    name: string;
    /** 角色标识 */
    roleKey: string;
    /** 角色描述 */
    description?: Record<string, unknown>;
  }

  interface UserPermissionSimpleDto {
    /** 权限ID */
    permissionId: string;
    /** 权限名称 */
    name: string;
    /** 权限代码 */
    code: string;
    /** 权限描述 */
    description?: Record<string, unknown>;
  }

  interface UserPermissionsResponseDto {
    /** 用户角色列表 */
    roles: UserRoleSimpleDto[];
    /** 用户权限列表（去重） */
    permissions: UserPermissionSimpleDto[];
    /** 是否为超级管理员 */
    isSuperAdmin: boolean;
  }

  interface UpdateProfileDto {
    /**
     * 昵称
     * @example 小明
     */
    nickname?: string;
    /** 头像URL */
    avatar?: string;
    /**
     * 手机号码
     * @example 13800138000
     */
    phone?: string;
    /** 性别：unknown-未知, male-男, female-女, other-其他 */
    gender?: 'unknown' | 'male' | 'female' | 'other';
  }

  interface ChangePasswordDto {
    /** 当前密码 */
    oldPassword: string;
    /** 新密码 */
    newPassword: string;
  }

  interface UpdateSettingsDto {
    /**
     * 主题模式
     * @example light
     */
    theme?: 'light' | 'dark' | 'auto';
    /**
     * 主题主色（Hex 颜色值或颜色名称，如 #1890ff、blue）
     * @example #1890ff
     */
    primaryColor?: string;
    /**
     * 色弱模式
     * @example false
     */
    colorWeak?: boolean;
    /**
     * 固定顶栏
     * @example false
     */
    fixedHeader?: boolean;
    /**
     * 显示 Logo
     * @example true
     */
    showLogo?: boolean;
    /**
     * 侧边栏深色（theme 控制全局亮暗，此字段仅控制侧边栏是否深色）
     * @example false
     */
    sidebarDark?: boolean;
    /**
     * 侧边栏是否折叠
     * @example false
     */
    sidebarCollapsed?: boolean;
    /**
     * 侧边栏只展开一个子菜单
     * @example true
     */
    uniqueOpened?: boolean;
    /**
     * 显示面包屑
     * @example true
     */
    showBreadcrumb?: boolean;
    /**
     * 显示页脚
     * @example true
     */
    showFooter?: boolean;
    /**
     * 语言
     * @example zh-CN
     */
    language?: 'zh-CN' | 'en-US';
    /**
     * 默认分页大小
     * @example 10
     */
    pageSize?: number;
    /**
     * 时区
     * @example Asia/Shanghai
     */
    timezone?: string;
    /**
     * 是否启用通知
     * @example true
     */
    enableNotification?: boolean;
  }

  interface BatchDeleteOperationLogsDto {
    /** 待删除操作日志ID列表 */
    ids: number[];
  }

  interface CleanOperationLogsDto {
    /**
     * 清理多少天之前的操作日志
     * @example 7
     */
    days: number;
  }

  // ─── Query 参数类型 ─────────────────────────

  interface UsersFindAllParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 排序字段 */
    sortBy?: string;
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc';
    /** 关键词（匹配用户名、昵称、手机号、邮箱） */
    keyword?: string;
    /** 用户名（模糊查询） */
    username?: string;
    /** 昵称（模糊查询） */
    nickname?: string;
    /** 手机号（模糊查询） */
    phone?: string;
    /** 用户状态 */
    status?: 'disabled' | 'enabled' | 'pending' | 'banned';
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface LoginLogsFindAllParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 登录用户名/邮箱/手机号 */
    account?: string;
    /** 登录IP地址 */
    ipAddress?: string;
    /** 登录结果：success-成功, failure-失败 */
    result?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
    /** 登录地点 */
    location?: string;
    /** 设备信息 */
    device?: string;
    /** 浏览器信息 */
    browser?: string;
    /** 操作系统信息 */
    os?: string;
    /** 登录类型 */
    loginType?: string;
  }

  interface LoginLogsGetStatsParams {
    days?: number;
  }

  interface RolesFindAllParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 角色名称（支持模糊查询） */
    name?: string;
    /** 角色描述（支持模糊查询） */
    description?: string;
    /** 状态：disabled-禁用, enabled-启用 */
    status?: string;
    /** 角色键（支持模糊查询） */
    roleKey?: string;
    /** 创建开始日期 */
    createdAtStart?: string;
    /** 创建结束日期 */
    createdAtEnd?: string;
  }

  interface PermissionsFindAllParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 排序字段 */
    sortBy?: string;
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc';
    /** 权限名称 */
    name?: string;
    /** 权限代码 */
    code?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface MenuFindAllParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 排序字段 */
    sortBy?: string;
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc';
    /** 菜单名称 */
    name?: string;
    /** 菜单路径 */
    path?: string;
    /** 菜单类型 */
    type?: 'CATALOG' | 'MENU';
    /** 状态 */
    status?: string;
    /** 父菜单ID */
    parentMenuId?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface MenuGetTreeParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 排序字段 */
    sortBy?: string;
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc';
    /** 菜单名称 */
    name?: string;
    /** 菜单路径 */
    path?: string;
    /** 菜单类型 */
    type?: 'CATALOG' | 'MENU';
    /** 状态 */
    status?: string;
    /** 父菜单ID */
    parentMenuId?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface DepartmentsFindAllParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 部门名称 */
    name?: string;
    /** 状态：disabled-禁用, enabled-启用 */
    status?: string;
    /** 父部门ID（UUID） */
    parentId?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface DepartmentsGetTreeParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 部门名称 */
    name?: string;
    /** 状态：disabled-禁用, enabled-启用 */
    status?: string;
    /** 父部门ID（UUID） */
    parentId?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface PositionsFindAllParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 岗位名称 */
    name?: string;
    /** 岗位编码 */
    code?: string;
    /** 状态：disabled-禁用, enabled-启用 */
    status?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface DictionariesFindAllDictionaryTypesParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 字典类型编码 */
    code?: string;
    /** 字典类型名称 */
    name?: string;
    /** 状态：disabled-禁用, enabled-启用 */
    status?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface DictionariesGetDictionaryItemsByTypeCodesParams {
    typeCodes?: string;
  }

  interface DictionariesFindAllDictionaryItemsParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 字典类型编码 */
    typeCode?: string;
    /** 字典项标签 */
    label?: string;
    /** 字典项值 */
    value?: string;
    /** 状态：disabled-禁用, enabled-启用 */
    status?: string;
  }

  interface ConfigsFindAllParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 配置键 */
    key?: string;
    /** 配置名称 */
    name?: string;
    /** 配置类型 */
    type?: string;
    /** 配置分组 */
    group?: string;
    /** 状态：disabled-禁用, enabled-启用 */
    status?: string;
    /** 是否对前端公开：true-公开, false-不公开 */
    isPublic?: string;
    /** 创建时间开始（YYYY-MM-DD） */
    createdAtStart?: string;
    /** 创建时间结束（YYYY-MM-DD） */
    createdAtEnd?: string;
  }

  interface ConfigsGetConfigsByKeysParams {
    keys?: string;
  }

  interface ProfileGetLoginLogsParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
  }

  interface OperationLogsFindManyParams {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** ID 精确匹配 */
    id?: number;
    /** 用户名 模糊匹配 */
    username?: string;
    /** 用户ID 精确匹配 */
    userId?: string;
    /** 模块名 模糊匹配 */
    module?: string;
    /** 动作 create/update/delete 等 */
    action?: string;
    /** 操作结果：success-成功, failure-失败 */
    result?: string;
    /** 路径 模糊匹配 */
    path?: string;
    /** 关键字：匹配 message/path/resource */
    keyword?: string;
    /** 开始时间(ISO字符串) */
    createdAtStart?: string;
    /** 结束时间(ISO字符串) */
    createdAtEnd?: string;
  }

  // ─── 通用类型 ───────────────────────────────

  interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  }

  interface Response<T = unknown> {
    success: boolean;
    code: number;
    message: string;
    data: T;
    timestamp?: string;
    path?: string;
  }
}
