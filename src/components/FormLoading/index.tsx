import { Spin } from 'antd';
import React from 'react';

export interface FormLoadingProps {
  loading?: boolean;
  tip?: string;
  children: React.ReactNode;
}

/**
 * 表单加载容器
 * - 用于弹窗表单的数据加载状态
 * - 统一 loading tip 文案，全局一处修改
 */
const FormLoading: React.FC<FormLoadingProps> = ({
  loading,
  tip = '加载中...',
  children,
}) => {
  return (
    <Spin spinning={loading} tip={tip}>
      {children}
    </Spin>
  );
};

export default FormLoading;
