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
