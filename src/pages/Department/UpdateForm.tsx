import FormGrid from '@/components/FormGrid';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import { createDepartment, updateDepartment } from '@/services/department';
import type { DictOption } from '@/types/dict';
import { logger } from '@/utils';
import { createFormLayout, VIRTUAL_ROOT_ID } from '@gvray/adminkit';
import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Radio,
  TreeSelect,
} from 'antd';
import React, { useImperativeHandle, useState } from 'react';
import { useUpdataFormModel } from './model';
import { normalizeToBackend } from './util';

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
  const { data: departmentList } = useUpdataFormModel(visible);
  const { message } = useFeedback();

  const reset = () => {
    form.resetFields();
    setConfirmLoading(false);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      const normalizedValues = normalizeToBackend(values);

      if (!form.getFieldValue('departmentId')) {
        await createDepartment(normalizedValues);
        message.success('新增成功');
      } else {
        const { departmentId, ...rest } = normalizedValues;
        await updateDepartment(departmentId, rest);
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
            form.setFieldsValue({
              ...data,
              parentId: data.parentId ?? VIRTUAL_ROOT_ID,
            });
          } else {
            form.setFieldsValue({
              status: 'enabled',
              parentId: VIRTUAL_ROOT_ID,
              sort: 0,
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
      width={820}
      title={title}
      open={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      okText="确认"
      cancelText="取消"
    >
      <Form
        {...createFormLayout()}
        form={form}
        layout="horizontal"
        name="form_in_modal"
        initialValues={{
          status: 'enabled',
          parentId: VIRTUAL_ROOT_ID,
          sort: 0,
        }}
      >
        <Form.Item name="departmentId" label="部门Id" hidden>
          <Input />
        </Form.Item>
        <FormGrid>
          <FormGrid.Item span={24}>
            <Form.Item
              name="parentId"
              label="上级部门"
              {...createFormLayout(3)}
              rules={[{ required: true, message: '请选择上级部门' }]}
            >
              <TreeSelect
                treeDefaultExpandAll
                fieldNames={{
                  value: 'departmentId',
                  label: 'name',
                }}
                treeDataSimpleMode={{
                  id: 'departmentId',
                  pId: 'parentId',
                }}
                treeData={departmentList}
                treeNodeFilterProp="name"
              />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="name"
              label="部门名称"
              rules={[{ required: true, message: '部门名称不能为空' }]}
            >
              <Input />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="sort"
              label="排序"
              rules={[{ required: true, message: '排序不能为空' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item name="manager" label="负责人">
              <Input />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="phone"
              label="联系电话"
              rules={[
                {
                  validator: (_, phone) => {
                    const reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
                    if (!phone || reg.test(phone)) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject(new Error('请输入正确的手机号码'));
                    }
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}
            >
              <Input />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="status"
              label="部门状态"
              rules={[{ required: true, message: '部门状态不能为空' }]}
            >
              <Radio.Group options={dict.common_status} />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={24}>
            <Form.Item
              name="description"
              label="部门描述"
              {...createFormLayout(3)}
            >
              <Input.TextArea placeholder="请输入部门描述" />
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
