import React from 'react';

export interface AdminTableColumn<T> {
  header: React.ReactNode;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  width?: string;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'Записей не найдено',
  onRowClick,
}: AdminTableProps<T>) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-theme-border bg-theme-surface shadow-md dark:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
              <tr className="border-b border-theme-border bg-theme-bg/60 text-theme-text font-sans text-xs font-bold uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 font-bold ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border font-sans text-sm text-theme-text">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-theme-textSec font-mono text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-theme-gold animate-ping" />
                    Загрузка данных...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-theme-textSec font-sans text-xs font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={keyExtractor(row, rowIdx)}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    transition-colors duration-150
                    ${onRowClick ? 'cursor-pointer hover:bg-theme-bg/60' : 'hover:bg-theme-bg/40'}
                  `}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3.5 px-4 ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                        ? (row[col.accessor] as any)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
