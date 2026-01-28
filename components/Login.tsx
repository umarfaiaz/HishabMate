
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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuth = async () => {
    setError('');
    if (!email || !password) return setError('Please fill in all fields.');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');

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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter relative overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-[40px] p-8 shadow-2xl relative z-10">
          <div className="text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-xl shadow-blue-500/20 mb-6 mx-auto transform rotate-3 hover:rotate-6 transition-transform duration-500">
                <Icons.Wallet className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{mode === 'LOGIN' ? 'Welcome Back' : 'Join HishabMate'}</h1>
              <p className="text-white/40 text-sm font-medium">Your personal finance companion</p>
          </div>

          <div className="space-y-5">
            <div className="group">
               <label className="text-xs font-bold text-white/40 uppercase ml-4 mb-2 block tracking-widest group-focus-within:text-blue-400 transition-colors">Email</label>
               <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
                       <Icons.User className="w-5 h-5"/>
                   </div>
                   <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all text-white placeholder-white/20 font-medium"
                  />
               </div>
            </div>
            
            <div className="group">
               <label className="text-xs font-bold text-white/40 uppercase ml-4 mb-2 block tracking-widest group-focus-within:text-blue-400 transition-colors">Password</label>
               <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
                       <Icons.Lock className="w-5 h-5"/>
                   </div>
                   <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all text-white placeholder-white/20 font-medium"
                  />
               </div>
            </div>
            
            {error && (
                <div className="flex items-center gap-3 text-rose-400 text-sm bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 animate-shake">
                    <Icons.X className="w-5 h-5 shrink-0"/>
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <button 
                onClick={handleAuth}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-blue-600/30 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                {mode === 'LOGIN' ? 'Sign In' : 'Create Account'}
            </button>

            <div className="flex items-center justify-between text-sm font-medium pt-2 px-2">
              <button onClick={() => { setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(''); }} className="text-white/50 hover:text-white transition-colors">
                {mode === 'LOGIN' ? 'Create an account' : 'Already have an account?'}
              </button>
              {mode === 'LOGIN' && (
                <button onClick={() => window.location.pathname = '/forgot-password'} className="text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot Password?
                </button>
              )}
            </div>
          </div>
      </div>
      
      <p className="absolute bottom-6 text-white/20 text-xs font-medium">Secure • Encrypted • Private</p>
    </div>
  );
};
