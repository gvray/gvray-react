import { DictionarySelect, FormGrid, IconSelector } from '@/components';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import { createPermission, updatePermission } from '@/services/permission';
import type { DictOption } from '@/types/dict';
import { logger } from '@/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { createFormLayout, VIRTUAL_ROOT_ID } from '@gvray/adminkit';
import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Switch,
  Tooltip,
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

// 权限代码格式说明组件
const PermissionCodeTooltip: React.FC = () => (
  <Tooltip
    title={
      <div>
        <div>
          <strong>格式规范：</strong>
        </div>
        <div>
          • 目录：<code>module</code>
        </div>
        <div style={{ marginLeft: 16 }}>例如：system</div>
        <div>
          • 菜单：<code>module:resource</code>
        </div>
        <div style={{ marginLeft: 16 }}>例如：system:user</div>
        <div>
          • 按钮：<code>module:resource:action</code>
        </div>
        <div style={{ marginLeft: 16 }}>例如：system:user:create</div>
        <div>
          • 扩展：<code>module:resource:action-xxx</code>
        </div>
        <div style={{ marginLeft: 16 }}>例如：system:user:assign-roles</div>
      </div>
    }
  >
    <QuestionCircleOutlined style={{ marginLeft: 4, cursor: 'help' }} />
  </Tooltip>
);

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
  const { data: permissionParentList } = useUpdataFormModel(visible);
  const typeValue = Form.useWatch('type', form);
  const permissionId = Form.useWatch('permissionId', form);
  const actionValue = Form.useWatch('action', form);

  // 当 action 改变时，自动更新 code 的 action 部分
  useEffect(() => {
    if (typeValue === 'BUTTON' && actionValue) {
      const currentCode = form.getFieldValue('code');
      if (currentCode) {
        const parts = currentCode.split(':');
        if (parts.length === 3) {
          // 保留扩展部分（如果有）
          const actionPart = parts[2];
          const extensionMatch = actionPart.match(/-(.*)/); // 匹配 -xxx 部分
          const newActionPart = extensionMatch
            ? `${actionValue}${extensionMatch[0]}`
            : actionValue;

          const newCode = `${parts[0]}:${parts[1]}:${newActionPart}`;
          form.setFieldValue('code', newCode);
        }
      }
    }
  }, [actionValue, typeValue, form]);

  // 当权限类型改变时，重新校验权限代码字段
  useEffect(() => {
    if (typeValue) {
      form.validateFields(['code']).catch((error) => {
        // 忽略校验错误，只是触发重新校验
        logger.debug('Permission code validation error on type change:', error);
      });
    }
  }, [typeValue, form]);

  // 处理父级权限列表：添加虚拟根节点 + 根据类型过滤 + 禁用节点
  const processedParentList = useMemo(() => {
    if (!permissionParentList?.length) return [];

    // 添加虚拟根节点
    let list = withVirtualRoot(permissionParentList);

    // 根据当前类型过滤
    if (typeValue === 'DIRECTORY') {
      // 目录类型：过滤掉菜单类型
      list = list.filter((item) => item.type !== 'MENU');
    } else if (typeValue === 'MENU') {
      // 菜单类型：过滤掉菜单类型（菜单不能放在菜单下）
      list = list.filter((item) => item.type !== 'MENU');
    }

    // 按钮类型：禁用目录节点
    if (typeValue === 'BUTTON') {
      list = list.map((item) => ({
        ...item,
        disabled:
          (item as any).type === 'DIRECTORY' &&
          item.permissionId !== VIRTUAL_ROOT_ID,
      }));
    }

    return list;
  }, [permissionParentList, typeValue]);

  // 当类型切换时，检查当前选中的父级权限是否仍然有效
  useEffect(() => {
    const currentParentId = form.getFieldValue('parentPermissionId');
    if (!currentParentId || currentParentId === VIRTUAL_ROOT_ID) return;

    // 检查当前选中的父级是否在处理后的列表中
    const isValid = processedParentList.some(
      (item) =>
        item.permissionId === currentParentId && !(item as any).disabled,
    );

    // 如果当前选中的父级不再有效，重置为虚拟根节点
    if (!isValid) {
      form.setFieldsValue({ parentPermissionId: VIRTUAL_ROOT_ID });
    }
  }, [typeValue, processedParentList, form]);

  // 重置弹出层表单
  const reset = () => {
    form.resetFields();
    setConfirmLoading(false);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      // 处理虚拟根节点：将 __root__ 转换为 null
      const normalizedValues = normalizeToBackend(values);

      if (!form.getFieldValue('permissionId')) {
        await createPermission(normalizedValues);
        message.success('新增成功');
      } else {
        const { permissionId, ...rest } = normalizedValues;
        await updatePermission(permissionId, rest);
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

  const handleValuesChange = () => {};

  useImperativeHandle(
    ref,
    () => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        show: (title, data) => {
          setTitle(title);
          setVisible(true);
          reset();
          if (data) {
            // 编辑模式
            form.setFieldsValue({
              ...data,
              // 如果 parentPermissionId 为 null，设置为虚拟根节点
              parentPermissionId: data.parentPermissionId ?? VIRTUAL_ROOT_ID,
              type: data.type ?? 'BUTTON',
              menuMeta: data.menuMeta ?? {},
            });
          } else {
            // 新增模式 - 设置默认 type 为 DIRECTORY
            form.setFieldsValue({
              parentPermissionId: VIRTUAL_ROOT_ID,
              type: 'DIRECTORY',
              menuMeta: { hidden: false, sort: 0 },
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
          type: 'DIRECTORY',
          menuMeta: { hidden: false, sort: 0 },
        }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item name="permissionId" label="权限Id" hidden>
          <Input />
        </Form.Item>
        <FormGrid>
          <FormGrid.Item span={24}>
            <Form.Item
              name="parentPermissionId"
              label="上级权限"
              {...createFormLayout(3)}
              rules={[{ required: true, message: '请选择上级权限' }]}
            >
              <TreeSelect
                treeDefaultExpandAll
                fieldNames={{ value: 'permissionId', label: 'name' }}
                treeDataSimpleMode={{
                  id: 'permissionId',
                  pId: 'parentPermissionId',
                }}
                treeData={processedParentList}
                treeNodeFilterProp="name"
                placeholder="请选择上级权限"
              />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="name"
              label={
                typeValue === 'DIRECTORY'
                  ? '目录名称'
                  : typeValue === 'MENU'
                  ? '菜单名称'
                  : '按钮名称'
              }
              rules={[
                {
                  required: true,
                  message: `${
                    typeValue === 'DIRECTORY'
                      ? '目录名称'
                      : typeValue === 'MENU'
                      ? '菜单名称'
                      : '按钮名称'
                  }不能为空`,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="type"
              label="权限类型"
              rules={[{ required: true, message: '权限类型不能为空' }]}
            >
              <Segmented
                disabled={Boolean(permissionId)}
                block
                options={[
                  { label: '目录', value: 'DIRECTORY' },
                  { label: '菜单', value: 'MENU' },
                  { label: '按钮', value: 'BUTTON' },
                ]}
              />
            </Form.Item>
          </FormGrid.Item>
          <FormGrid.Item span={12}>
            <Form.Item
              name="code"
              label={
                <span>
                  权限代码
                  <PermissionCodeTooltip />
                </span>
              }
              rules={[
                { required: true, message: '权限代码不能为空' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const parts = value.split(':');

                    // 目录：module（单层，不包含冒号）
                    if (typeValue === 'DIRECTORY') {
                      if (parts.length !== 1 || value.includes(':')) {
                        return Promise.reject(
                          new Error('目录格式应为：module（例如：system）'),
                        );
                      }
                    }

                    // 菜单：module:resource（两层）
                    if (typeValue === 'MENU') {
                      if (parts.length !== 2) {
                        return Promise.reject(
                          new Error(
                            '菜单格式应为：module:resource（例如：system:user）',
                          ),
                        );
                      }
                    }

                    // 按钮：module:resource:action 或 module:resource:action-xxx
                    if (typeValue === 'BUTTON') {
                      if (parts.length !== 3) {
                        return Promise.reject(
                          new Error('按钮格式应为：module:resource:action'),
                        );
                      }

                      // 如果选择了 action，校验 code 的第三部分是否匹配
                      if (actionValue) {
                        const codeAction = parts[2].split('-')[0]; // 取 action 部分（去掉 -xxx）
                        if (codeAction !== actionValue) {
                          return Promise.reject(
                            new Error(
                              `权限代码的 action 部分应与选择的权限动作一致：${actionValue}`,
                            ),
                          );
                        }
                      }
                    }

                    // 检查每个部分是否为空
                    if (parts.some((part: string) => !part.trim())) {
                      return Promise.reject(
                        new Error('权限代码各部分不能为空'),
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder={
                  typeValue === 'DIRECTORY'
                    ? 'system'
                    : typeValue === 'MENU'
                    ? 'system:user'
                    : 'system:user:create 或 system:user:export-excel'
                }
              />
            </Form.Item>
          </FormGrid.Item>
          {typeValue === 'BUTTON' && (
            <FormGrid.Item span={12}>
              <Form.Item
                name="action"
                label="权限动作"
                rules={[{ required: true, message: '权限动作不能为空' }]}
              >
                <DictionarySelect
                  options={dict['permission_action'].map((item) => ({
                    label: `${item.label} (${item.value})`,
                    value: item.value,
                  }))}
                />
              </Form.Item>
            </FormGrid.Item>
          )}
          {(typeValue === 'DIRECTORY' || typeValue === 'MENU') && (
            <>
              <FormGrid.Item span={12}>
                <Form.Item
                  name={['menuMeta', 'path']}
                  label={typeValue === 'DIRECTORY' ? '目录路径' : '菜单路径'}
                >
                  <Input
                    placeholder={
                      typeValue === 'DIRECTORY'
                        ? '/system'
                        : '/system/permission'
                    }
                  />
                </Form.Item>
              </FormGrid.Item>
              <FormGrid.Item span={12}>
                <Form.Item
                  name={['menuMeta', 'icon']}
                  label={typeValue === 'DIRECTORY' ? '目录图标' : '菜单图标'}
                >
                  <IconSelector />
                </Form.Item>
              </FormGrid.Item>
              <FormGrid.Item span={12}>
                <Form.Item
                  name={['menuMeta', 'component']}
                  label={typeValue === 'DIRECTORY' ? '目录组件' : '菜单组件'}
                >
                  <Input
                    placeholder={
                      typeValue === 'DIRECTORY' ? '如 Layout' : '如 Permission'
                    }
                  />
                </Form.Item>
              </FormGrid.Item>
              <FormGrid.Item span={12}>
                <Form.Item name={['menuMeta', 'sort']} label="排序">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </FormGrid.Item>
              <FormGrid.Item span={12}>
                <Form.Item
                  name={['menuMeta', 'hidden']}
                  label={typeValue === 'DIRECTORY' ? '隐藏目录' : '隐藏菜单'}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </FormGrid.Item>
            </>
          )}
          <FormGrid.Item span={24}>
            <Form.Item
              name="description"
              label="权限描述"
              {...createFormLayout(3)}
            >
              <Input.TextArea placeholder="请输入权限描述"></Input.TextArea>
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
