import React from 'react';

const Card = ({ title, children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white/90 backdrop-blur shadow-sm border border-slate-200/70 rounded-3xl transition-all duration-200 hover:shadow-md ${className}`}>
      {title && (
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100/50">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        </div>
      )}
      <div className={noPadding ? '' : 'p-6 sm:p-8'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
