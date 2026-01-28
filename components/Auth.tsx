
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
  
  // Get saved name for welcome message
  const savedName = safeParse('user_profile', null)?.name?.split(' ')[0] || '';

  const vibrate = () => { if (navigator.vibrate) navigator.vibrate(10); };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = () => {
    if (!profileForm.name || !profileForm.email) { 
        setError('Name and Email required'); 
        return; 
    }
    
    if (!validateEmail(profileForm.email)) {
        setError('Invalid email format. Must contain @ and .');
        return;
    }

    const newProfile: UserProfile = { ...profileForm, currency: 'BDT', language: 'EN', theme: 'DARK' } as UserProfile;
    localStorage.setItem('user_profile', JSON.stringify(newProfile));
    setStep('SETUP_PIN'); setError('');
  };

  const handleLoginWithEmail = () => {
      if (!profileForm.email) {
          setError("Email is required");
          vibrate();
          return;
      }
      if (!validateEmail(profileForm.email)) {
          setError("Invalid email format");
          vibrate();
          return;
      }
      if (pin.length !== 4) {
          setError("Enter 4-digit PIN");
          vibrate();
          return;
      }
      
      const name = profileForm.email.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      
      const newProfile: UserProfile = { 
          name: formattedName, 
          email: profileForm.email, 
          phone: '', 
          gender: 'MALE', 
          currency: 'BDT', 
          language: 'EN', 
          theme: 'DARK',
          ...profileForm // Allow overwriting if gender was somehow set (though it isn't in this flow)
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
      if (!isForgotMode) {
          setIsForgotMode(true);
          return;
      }
      if (window.confirm("This will RESET all your app data to factory settings. Are you sure?")) {
          localStorage.clear();
          window.location.reload();
      }
  };
  
  const handleSwitchAccount = () => {
      if (window.confirm("Switching account will clear the current data on this device to allow a new login. Proceed?")) {
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

  if (step === 'ONBOARDING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black animate-enter">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 transform rotate-3">
          <Icons.Wallet className="w-12 h-12 text-white drop-shadow-md" />
        </div>
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">HishabMate</h1>
        <p className="text-blue-100/60 mb-12 text-lg max-w-xs mx-auto leading-relaxed">Master your finances with smart tools and secure tracking.</p>
        <div className="w-full max-w-xs space-y-4">
             <GlassButton variant="accent" className="w-full !py-5 text-lg rounded-[24px]" onClick={() => setStep('GENDER_SELECT')}>Get Started</GlassButton>
             <button onClick={() => { setPin(''); setStep('EMAIL_LOGIN'); }} className="text-sm font-medium text-blue-300 hover:text-white transition-colors">
                Already have an account? Log In
             </button>
        </div>
      </div>
    );
  }

  if (step === 'EMAIL_LOGIN') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter bg-black text-center">
             <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[32px] shadow-2xl backdrop-blur-xl">
                 <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-white">Welcome Back</h2>
                    <p className="text-white/40 text-sm">Log in with your credentials</p>
                 </div>
                 
                 <div className="space-y-5 text-left">
                    <div>
                       <label className="text-xs font-bold text-white/40 ml-1 uppercase mb-2 block tracking-wider">Email Address</label>
                       <input 
                          type="email" 
                          placeholder="name@example.com" 
                          className="w-full glass-input p-4 rounded-2xl outline-none transition-all focus:border-blue-500/50 text-white placeholder-white/20" 
                          value={profileForm.email} 
                          onChange={e => setProfileForm({...profileForm, email: e.target.value})} 
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-white/40 ml-1 uppercase mb-2 block tracking-wider">4-Digit PIN</label>
                       <input 
                          type="password" 
                          inputMode="numeric" 
                          maxLength={4}
                          placeholder="••••" 
                          className="w-full glass-input p-4 rounded-2xl outline-none transition-all focus:border-blue-500/50 tracking-[0.5em] text-center font-bold text-xl text-white placeholder-white/20" 
                          value={pin} 
                          onChange={e => { if(/^\d*$/.test(e.target.value) && e.target.value.length <= 4) setPin(e.target.value); }}
                       />
                    </div>
                 </div>

                 {error && <p className="text-red-400 mt-4 text-sm font-bold bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
                 
                 <GlassButton variant="accent" className="w-full !py-4 text-lg mt-6" onClick={handleLoginWithEmail}>Log In</GlassButton>
                 
                 <button onClick={() => { setPin(''); setStep('ONBOARDING'); }} className="mt-6 text-sm text-white/30 hover:text-white transition-colors">
                    Back to Start
                 </button>
             </div>
        </div>
      )
  }

  if (step === 'GENDER_SELECT') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter bg-black">
        <h2 className="text-3xl font-bold mb-2 text-white">Who are you?</h2>
        <p className="text-white/40 mb-8">Select your style</p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <button 
                onClick={() => { setProfileForm({...profileForm, gender: 'MALE'}); setStep('REGISTER'); }}
                className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-white/10 flex flex-col items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/30"
            >
                <Icons.Male className="w-20 h-20 text-blue-200" />
                <span className="font-bold text-lg text-white">Male</span>
            </button>

            <button 
                onClick={() => { setProfileForm({...profileForm, gender: 'FEMALE'}); setStep('REGISTER'); }}
                className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-pink-500 to-rose-900 border border-white/10 flex flex-col items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-pink-900/30"
            >
                <Icons.Female className="w-20 h-20 text-pink-200" />
                <span className="font-bold text-lg text-white">Female</span>
            </button>
        </div>
      </div>
    );
  }

  if (step === 'REGISTER') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 animate-enter bg-black">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-white">Create Profile</h1>
            <p className="text-white/40">Let's personalize your experience</p>
          </div>
          <div className="space-y-5">
             <div>
                 <label className="text-xs font-bold text-white/40 ml-1 uppercase mb-2 block tracking-wider">Full Name</label>
                 <input 
                    type="text" 
                    placeholder="e.g. John Doe" 
                    className="w-full glass-input p-5 rounded-2xl outline-none text-lg transition-all focus:border-blue-500/50 text-white placeholder-white/20" 
                    value={profileForm.name} 
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                 />
             </div>
             
             <div>
                 <label className="text-xs font-bold text-white/40 ml-1 uppercase mb-2 block tracking-wider">Email Address</label>
                 <input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="w-full glass-input p-5 rounded-2xl outline-none text-lg transition-all focus:border-blue-500/50 text-white placeholder-white/20" 
                    value={profileForm.email} 
                    onChange={e => setProfileForm({...profileForm, email: e.target.value})} 
                 />
             </div>
             
             <div>
                 <label className="text-xs font-bold text-white/40 ml-1 uppercase mb-2 block tracking-wider">Phone (Optional)</label>
                 <input 
                    type="tel" 
                    placeholder="+880..." 
                    className="w-full glass-input p-5 rounded-2xl outline-none text-lg transition-all focus:border-blue-500/50 text-white placeholder-white/20" 
                    value={profileForm.phone} 
                    onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                 />
             </div>
             
             {error && <p className="text-red-400 text-sm text-center font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
             <GlassButton variant="accent" className="w-full !py-5 text-lg mt-4" onClick={handleRegister}>Continue</GlassButton>
          </div>
        </div>
      </div>
    );
  }

  if (isForgotMode) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black animate-enter text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6"><Icons.LogOut className="w-8 h-8"/></div>
            <h2 className="text-2xl font-bold mb-2 text-white">Reset App Data?</h2>
            <p className="text-white/50 mb-8 max-w-xs">Since we are offline-first, we cannot email you a code. You must reset the app to set a new PIN.</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <GlassButton variant="danger" onClick={handleForgotPin}>Yes, Reset Everything</GlassButton>
                <GlassButton variant="secondary" onClick={() => setIsForgotMode(false)}>Cancel</GlassButton>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-enter selection:bg-none relative bg-black">
       <div className="mb-12">
        <h1 className="text-2xl font-bold mb-2 tracking-wide text-white">{step === 'LOGIN' ? `Welcome Back${savedName ? `, ${savedName}` : ''}` : 'Set Passcode'}</h1>
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest">{step === 'LOGIN' ? 'Enter 4-Digit PIN' : (pin.length === 4 ? 'Confirm PIN' : 'Create PIN')}</p>
      </div>
      
      {/* Pin Dots */}
      <div className="flex gap-8 mb-16">
          {[0, 1, 2, 3].map(i => {
              const active = (step === 'LOGIN' ? pin.length : (pin.length === 4 ? confirmPin.length : pin.length)) > i;
              return (
                <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${active ? 'bg-blue-500 scale-125 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/10 border border-white/10'}`} />
              )
          })}
      </div>
      
      {error && <p className="text-red-400 mb-8 font-medium animate-pulse bg-red-500/10 px-4 py-2 rounded-full text-sm">{error}</p>}
      
      {/* Keypad */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[300px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onPointerDown={() => handlePinInput(num.toString())} className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-95 flex items-center justify-center text-3xl font-medium transition-all select-none text-white">
                {num}
            </button>
        ))}
        <div className="flex items-center justify-center">
             {step === 'LOGIN' && <button onClick={handleSwitchAccount} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider">Switch</button>}
        </div>
        <button onPointerDown={() => handlePinInput('0')} className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-95 flex items-center justify-center text-3xl font-medium transition-all select-none text-white">0</button>
        <button onPointerDown={handlePinDelete} className="w-20 h-20 rounded-full flex items-center justify-center text-white/30 hover:text-white active:scale-90 transition-all">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12H7" /><path d="M12 19l-7-7 7-7" /></svg>
        </button>
      </div>
      
      {step === 'LOGIN' && (
          <button onClick={handleForgotPin} className="mt-8 text-xs text-red-400/60 hover:text-red-400 font-medium">Forgot PIN?</button>
      )}
    </div>
  );
};
