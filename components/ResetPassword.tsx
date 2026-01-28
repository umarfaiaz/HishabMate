
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Icons } from '../Icons';

export const ResetPassword: React.FC = () => {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // 1. Check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
        setVerifying(false);
      }
    });

    // 2. Listen for auth changes (specifically recovery event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
        setVerifying(false);
      } else if (session) {
        setValidSession(true);
        setVerifying(false);
      }
    });

    // 3. Safety Timeout
    const timer = setTimeout(() => {
        setVerifying(prev => {
            if (prev) return false;
            return prev;
        });
    }, 4000); // 4 seconds timeout

    return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
    };
  }, []);

  const handleUpdate = async () => {
    setError('');
    if (pass.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }
    if (pass !== confirm) {
        setError("Passwords don't match");
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    if (!error) {
      alert('Password updated successfully! Redirecting...');
      window.location.pathname = '/';
    } else {
      setError(error.message);
    }
    setLoading(false);
  };

  if (verifying) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.15),_transparent_70%)]"></div>
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 relative z-10"></div>
              <p className="text-emerald-500 font-bold animate-pulse relative z-10">Verifying security token...</p>
          </div>
      )
  }

  if (!validSession) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center animate-enter">
              <div className="w-20 h-20 bg-rose-500/10 rounded-[32px] flex items-center justify-center text-rose-500 mb-6 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
                  <Icons.X className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Link Expired</h2>
              <p className="text-white/50 mb-8 max-w-xs mx-auto leading-relaxed">This password reset link is invalid or has expired. Please request a new one.</p>
              <button 
                onClick={() => window.location.pathname = '/forgot-password'}
                className="px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
              >
                Request New Link
              </button>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter relative overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-[40px] p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-[28px] flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-6 mx-auto transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <Icons.Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Set New Password</h1>
              <p className="text-white/40 text-sm font-medium">Secure your account with a strong password</p>
          </div>

          <div className="space-y-5">
            <div className="group">
               <label className="text-xs font-bold text-white/40 uppercase ml-4 mb-2 block tracking-widest group-focus-within:text-emerald-400 transition-colors">New Password</label>
               <input 
                type="password" 
                placeholder="••••••••" 
                value={pass}
                onChange={e => { setPass(e.target.value); setError(''); }}
                className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all text-white placeholder-white/20 font-medium text-lg"
              />
            </div>
            
            <div className="group">
               <label className="text-xs font-bold text-white/40 uppercase ml-4 mb-2 block tracking-widest group-focus-within:text-emerald-400 transition-colors">Confirm Password</label>
               <input 
                type="password" 
                placeholder="••••••••" 
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all text-white placeholder-white/20 font-medium text-lg"
              />
            </div>
            
            {error && (
                <div className="flex items-center gap-3 text-rose-400 text-sm bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 animate-shake">
                    <Icons.X className="w-5 h-5 shrink-0"/>
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <button 
                onClick={handleUpdate}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-600/20 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                Update Password
            </button>
          </div>
      </div>
    </div>
  );
};
