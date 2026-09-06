import React from 'react';

interface Column<T> {
  accessorKey: keyof T;
  header: string;
  size?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  testId?: string;
  noDataText?: string;
}

export const Table: React.FC<TableProps<any>> = ({
  data,
  columns,
  className,
  testId,
  noDataText = 'No data available',
}) => {
  if (data.length === 0) {
    return (
      <div
        className={[
          'py-8 text-center text-muted-foreground',
          testId && 'data-testid',
        ].join(' ').replace('data-testid', `data-testid="${testId}"`)},
        ...(testId && { 'data-testid': testId }),
      >
        {noDataText}
      </div>
    );
  }

  return (
    <div className={[
      'overflow-x-auto',
      className,
    ].join(' ')}>
      <table className="w-full rounded-md border">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessorKey} className="px-4 py-2 text-left text-xs font-medium text-muted-foreground border-b">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-y hover:bg-accent/5">
              {columns.map((col) => (
                <td key={col.accessorKey} className="px-4 py-2 text-sm align-middle">
                  {row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};