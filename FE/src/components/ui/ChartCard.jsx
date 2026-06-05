import React from 'react';

const ChartCard = ({ title, subtitle, children, className = "", action }) => {
  return (
    <div className={`bg-white/90 backdrop-blur rounded-3xl border border-slate-200/70 shadow-sm flex flex-col ${className}`}>
      <div className="px-6 pt-6 pb-4 border-b border-slate-100/50 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[260px] max-h-[320px] relative">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
