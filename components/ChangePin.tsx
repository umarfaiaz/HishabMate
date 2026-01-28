
import React, { useState } from 'react';
import { PinInput } from './PinInput';
import { AppHeader, GlassButton } from './UI';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

export const ChangePin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<'OLD' | 'NEW' | 'CONFIRM'>('OLD');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);

  const verifyOld = async (val: string) => {
    const { data } = await supabase.from('profiles').select('pin_hash').single();
    if (data && await bcrypt.compare(val, data.pin_hash)) {
      setStep('NEW');
    } else {
      setError(true);
      setOldPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  const handleSave = async () => {
    if (newPin !== confirmPin) {
      setError(true);
      setConfirmPin('');
      setTimeout(() => setError(false), 500);
      return;
    }
    const hash = await bcrypt.hash(newPin, 10);
    await supabase.from('profiles').update({ pin_hash: hash }).eq('id', (await supabase.auth.getUser()).data.user?.id);
    alert('PIN Changed!');
    onBack();
  };

  return (
    <div className="min-h-screen p-6 animate-enter flex flex-col items-center">
      <AppHeader title="Change PIN" onBack={onBack} />
      
      <div className="mt-12 w-full max-w-xs text-center">
        <h3 className="text-xl font-bold mb-8">
          {step === 'OLD' ? 'Enter Current PIN' : step === 'NEW' ? 'Set New PIN' : 'Confirm New PIN'}
        </h3>

        {step === 'OLD' && <PinInput value={oldPin} onChange={setOldPin} onComplete={verifyOld} error={error} />}
        
        {step === 'NEW' && <PinInput value={newPin} onChange={setNewPin} onComplete={() => setStep('CONFIRM')} />}
        
        {step === 'CONFIRM' && (
          <div className="space-y-8">
            <PinInput value={confirmPin} onChange={setConfirmPin} error={error} />
            <GlassButton variant="accent" onClick={handleSave} className="w-full">Update PIN</GlassButton>
          </div>
        )}
      </div>
    </div>
  );
};
