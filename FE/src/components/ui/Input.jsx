import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, className = '', ...props }) => {
  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && <label className="block text-slate-700 text-sm font-semibold mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        {...props}
      />
    </div>
  );
};

export default Input;
