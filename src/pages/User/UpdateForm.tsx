import { FormGrid } from '@/components';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import { createUser, updateUser } from '@/services/user';
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
import React, { useImperativeHandle, useState } from 'react';
import useUpdateForm from './model';

interface UpdateFormProps {
  onCancel?: () => void;
  onOk?: () => void;
  dict: Record<string, { label: string; value: string | number }[]>;
}

export interface UpdateFormRef {
  show: (title: string, data?: Record<string, unknown>) => void;
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
  const [isEdit, setIsEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const { positionList, departmentList } = useUpdateForm(visible);

  // 重置弹出层表单
  const reset = () => {
    form.resetFields();
    setConfirmLoading(false);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      if (form.getFieldValue('userId') === undefined) {
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
    () => {
      return {
        show: (title: string, data?: Record<string, unknown>) => {
          setTitle(title);
          setVisible(true);
          reset();
          if (data) {
            setIsEdit(true);
            form.setFieldsValue(data);
          } else {
            setIsEdit(false);
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
              <Input placeholder="请输入用户名称" />
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
                    } else {
                      return Promise.reject(new Error('请输入正确的手机号码'));
                    }
                  },
                },
              ]}
            >
              <Input placeholder="请输入手机号码" maxLength={11} />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item>
            <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]}>
              <Input placeholder="请输入邮箱" maxLength={50} />
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
              <Input placeholder="请输登陆账号" maxLength={30} />
            </Form.Item>
          </FormGrid.Item>
          {/* <Col >
            <Form.Item name="roleIds" label="角色">
              <Select
                options={roleList}
                fieldNames={{ value: 'roleId', label: 'name' }}
                mode="multiple"
                allowClear
              />
            </Form.Item>
          </Col> */}
          <FormGrid.Item>
            <Form.Item name="gender" label="性别">
              <Select options={dict['user_gender']} />
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
                <Input.Password placeholder="请输用户密码" maxLength={20} />
              </Form.Item>
            </FormGrid.Item>
          )}
          <FormGrid.Item>
            <Form.Item name="status" label="用户状态">
              <Radio.Group
                options={dict['common_status']?.filter(
                  (item) => item.value !== 'banned' && item.value !== 'pending',
                )}
              ></Radio.Group>
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
