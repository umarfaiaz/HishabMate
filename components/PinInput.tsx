
import React, { useRef, useEffect } from 'react';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  error?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({ length = 4, value, onChange, onComplete, error }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newVal = value.split('');
    newVal[i] = val.slice(-1); // Take last char
    const nextValue = newVal.join('');
    
    onChange(nextValue);

    if (val && i < length - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  return (
    <div className={`flex gap-4 justify-center ${error ? 'animate-shake' : ''}`}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          className={`w-14 h-16 rounded-2xl text-center text-2xl font-bold bg-white/5 border transition-all outline-none 
            ${error ? 'border-red-500/50 text-red-400' : 'border-white/10 focus:border-blue-500/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)]'}
          `}
        />
      ))}
    </div>
  );
};
