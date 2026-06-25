import { Dropdown, Input } from 'antd';
import React, { useState } from 'react';
import { styled } from 'umi';
import AllIconsPreview from '../AllIconsPreview';
import AntIcon from '../AntIcon';

interface IconSelectorProps {
  value?: string;
  onChange?: (icon: string) => void;
}

const DropdownPanel = styled.div`
  background-color: var(--gvray-bg-container);
  max-height: 500px;
  padding-left: 10px;
  padding-right: 10px;
  box-shadow: var(--gvray-box-shadow);
`;

interface CustomPanelProps {
  onChange?: (icon: string) => void;
}
const CustomPanel: React.FC<CustomPanelProps> = ({ onChange }) => {
  return (
    <DropdownPanel>
      <AllIconsPreview onChange={onChange} />
    </DropdownPanel>
  );
};
const IconSelector: React.FC<IconSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const handleChange = (icon: string) => {
    onChange?.(icon);
    setOpen(false);
  };
  return (
    <Dropdown
      popupRender={() => <CustomPanel onChange={handleChange} />}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
    >
      <Input
        readOnly
        prefix={value ? <AntIcon icon={value} /> : null}
        placeholder="选择图标"
        value={value}
      />
    </Dropdown>
  );
};

export default IconSelector;
