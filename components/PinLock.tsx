
import React, { useState } from 'react';
import { PinInput } from './PinInput';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';
import { Icons } from '../Icons';

export const PinLock: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  const handleVerify = async (val: string) => {
    if (lockedUntil && new Date() < lockedUntil) return;

    const { data } = await supabase.from('profiles').select('pin_hash').single();
    if (!data?.pin_hash) return; // Should allow setup if no pin, handled by parent

    const valid = await bcrypt.compare(val, data.pin_hash);
    
    if (valid) {
      onSuccess();
    } else {
      setError(true);
      setPin('');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        const lockTime = new Date(Date.now() + 15 * 60 * 1000);
        setLockedUntil(lockTime);
        // Sync lock to DB (omitted for brevity, utilizing local state for immediate UI feedback)
      }
      
      setTimeout(() => setError(false), 500);
    }
  };

  if (lockedUntil && new Date() < lockedUntil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-enter bg-red-900/20">
        <Icons.Lock className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-red-500">App Locked</h1>
        <p className="text-white/60 mt-2">Too many attempts. Try again in 15 minutes.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter">
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-8">
        <Icons.Lock className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold mb-8">Enter PIN</h1>
      
      <PinInput value={pin} onChange={setPin} onComplete={handleVerify} error={error} />
      
      {attempts > 0 && <p className="text-red-400 text-sm mt-6">{5 - attempts} attempts remaining</p>}
      
      <button onClick={() => window.location.pathname = '/pin-reset-info'} className="mt-12 text-sm font-bold text-white/40 hover:text-white">
        Forgot PIN?
      </button>
    </div>
  );
};
