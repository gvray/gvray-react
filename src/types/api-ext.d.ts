/**
 * API 类型扩展（临时兼容）
 *
 * 后端已将 /auth/me 和 /profile 职责分离，但自动生成的 api.d.ts
 * 中 CurrentUserResponseDto 暂未包含以下常用字段。
 * 此文件用于过渡兼容，待重新生成 api.d.ts 后可移除。
 */
declare namespace API {
  interface CurrentUserResponseDto {
    /** 昵称 */
    nickname?: string;
    /** 头像URL */
    avatar?: string;
    /** 邮箱 */
    email?: string;
    /** 手机号码 */
    phone?: string;
    /**
     * 用户状态
     * @example enabled
     */
    status?: 'disabled' | 'enabled' | 'pending' | 'banned';
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
  }
}
