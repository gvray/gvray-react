/**
 * 字节数转换为可读格式
 * @param bytes 字节数
 * @returns 如 "1.23 GB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unit = units[Math.min(i, units.length - 1)];
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(2)} ${unit}`;
}

/**
 * 秒数转换为 "X 天 X 小时 X 分" 格式
 * @param seconds 秒数
 * @returns 如 "2 天 3 小时 15 分"
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} 天`);
  if (hours > 0) parts.push(`${hours} 小时`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} 分`);

  return parts.join(' ');
}

/**
 * 根据使用率获取颜色
 * @param percent 使用率百分比
 * @returns 颜色值
 */
export function getUsageColor(percent: number): string {
  if (percent < 60) return '#52c41a'; // 绿
  if (percent < 80) return '#faad14'; // 黄
  return '#f5222d'; // 红
}
