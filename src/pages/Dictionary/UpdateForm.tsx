import { FormLoading } from '@/components';
import FormGrid from '@/components/FormGrid';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import {
  createDictionaryType,
  getDictionaryTypeById,
  updateDictionaryType,
} from '@/services/dictionary';
import type { DictOption } from '@/types/dict';
import { logger } from '@/utils';
import { createFormLayout } from '@gvray/adminkit';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const { TextArea } = Input;

export interface UpdateFormRef {
  show: (title: string, typeId?: string) => void;
  hide: () => void;
}

interface UpdateFormProps {
  onOk?: () => void;
  onCancel?: () => void;
  dict: Record<string, DictOption[]>;
}

const UpdateForm = forwardRef<UpdateFormRef, UpdateFormProps>(
  ({ onOk, onCancel, dict }, ref) => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState(DEFAULT_MODAL_TITLE);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | undefined>();
    const [form] = Form.useForm();
    const { message } = useFeedback();

    // 弹窗打开时拉详情（编辑时）
    useEffect(() => {
      if (!visible) return;

      const load = async () => {
        setFormLoading(true);
        try {
          if (editingId) {
            const { data } = await getDictionaryTypeById(editingId);
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
          await createDictionaryType(values as API.CreateDictionaryTypeDto);
          message.success('创建成功');
        } else {
          const rest = { ...values };
          delete rest.typeId;
          await updateDictionaryType(
            editingId,
            rest as API.UpdateDictionaryTypeDto,
          );
          message.success('更新成功');
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
        show: (title, typeId) => {
          setTitle(title);
          setEditingId(typeId);
          setVisible(true);
        },
        hide: () => {
          setVisible(false);
          reset();
        },
      }),
      [],
    );

    return (
      <Modal
        title={title}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        width={600}
        destroyOnHidden
      >
        <FormLoading loading={formLoading}>
          <Form
            {...createFormLayout(4)}
            form={form}
            layout="horizontal"
            initialValues={{
              status: 'enabled',
              sort: 0,
            }}
          >
            <Form.Item name="typeId" label="字典类型ID" hidden />
            <FormGrid>
              <FormGrid.Item span={24}>
                <Form.Item
                  name="code"
                  label="字典编码"
                  rules={[{ required: true, message: '请输入字典编码' }]}
                >
                  <Input
                    placeholder="请输入字典编码，例如：user_status"
                    disabled={formLoading}
                  />
                </Form.Item>
              </FormGrid.Item>
              <FormGrid.Item span={24}>
                <Form.Item
                  name="name"
                  label="字典名称"
                  rules={[{ required: true, message: '请输入字典名称' }]}
                >
                  <Input placeholder="请输入字典名称" disabled={formLoading} />
                </Form.Item>
              </FormGrid.Item>
              <FormGrid.Item span={12}>
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态' }]}
                  {...createFormLayout(8)}
                >
                  <Select
                    placeholder="请选择"
                    options={dict.common_status}
                    disabled={formLoading}
                  />
                </Form.Item>
              </FormGrid.Item>
              <FormGrid.Item span={12}>
                <Form.Item
                  name="sort"
                  label="排序权重"
                  {...createFormLayout(8)}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={9999}
                    disabled={formLoading}
                  />
                </Form.Item>
              </FormGrid.Item>
              <FormGrid.Item span={24}>
                <Form.Item name="description" label="字典描述">
                  <TextArea
                    rows={3}
                    placeholder="请输入字典描述"
                    disabled={formLoading}
                  />
                </Form.Item>
              </FormGrid.Item>
            </FormGrid>
          </Form>
        </FormLoading>
      </Modal>
    );
  },
);

UpdateForm.displayName = 'DictionaryUpdateForm';

export default UpdateForm;
