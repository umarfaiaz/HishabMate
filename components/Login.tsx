
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { GlassButton } from './UI';
import { Icons } from '../Icons';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAuth = async () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., user@email.com).');
      return;
    }

    setLoading(true);
    
    try {
      if (mode === 'SIGNUP') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;
        alert('Check your email for the verification link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter">
      <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[28px] flex items-center justify-center shadow-xl shadow-blue-500/20 mb-8">
        <Icons.Wallet className="w-10 h-10 text-white" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2 text-white">{mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}</h1>
      <p className="text-white/40 mb-8">{mode === 'LOGIN' ? 'Sign in to continue' : 'Start your financial journey'}</p>

      <div className="w-full max-w-sm space-y-5">
        <div>
           <label className="text-xs font-bold text-white/50 uppercase ml-1 mb-2 block tracking-wider">Email Address</label>
           <input 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            className="w-full glass-input p-4 rounded-2xl outline-none focus:border-blue-500/50 transition-all text-white placeholder-white/20"
          />
        </div>
        
        <div>
           <label className="text-xs font-bold text-white/50 uppercase ml-1 mb-2 block tracking-wider">Password</label>
           <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className="w-full glass-input p-4 rounded-2xl outline-none focus:border-blue-500/50 transition-all text-white placeholder-white/20"
          />
        </div>
        
        {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl font-medium text-center border border-red-500/20">{error}</p>}

        <GlassButton variant="accent" className="w-full !py-4 text-lg mt-2" onClick={handleAuth}>
          {loading ? 'Processing...' : (mode === 'LOGIN' ? 'Sign In' : 'Sign Up')}
        </GlassButton>

        <div className="flex justify-between mt-6 text-sm">
          <button onClick={() => { setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(''); }} className="text-white/60 hover:text-white font-medium transition-colors">
            {mode === 'LOGIN' ? 'Create an account' : 'Already have an account?'}
          </button>
          {mode === 'LOGIN' && (
            <button onClick={() => window.location.pathname = '/forgot-password'} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Forgot Password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
