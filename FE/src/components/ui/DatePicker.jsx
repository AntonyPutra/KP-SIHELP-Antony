import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const DatePicker = ({ value, onChange, placeholder = "Pilih Tanggal...", className = "", label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Mg", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleSelectDate = (day) => {
    // Format YYYY-MM-DD
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange({ target: { value: dateStr } });
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const d = new Date(value);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">{label}</label>}
      
      <div className="relative">
        <button
          type="button"
          className={`glass-input w-full text-left rounded-2xl flex items-center justify-between outline-none transition-all duration-200
            pl-10 pr-4 py-3 text-sm
            ${isOpen ? 'ring-2 ring-blue-300/60 border-blue-400' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          style={{ fontFamily: 'inherit' }}
        >
          <CalendarIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
          <span className={`block truncate ${!value ? 'text-slate-400' : 'text-slate-800'}`}>
            {getDisplayValue()}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-64 mt-2 animate-slide-down">
          <div 
            className="rounded-2xl overflow-hidden py-3 px-3 shadow-2xl border border-white/60"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px) saturate(200%)',
              WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {dayNames.map(day => (
                <div key={day} className="text-[10px] font-bold text-slate-400 uppercase">{day}</div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = value && new Date(value).getDate() === day && new Date(value).getMonth() === currentDate.getMonth() && new Date(value).getFullYear() === currentDate.getFullYear();
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    className={`w-7 h-7 flex items-center justify-center text-xs rounded-full transition-all mx-auto
                      ${isSelected 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20 font-bold' 
                        : isToday 
                          ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            
            {/* Clear Button */}
            {value && (
              <div className="mt-3 pt-2 border-t border-slate-100/50 flex justify-center">
                <button 
                  type="button"
                  onClick={() => { onChange({ target: { value: '' } }); setIsOpen(false); }}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
