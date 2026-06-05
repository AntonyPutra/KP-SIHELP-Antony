import React, { useState } from 'react';

const BrandLogo = ({ size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-xl',
  };

  const containerClasses = `flex items-center justify-center rounded-xl shrink-0 ${sizeClasses[size]} ${className}`;

  if (hasError) {
    return (
      <div className={`${containerClasses} bg-blue-600 text-white font-bold shadow-sm border border-blue-500`}>
        AP
      </div>
    );
  }

  return (
    <div className={`${containerClasses} bg-white shadow-sm border border-slate-200 overflow-hidden p-1`}>
      <img
        src="/logo.png"
        alt="AntonyPutra Logo"
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default BrandLogo;
