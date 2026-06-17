import { FormGrid, IconSelector } from '@/components';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import { createMenu, updateMenu } from '@/services/menu';
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
  Segmented,
  Switch,
  TreeSelect,
} from 'antd';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { useUpdataFormModel } from './model';
import { normalizeToBackend, withVirtualRoot } from './util';

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
  const { message } = useFeedback();
  const [title, setTitle] = useState(DEFAULT_MODAL_TITLE);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const { data: menuParentList } = useUpdataFormModel(visible);
  const typeValue = Form.useWatch('type', form);
  const menuId = Form.useWatch('menuId', form);

  // 处理父级菜单列表：添加虚拟根节点 + 根据类型过滤
  const processedParentList = useMemo(() => {
    if (!menuParentList?.length) return [];

    let list = withVirtualRoot(menuParentList);

    if (typeValue === 'MENU') {
      // 菜单只能放在目录下；虚拟根节点保留但禁用，防止 TreeSelect 显示 raw UUID
      list = list.map((item) => ({
        ...item,
        disabled:
          item.menuId === VIRTUAL_ROOT_ID ? true : item.type !== 'CATALOG',
      }));
    }

    return list;
  }, [menuParentList, typeValue]);

  // 当类型切换时，检查当前选中的父级是否仍然有效
  useEffect(() => {
    const currentParentId = form.getFieldValue('parentMenuId');

    const isValid = processedParentList.some(
      (item) => item.menuId === currentParentId && !item.disabled,
    );

    if (!isValid) {
      // 目录默认顶级，菜单留空让用户重选
      const defaultValue =
        typeValue === 'CATALOG' ? VIRTUAL_ROOT_ID : undefined;
      form.setFieldsValue({ parentMenuId: defaultValue });
    }
  }, [typeValue, processedParentList, form]);

  const reset = () => {
    form.resetFields();
    setConfirmLoading(false);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      const normalizedValues = normalizeToBackend(values);

      if (!form.getFieldValue('menuId')) {
        await createMenu(normalizedValues);
        message.success('新增成功');
      } else {
        const { menuId: id, ...rest } = normalizedValues;
        await updateMenu(id, rest);
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
              parentMenuId: data.parentMenuId ?? VIRTUAL_ROOT_ID,
              type: data.type ?? 'CATALOG',
            });
          } else {
            form.setFieldsValue({
              parentMenuId: VIRTUAL_ROOT_ID,
              type: 'CATALOG',
              hidden: false,
              sort: 0,
              status: 'enabled',
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
      width={720}
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
          type: 'CATALOG',
          hidden: false,
          sort: 0,
          status: 'enabled',
        }}
      >
        <Form.Item name="menuId" label="菜单Id" hidden>
          <Input />
        </Form.Item>
        <FormGrid>
          <FormGrid.Item span={24}>
            <Form.Item
              name="parentMenuId"
              label="上级菜单"
              {...createFormLayout(3)}
              rules={[{ required: true, message: '请选择上级菜单' }]}
            >
              <TreeSelect
                treeDefaultExpandAll
                fieldNames={{ value: 'menuId', label: 'name' }}
                treeDataSimpleMode={{
                  id: 'menuId',
                  pId: 'parentMenuId',
                }}
                treeData={processedParentList}
                treeNodeFilterProp="name"
                placeholder="请选择上级菜单"
              />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="name"
              label={typeValue === 'CATALOG' ? '目录名称' : '菜单名称'}
              rules={[
                {
                  required: true,
                  message: `${
                    typeValue === 'CATALOG' ? '目录名称' : '菜单名称'
                  }不能为空`,
                },
              ]}
            >
              <Input
                placeholder={`请输入${
                  typeValue === 'CATALOG' ? '目录名称' : '菜单名称'
                }`}
              />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="type"
              label="菜单类型"
              rules={[{ required: true, message: '菜单类型不能为空' }]}
            >
              <Segmented
                disabled={Boolean(menuId)}
                block
                options={[
                  { label: '目录', value: 'CATALOG' },
                  { label: '菜单', value: 'MENU' },
                ]}
              />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="path"
              label="菜单路径"
              rules={[{ required: true, message: '菜单路径不能为空' }]}
            >
              <Input placeholder="请输入菜单路径，如 /system/user" />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item name="icon" label="菜单图标">
              <IconSelector placeholder="请选择图标" />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="sort"
              label="排序权重"
              rules={[{ required: true, message: '排序权重不能为空' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="请输入排序权重"
              />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item name="permissionCode" label="权限代码">
              <Input placeholder="请输入绑定的权限代码" />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '状态不能为空' }]}
            >
              <Radio.Group options={dict.common_status} />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item name="hidden" label="是否隐藏" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" />
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

UpdateForm.displayName = 'MenuUpdateForm';

export default UpdateForm;
