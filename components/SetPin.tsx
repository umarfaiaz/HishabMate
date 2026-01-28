
import React, { useState } from 'react';
import { PinInput } from './PinInput';
import { GlassButton } from './UI';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

export const SetPin: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPin = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    const hash = await bcrypt.hash(pin, 10);
    
    const { error } = await supabase.from('profiles').upsert({ 
      id: (await supabase.auth.getUser()).data.user?.id,
      pin_hash: hash,
      updated_at: new Date()
    });

    if (!error) {
      onSuccess();
    } else {
      alert("Failed to save PIN: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter text-center">
      <h1 className="text-3xl font-bold mb-2">Secure HishabMate</h1>
      <p className="text-white/50 mb-10">Set a 4-digit PIN for quick access</p>
      
      <div className="mb-8">
        <PinInput value={pin} onChange={setPin} />
      </div>

      <GlassButton 
        variant="accent" 
        className="w-full max-w-xs !py-4" 
        onClick={handleSetPin}
        disabled={loading || pin.length !== 4}
      >
        {loading ? 'Securing...' : 'Set PIN'}
      </GlassButton>
    </div>
  );
};
