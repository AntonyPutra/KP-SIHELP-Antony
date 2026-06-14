import React from 'react';

const Badge = ({ children, color = 'gray', className = '' }) => {
  /* Liquid Glass badge styling — translucent bg + frosted blur + sharp border */
  const colors = {
    slate:   'bg-slate-500/10 text-slate-700 border border-slate-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    gray:    'bg-slate-500/10 text-slate-700 border border-slate-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    
    rose:    'bg-rose-500/10 text-rose-700 border border-rose-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    red:     'bg-rose-500/10 text-rose-700 border border-rose-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    
    amber:   'bg-amber-500/15 text-amber-700 border border-amber-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    orange:  'bg-amber-500/15 text-amber-700 border border-amber-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    yellow:  'bg-amber-500/15 text-amber-700 border border-amber-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    
    emerald: 'bg-emerald-500/15 text-emerald-700 border border-emerald-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    green:   'bg-emerald-500/15 text-emerald-700 border border-emerald-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    
    blue:    'bg-blue-500/10 text-blue-700 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    cyan:    'bg-cyan-500/10 text-cyan-700 border border-cyan-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    
    /* Legacy */
    indigo:  'bg-blue-500/10 text-blue-700 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    purple:  'bg-blue-500/10 text-blue-700 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full
      text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm
      ${colors[color] || colors.gray} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
