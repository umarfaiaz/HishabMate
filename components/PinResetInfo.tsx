
import React from 'react';
import { GlassButton, AppHeader } from './UI';
import { supabase } from '../supabaseClient';
import { Icons } from '../Icons';

export const PinResetInfo: React.FC = () => {
  const handleReset = async () => {
    await supabase.auth.signOut();
    window.location.pathname = '/';
  };

  return (
    <div className="min-h-screen p-6 animate-enter flex flex-col">
      <AppHeader title="Reset PIN" onBack={() => window.location.pathname = '/'} />
      
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Icons.LogOut className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Forgot your PIN?</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          For your security, you must log out and log back in with your email & password to set a new PIN.
        </p>
        <GlassButton variant="danger" className="w-full !py-4" onClick={handleReset}>
          Logout & Reset
        </GlassButton>
      </div>
    </div>
  );
};
