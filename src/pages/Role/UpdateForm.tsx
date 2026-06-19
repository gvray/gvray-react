import { FormGrid, FormLoading } from '@/components';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import { createRole, getRoleById, updateRole } from '@/services/role';
import type { DictOption } from '@/types/dict';
import { logger } from '@/utils';
import { createFormLayout } from '@gvray/adminkit';
import { Form, FormInstance, Input, InputNumber, Modal, Radio } from 'antd';
import React, { useEffect, useImperativeHandle, useState } from 'react';

interface UpdateFormProps {
  onCancel?: () => void;
  onOk?: () => void;
  dict: Record<string, DictOption[]>;
}

export interface UpdateFormRef {
  show: (title: string, roleId?: string) => void;
  hide: () => void;
  form: FormInstance;
}

const UpdateFormFunction: React.ForwardRefRenderFunction<
  UpdateFormRef,
  UpdateFormProps
> = ({ onOk, onCancel, dict }, ref) => {
  const { message } = useFeedback();
  const [title, setTitle] = useState(DEFAULT_MODAL_TITLE);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();

  // 弹窗打开时拉详情
  useEffect(() => {
    if (!visible) return;

    const load = async () => {
      setFormLoading(true);
      try {
        if (editingId) {
          const { data } = await getRoleById(editingId);
          if (data) {
            form.setFieldsValue(data);
          }
        } else {
          form.resetFields();
          form.setFieldsValue({
            status: 'enabled',
            sort: 0,
          });
        }
      } catch (error) {
        logger.error(error);
        message.error('数据加载失败');
      } finally {
        setFormLoading(false);
      }
    };

    load();
  }, [visible, editingId, form, message]);

  const reset = () => {
    form.resetFields();
    setConfirmLoading(false);
    setEditingId(undefined);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();

      if (!editingId) {
        await createRole(values as API.CreateRoleDto);
        message.success('新增成功');
      } else {
        await updateRole(values as API.UpdateRoleDto & { roleId: string });
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
        show: (title, roleId) => {
          setTitle(title);
          setEditingId(roleId);
          setVisible(true);
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
      width={620}
      title={title}
      open={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      okText="确认"
      cancelText="取消"
    >
      <FormLoading loading={formLoading}>
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
          <Form.Item name="roleId" label="角色Id" hidden>
            <Input />
          </Form.Item>
          <FormGrid columns={1}>
            <FormGrid.Item>
              <Form.Item
                name="name"
                label="角色名称"
                rules={[{ required: true, message: '角色名称不能为空' }]}
              >
                <Input placeholder="请输入角色名称" disabled={formLoading} />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item
                name="roleKey"
                label="角色标识"
                rules={[{ required: true, message: '角色标识不能为空' }]}
              >
                <Input
                  placeholder="请输入角色标识"
                  maxLength={50}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item
                name="sort"
                label="排序"
                rules={[{ required: true, message: '排序不能为空' }]}
              >
                <InputNumber placeholder="请输入排序" disabled={formLoading} />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item name="status" label="状态">
                <Radio.Group
                  options={dict.common_status}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={24}>
              <Form.Item name="description" label="角色描述">
                <Input.TextArea
                  placeholder="请输入角色描述"
                  rows={3}
                  showCount
                  maxLength={200}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
          </FormGrid>
        </Form>
      </FormLoading>
    </Modal>
  );
};

const UpdateForm = React.forwardRef<UpdateFormRef, UpdateFormProps>(
  UpdateFormFunction,
);

UpdateForm.displayName = 'RoleUpdateForm';

export default UpdateForm;
