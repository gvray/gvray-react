import { FormLoading } from '@/components';
import FormGrid from '@/components/FormGrid';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import {
  createDepartment,
  getDepartmentById,
  queryDepartmentOptions,
  updateDepartment,
} from '@/services/department';
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
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { normalizeToBackend, withVirtualRoot } from './util';

interface UpdateFormProps {
  onCancel?: () => void;
  onOk?: () => void;
  dict: Record<string, DictOption[]>;
}

export interface UpdateFormRef {
  show: (title: string, departmentId?: string) => void;
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
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [departmentList, setDepartmentList] = useState<
    API.DepartmentResponseDto[]
  >([]);
  const [form] = Form.useForm();
  const { message } = useFeedback();

  // 弹窗打开时拉数据
  useEffect(() => {
    if (!visible) return;

    const load = async () => {
      setFormLoading(true);
      try {
        const [listRes, detailRes] = await Promise.all([
          queryDepartmentOptions(),
          editingId ? getDepartmentById(editingId) : undefined,
        ]);

        if (listRes.data?.length) {
          setDepartmentList(withVirtualRoot(listRes.data));
        }

        if (detailRes?.data) {
          form.setFieldsValue({
            ...detailRes.data,
            parentId: detailRes.data.parentId ?? VIRTUAL_ROOT_ID,
          });
        } else {
          form.setFieldsValue({
            status: 'enabled',
            parentId: VIRTUAL_ROOT_ID,
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

  // 过滤自身：上级部门里不能选自己（防止循环引用）
  const processedParentList = useMemo(() => {
    if (!departmentList?.length) return [];
    return departmentList.filter((item) => item.departmentId !== editingId);
  }, [departmentList, editingId]);

  const reset = () => {
    form.resetFields();
    setConfirmLoading(false);
    setEditingId(undefined);
    setDepartmentList([]);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      const normalizedValues = normalizeToBackend(values);

      if (!editingId) {
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
        show: (title, departmentId) => {
          setTitle(title);
          setEditingId(departmentId);
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
      width={820}
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
                  disabled={formLoading}
                  fieldNames={{
                    value: 'departmentId',
                    label: 'name',
                  }}
                  treeDataSimpleMode={{
                    id: 'departmentId',
                    pId: 'parentId',
                  }}
                  treeData={processedParentList}
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
                <Input disabled={formLoading} />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item
                name="sort"
                label="排序"
                rules={[{ required: true, message: '排序不能为空' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item name="manager" label="负责人">
                <Input disabled={formLoading} />
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
                      }
                      return Promise.reject(new Error('请输入正确的手机号码'));
                    },
                  },
                ]}
              >
                <Input disabled={formLoading} />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}
              >
                <Input disabled={formLoading} />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item
                name="status"
                label="部门状态"
                rules={[{ required: true, message: '部门状态不能为空' }]}
              >
                <Radio.Group
                  options={dict.common_status}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={24}>
              <Form.Item
                name="description"
                label="部门描述"
                {...createFormLayout(3)}
              >
                <Input.TextArea
                  placeholder="请输入部门描述"
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

UpdateForm.displayName = 'DepartmentUpdateForm';

export default UpdateForm;
