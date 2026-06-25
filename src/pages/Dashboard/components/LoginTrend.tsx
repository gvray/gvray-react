import { Charts } from '@/components';
import { theme } from 'antd';
import type { EChartsOption } from 'echarts';
import React from 'react';

interface LoginTrendProps {
  data: { date: string; value: number }[];
  height?: number;
}

const LoginTrend: React.FC<LoginTrendProps> = ({ data, height = 340 }) => {
  const { token } = theme.useToken();
  const options: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      borderWidth: 1,
      textStyle: { color: token.colorText, fontSize: 13 },
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: 'rgba(102, 126, 234, 0.06)' },
      },
      formatter: (params: unknown) => {
        const list = params as { name: string; value: number }[];
        if (!Array.isArray(list) || list.length === 0) return '';
        const item = list[0];
        return `<div style="font-weight:600;margin-bottom:4px">${item.name}</div>
                <div style="color:#667eea">登录次数: <b>${item.value}</b></div>`;
      },
    },
    grid: {
      left: 8,
      right: 16,
      bottom: 0,
      top: 16,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.date),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: token.colorTextSecondary,
        fontSize: 11,
        margin: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: token.colorTextSecondary, fontSize: 11 },
      splitLine: {
        lineStyle: { color: token.colorFillSecondary, type: 'dashed' },
      },
    },
    series: [
      {
        name: '登录次数',
        data: data.map((item) => item.value),
        type: 'line',
        smooth: true,
        showSymbol: false,
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#667eea',
            borderWidth: 3,
            shadowBlur: 8,
            shadowColor: 'rgba(102, 126, 234, 0.4)',
          },
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.25)' },
              { offset: 0.7, color: 'rgba(102, 126, 234, 0.05)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0)' },
            ],
          },
        },
        lineStyle: {
          width: 2.5,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' },
            ],
          },
        },
        itemStyle: {
          color: '#667eea',
          borderColor: token.colorBgContainer,
          borderWidth: 2,
        },
        symbolSize: 8,
      },
    ],
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Charts options={options} />
    </div>
  );
};

export default LoginTrend;
