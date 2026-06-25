import { Charts } from '@/components';
import { theme } from 'antd';
import type { EChartsOption } from 'echarts';
import React, { useMemo } from 'react';

interface RoleDataItem {
  name: string;
  value: number;
  itemStyle?: { color: string };
}

interface RoleDistributionProps {
  height?: number;
  data: RoleDataItem[] | Record<string, unknown> | null;
}

const colorPalette = [
  '#667eea',
  '#f5576c',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#764ba2',
  '#f093fb',
  '#38f9d7',
];

const RoleDistribution: React.FC<RoleDistributionProps> = ({
  height = 340,
  data,
}) => {
  const { token } = theme.useToken();
  const normalizedData: RoleDataItem[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as RoleDataItem[];
    return [];
  }, [data]);

  const dataWithColor = useMemo(
    () =>
      normalizedData.map((item: RoleDataItem, index: number) => ({
        ...item,
        itemStyle: {
          color:
            item.itemStyle?.color ||
            colorPalette[index % colorPalette.length] ||
            token.colorBorder,
        },
      })),
    [normalizedData],
  );

  const options: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      borderWidth: 1,
      textStyle: { color: token.colorText, fontSize: 13 },
      formatter: (params: unknown) => {
        const p = params as {
          name: string;
          value: number;
          percent: number;
          color: string;
        };
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
                  <b>${p.name}</b>
                </div>
                <div>用户数: <b>${p.value}</b> (${p.percent}%)</div>`;
      },
    },
    legend: {
      orient: 'vertical',
      right: 16,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      icon: 'circle',
      textStyle: {
        fontSize: 12,
        color: token.colorTextSecondary,
        rich: {
          name: { fontSize: 12, color: token.colorText, padding: [0, 0, 0, 4] },
          value: {
            fontSize: 12,
            color: token.colorTextSecondary,
            padding: [0, 0, 0, 8],
          },
        },
      },
      formatter: (name: string) => {
        const item = dataWithColor.find((d: RoleDataItem) => d.name === name);
        return `{name|${name}}  {value|${item?.value ?? 0}}`;
      },
    },
    series: [
      {
        name: '角色分布',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: token.colorBgContainer,
          borderWidth: 3,
        },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: {
            shadowBlur: 16,
            shadowOffsetX: 0,
          },
        },
        data: dataWithColor,
      },
    ],
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Charts options={options} />
    </div>
  );
};

export default RoleDistribution;
