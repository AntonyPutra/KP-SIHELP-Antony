import React from 'react';

const ChartCard = ({ title, subtitle, children, className = "", action }) => {
  return (
    <div className={`glass-panel floating-glass flex flex-col ${className}`}>
      <div className="px-6 pt-6 pb-4 border-b border-white/40 flex justify-between items-center relative z-10">
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[260px] max-h-[320px] relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
