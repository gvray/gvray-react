import { THEME_MODE_LABELS, ThemeModeWithoutSystem } from '@/constants';
import { useSettingStore } from '@/stores';
import { BellOutlined, SettingOutlined } from '@ant-design/icons';
import { Card, Col, List, Row, Select, Switch } from 'antd';
import { useState } from 'react';
import styles from './index.less';
// 系统设置组件
const SystemSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const { theme } = useSettingStore();
  const setTheme = useSettingStore((s) => s.setTheme);
  const handleThemeModeChange = (value: string) => {
    setTheme(value as ThemeModeWithoutSystem);
  };

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="通知设置" className={styles.notificationCard}>
          <List
            dataSource={[
              {
                title: '邮件通知',
                desc: '接收系统邮件通知',
                key: 'email',
              },
              {
                title: '短信通知',
                desc: '接收重要短信提醒',
                key: 'sms',
              },
              {
                title: '推送通知',
                desc: '接收浏览器推送',
                key: 'push',
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<BellOutlined />}
                  title={item.title}
                  description={item.desc}
                />
                <Switch
                  checked={
                    notifications[item.key as keyof typeof notifications]
                  }
                  onChange={(checked) =>
                    setNotifications({ ...notifications, [item.key]: checked })
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="偏好设置" className={styles.preferenceCard}>
          <List
            dataSource={[
              {
                title: '外观',
                desc: '修改算法生成主题',
                extra: (
                  <Select
                    value={theme}
                    onChange={handleThemeModeChange}
                    style={{ width: 120 }}
                    options={Object.entries(THEME_MODE_LABELS).map(
                      ([value, label]) => ({ value, label }),
                    )}
                  />
                ),
              },
              {
                title: '自动保存',
                desc: '自动保存表单数据',
                extra: <Switch defaultChecked />,
              },
              {
                title: '数据统计',
                desc: '允许收集使用数据',
                extra: <Switch defaultChecked />,
              },
              {
                title: '快捷键',
                desc: '启用键盘快捷键',
                extra: <Switch defaultChecked />,
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<SettingOutlined />}
                  title={item.title}
                  description={item.desc}
                />
                {item.extra}
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default SystemSettings;
