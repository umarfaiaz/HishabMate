
import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { GlassButton } from './UI';
import { safeParse } from '../utils';
import { AuthState, UserProfile } from '../types';

export const RegistrationAndPin: React.FC<{ onAuthenticated: (profile: UserProfile) => void }> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<AuthState>(() => {
    const savedProfile = safeParse('user_profile', null);
    if (!savedProfile) return 'ONBOARDING';
    const savedPin = localStorage.getItem('app_pin');
    if (!savedPin) return 'SETUP_PIN';
    return 'LOGIN';
  });

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', gender: 'MALE' as 'MALE'|'FEMALE' });
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  
  const savedName = safeParse('user_profile', null)?.name?.split(' ')[0] || '';
  const vibrate = () => { if (navigator.vibrate) navigator.vibrate(10); };
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = () => {
    if (!profileForm.name || !profileForm.email) return setError('Name and Email required'); 
    if (!validateEmail(profileForm.email)) return setError('Invalid email format.');

    const newProfile: UserProfile = { ...profileForm, currency: 'BDT', language: 'EN', theme: 'DARK' } as UserProfile;
    localStorage.setItem('user_profile', JSON.stringify(newProfile));
    setStep('SETUP_PIN'); setError('');
  };

  const handleLoginWithEmail = () => {
      if (!profileForm.email) return setError("Email is required");
      if (!validateEmail(profileForm.email)) return setError("Invalid email format");
      if (pin.length !== 4) return setError("Enter 4-digit PIN");
      
      const nameParts = profileForm.email.split('@')[0];
      const newProfile: UserProfile = { 
          name: nameParts.charAt(0).toUpperCase() + nameParts.slice(1), 
          email: profileForm.email, 
          phone: '', gender: 'MALE', currency: 'BDT', language: 'EN', theme: 'DARK', ...profileForm 
      } as UserProfile;
      
      localStorage.setItem('user_profile', JSON.stringify(newProfile));
      localStorage.setItem('app_pin', pin);
      onAuthenticated(newProfile);
  };

  const handlePinInput = (num: string) => {
    vibrate(); setError('');
    if (step === 'LOGIN') { if (pin.length < 4) setPin(prev => prev + num); }
    else if (step === 'SETUP_PIN') {
      if (!confirmPin && pin.length < 4) setPin(prev => prev + num);
      else if (pin.length === 4 && confirmPin.length < 4) setConfirmPin(prev => prev + num);
    }
  };

  const handlePinDelete = () => {
    vibrate();
    if (confirmPin) setConfirmPin(prev => prev.slice(0, -1)); else setPin(prev => prev.slice(0, -1));
  };

  const handleForgotPin = () => {
      if (!isForgotMode) return setIsForgotMode(true);
      if (window.confirm("This will RESET all app data. Proceed?")) {
          localStorage.clear();
          window.location.reload();
      }
  };
  
  const handleSwitchAccount = () => {
      if (window.confirm("Switch account? This clears current device data.")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  useEffect(() => {
    const checkAuth = () => {
      if (step === 'LOGIN' && pin.length === 4) {
        const savedPin = localStorage.getItem('app_pin');
        if (pin === savedPin) onAuthenticated(safeParse('user_profile', { name: '', email: '', phone: '', dob: '', gender: 'MALE', currency: 'BDT', language: 'EN', theme: 'DARK' }));
        else { vibrate(); setError('Incorrect PIN'); setTimeout(() => setPin(''), 500); }
      } else if (step === 'SETUP_PIN' && pin.length === 4 && confirmPin.length === 4) {
        if (pin === confirmPin) { localStorage.setItem('app_pin', pin); onAuthenticated(safeParse('user_profile', { name: '', email: '', phone: '', dob: '', gender: 'MALE', currency: 'BDT', language: 'EN', theme: 'DARK' })); }
        else { vibrate(); setError('PINs do not match'); setTimeout(() => { setPin(''); setConfirmPin(''); }, 500); }
      }
    };
    checkAuth();
  }, [pin, confirmPin, step]);

  // Shared Styles
  const containerClass = "min-h-screen flex flex-col items-center justify-center p-6 text-center animate-enter relative bg-black";
  const cardClass = "w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[40px] shadow-2xl backdrop-blur-xl relative z-10";
  const labelClass = "text-xs font-bold text-white/40 ml-4 uppercase mb-2 block tracking-widest text-left";
  const inputClass = "w-full bg-black/20 border border-white/10 p-4 pl-6 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all text-white placeholder-white/20 font-medium text-lg";

  if (step === 'ONBOARDING') {
    return (
      <div className={containerClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8 transform rotate-3">
          <Icons.Wallet className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">HishabMate</h1>
        <p className="text-blue-100/60 mb-12 text-lg max-w-xs mx-auto leading-relaxed font-medium">Master your finances with smart tools and secure tracking.</p>
        <div className="w-full max-w-xs space-y-4 relative z-10">
             <button onClick={() => setStep('GENDER_SELECT')} className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">Get Started</button>
             <button onClick={() => { setPin(''); setStep('EMAIL_LOGIN'); }} className="text-sm font-bold text-white/50 hover:text-white transition-colors">Already have an account?</button>
        </div>
      </div>
    );
  }

  if (step === 'EMAIL_LOGIN') {
      return (
        <div className={containerClass}>
             <div className={cardClass}>
                 <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back</h2>
                    <p className="text-white/40 text-sm font-medium">Log in with your backup credentials</p>
                 </div>
                 <div className="space-y-6">
                    <div>
                       <label className={labelClass}>Email Address</label>
                       <input type="email" placeholder="name@example.com" className={inputClass} value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
                    </div>
                    <div>
                       <label className={labelClass}>4-Digit PIN</label>
                       <input type="password" inputMode="numeric" maxLength={4} placeholder="••••" className={`${inputClass} tracking-[0.5em] text-center font-bold text-xl`} value={pin} onChange={e => { if(/^\d*$/.test(e.target.value) && e.target.value.length <= 4) setPin(e.target.value); }}/>
                    </div>
                 </div>
                 {error && <p className="text-rose-400 mt-6 text-sm font-bold bg-rose-500/10 py-3 rounded-xl border border-rose-500/20">{error}</p>}
                 <button className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg mt-8 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20" onClick={handleLoginWithEmail}>Log In</button>
                 <button onClick={() => { setPin(''); setStep('ONBOARDING'); }} className="mt-6 text-sm text-white/30 hover:text-white font-bold">Back to Start</button>
             </div>
        </div>
      )
  }

  if (step === 'GENDER_SELECT') {
    return (
      <div className={containerClass}>
        <h2 className="text-3xl font-bold mb-3 text-white">Who are you?</h2>
        <p className="text-white/40 mb-10 font-medium">Select your style to personalize the app</p>
        <div className="grid grid-cols-2 gap-6 w-full max-w-sm relative z-10">
            {['MALE', 'FEMALE'].map(g => (
                <button 
                    key={g}
                    onClick={() => { setProfileForm({...profileForm, gender: g as any}); setStep('REGISTER'); }}
                    className={`aspect-[3/4] rounded-[32px] border flex flex-col items-center justify-center gap-6 transition-all hover:scale-105 active:scale-95 ${g === 'MALE' ? 'bg-gradient-to-br from-blue-600/20 to-indigo-900/40 border-blue-500/30 hover:border-blue-400' : 'bg-gradient-to-br from-pink-500/20 to-rose-900/40 border-pink-500/30 hover:border-pink-400'}`}
                >
                    {g === 'MALE' ? <Icons.Male className="w-20 h-20 text-blue-300 drop-shadow-lg" /> : <Icons.Female className="w-20 h-20 text-pink-300 drop-shadow-lg" />}
                    <span className="font-bold text-xl text-white tracking-wide">{g === 'MALE' ? 'Male' : 'Female'}</span>
                </button>
            ))}
        </div>
      </div>
    );
  }

  if (step === 'REGISTER') {
    return (
      <div className={containerClass}>
        <div className={cardClass}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Create Profile</h1>
            <p className="text-white/40 font-medium">Let's get to know you</p>
          </div>
          <div className="space-y-5">
             <div><label className={labelClass}>Full Name</label><input type="text" placeholder="e.g. John Doe" className={inputClass} value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} /></div>
             <div><label className={labelClass}>Email Address</label><input type="email" placeholder="name@example.com" className={inputClass} value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} /></div>
             <div><label className={labelClass}>Phone (Optional)</label><input type="tel" placeholder="+880..." className={inputClass} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} /></div>
             {error && <p className="text-rose-400 text-sm text-center font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}
             <button className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg mt-4 hover:bg-gray-200 transition-colors" onClick={handleRegister}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  if (isForgotMode) {
      return (
        <div className={containerClass}>
            <div className={cardClass}>
                <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-6 mx-auto"><Icons.LogOut className="w-10 h-10"/></div>
                <h2 className="text-2xl font-bold mb-4 text-white">Reset App Data?</h2>
                <p className="text-white/50 mb-8 leading-relaxed font-medium">Since we are offline-first, we cannot recover your PIN. You must reset the app to set a new one.</p>
                <div className="flex flex-col gap-4">
                    <button onClick={handleForgotPin} className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors">Yes, Reset Everything</button>
                    <button onClick={() => setIsForgotMode(false)} className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">Cancel</button>
                </div>
            </div>
        </div>
      )
  }

  // PIN Entry Screen
  return (
    <div className={containerClass}>
       <div className="mb-12 relative z-10">
        <h1 className="text-3xl font-bold mb-3 tracking-wide text-white">{step === 'LOGIN' ? `Welcome Back${savedName ? `, ${savedName}` : ''}` : 'Set Passcode'}</h1>
        <p className="text-blue-200/50 text-sm font-bold uppercase tracking-[0.2em]">{step === 'LOGIN' ? 'Enter 4-Digit PIN' : (pin.length === 4 ? 'Confirm PIN' : 'Create PIN')}</p>
      </div>
      
      <div className="flex gap-6 mb-16 relative z-10">
          {[0, 1, 2, 3].map(i => {
              const active = (step === 'LOGIN' ? pin.length : (pin.length === 4 ? confirmPin.length : pin.length)) > i;
              return <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${active ? 'bg-blue-500 scale-125 shadow-[0_0_20px_rgba(59,130,246,0.8)]' : 'bg-white/10 border border-white/10'}`} />
          })}
      </div>
      
      {error && <p className="absolute top-24 text-rose-400 font-bold animate-shake bg-rose-500/10 px-6 py-2 rounded-full border border-rose-500/20">{error}</p>}
      
      <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[320px] relative z-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onPointerDown={() => handlePinInput(num.toString())} className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/20 active:bg-white/30 active:scale-95 flex items-center justify-center text-3xl font-medium transition-all select-none text-white backdrop-blur-sm border border-white/5 shadow-lg">
                {num}
            </button>
        ))}
        <div className="flex items-center justify-center">{step === 'LOGIN' && <button onClick={handleSwitchAccount} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider p-2">Switch</button>}</div>
        <button onPointerDown={() => handlePinInput('0')} className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/20 active:bg-white/30 active:scale-95 flex items-center justify-center text-3xl font-medium transition-all select-none text-white backdrop-blur-sm border border-white/5 shadow-lg">0</button>
        <button onPointerDown={handlePinDelete} className="w-20 h-20 rounded-full flex items-center justify-center text-white/30 hover:text-white active:scale-90 transition-all"><Icons.ArrowLeft className="w-8 h-8"/></button>
      </div>
      
      {step === 'LOGIN' && <button onClick={handleForgotPin} className="mt-12 text-xs text-rose-400/60 hover:text-rose-400 font-bold tracking-widest uppercase relative z-10">Forgot PIN?</button>}
    </div>
  );
};
