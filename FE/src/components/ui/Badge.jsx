import React from 'react';

const Badge = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    gray: 'bg-slate-100 text-slate-700 border border-slate-200',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    green: 'bg-green-50 text-green-700 border border-green-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  };

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide ${colors[color] || colors.gray} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
