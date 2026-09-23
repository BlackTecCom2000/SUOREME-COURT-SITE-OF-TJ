import React from 'react';

// Portal table — same generic prop API as AdminTable, theme tokens + responsive wrapper.
export interface TableColumn<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'Записей не найдено',
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 font-mono text-xs text-theme-textMuted" role="status">
        <span className="w-2 h-2 rounded-full bg-theme-gold animate-ping" aria-hidden="true" />
        <span>Загрузка…</span>
      </div>
    );
  }
  if (data.length === 0) {
    return <p className="py-10 text-center font-mono text-xs text-theme-textMuted">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-theme-border">
      <table className="w-full text-left border-collapse min-w-[560px]">
        <thead>
          <tr className="border-b border-theme-border bg-theme-bg/60 font-mono text-[11px] uppercase tracking-wider text-theme-textMuted">
            {columns.map((c, i) => (
              <th key={i} className={`py-3 px-4 font-semibold ${c.className || ''}`} style={c.width ? { width: c.width } : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr
              key={keyExtractor(row, ri)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-theme-border/40 last:border-0 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-theme-bg/50' : ''
              }`}
            >
              {columns.map((c, ci) => (
                <td key={ci} className={`py-3 px-4 text-sm text-theme-text ${c.className || ''}`}>
                  {typeof c.accessor === 'function'
                    ? (c.accessor as (row: T) => React.ReactNode)(row)
                    : c.accessor != null
                      ? String((row as any)[c.accessor] ?? '')
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
