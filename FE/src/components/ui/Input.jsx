import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, className = '', ...props }) => {
  return (
    <div className={`mb-5 w-full ${className}`}>
      {label && (
        <label className="block text-slate-700 text-sm font-semibold mb-1.5 ml-0.5">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-slate-800"
        style={{ fontFamily: 'inherit' }}
        {...props}
      />
    </div>
  );
};

export default Input;
