import React from 'react';

const Card = ({ title, subtitle, action, children, className = '', noPadding = false }) => {
  return (
    <div className={`glass-panel floating-glass ${className}`}>
      {/* Card header */}
      {(title || action) && (
        <div
          className="flex items-center justify-between px-6 py-5 relative z-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.45)' }}
        >
          <div>
            {title && (
              typeof title === 'string'
                ? <h3 className="font-bold text-slate-800 text-base tracking-tight">{title}</h3>
                : title
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
      )}

      {/* Card body */}
      <div className={`relative z-10 ${noPadding ? '' : 'p-6 sm:p-7'}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
