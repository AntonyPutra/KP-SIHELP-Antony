import React from 'react';

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full bg-white text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data && data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'}`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
          {(!data || data.length === 0) && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-50/50">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg mb-1">📭</span>
                  <p>Tidak ada data untuk ditampilkan</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
