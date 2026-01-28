
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Icons } from '../Icons';

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
    
    if (!email) return setError('Please enter your email address.');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (!error) setSent(true);
    else setError(error.message);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter relative overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <button onClick={() => window.location.pathname = '/'} className="absolute top-6 left-6 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20 group text-white">
          <Icons.ArrowLeft className="w-6 h-6 opacity-60 group-hover:opacity-100" />
      </button>

      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-[40px] p-8 shadow-2xl relative z-10">
        {!sent ? (
          <>
            <div className="text-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-[32px] flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 mx-auto transform rotate-3">
                    <Icons.Lock className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Forgot Password?</h1>
                <p className="text-white/40 text-sm font-medium leading-relaxed">Don't worry, we'll send you reset instructions.</p>
            </div>

            <div className="space-y-6">
                <div className="group">
                    <label className="text-xs font-bold text-white/40 uppercase ml-4 mb-2 block tracking-widest group-focus-within:text-indigo-400 transition-colors">Email Address</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
                            <Icons.User className="w-5 h-5"/>
                        </div>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-all text-white placeholder-white/20 font-medium text-lg"
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
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                    {loading ? 'Sending...' : 'Send Link'}
                </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-[32px] flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-8 mx-auto animate-enter">
                <Icons.CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Email Sent!</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
                If an account exists for <span className="text-white font-bold">{email}</span>, you will receive a reset link shortly.
            </p>
            <button onClick={() => window.location.pathname = '/'} className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/5">
                Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
