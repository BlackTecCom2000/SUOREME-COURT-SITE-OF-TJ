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
    <div className="w-full rounded-xl border border-slate-800 bg-[#070d1a]/80 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-xs uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 font-semibold ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans text-sm text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-500 font-mono text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Загрузка данных...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-500 font-mono text-xs">
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
                    ${onRowClick ? 'cursor-pointer hover:bg-[#0c1527]' : 'hover:bg-slate-900/40'}
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
