import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ value, onChange, options, placeholder = "Pilih...", className = "", icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {Icon && <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />}
      
      <button
        type="button"
        className={`glass-input w-full text-left rounded-2xl flex items-center justify-between outline-none transition-all duration-200
          ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-sm
          ${isOpen ? 'ring-2 ring-blue-300/60 border-blue-400' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontFamily: 'inherit' }}
      >
        <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-800'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-2 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 animate-slide-down">
          <div 
            className="rounded-2xl overflow-hidden py-1.5"
            style={{
              background: 'rgba(255, 255, 255, 0.70)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.70)',
              boxShadow: '0 24px 60px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.90)',
              maxHeight: '250px',
              overflowY: 'auto'
            }}
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">Tidak ada opsi</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center
                    ${value === option.value 
                      ? 'bg-blue-500/10 text-blue-700 font-bold' 
                      : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 font-medium'}`}
                  onClick={() => {
                    onChange({ target: { value: option.value } });
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
