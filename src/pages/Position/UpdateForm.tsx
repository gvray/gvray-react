import FormGrid from '@/components/FormGrid';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import { createPosition, updatePosition } from '@/services/position';
import type { DictOption } from '@/types/dict';
import { logger } from '@/utils';
import { createFormLayout } from '@gvray/adminkit';
import { Form, FormInstance, Input, InputNumber, Modal, Radio } from 'antd';
import React, { useImperativeHandle, useState } from 'react';

interface UpdateFormProps {
  onCancel?: () => void;
  onOk?: () => void;
  dict: Record<string, DictOption[]>;
}

export interface UpdateFormRef {
  show: (title: string, data?: Record<string, unknown>) => void;
  hide: () => void;
  form: FormInstance;
}

const UpdateFormFunction: React.ForwardRefRenderFunction<
  UpdateFormRef,
  UpdateFormProps
> = ({ onOk, onCancel, dict }, ref) => {
  const [title, setTitle] = useState(DEFAULT_MODAL_TITLE);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = useFeedback();

  // 重置弹出层表单
  const reset = () => {
    form.resetFields();
    setConfirmLoading(false);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      const positionId = form.getFieldValue('positionId');
      if (
        positionId === undefined ||
        positionId === null ||
        positionId === ''
      ) {
        await createPosition(values as API.CreatePositionDto);
        message.success('新增成功');
      } else {
        const { positionId: id, ...rest } = values;
        await updatePosition(String(id), rest as API.UpdatePositionDto);
        message.success('修改成功');
      }
      setVisible(false);
      onOk?.();
      reset();
    } catch (error) {
      logger.error(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setVisible(false);
    reset();
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        show: (title, data) => {
          setTitle(title);
          setVisible(true);
          reset();
          if (data) {
            // setIsEdit(true);
            form.setFieldsValue(data);
          } else {
            // setIsEdit(false);
          }
        },
        hide: () => {
          setVisible(false);
          reset();
        },
        form,
      };
    },
    [],
  );

  return (
    <Modal
      destroyOnHidden
      forceRender
      width={520}
      title={title}
      open={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      okText="确认"
      cancelText="取消"
    >
      <Form
        {...createFormLayout(4)}
        form={form}
        layout="horizontal"
        name="form_in_modal"
        initialValues={{
          status: 'enabled',
          sort: 0,
        }}
      >
        <Form.Item name="positionId" label="岗位Id" hidden>
          <Input />
        </Form.Item>
        <FormGrid>
          <FormGrid.Item span={24}>
            <Form.Item
              name="name"
              label="岗位名称"
              rules={[{ required: true, message: '岗位名称不能为空' }]}
            >
              <Input placeholder="请输入岗位名称" />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={24}>
            <Form.Item
              name="code"
              label="岗位编码"
              rules={[{ required: true, message: '岗位编码不能为空' }]}
            >
              <Input placeholder="请输入岗位编码" />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              {...createFormLayout(8)}
              name="status"
              label="岗位状态"
              rules={[{ required: true, message: '岗位状态不能为空' }]}
            >
              <Radio.Group options={dict.common_status} />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              {...createFormLayout(8)}
              name="sort"
              label="排序"
              rules={[{ required: true, message: '排序不能为空' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={24}>
            <Form.Item name="description" label="岗位描述">
              <Input.TextArea
                placeholder="请输入岗位描述"
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>
          </FormGrid.Item>
        </FormGrid>
      </Form>
    </Modal>
  );
};

const UpdateForm = React.forwardRef<UpdateFormRef, UpdateFormProps>(
  UpdateFormFunction,
);

UpdateForm.displayName = 'UpdateForm';

export default UpdateForm;
