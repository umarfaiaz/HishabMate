
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { GlassButton } from './UI';
import { Icons } from '../Icons';

export const VerifyEmail: React.FC = () => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const handleResend = async () => {
    if (email) await supabase.auth.resend({ type: 'signup', email });
    alert('Verification email resent.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.pathname = '/';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-enter">
      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 mb-6">
        <Icons.Tag className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Verify your email</h1>
      <p className="text-white/50 mb-6">We've sent a verification link to</p>
      
      <div className="bg-white/10 px-4 py-2 rounded-full mb-8 font-mono text-sm border border-white/10">
        {email || 'your email'}
      </div>

      <div className="w-full max-w-xs space-y-3">
        <GlassButton variant="primary" className="w-full" onClick={handleResend}>Resend Email</GlassButton>
        <button onClick={handleLogout} className="text-sm text-white/40 hover:text-white mt-4">Logout</button>
      </div>
    </div>
  );
};
