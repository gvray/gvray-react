import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { pruneEmptyChildren } from '@gvray/adminkit';
import {
  Button,
  Flex,
  Pagination,
  Space,
  Table,
  TableProps,
  Tooltip,
} from 'antd';
import type { ColumnGroupType, ColumnType, ColumnsType } from 'antd/es/table';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { styled } from 'umi';
import type { AdvancedSearchItem } from './components/AdvancedSearchForm';
import AdvancedSearchForm from './components/AdvancedSearchForm';
import { useTablePro } from './useTablePro';

export type TableProColumnType<RecordType> = (ColumnType<RecordType> & {
  advancedSearch?: AdvancedSearchItem<Record<string, any>>;
}) & {
  children?: TableProColumnsType<RecordType>;
};

export type TableProColumnGroupType<RecordType> =
  (ColumnGroupType<RecordType> & {
    advancedSearch?: AdvancedSearchItem<Record<string, any>>;
  }) & {
    children: TableProColumnsType<RecordType>;
  };

export type TableProColumnsType<RecordType> = Array<
  TableProColumnType<RecordType> | TableProColumnGroupType<RecordType>
>;

const stripAdvancedSearch = <T,>(
  cols?: TableProColumnsType<T>,
): ColumnsType<T> | undefined => {
  if (!cols) return cols;

  return cols.map((col) => {
    const rest: any = { ...(col as any) };
    delete rest.advancedSearch;
    if (rest.children) {
      return {
        ...rest,
        children: stripAdvancedSearch(rest.children) as any,
      };
    }
    return rest;
  }) as any;
};

interface TableProProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns?: TableProColumnsType<T>;
  request: (params: any, options?: { [key: string]: any }) => Promise<any>;
  toolbarRender?: () => React.ReactNode;
  onSelectionChange?: (keys: React.Key[], rows?: T[]) => void;
  tree?: boolean;
}

export interface TableProRef {
  reload: () => void;
  loading: boolean;
  getSelectedRowKeys: () => React.Key[];
  getSelectedRows: () => any[];
  clearSelection: () => void;
}

const TableWrap = styled.div`
  box-sizing: border-box;
`;

const PaginationWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const TableProFunction: React.ForwardRefRenderFunction<
  TableProRef,
  TableProProps<any>
> = (props, ref) => {
  const {
    columns,
    request,
    toolbarRender = () => null,
    onSelectionChange,
    tree = false,
    ...rest
  } = props;

  const {
    loading,
    listData,
    total,
    pagination,
    handleReload,
    handleResetPage,
    handleAdvancedQuery,
    showSearch,
    paramsRef,
    setPagination,
    setShowSearch,
  } = useTablePro(request, !!tree);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const reload = useCallback(() => {
    handleReload();
  }, [handleReload]);

  const getSelectedRowKeys = useCallback(
    () => selectedRowKeys,
    [selectedRowKeys],
  );

  const searchFields = (columns || [])
    .filter((item) => item.advancedSearch !== undefined)
    .map((item) => ({
      title: (item as any).title,
      dataIndex: (item as any).dataIndex,
      advancedSearch: (item as any).advancedSearch,
    }));
  const getSelectedRows = useCallback(() => selectedRows, [selectedRows]);
  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    onSelectionChange?.([], []);
  }, [onSelectionChange]);

  useImperativeHandle(
    ref,
    () => ({
      reload,
      loading,
      getSelectedRowKeys,
      getSelectedRows,
      clearSelection,
    }),
    [reload, loading, getSelectedRowKeys, getSelectedRows, clearSelection],
  );

  const toolbar = toolbarRender();
  const tableProps: TableProps<any> = {
    ...rest,
    ...(onSelectionChange && !rest.rowSelection
      ? {
          rowSelection: {
            selectedRowKeys,
            onChange: (keys: React.Key[], rows: any[]) => {
              setSelectedRowKeys(keys);
              setSelectedRows(rows);
              onSelectionChange?.(keys, rows);
            },
          },
        }
      : {}),
  };
  return (
    <TableWrap>
      {showSearch && !!columns && (
        <AdvancedSearchForm
          searchFields={searchFields}
          onSearchFinish={handleAdvancedQuery}
          resetSearch={() => {
            // 重制高级搜索参数
            paramsRef.current = {};
            handleResetPage();
          }}
        ></AdvancedSearchForm>
      )}
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Space>{toolbar}</Space>
        <Space style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Tooltip title={showSearch ? '隐藏搜索' : '显示搜索'}>
            <Button
              shape="circle"
              icon={<SearchOutlined />}
              onClick={() => setShowSearch(!showSearch)}
            />
          </Tooltip>
          <Tooltip title="刷新">
            <Button
              shape="circle"
              onClick={() => reload()}
              icon={<ReloadOutlined />}
            />
          </Tooltip>
        </Space>
      </Flex>
      <Table
        columns={stripAdvancedSearch(columns)}
        dataSource={pruneEmptyChildren(listData)}
        loading={loading}
        pagination={false}
        {...tableProps}
        scroll={{ x: 'max-content' }}
      />
      {!tree && total > 0 && total > pagination.pageSize && (
        <PaginationWrap>
          <Pagination
            total={total}
            showSizeChanger
            showQuickJumper
            current={pagination.page}
            pageSize={pagination.pageSize}
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, pageSize) => {
              setPagination({ page, pageSize });
            }}
          />
        </PaginationWrap>
      )}
    </TableWrap>
  );
};

const TablePro = forwardRef(TableProFunction);
TablePro.displayName = 'TablePro';
export default TablePro;
