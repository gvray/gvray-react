import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './index.less';
import { useProfileLoginLogModel } from './model';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const TabLoginLog: React.FC = () => {
  const model = useProfileLoginLogModel();

  const columns: ColumnsType<API.LoginLogResponseDto> = [
    {
      title: '登录时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'IP 地址',
      dataIndex: 'ipAddress',
      width: 140,
    },
    {
      title: '登录地点',
      dataIndex: 'location',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '设备',
      dataIndex: 'device',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: number | string) => {
        const success = status === 1 || status === 'success';
        return (
          <Tag color={success ? 'green' : 'red'}>
            {success ? '成功' : '失败'}
          </Tag>
        );
      },
    },
    {
      title: '失败原因',
      dataIndex: 'failReason',
      ellipsis: true,
      render: (text: string) =>
        text ? (
          <Text type="danger" className={styles.tableMetaText}>
            {text}
          </Text>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Card className={styles.moduleCard} size="small" title="登录记录">
      <div className={styles.logFilters}>
        <Input
          placeholder="搜索账号"
          prefix={<SearchOutlined />}
          className={styles.logFilterControl}
          allowClear
          value={model.keyword}
          onChange={(event) => model.setKeyword(event.target.value)}
          onPressEnter={model.handleSearch}
        />
        <Select
          placeholder="登录状态"
          className={styles.logStatusSelect}
          allowClear
          value={model.statusFilter}
          onChange={model.handleStatusChange}
          options={[
            { value: 'success', label: '成功' },
            { value: 'failure', label: '失败' },
          ]}
        />
        <RangePicker
          className={styles.logRangePicker}
          value={model.dateRange}
          onChange={(dates) => model.setDateRange(dates)}
        />
        <Space className={styles.logActions}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={model.handleSearch}
          >
            查询
          </Button>
          <Button icon={<ReloadOutlined />} onClick={model.handleReset}>
            重置
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={model.data}
        rowKey="id"
        loading={model.loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: model.page,
          total: model.total,
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条`,
          onChange: model.setPage,
        }}
      />
    </Card>
  );
};

export default TabLoginLog;
