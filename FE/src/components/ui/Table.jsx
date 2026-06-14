import React from 'react';

const Table = ({ columns, data, onRowClick, emptyMessage = 'Tidak ada data.' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        <p className="text-sm font-semibold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr
            style={{
              background: 'rgba(241,245,249,0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderBottom: '1px solid rgba(148,163,184,0.25)',
            }}
          >
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`group transition-all duration-200 ${onRowClick ? 'cursor-pointer' : ''}`}
              style={{
                borderBottom: '1px solid rgba(148,163,184,0.15)',
              }}
              onMouseEnter={e => {
                if (onRowClick) {
                  e.currentTarget.style.background = 'rgba(37,99,235,0.06)';
                  e.currentTarget.style.backdropFilter = 'blur(4px)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.backdropFilter = 'none';
              }}
            >
              {columns.map((col, j) => (
                <td key={j} className="px-6 py-4 text-sm text-slate-700">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
