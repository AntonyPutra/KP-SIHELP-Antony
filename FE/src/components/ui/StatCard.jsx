import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass = "blue" }) => {
  const colorStyles = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-200",
    rose: "text-rose-600 bg-rose-50 border-rose-200",
    violet: "text-violet-600 bg-violet-50 border-violet-200"
  };

  const selectedColor = colorStyles[colorClass] || colorStyles.blue;

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur rounded-3xl border border-slate-200/70 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Decorative gradient blob */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity ${selectedColor.split(' ')[0].replace('text', 'bg')}`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
          {subtitle && <p className={`text-xs font-medium mt-2 ${selectedColor.split(' ')[0]}`}>{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${selectedColor} shrink-0`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
