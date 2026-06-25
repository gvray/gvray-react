import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import { updatePermission } from '@/services/permission';
import { logger } from '@/utils';
import { createFormLayout } from '@gvray/adminkit';
import { Form, FormInstance, Input, Modal } from 'antd';
import React, { useImperativeHandle, useState } from 'react';

interface UpdateFormProps {
  onCancel?: () => void;
  onOk?: () => void;
}

export interface UpdateFormRef {
  show: (title: string, data?: Record<string, unknown>) => void;
  hide: () => void;
  form: FormInstance;
}

const UpdateFormFunction: React.ForwardRefRenderFunction<
  UpdateFormRef,
  UpdateFormProps
> = ({ onOk, onCancel }, ref) => {
  const { message } = useFeedback();
  const [title, setTitle] = useState(DEFAULT_MODAL_TITLE);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [form] = Form.useForm();

  const reset = () => {
    form.resetFields();
    setRecord(null);
    setConfirmLoading(false);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      const permissionId = record?.permissionId as string;
      await updatePermission(permissionId, { description: values.description });
      message.success('修改成功');
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
          setRecord(data ?? null);
          setVisible(true);
          if (data) {
            form.setFieldsValue({
              permissionId: data.permissionId,
              name: data.name,
              code: data.code,
              description: data.description,
            });
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
        name="permission_desc_form"
      >
        <Form.Item name="permissionId" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="权限名称">
          <span style={{ color: 'var(--gvray-text-color-secondary)' }}>
            {(record?.name as string) || '-'}
          </span>
        </Form.Item>
        <Form.Item label="权限代码">
          <code style={{ color: 'var(--gvray-text-color-secondary)' }}>
            {(record?.code as string) || '-'}
          </code>
        </Form.Item>
        <Form.Item
          name="description"
          label="权限描述"
          rules={[{ max: 200, message: '描述最多 200 字' }]}
        >
          <Input.TextArea
            placeholder="请输入权限描述"
            rows={4}
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const UpdateForm = React.forwardRef<UpdateFormRef, UpdateFormProps>(
  UpdateFormFunction,
);

UpdateForm.displayName = 'PermissionUpdateForm';

export default UpdateForm;
