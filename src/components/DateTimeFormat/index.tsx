import { logger } from '@/utils';
import dayjs from 'dayjs';
import React from 'react';
import { styled } from 'umi';

interface DateTimeFormatProps {
  value?: string | number | Date;
  format?: string;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Span = styled.span`
  font-size: 12px;
  color: var(--gvray-text-color-secondary);
`;

/**
 * 时间格式化组件
 * @param value - 时间值
 * @param format - 格式化字符串，默认为 'YYYY/MM/DD'
 * @param fallback - 当值为空时显示的文本，默认为 '-'
 * @param className - CSS类名
 * @param style - 内联样式
 */
const DateTimeFormat: React.FC<DateTimeFormatProps> = ({
  value,
  format = 'YYYY/MM/DD',
  fallback = '-',
  className,
  style,
}) => {
  if (!value) {
    return (
      <Span className={className} style={style}>
        {fallback}
      </Span>
    );
  }

  try {
    const formattedDate = dayjs(value).format(format);
    return (
      <Span className={className} style={style}>
        {formattedDate}
      </Span>
    );
  } catch (error) {
    logger.debug('Date format error:', error);
    return (
      <Span className={className} style={style}>
        {fallback}
      </Span>
    );
  }
};

export default DateTimeFormat;
