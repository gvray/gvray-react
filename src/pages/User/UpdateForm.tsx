import { FormGrid, FormLoading } from '@/components';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import { queryDepartmentOptions } from '@/services/department';
import { queryPositionOptions } from '@/services/position';
import { queryRoleOptions } from '@/services/role';
import { createUser, getUserById, updateUser } from '@/services/user';
import type { DictOption } from '@/types/dict';
import { logger } from '@/utils';
import { createFormLayout } from '@gvray/adminkit';
import {
  Form,
  FormInstance,
  Input,
  Modal,
  Radio,
  Select,
  TreeSelect,
} from 'antd';
import type { ForwardRefRenderFunction } from 'react';
import React, { useEffect, useImperativeHandle, useState } from 'react';

interface UpdateFormProps {
  onCancel?: () => void;
  onOk?: () => void;
  dict: Record<string, DictOption[]>;
}

export interface UpdateFormRef {
  show: (title: string, userId?: string) => void;
  hide: () => void;
  form: FormInstance;
}

const UpdateFormFunction: ForwardRefRenderFunction<
  UpdateFormRef,
  UpdateFormProps
> = ({ onCancel, onOk, dict }, ref) => {
  const { message } = useFeedback();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState(DEFAULT_MODAL_TITLE);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [departmentList, setDepartmentList] = useState<
    API.DepartmentResponseDto[]
  >([]);
  const [positionList, setPositionList] = useState<API.PositionResponseDto[]>(
    [],
  );
  const [roleList, setRoleList] = useState<API.RoleResponseDto[]>([]);
  const [form] = Form.useForm();

  // 弹窗打开时拉 options + detail
  useEffect(() => {
    if (!visible) return;

    const load = async () => {
      setFormLoading(true);
      try {
        const [deptRes, posRes, roleRes] = await Promise.all([
          queryDepartmentOptions(),
          queryPositionOptions(),
          queryRoleOptions(),
        ]);

        if (deptRes.data) {
          setDepartmentList(deptRes.data);
        }
        if (posRes.data) {
          setPositionList(posRes.data);
        }
        if (roleRes.data) {
          setRoleList(roleRes.data);
        }

        if (editingId) {
          const { data } = await getUserById(editingId);
          if (data) {
            form.setFieldsValue({
              ...data,
              positionIds: data.positions?.map((item: any) => item.positionId),
              roleIds: data.roles?.map((item: any) => item.roleId),
              departmentId: data.department?.departmentId,
            });
          }
        } else {
          form.resetFields();
          form.setFieldsValue({
            status: 'enabled',
            password: '123456',
            postIds: [],
            roleIds: [],
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
    setDepartmentList([]);
    setPositionList([]);
    setRoleList([]);
  };

  const isEdit = Boolean(editingId);

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();

      if (!isEdit) {
        await createUser(values);
        message.success('新增成功');
      } else {
        await updateUser(values);
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
    () => ({
      show: (title, userId) => {
        setTitle(title);
        setEditingId(userId);
        setVisible(true);
      },
      hide: () => {
        setVisible(false);
        reset();
      },
      form,
    }),
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
            password: '123456',
            postIds: [],
            roleIds: [],
          }}
        >
          <Form.Item name="userId" label="用户Id" hidden>
            <Input />
          </Form.Item>
          <FormGrid>
            <FormGrid.Item>
              <Form.Item
                name="nickname"
                label="用户名称"
                rules={[{ required: true, message: '用户名称不能为空' }]}
              >
                <Input placeholder="请输入用户名称" disabled={formLoading} />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item
                name="phone"
                label="手机号码"
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
                <Input
                  placeholder="请输入手机号码"
                  maxLength={11}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]}>
                <Input
                  placeholder="请输入邮箱"
                  maxLength={50}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={isEdit ? 0 : 12}>
              <Form.Item
                hidden={isEdit}
                name="username"
                label="登陆账号"
                rules={[
                  { required: true, message: '登陆账号不能为空' },
                  {
                    min: 2,
                    max: 20,
                    message: '登陆账号长度必须介于 2 和 20 之间',
                  },
                ]}
              >
                <Input
                  placeholder="请输登陆账号"
                  maxLength={30}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item name="gender" label="性别">
                <Select options={dict['user_gender']} disabled={formLoading} />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item name="departmentId" label="部门">
                <TreeSelect
                  treeData={departmentList}
                  treeDataSimpleMode={{
                    id: 'departmentId',
                    pId: 'parentId',
                  }}
                  fieldNames={{ value: 'departmentId', label: 'name' }}
                  allowClear
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item name="positionIds" label="岗位">
                <Select
                  options={positionList}
                  fieldNames={{ value: 'positionId', label: 'name' }}
                  mode="multiple"
                  allowClear
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item>
              <Form.Item name="roleIds" label="角色">
                <Select
                  options={roleList}
                  fieldNames={{ value: 'roleId', label: 'name' }}
                  mode="multiple"
                  allowClear
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            {!isEdit && (
              <FormGrid.Item>
                <Form.Item
                  name="password"
                  label="用户密码"
                  rules={[
                    { required: true, message: '用户密码不能为空' },
                    {
                      min: 5,
                      max: 20,
                      message: '用户密码长度必须介于 5 和 20 之间',
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="请输用户密码"
                    maxLength={20}
                    disabled={formLoading}
                  />
                </Form.Item>
              </FormGrid.Item>
            )}
            <FormGrid.Item>
              <Form.Item name="status" label="用户状态">
                <Radio.Group
                  options={dict['user_status']}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={24}>
              <Form.Item
                name="description"
                label="用户描述"
                {...createFormLayout(3)}
              >
                <Input.TextArea
                  placeholder="请输入用户描述"
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

UpdateForm.displayName = 'UserUpdateForm';

export default UpdateForm;
