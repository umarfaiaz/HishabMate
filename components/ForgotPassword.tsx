
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { GlassButton, AppHeader } from './UI';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleReset = async () => {
    setError('');
    
    if (!email) {
        setError('Please enter your email address.');
        return;
    }
    
    if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (!error) setSent(true);
    else setError(error.message);
  };

  return (
    <div className="min-h-screen p-6 animate-enter bg-black text-white">
      <AppHeader title="Reset Password" onBack={() => window.location.pathname = '/'} />
      
      <div className="mt-10 max-w-md mx-auto">
        {!sent ? (
          <>
            <p className="text-white/60 mb-6">Enter your email to receive password reset instructions.</p>
            
            <div className="mb-6">
                <label className="text-xs font-bold text-white/50 uppercase ml-1 mb-2 block tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="w-full glass-input p-4 rounded-2xl outline-none text-white placeholder-white/20 transition-all focus:border-blue-500/50"
                />
            </div>
            
            {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl mb-4 font-medium border border-red-500/20">{error}</p>}
            
            <GlassButton variant="accent" className="w-full !py-4" onClick={handleReset}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </GlassButton>
          </>
        ) : (
          <div className="text-center bg-green-500/10 p-6 rounded-2xl border border-green-500/20">
            <h3 className="text-xl font-bold text-green-500 mb-2">Check your email</h3>
            <p className="text-white/70 text-sm">If an account exists for {email}, a reset link has been sent.</p>
            <button onClick={() => window.location.pathname = '/'} className="mt-6 text-sm font-bold text-white hover:underline">Back to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};
