
import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { GlassCard, GlassButton, AppHeader } from './UI';
import { LANGUAGES, CURRENCIES } from '../constants';
import { UserProfile, Category } from '../types';

export const SettingsView: React.FC<{
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setAuthState: (state: any) => void;
  generateId: () => string;
  t: (key: any) => string;
  initialSubTab?: 'MAIN' | 'CATS' | 'PROFILE' | 'CHANGE_PIN';
}> = ({ user, setUser, categories, setCategories, setAuthState, generateId, t, initialSubTab = 'MAIN' }) => {
    const [subTab, setSubTab] = useState<'MAIN' | 'CATS' | 'PROFILE' | 'CHANGE_PIN'>(initialSubTab);
    const [newCat, setNewCat] = useState('');
    const [tempProfile, setTempProfile] = useState(user);
    
    useEffect(() => {
        if(initialSubTab) setSubTab(initialSubTab);
    }, [initialSubTab]);
    
    // Change PIN State
    const [pinStage, setPinStage] = useState<'OLD'|'NEW'|'CONFIRM'>('OLD');
    const [pinInput, setPinInput] = useState('');
    const [newPinTemp, setNewPinTemp] = useState('');
    const [pinError, setPinError] = useState('');

    const isLight = user.theme === 'LIGHT';

    const renderIcon = (iconName: string, className: string) => {
       const IconComp = Icons[iconName as keyof typeof Icons] as any;
       return IconComp ? <IconComp className={className} /> : <Icons.LayoutGrid className={className} />;
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSaveProfile = () => {
        if (!tempProfile.email) {
            alert("Email cannot be empty");
            return;
        }
        if (!validateEmail(tempProfile.email)) {
            alert("Please enter a valid email address");
            return;
        }
        setUser(tempProfile); 
        setSubTab('MAIN');
    };

    if (subTab === 'CATS') {
       return (
         <div className="animate-enter pb-24">
            <AppHeader title="Manage Categories" onBack={() => setSubTab('MAIN')} isLight={isLight} />
            <div className="flex gap-2 mb-6">
               <input type="text" placeholder="New Category Name" className={`flex-1 p-3 rounded-xl outline-none ${isLight ? 'bg-white border border-gray-200' : 'glass-input'}`} value={newCat} onChange={e => setNewCat(e.target.value)} />
               <button onClick={() => { if(newCat) { setCategories(prev => [...prev, { id: generateId(), name: newCat, type: 'EXPENSE', icon: 'Tag', color: '#888', isCustom: true }]); setNewCat(''); } }} className="bg-blue-600 px-4 rounded-xl font-bold text-sm text-white">Add</button>
            </div>
            <div className="space-y-2">{categories.map(c => <GlassCard isLight={isLight} key={c.id} className="!p-3 flex justify-between items-center"><div className="flex items-center gap-3"><span className="text-xl">{renderIcon(c.icon, "w-6 h-6")}</span><span className="font-medium">{c.name}</span>{c.isCustom && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 rounded-full">Custom</span>}</div>{c.isCustom && <button onClick={() => setCategories(prev => prev.filter(x => x.id !== c.id))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><Icons.Trash className="w-4 h-4"/></button>}</GlassCard>)}</div>
         </div>
       )
    }

    if (subTab === 'CHANGE_PIN') {
        const handlePinDigit = (d: string) => {
            if (pinInput.length < 4) {
                const next = pinInput + d;
                setPinInput(next);
                
                if (next.length === 4) {
                    setTimeout(() => processPin(next), 200);
                }
            }
        };

        const processPin = (code: string) => {
            setPinError('');
            if (pinStage === 'OLD') {
                const saved = localStorage.getItem('app_pin');
                if (code === saved) {
                    setPinStage('NEW');
                    setPinInput('');
                } else {
                    setPinError('Incorrect PIN');
                    setTimeout(() => setPinInput(''), 500);
                }
            } else if (pinStage === 'NEW') {
                setNewPinTemp(code);
                setPinStage('CONFIRM');
                setPinInput('');
            } else if (pinStage === 'CONFIRM') {
                if (code === newPinTemp) {
                    localStorage.setItem('app_pin', code);
                    alert("PIN Changed Successfully");
                    setSubTab('MAIN');
                } else {
                    setPinError("PINs do not match");
                    setTimeout(() => {
                        setPinInput('');
                        setPinStage('NEW'); // Restart new pin flow
                    }, 1000);
                }
            }
        };

        return (
            <div className="animate-enter pb-24 flex flex-col items-center">
                 <AppHeader title="Change PIN" onBack={() => setSubTab('MAIN')} isLight={isLight} />
                 <h3 className={`text-xl font-bold mt-8 mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                     {pinStage === 'OLD' ? 'Enter Old PIN' : (pinStage === 'NEW' ? 'Enter New PIN' : 'Confirm New PIN')}
                 </h3>
                 <div className="flex gap-4 mb-8">
                     {[0,1,2,3].map(i => <div key={i} className={`w-4 h-4 rounded-full transition-all ${pinInput.length > i ? 'bg-blue-500' : (isLight ? 'bg-gray-300' : 'bg-white/20')}`}></div>)}
                 </div>
                 {pinError && <p className="text-red-500 font-bold mb-4">{pinError}</p>}
                 
                 <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button key={num} onClick={() => handlePinDigit(num.toString())} className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${isLight ? 'bg-white shadow border border-gray-100' : 'bg-white/10 active:bg-white/20'}`}>{num}</button>)}
                    <div/>
                    <button onClick={() => handlePinDigit('0')} className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${isLight ? 'bg-white shadow border border-gray-100' : 'bg-white/10 active:bg-white/20'}`}>0</button>
                    <button onClick={() => setPinInput(p => p.slice(0, -1))} className="w-20 h-20 flex items-center justify-center"><Icons.ArrowLeft className="w-6 h-6"/></button>
                 </div>
            </div>
        )
    }

    if (subTab === 'PROFILE') {
       const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/40';
       const labelClass = `text-xs mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`;
       
       return (
          <div className="animate-enter pb-24">
             <AppHeader title="Edit Profile" onBack={() => setSubTab('MAIN')} isLight={isLight} />
             <div className="space-y-5">
                <div>
                   <label className={labelClass}>Full Name</label>
                   <input className={`${inputClass} w-full p-4 rounded-2xl outline-none`} value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} placeholder="e.g. John Doe" />
                </div>
                <div>
                   <label className={labelClass}>Email Address</label>
                   <input className={`${inputClass} w-full p-4 rounded-2xl outline-none`} value={tempProfile.email} onChange={e => setTempProfile({...tempProfile, email: e.target.value})} placeholder="name@example.com" type="email" />
                </div>
                <div>
                   <label className={labelClass}>Phone Number</label>
                   <input className={`${inputClass} w-full p-4 rounded-2xl outline-none`} value={tempProfile.phone} onChange={e => setTempProfile({...tempProfile, phone: e.target.value})} placeholder="+880..." type="tel" />
                </div>
                <div>
                   <label className={labelClass}>Gender</label>
                   <div className="flex gap-4">
                       <button 
                           onClick={() => setTempProfile({...tempProfile, gender: 'MALE'})}
                           className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold ${tempProfile.gender === 'MALE' ? 'bg-blue-600 text-white border-transparent' : 'border-white/10 text-white/50'}`}
                       >
                           <Icons.Male className="w-5 h-5"/> Male
                       </button>
                       <button 
                           onClick={() => setTempProfile({...tempProfile, gender: 'FEMALE'})}
                           className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold ${tempProfile.gender === 'FEMALE' ? 'bg-pink-600 text-white border-transparent' : 'border-white/10 text-white/50'}`}
                       >
                           <Icons.Female className="w-5 h-5"/> Female
                       </button>
                   </div>
                </div>
                <GlassButton variant="accent" className="w-full" onClick={handleSaveProfile}>Save Changes</GlassButton>
             </div>
          </div>
       )
    }

    const currencySymbol = CURRENCIES[user.currency as keyof typeof CURRENCIES]?.symbol || '$';

    return (
      <div className="animate-enter pb-24">
        <AppHeader title={t('settings')} isLight={isLight} />
        
        <div className={`flex items-center justify-between mb-8 p-4 rounded-2xl ${isLight ? 'bg-white shadow-sm border border-gray-100' : 'bg-white/5'}`}>
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${user.gender === 'FEMALE' ? 'bg-gradient-to-tr from-pink-500 to-rose-500' : 'bg-gradient-to-tr from-blue-500 to-indigo-600'}`}>
                  <Icons.User className="w-6 h-6"/>
              </div>
              <div><h3 className="font-bold text-lg">{user?.name || 'User'}</h3><p className={`text-sm ${isLight ? 'text-gray-500' : 'text-white/40'}`}>{user?.phone || user?.email}</p></div>
           </div>
           <button onClick={() => { setTempProfile(user); setSubTab('PROFILE'); }} className={`p-2 rounded-full ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-white/10'}`}><Icons.Edit className="w-4 h-4"/></button>
        </div>
        
        <div className="space-y-4">
           {/* Theme Toggle */}
           <GlassCard isLight={isLight} className="!p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                   {user.theme === 'LIGHT' ? <Icons.Sun className="w-6 h-6 text-yellow-500"/> : <Icons.Moon className="w-6 h-6 text-blue-300"/>}
                   <span>Appearance</span>
               </div>
               <div className="flex bg-black/10 p-1 rounded-lg">
                  <button onClick={() => setUser({...user, theme: 'DARK'})} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${user.theme !== 'LIGHT' ? 'bg-gray-800 text-white shadow' : 'text-gray-500'}`}>Dark</button>
                  <button onClick={() => setUser({...user, theme: 'LIGHT'})} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${user.theme === 'LIGHT' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}>Light</button>
               </div>
           </GlassCard>

           <GlassCard isLight={isLight} className="!p-4 flex justify-between items-center">
                <div className="flex items-center gap-3"><Icons.Globe className="text-blue-500 w-6 h-6" /><span>Language</span></div>
                <div className="flex bg-black/10 p-1 rounded-lg">{Object.keys(LANGUAGES).map((lang) => <button key={lang} onClick={() => setUser({...user, language: lang})} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${user.language === lang ? (isLight ? 'bg-white text-black shadow' : 'bg-gray-700 text-white shadow') : 'text-gray-500'}`}>{lang}</button>)}</div>
           </GlassCard>
           
           <GlassCard isLight={isLight} className="!p-4 flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="w-6 text-center font-bold text-emerald-500">{currencySymbol}</div><span>Currency</span></div>
              <select value={user?.currency || 'BDT'} onChange={e => setUser({...user, currency: e.target.value})} className={`text-sm p-2 rounded-lg outline-none ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-black/40 text-white'}`}>
                {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </GlassCard>
           
           {/* Enhanced Cards for Manage and Pin */}
           <GlassCard isLight={isLight} onClick={() => setSubTab('CATS')} className="!p-4 flex justify-between items-center cursor-pointer active:scale-[0.99] transition-transform">
               <div className="flex items-center gap-3">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLight ? 'bg-purple-100' : 'bg-purple-500/20'}`}>
                        <Icons.List className="w-4 h-4 text-purple-500" />
                   </div>
                   <span>Manage Categories</span>
               </div>
               <Icons.ChevronRight className="w-4 h-4 opacity-30"/>
           </GlassCard>

           <GlassCard isLight={isLight} onClick={() => setSubTab('CHANGE_PIN')} className="!p-4 flex justify-between items-center cursor-pointer active:scale-[0.99] transition-transform">
               <div className="flex items-center gap-3">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLight ? 'bg-orange-100' : 'bg-orange-500/20'}`}>
                        <Icons.Lock className="w-4 h-4 text-orange-500" />
                   </div>
                   <span>Change App PIN</span>
               </div>
               <Icons.ChevronRight className="w-4 h-4 opacity-30"/>
           </GlassCard>
           
           <button onClick={() => setAuthState('LOGIN')} className="w-full p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold mt-8 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"><Icons.LogOut className="w-5 h-5"/> Sign Out</button>
        </div>
      </div>
    );
};
