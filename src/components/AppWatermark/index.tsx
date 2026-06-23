import { useAuthStore } from '@/stores';
import { runtimeConfig } from '@/utils/runtime-config';
import { Watermark } from 'antd';
import { useMemo } from 'react';

/**
 * 全局水印组件。
 * 受 runtimeConfig.security.watermarkEnabled 控制。
 * 水印文字取当前登录用户的昵称或用户名，未登录时不显示水印。
 */
const AppWatermark = () => {
  const watermarkEnabled = runtimeConfig.get().security.watermarkEnabled;

  const me = useAuthStore((s) => s.profile);

  const text = useMemo(() => {
    return me?.profile?.nickname || me?.username;
  }, [me?.profile?.nickname, me?.username]);

  if (!watermarkEnabled || !text) return null;

  return (
    <Watermark
      content={text}
      font={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.06)' }}
      gap={[120, 120]}
      rotate={-22}
      zIndex={1}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AppWatermark;
