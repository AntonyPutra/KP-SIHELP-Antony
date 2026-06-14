import React from 'react';

const Button = ({
  children,
  type = 'button',
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}) => {
  const base = `inline-flex items-center justify-center font-semibold
    focus:outline-none
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed`;

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5   py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7   py-3.5 text-sm rounded-2xl gap-2',
  };

  /* Use the global CSS glass classes for primary and secondary */
  const variants = {
    primary:   'glass-btn-primary',
    secondary: 'glass-btn-secondary',
    danger:
      `bg-gradient-to-br from-rose-500 to-red-600 text-white
       border border-white/20 rounded-xl
       shadow-md shadow-rose-500/25
       hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/35
       active:scale-[0.98]`,
    success:
      `bg-gradient-to-br from-emerald-500 to-green-600 text-white
       border border-white/20 rounded-xl
       shadow-md shadow-emerald-500/20
       hover:-translate-y-0.5 hover:shadow-lg
       active:scale-[0.98]`,
    ghost:
      `bg-transparent text-slate-600
       hover:bg-white/40 hover:backdrop-blur hover:text-slate-900
       rounded-xl border border-transparent
       hover:border-slate-200/50`,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
