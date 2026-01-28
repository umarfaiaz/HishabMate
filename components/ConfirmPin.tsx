
// This logic is usually handled within ChangePin or SetPin flows, 
// but creating as requested for standalone flow if needed.
import React, { useState } from 'react';
import { PinInput } from './PinInput';
import { GlassButton, AppHeader } from './UI';

export const ConfirmPin: React.FC<{ 
  originalPin: string; 
  onSuccess: () => void; 
  onBack: () => void;
}> = ({ originalPin, onSuccess, onBack }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (pin === originalPin) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => { setPin(''); setError(false); }, 500);
    }
  };

  return (
    <div className="min-h-screen p-6 animate-enter flex flex-col items-center pt-20">
      <AppHeader title="Confirm PIN" onBack={onBack} />
      <p className="text-white/50 mb-10 mt-10">Re-enter your new PIN</p>
      <PinInput value={pin} onChange={setPin} error={error} onComplete={handleConfirm} />
    </div>
  );
};
