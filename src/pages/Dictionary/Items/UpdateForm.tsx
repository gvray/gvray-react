// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormGrid } from '@/components';
import { DEFAULT_MODAL_TITLE } from '@/constants';
import { useFeedback } from '@/hooks';
import {
  createDictionaryItem,
  updateDictionaryItem,
} from '@/services/dictionary';
import type { DictOption } from '@/types/dict';
import { logger } from '@/utils';
import { createFormLayout } from '@gvray/adminkit';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';

const { TextArea } = Input;

export interface UpdateFormRef {
  show: (title: string, data?: Record<string, unknown>) => void;
}

interface UpdateFormProps {
  onOk?: () => void;
  typeCode?: string;
  dict: Record<string, DictOption[]>;
}

const UpdateForm = forwardRef<UpdateFormRef, UpdateFormProps>(
  ({ onOk, typeCode, dict }, ref) => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState(DEFAULT_MODAL_TITLE);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const { message } = useFeedback();

    useImperativeHandle(ref, () => ({
      show: (title: string, data?: Record<string, unknown>) => {
        setTitle(title);
        setVisible(true);
        if (data) {
          form.setFieldsValue(data);
        } else {
          form.resetFields();
        }
      },
    }));

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        setLoading(true);

        const itemId = values?.itemId;
        if (itemId === undefined || itemId === null || itemId === '') {
          await createDictionaryItem(values as API.CreateDictionaryItemDto);
          message.success('创建成功');
        } else {
          const { itemId: id, ...rest } = values;
          await updateDictionaryItem(
            String(id),
            rest as API.UpdateDictionaryItemDto,
          );
          message.success('更新成功');
        }

        setVisible(false);
        onOk?.();
      } catch (error) {
        logger.error(error); // Use logger.error
      } finally {
        setLoading(false);
      }
    };

    const handleCancel = () => {
      setVisible(false);
      form.resetFields();
    };

    return (
      <Modal
        title={title}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={600}
        destroyOnHidden
      >
        <Form
          {...createFormLayout(4)}
          form={form}
          layout="horizontal"
          initialValues={{
            status: 'enabled',
            sort: 0,
            typeCode,
          }}
        >
          <Form.Item name="itemId" label="字典项ID" hidden />
          <FormGrid>
            <FormGrid.Item span={24}>
              <Form.Item name="typeCode" label="字典类型">
                <Input disabled />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={24}>
              <Form.Item
                name="value"
                label="字典项值"
                rules={[{ required: true, message: '请输入字典项值' }]}
              >
                <Input placeholder="请输入字典项值" />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={24}>
              <Form.Item
                name="label"
                label="显示标签"
                rules={[{ required: true, message: '请输入显示标签' }]}
              >
                <Input placeholder="请输入显示标签" />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
                {...createFormLayout(8)}
              >
                <Select placeholder="请选择" options={dict.common_status} />
              </Form.Item>
            </FormGrid.Item>
            <FormGrid.Item span={12}>
              <Form.Item name="sort" label="排序权重" {...createFormLayout(8)}>
                <InputNumber style={{ width: '100%' }} min={0} max={9999} />
              </Form.Item>
            </FormGrid.Item>
          </FormGrid>
          <FormGrid.Item span={24}>
            <Form.Item name="description" label="字典项描述">
              <TextArea rows={3} placeholder="请输入字典项描述" />
            </Form.Item>
          </FormGrid.Item>
        </Form>
      </Modal>
    );
  },
);

UpdateForm.displayName = 'UpdateForm';

export default UpdateForm;
