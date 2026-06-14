import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass = 'blue' }) => {
  const palette = {
    blue:    { grad: 'rgba(37,99,235,0.12), rgba(37,99,235,0.04)',   icon: '#2563EB', bg: 'rgba(219,234,254,0.60)', border: 'rgba(147,197,253,0.45)', blob: 'rgba(37,99,235,0.20)'   },
    amber:   { grad: 'rgba(245,158,11,0.12), rgba(245,158,11,0.04)', icon: '#D97706', bg: 'rgba(253,230,138,0.50)', border: 'rgba(252,211,77,0.40)',  blob: 'rgba(245,158,11,0.20)'  },
    emerald: { grad: 'rgba(16,185,129,0.12), rgba(16,185,129,0.04)', icon: '#059669', bg: 'rgba(167,243,208,0.50)', border: 'rgba(110,231,183,0.40)', blob: 'rgba(16,185,129,0.20)'  },
    cyan:    { grad: 'rgba(6,182,212,0.12), rgba(6,182,212,0.04)',   icon: '#0891B2', bg: 'rgba(165,243,252,0.50)', border: 'rgba(103,232,249,0.40)', blob: 'rgba(6,182,212,0.20)'   },
    rose:    { grad: 'rgba(244,63,94,0.12), rgba(244,63,94,0.04)',   icon: '#E11D48', bg: 'rgba(254,205,211,0.50)', border: 'rgba(253,164,175,0.40)', blob: 'rgba(244,63,94,0.20)'   },
    slate:   { grad: 'rgba(100,116,139,0.10), rgba(100,116,139,0.04)', icon: '#475569', bg: 'rgba(226,232,240,0.55)', border: 'rgba(148,163,184,0.40)', blob: 'rgba(100,116,139,0.15)' },
    /* Legacy aliases */
    indigo:  { grad: 'rgba(37,99,235,0.12), rgba(37,99,235,0.04)',   icon: '#2563EB', bg: 'rgba(219,234,254,0.60)', border: 'rgba(147,197,253,0.45)', blob: 'rgba(37,99,235,0.20)'   },
    violet:  { grad: 'rgba(6,182,212,0.12), rgba(6,182,212,0.04)',   icon: '#0891B2', bg: 'rgba(165,243,252,0.50)', border: 'rgba(103,232,249,0.40)', blob: 'rgba(6,182,212,0.20)'   },
    orange:  { grad: 'rgba(249,115,22,0.12), rgba(249,115,22,0.04)', icon: '#EA580C', bg: 'rgba(254,215,170,0.50)', border: 'rgba(253,186,116,0.40)', blob: 'rgba(249,115,22,0.20)'  },
  };

  const c = palette[colorClass] || palette.blue;

  return (
    <div
      className="floating-glass group relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${c.grad})`,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${c.border}`,
        borderRadius: '24px',
        boxShadow: `0 16px 48px rgba(15,23,42,0.10), 0 4px 16px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.72)`,
        padding: '28px',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Glossy top highlight */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.88) 50%, transparent 90%)',
        pointerEvents: 'none',
      }} />

      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: '-16px', right: '-16px',
        width: '96px', height: '96px', borderRadius: '50%',
        background: c.blob, filter: 'blur(24px)',
        opacity: 0.85, pointerEvents: 'none',
        transition: 'opacity 0.35s ease',
      }} />

      {/* Sheen reflection */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '44%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
        borderRadius: '24px 24px 0 0', pointerEvents: 'none',
      }} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.12em] mb-3">{title}</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">{value}</h3>
          {subtitle && (
            <p className="text-xs font-bold" style={{ color: c.icon }}>{subtitle}</p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
            group-hover:scale-110 transition-transform duration-300"
          style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            backdropFilter: 'blur(8px)',
            color: c.icon,
            boxShadow: `0 4px 16px ${c.blob}`,
          }}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
