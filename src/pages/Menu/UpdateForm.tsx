import { FormGrid, FormLoading, IconSelector } from '@/components';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import {
  createMenu,
  getMenuById,
  queryMenuOptions,
  updateMenu,
} from '@/services/menu';
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
import { normalizeToBackend, withVirtualRoot } from './util';

interface UpdateFormProps {
  onCancel?: () => void;
  onOk?: () => void;
  dict: Record<string, DictOption[]>;
}

export interface UpdateFormRef {
  show: (title: string, menuId?: string) => void;
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
  const [parentOptions, setParentOptions] = useState<API.MenuTreeNodeDto[]>([]);
  const [form] = Form.useForm();
  const menuId = Form.useWatch('menuId', form);
  const typeValue = Form.useWatch('type', form);

  // 弹窗打开时拉数据
  useEffect(() => {
    if (!visible) return;

    const load = async () => {
      setFormLoading(true);
      try {
        // 并行拉 options + detail（如果是编辑）
        const optionsPromise = queryMenuOptions();
        const detailPromise = editingId ? getMenuById(editingId) : undefined;

        const [optionsRes, detailRes] = await Promise.all([
          optionsPromise,
          detailPromise,
        ]);

        if (optionsRes.data) {
          // 上级只能是目录，直接过滤掉 MENU 类型
          setParentOptions(
            withVirtualRoot(
              optionsRes.data.filter((item) => item.type !== 'MENU'),
            ),
          );
        }

        if (detailRes?.data) {
          const data = detailRes.data;
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
      } catch (error) {
        logger.error(error);
      } finally {
        setFormLoading(false);
      }
    };

    load();
  }, [visible, editingId, form, message]);

  // 过滤自身：父级选项里不能选自己（防止循环引用）
  const processedParentList = useMemo(() => {
    if (!parentOptions?.length) return [];
    return parentOptions.filter((item) => item.menuId !== menuId);
  }, [parentOptions, menuId]);

  const reset = () => {
    form.resetFields();
    setConfirmLoading(false);
    setEditingId(undefined);
    setParentOptions([]);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      const normalizedValues = normalizeToBackend(values);

      if (!editingId) {
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
        show: (title, menuId) => {
          setTitle(title);
          setEditingId(menuId);
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

  const nameLabel = typeValue === 'CATALOG' ? '目录名称' : '菜单名称';
  const pathLabel = typeValue === 'CATALOG' ? '目录路径' : '菜单路径';

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
      <FormLoading loading={formLoading}>
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
                label="上级目录"
                {...createFormLayout(3)}
                rules={[{ required: true, message: '请选择上级目录' }]}
              >
                <TreeSelect
                  treeDefaultExpandAll
                  disabled={formLoading}
                  fieldNames={{ value: 'menuId', label: 'name' }}
                  treeDataSimpleMode={{
                    id: 'menuId',
                    pId: 'parentMenuId',
                  }}
                  treeData={processedParentList as any}
                  treeNodeFilterProp="name"
                  placeholder="请选择上级目录"
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item
                name="name"
                label={nameLabel}
                rules={[
                  {
                    required: true,
                    message: `${nameLabel}不能为空`,
                  },
                ]}
              >
                <Input
                  placeholder={`请输入${nameLabel}`}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: '类型不能为空' }]}
              >
                <Segmented
                  disabled={Boolean(menuId) || formLoading}
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
                label={pathLabel}
                rules={[{ required: true, message: `${pathLabel}不能为空` }]}
              >
                <Input
                  placeholder={`请输入${pathLabel}，如 /system/user`}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item name="icon" label="菜单图标">
                <IconSelector />
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
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            {typeValue !== 'CATALOG' && (
              <FormGrid.Item span={12}>
                <Form.Item name="permissionCode" label="权限代码">
                  <Input
                    placeholder="请输入绑定的权限代码"
                    disabled={formLoading}
                  />
                </Form.Item>
              </FormGrid.Item>
            )}
            <FormGrid.Item span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '状态不能为空' }]}
              >
                <Radio.Group
                  options={dict.common_status}
                  disabled={formLoading}
                />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item name="hidden" label="是否隐藏" valuePropName="checked">
                <Switch
                  checkedChildren="是"
                  unCheckedChildren="否"
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

UpdateForm.displayName = 'MenuUpdateForm';

export default UpdateForm;
