
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../Icons';
import { safeParse } from '../utils';

export const AppHeader: React.FC<{
  title: string;
  onBack?: () => void;
  action?: { icon: React.ReactNode; onClick: () => void; label?: string };
  isLight?: boolean;
}> = ({ title, onBack, action, isLight }) => (
  <div className={`flex items-center justify-between py-4 mb-2 sticky top-0 z-30 px-6 -mx-6 ${isLight ? 'bg-gray-50/90 border-b border-gray-200' : 'bg-black/80 border-b border-white/5'} backdrop-blur-md`}>
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'bg-gray-200 hover:bg-gray-300' : 'bg-white/10 hover:bg-white/20'}`}>
          <Icons.ArrowLeft className={`w-5 h-5 ${isLight ? 'text-gray-900' : 'text-white'}`} />
        </button>
      )}
      <h1 className={`text-xl font-bold tracking-tight truncate max-w-[200px] bg-clip-text text-transparent bg-gradient-to-r ${isLight ? 'from-gray-900 to-gray-600' : 'from-white to-gray-400'}`}>
        {title}
      </h1>
    </div>
    {action && (
      <button onClick={action.onClick} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all active:scale-95 ${isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}>
        {action.icon}
        {action.label && <span>{action.label}</span>}
      </button>
    )}
  </div>
);

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void; isLight?: boolean }> = ({ children, className = '', onClick, isLight }) => (
  <div onClick={onClick} className={`rounded-[24px] p-5 transition-transform active:scale-[0.99] border backdrop-blur-md ${
    isLight 
      ? 'bg-white border-gray-100 shadow-lg shadow-gray-200/50 text-gray-900' 
      : 'glass-card text-white'
  } ${className}`}>{children}</div>
);

export const GlassButton: React.FC<any> = ({ onClick, children, variant = 'primary', className = '', type = "button", isLight, size = 'md' }) => {
  const user = safeParse('user_profile', { gender: 'MALE' });
  const isFemale = user.gender === 'FEMALE';

  const variants = {
    primary: isLight ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black hover:bg-gray-100",
    secondary: isLight ? "bg-gray-200 text-gray-900" : "glass-button text-white",
    danger: "bg-red-500/20 text-red-500 border border-red-500/30",
    accent: isFemale 
        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30" 
        : "bg-blue-600 text-white shadow-lg shadow-blue-500/30",
  };
  const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-4 text-sm"
  };
  return (
    <button type={type} onClick={onClick} className={`rounded-full font-semibold tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2 ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`}>
      {children}
    </button>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; isLight?: boolean }> = ({ isOpen, onClose, title, children, isLight }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-enter p-4">
      <div className={`relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-md shadow-2xl flex flex-col rounded-[32px] overflow-hidden ${isLight ? 'bg-gray-50' : 'bg-[#1c1c1e] border border-white/10'}`}>
        <div className={`flex justify-between items-center p-6 border-b shrink-0 z-10 ${isLight ? 'bg-white border-gray-200' : 'bg-[#1c1c1e] border-white/5'}`}>
          <h3 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isLight ? 'from-gray-900 to-gray-600' : 'from-white to-gray-400'}`}>{title}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}><Icons.X className="w-5 h-5" /></button>
        </div>
        <div className={`p-6 overflow-y-auto custom-scrollbar grow flex flex-col ${isLight ? 'bg-gray-50' : 'bg-[#121212]'}`}>
           {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                // @ts-ignore
                return React.cloneElement(child, { isLight });
              }
              return child;
           })}
        </div>
      </div>
    </div>
  );
};

export const FormattedNumberInput: React.FC<{ 
  value: number | string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  className?: string;
  isLight?: boolean;
}> = ({ value, onChange, placeholder, className, isLight }) => {
  const format = (val: string) => {
      if (val === undefined || val === null || val === '') return '';
      const strVal = String(val);
      const parts = strVal.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join('.');
  };

  const unformat = (val: string) => val.replace(/,/g, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (!/^[\d,.]*$/.test(rawValue)) return;
    const cleanValue = unformat(rawValue);
    if ((cleanValue.match(/\./g) || []).length > 1) return;
    onChange(cleanValue);
  };

  const displayValue = (typeof value === 'number' && value === 0) ? '' : format(String(value ?? ''));

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`${className} ${isLight ? 'text-gray-900 placeholder-gray-400 bg-white border border-gray-200' : 'text-white placeholder-white/30 glass-input'}`}
    />
  );
};

export const CustomSelect: React.FC<{
  options: { label: string; value: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  isLight?: boolean;
}> = ({ options, value, onChange, placeholder = "Select", label, className = "", isLight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(o => o.value === value);
  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
      if (isOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
      else setSearchTerm('');
  }, [isOpen]);

  const baseInput = isLight ? "bg-white border border-gray-200 text-gray-900" : "glass-input text-white";
  const dropdownBg = isLight ? "bg-white border-gray-200 shadow-xl" : "bg-[#1c1c1e] border-white/10";
  const itemHover = isLight ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className={`text-xs mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-xl flex items-center justify-between text-left transition-all active:scale-[0.99] ${baseInput}`}
      >
        <div className={`flex items-center gap-2 overflow-hidden ${!selectedOption ? (isLight ? 'text-gray-400' : 'text-white/40') : ''}`}>
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            placeholder
          )}
        </div>
        <Icons.ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'} ${isLight ? 'text-gray-400' : 'text-white/40'}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 rounded-xl max-h-[320px] flex flex-col overflow-hidden animate-enter border ${dropdownBg}`}>
          <div className={`p-2 border-b shrink-0 z-10 ${isLight ? 'bg-white border-gray-100' : 'bg-[#1c1c1e] border-white/5'}`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isLight ? 'bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-blue-400' : 'bg-black/20 border-white/5 focus-within:bg-black/40 focus-within:border-white/20'}`}>
                  <Icons.Search className={`w-4 h-4 shrink-0 ${isLight ? 'text-gray-400' : 'text-white/30'}`}/>
                  <input 
                      ref={searchInputRef}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className={`w-full bg-transparent outline-none text-sm ${isLight ? 'text-gray-900 placeholder-gray-400' : 'text-white placeholder-white/30'}`}
                      onClick={(e) => e.stopPropagation()} 
                      autoComplete="off"
                  />
                  {searchTerm && <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); searchInputRef.current?.focus(); }}><Icons.X className={`w-3 h-3 ${isLight ? 'text-gray-400' : 'text-white/30'}`}/></button>}
              </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                    <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                    className={`w-full p-4 text-left flex items-center gap-3 transition-colors border-b last:border-0 ${isLight ? 'border-gray-100' : 'border-white/5'} ${itemHover} ${value === opt.value ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/20 text-blue-300') : ''}`}
                    >
                        {opt.icon && <span className="text-lg shrink-0">{opt.icon}</span>}
                        <span className="font-medium text-sm truncate">{opt.label}</span>
                        {value === opt.value && <Icons.CheckSquare className="w-4 h-4 ml-auto shrink-0" />}
                    </button>
                ))
            ) : (
                <div className={`p-6 text-center text-xs opacity-50 ${isLight ? 'text-gray-500' : 'text-white/50'}`}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CustomDatePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  isLight?: boolean;
}> = ({ value, onChange, label, placeholder = "Select Date", className = "", isLight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse initial date or default to today
  const parseDate = (d: string) => {
      const parts = d.split('-');
      if(parts.length === 3) return new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
      return new Date();
  };
  
  const [viewDate, setViewDate] = useState(() => parseDate(value));

  useEffect(() => {
      if(value) setViewDate(parseDate(value));
  }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateValue = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
  };

  const handleDayClick = (day: number) => {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      onChange(formatDateValue(newDate));
      setIsOpen(false);
  };

  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const baseInput = isLight ? "bg-white border border-gray-200 text-gray-900" : "glass-input text-white";
  const dropdownBg = isLight ? "bg-white border-gray-200 shadow-xl" : "bg-[#1c1c1e] border-white/10";
  const dayHover = isLight ? "hover:bg-blue-50 hover:text-blue-600" : "hover:bg-white/10 hover:text-white";

  return (
      <div className={`relative ${className}`} ref={containerRef}>
          {label && <label className={`text-xs mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>{label}</label>}
          <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full p-4 rounded-xl flex items-center justify-between text-left transition-all active:scale-[0.99] ${baseInput}`}
          >
              <div className={`flex items-center gap-2 overflow-hidden ${!value ? (isLight ? 'text-gray-400' : 'text-white/40') : ''}`}>
                  <Icons.Calendar className={`w-5 h-5 shrink-0 ${isLight ? 'text-gray-400' : 'text-white/40'}`} />
                  <span className="truncate">{value || placeholder}</span>
              </div>
              <Icons.ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'} ${isLight ? 'text-gray-400' : 'text-white/40'}`} />
          </button>

          {isOpen && (
              <div className={`absolute z-50 w-full min-w-[300px] mt-2 rounded-xl p-4 animate-enter border ${dropdownBg}`}>
                  <div className="flex justify-between items-center mb-4">
                      <button onClick={prevMonth} className={`p-2 rounded-lg ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}><Icons.ArrowLeft className="w-4 h-4"/></button>
                      <span className="font-bold">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <button onClick={nextMonth} className={`p-2 rounded-lg ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}><Icons.ChevronRight className="w-4 h-4"/></button>
                  </div>
                  <div className="grid grid-cols-7 mb-2 text-center">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d} className="text-xs font-bold opacity-50">{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                          const d = i + 1;
                          const currentDateStr = formatDateValue(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
                          const isSelected = value === currentDateStr;
                          const isToday = formatDateValue(new Date()) === currentDateStr;
                          
                          return (
                              <button
                                  key={d}
                                  onClick={() => handleDayClick(d)}
                                  className={`aspect-square rounded-lg text-sm font-medium transition-colors ${dayHover} ${isSelected ? 'bg-blue-600 text-white shadow-lg !hover:bg-blue-700' : ''} ${isToday && !isSelected ? 'text-blue-500 font-bold border border-blue-500/30' : ''}`}
                              >
                                  {d}
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}
      </div>
  );
};
