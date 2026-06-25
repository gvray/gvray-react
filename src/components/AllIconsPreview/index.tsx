import { Input, Tabs } from 'antd';
import React, { useState } from 'react';
import { styled } from 'umi';
import AntIcon, { antdIcons } from '../AntIcon';

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
  gap: 4px;
  height: 180px;
  overflow-y: auto;
  padding: 0 10px 20px 10px;
`;

const IconItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  font-size: 16px;
  color: var(--gvray-text-color-secondary);
  background-color: var(--gvray-fill-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: var(--gvray-fill-color-secondary);
  }
`;

const categorizeIcons = () => {
  const categories = {
    Outlined: [] as string[],
    Filled: [] as string[],
    TwoTone: [] as string[],
  };

  antdIcons.forEach((key) => {
    if (key.endsWith('Outlined')) categories.Outlined.push(key);
    else if (key.endsWith('Filled')) categories.Filled.push(key);
    else if (key.endsWith('TwoTone')) categories.TwoTone.push(key);
  });

  return categories;
};

interface AllIconsPreviewProps {
  onChange?: (icon: string) => void;
}

const AllIconsPreview: React.FC<AllIconsPreviewProps> = ({ onChange }) => {
  const iconGroups = categorizeIcons();
  const [search, setSearch] = useState('');
  const renderIcons = (iconNames: string[]) => (
    <IconGrid>
      {iconNames.map((name) => {
        return (
          <IconItem key={name} onClick={() => onChange?.(name)}>
            <AntIcon icon={name} />
          </IconItem>
        );
      })}
    </IconGrid>
  );

  return (
    <Tabs
      tabBarExtraContent={
        <Input.Search
          placeholder="搜索图标"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      }
      defaultActiveKey="Outlined"
      items={[
        {
          key: 'Outlined',
          label: 'Outlined 图标',
          children: renderIcons(
            iconGroups.Outlined.filter((icon) =>
              icon.toLowerCase().includes(search.toLowerCase()),
            ),
          ),
        },
        {
          key: 'Filled',
          label: 'Filled 图标',
          children: renderIcons(
            iconGroups.Filled.filter((icon) =>
              icon.toLowerCase().includes(search.toLowerCase()),
            ),
          ),
        },
        {
          key: 'TwoTone',
          label: 'TwoTone 图标',
          children: renderIcons(
            iconGroups.TwoTone.filter((icon) =>
              icon.toLowerCase().includes(search.toLowerCase()),
            ),
          ),
        },
      ]}
    />
  );
};

export default AllIconsPreview;
