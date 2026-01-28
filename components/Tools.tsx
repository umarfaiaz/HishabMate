
import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { GlassCard, GlassButton, AppHeader, FormattedNumberInput, CustomSelect, Modal, CustomDatePicker } from './UI';
import { generateId } from '../utils';
import { NotesView } from './Notes';
import { CalendarView } from './Calendar';
import { HealthView } from './Health';
import { SavedCalculation, SplitBill, Note, Tour, ListItem, Loan, Debt, CalendarEvent, LoanOffer, SavingsGoal, HealthData } from '../types';

// --- Helper Functions ---
const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const calculateEMIValue = (principal: number, rate: number, tenureMonths: number) => {
    if (!principal || !rate || !tenureMonths) return 0;
    const r = rate / 12 / 100;
    const n = tenureMonths;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi;
};

// ... (Keep SavingsGoalTracker, TourPlanner, SimpleCalculator, SplitBillComponent, EMICalculator exactly as they are) ...
// Note: In a real diff I would keep them. Since I must output full file content if I change it, 
// I will output the file with the BMI component removed and Health added.

// --- Savings Goal Tracker ---
const SavingsGoalTracker: React.FC<{ 
    goals: SavingsGoal[]; 
    setGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>; 
    formatCurrency: (v: number) => string; 
    isLight: boolean; 
}> = ({ goals, setGoals, formatCurrency, isLight }) => {
    const [mode, setMode] = useState<'LIST' | 'FORM'>('LIST');
    const [form, setForm] = useState<Partial<SavingsGoal>>({});
    
    const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/30';

    const handleSave = () => {
        if(!form.title || !form.targetAmount) return;
        const newGoal = {
            id: form.id || generateId(),
            title: form.title,
            targetAmount: Number(form.targetAmount),
            currentAmount: Number(form.currentAmount || 0),
            deadline: form.deadline || '',
            icon: form.icon || 'PiggyBank',
            color: form.color || '#10b981'
        } as SavingsGoal;

        if (form.id) {
            setGoals(prev => prev.map(g => g.id === form.id ? newGoal : g));
        } else {
            setGoals(prev => [...prev, newGoal]);
        }
        setMode('LIST');
    };

    if (mode === 'FORM') {
        return (
            <div className="animate-enter space-y-6">
                <div className="flex justify-between items-center">
                    <button onClick={() => setMode('LIST')} className="text-xs opacity-60 flex items-center gap-1"><Icons.ArrowLeft className="w-3 h-3"/> Back</button>
                    <h2 className="font-bold text-lg">{form.id ? 'Edit Goal' : 'New Goal'}</h2>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Goal Name</label>
                        <input className={`${inputClass} w-full p-4 rounded-xl font-bold`} value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. New Laptop" />
                    </div>
                    <div>
                        <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Target Amount</label>
                        <FormattedNumberInput value={form.targetAmount || ''} onChange={v => setForm({...form, targetAmount: Number(v)})} className={`${inputClass} w-full p-4 rounded-xl font-bold text-lg`} placeholder="0.00" isLight={isLight} />
                    </div>
                    <div>
                        <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Saved So Far</label>
                        <FormattedNumberInput value={form.currentAmount || ''} onChange={v => setForm({...form, currentAmount: Number(v)})} className={`${inputClass} w-full p-4 rounded-xl font-bold`} placeholder="0.00" isLight={isLight} />
                    </div>
                    <div className="relative z-10">
                        <CustomDatePicker
                            label="Deadline (Optional)"
                            value={form.deadline || ''}
                            onChange={val => setForm({...form, deadline: val})}
                            isLight={isLight}
                        />
                    </div>
                </div>
                <GlassButton variant="accent" onClick={handleSave} className="w-full !py-4">Save Goal</GlassButton>
            </div>
        )
    }

    return (
        <div className="animate-enter space-y-4">
            <GlassButton onClick={() => { setForm({}); setMode('FORM'); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white !py-4"><Icons.Plus className="w-5 h-5"/> New Savings Goal</GlassButton>
            
            {goals.map(goal => {
                const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
                return (
                    <GlassCard isLight={isLight} key={goal.id} onClick={() => { setForm(goal); setMode('FORM'); }} className="relative overflow-hidden !p-5 cursor-pointer hover:scale-[1.01] transition-transform">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    <Icons.PiggyBank className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">{goal.title}</h3>
                                    {goal.deadline && <p className="text-xs opacity-50">By {goal.deadline}</p>}
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setGoals(prev => prev.filter(g => g.id !== goal.id)); }} className="text-red-400 p-2 hover:bg-red-500/10 rounded-full"><Icons.Trash className="w-4 h-4"/></button>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span>{formatCurrency(goal.currentAmount)}</span>
                                <span>{formatCurrency(goal.targetAmount)}</span>
                            </div>
                            <div className={`h-3 rounded-full overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-right text-[10px] font-bold mt-1 opacity-60">{progress.toFixed(1)}%</p>
                        </div>
                    </GlassCard>
                )
            })}
            
            {goals.length === 0 && <div className="text-center opacity-40 mt-10 p-8">No goals set yet.</div>}
        </div>
    );
};

// --- Advanced Tour Planner ---
const TourPlanner: React.FC<{ 
    tours: Tour[];
    setTours: React.Dispatch<React.SetStateAction<Tour[]>>;
    formatCurrency: (v: number) => string; 
    isLight: boolean; 
}> = ({ tours, setTours, formatCurrency, isLight }) => {
    const [mode, setMode] = useState<'LIST'|'CREATE'|'VIEW'>('LIST');
    const [form, setForm] = useState<Partial<Tour>>({ tripType: 'SOLO' });
    const [newItemText, setNewItemText] = useState('');

    const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/30';

    const handleSave = () => {
        if (!form.destination || !form.startDate) { alert('Destination and Start Date required'); return; }
        const newTour = { 
            ...form, 
            id: form.id || generateId(),
            packingList: form.packingList || []
        } as Tour;
        
        if (form.id) {
            setTours(prev => prev.map(t => t.id === form.id ? newTour : t));
        } else {
            setTours(prev => [newTour, ...prev]);
        }
        setMode('LIST');
    };

    const handleShare = (tour: Tour) => {
        const typeEmoji = tour.tripType === 'COUPLE' ? '💑' : tour.tripType === 'FAMILY' ? '👨‍👩‍👧‍👦' : tour.tripType === 'FRIENDS' ? '👯‍♂️' : '🧍';
        const typeText = tour.tripType ? `${tour.tripType.charAt(0).toUpperCase() + tour.tripType.slice(1).toLowerCase()} Trip` : 'Trip';
        const text = `${typeEmoji} ${typeText} to ${tour.destination}\n📅 ${tour.startDate} - ${tour.endDate || '?'}\n💰 Budget: ${formatCurrency(tour.budget || 0)}\n\n📋 Itinerary:\n${tour.itinerary || 'No details'}\n\nGenerated by HishabMate`;
        
        if (navigator.share) {
            navigator.share({ title: `${typeText} to ${tour.destination}`, text })
                .catch((err) => { if (err.name !== 'AbortError') console.error(err); });
        } else {
            navigator.clipboard.writeText(text);
            alert("Trip details copied to clipboard!");
        }
    };

    if (mode === 'LIST') {
        return (
            <div className="animate-enter space-y-4">
                <GlassButton onClick={() => { setForm({ packingList: [], tripType: 'SOLO' }); setMode('CREATE'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white !py-4"><Icons.Plus className="w-5 h-5"/> Plan New Trip</GlassButton>
                {tours.map(t => (
                    <div key={t.id} onClick={() => { setForm(t); setMode('CREATE'); }} className={`p-5 rounded-2xl border relative overflow-hidden ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-xl flex items-center gap-2"><Icons.Map className="w-5 h-5 text-blue-500"/> {t.destination}</h3>
                                <p className="text-xs opacity-50 flex items-center gap-1">
                                    {t.tripType === 'COUPLE' ? '💑 Couple' : t.tripType === 'FAMILY' ? '👨‍👩‍👧‍👦 Family' : t.tripType === 'FRIENDS' ? '👯‍♂️ Friends' : '🧍 Solo'} • {t.startDate} ➔ {t.endDate || '?'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleShare(t); }} className="p-2 rounded-full bg-blue-500/10 text-blue-500"><Icons.ArrowUpRight className="w-4 h-4"/></button>
                                <button onClick={(e) => { e.stopPropagation(); setTours(p => p.filter(x => x.id !== t.id)); }} className="p-2 rounded-full bg-red-500/10 text-red-500"><Icons.Trash className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded font-bold">{formatCurrency(t.budget || 0)} Budget</span>
                            <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded font-bold">{(t.packingList?.filter(i => i.checked).length || 0)} / {(t.packingList?.length || 0)} Packed</span>
                        </div>
                    </div>
                ))}
                {tours.length === 0 && <div className="text-center opacity-40 mt-10 p-8">No trips planned yet.</div>}
            </div>
        )
    }

    return (
        <div className="animate-enter space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <button onClick={() => setMode('LIST')} className="text-xs opacity-60 flex items-center gap-1"><Icons.ArrowLeft className="w-3 h-3"/> Back</button>
                <h2 className="font-bold text-lg">{form.id ? 'Edit Trip' : 'New Trip'}</h2>
            </div>

            <div className="space-y-4">
                <CustomSelect 
                    label="Who are you traveling with?"
                    options={[
                        { label: 'Solo Trip', value: 'SOLO', icon: <Icons.User className="w-4 h-4"/> },
                        { label: 'Couple / Partner', value: 'COUPLE', icon: <Icons.Heart className="w-4 h-4"/> },
                        { label: 'Family Group', value: 'FAMILY', icon: <Icons.Home className="w-4 h-4"/> },
                        { label: 'Friends Group', value: 'FRIENDS', icon: <Icons.Users className="w-4 h-4"/> },
                    ]}
                    value={form.tripType || 'SOLO'}
                    onChange={(val: any) => setForm({...form, tripType: val})}
                    isLight={isLight}
                />

                <input placeholder="Destination (e.g. Cox's Bazar)" className={`${inputClass} w-full p-4 rounded-xl font-bold text-lg`} value={form.destination || ''} onChange={e => setForm({...form, destination: e.target.value})} />
                
                <div className="flex gap-2">
                    <div className="flex-1">
                        <CustomDatePicker
                            label="Start"
                            value={form.startDate || ''}
                            onChange={val => setForm({...form, startDate: val})}
                            isLight={isLight}
                            className="z-20"
                        />
                    </div>
                    <div className="flex-1">
                        <CustomDatePicker
                            label="End"
                            value={form.endDate || ''}
                            onChange={val => setForm({...form, endDate: val})}
                            isLight={isLight}
                            className="z-10"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs opacity-50 ml-1 uppercase font-bold">Budget</label>
                    <FormattedNumberInput value={form.budget || ''} onChange={v => setForm({...form, budget: Number(v)})} className={`${inputClass} w-full p-3 rounded-xl`} placeholder="0.00" isLight={isLight} />
                </div>
            </div>

            <div className={`p-4 rounded-2xl ${isLight ? 'bg-white border border-gray-200' : 'bg-white/5'}`}>
                <h3 className="text-sm font-bold opacity-70 mb-2 uppercase">Itinerary & Notes</h3>
                <textarea 
                    className={`w-full bg-transparent outline-none h-32 resize-none ${isLight ? 'text-gray-900 placeholder-gray-400' : 'text-white placeholder-white/30'}`} 
                    placeholder={
                        form.tripType === 'COUPLE' ? "Romantic dinner at..." :
                        form.tripType === 'FAMILY' ? "Kids play time at..." :
                        "Day 1 plan..."
                    }
                    value={form.itinerary || ''}
                    onChange={e => setForm({...form, itinerary: e.target.value})}
                />
            </div>

            <div className={`p-4 rounded-2xl ${isLight ? 'bg-white border border-gray-200' : 'bg-white/5'}`}>
                <h3 className="text-sm font-bold opacity-70 mb-2 uppercase">Packing List</h3>
                <div className="flex gap-2 mb-2">
                    <input 
                        value={newItemText} 
                        onChange={e => setNewItemText(e.target.value)} 
                        className={`${inputClass} flex-1 p-2 rounded-lg text-sm`} 
                        placeholder="Add item..." 
                        onKeyDown={e => { if(e.key==='Enter' && newItemText.trim()) { setForm({...form, packingList: [...(form.packingList||[]), {text: newItemText, checked: false}]}); setNewItemText(''); }}}
                    />
                    <button onClick={() => { if(newItemText.trim()) { setForm({...form, packingList: [...(form.packingList||[]), {text: newItemText, checked: false}]}); setNewItemText(''); }}} className="bg-blue-500 text-white px-3 rounded-lg"><Icons.Plus className="w-4 h-4"/></button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {form.packingList?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            <button onClick={() => { const newList = [...(form.packingList||[])]; newList[idx].checked = !newList[idx].checked; setForm({...form, packingList: newList}); }}>
                                {item.checked ? <Icons.CheckCircle className="w-5 h-5 text-emerald-500"/> : <div className={`w-5 h-5 rounded-full border ${isLight ? 'border-gray-300' : 'border-white/30'}`}/>}
                            </button>
                            <span className={item.checked ? 'line-through opacity-50' : ''}>{item.text}</span>
                            <button onClick={() => { const newList = [...(form.packingList||[])]; newList.splice(idx, 1); setForm({...form, packingList: newList}); }} className="ml-auto text-red-400 opacity-50 hover:opacity-100"><Icons.X className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
            </div>

            <GlassButton variant="accent" onClick={handleSave} className="w-full !py-4">Save Trip</GlassButton>
        </div>
    );
};

// --- Calculator Component ---
const SimpleCalculator: React.FC<{
  savedCalcs: SavedCalculation[];
  setSavedCalcs: React.Dispatch<React.SetStateAction<SavedCalculation[]>>;
  isLight: boolean;
}> = ({ savedCalcs, setSavedCalcs, isLight }) => {
    // ... (Keep existing calculator logic)
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleNum = (num: string) => {
    if (shouldReset) {
      setDisplay(num);
      setShouldReset(false);
      setShowSaveInput(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOp = (op: string) => {
    setShowSaveInput(false);
    if (op === 'AC') {
      setDisplay('0');
      setEquation('');
      setShouldReset(false);
    } else if (op === 'DEL') {
      if (shouldReset) {
          setDisplay('0');
          setShouldReset(false);
      } else {
          setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
      }
    } else if (op === '=') {
       try {
         const sanitized = (equation + display).replace(/×/g, '*').replace(/÷/g, '/');
         const res = String(Function('"use strict";return (' + sanitized + ')')());
         setEquation(''); 
         setDisplay(res === 'NaN' || res === 'Infinity' ? 'Error' : res);
         setShouldReset(true);
       } catch {
         setDisplay('Error');
         setShouldReset(true);
       }
    } else {
       setEquation(display + ' ' + op + ' ');
       setShouldReset(true);
    }
  };

  const confirmSave = () => {
      if(saveName.trim()) {
          setSavedCalcs(prev => [{ id: generateId(), name: saveName, expression: equation + display, result: display, date: new Date().toLocaleDateString() }, ...prev]);
          setSaveName('');
          setShowSaveInput(false);
          setShowHistory(true);
      }
  };

  const Btn = ({ label, type = 'num', onClick, span = 1 }: { label: React.ReactNode, type?: 'num'|'op'|'top'|'accent', onClick: () => void, span?: number }) => {
      let styles = "";
      if (type === 'num') styles = isLight ? "bg-white/60 border border-white/40 text-gray-800 hover:bg-white shadow-sm" : "bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-lg shadow-black/5";
      if (type === 'top') styles = isLight ? "bg-gray-200/80 border border-gray-200/50 text-gray-900 hover:bg-gray-200" : "bg-white/10 border border-white/10 text-cyan-400 hover:bg-white/20";
      if (type === 'op') styles = isLight ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 border border-blue-400/20" : "bg-blue-600 text-white shadow-lg shadow-blue-600/40 hover:bg-blue-500 border border-blue-500/20";
      if (type === 'accent') styles = isLight ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600" : "bg-orange-500 text-white shadow-lg shadow-orange-500/40 hover:bg-orange-600";

      return (
        <button 
          onClick={onClick}
          className={`${styles} ${span === 2 ? 'col-span-2 w-full aspect-[2.1/1]' : 'aspect-square'} rounded-[24px] text-2xl font-medium backdrop-blur-md transition-all active:scale-90 flex items-center justify-center select-none`}
        >
          {label}
        </button>
      )
  };

  return (
      <div className="animate-enter h-full flex flex-col pb-8 px-4 relative">
         {showHistory && (
             <div className={`absolute inset-0 z-30 rounded-[32px] overflow-hidden flex flex-col ${isLight ? 'bg-white/95' : 'bg-black/95'} backdrop-blur-xl animate-enter`}>
                 <div className="flex justify-between items-center p-6 border-b border-white/10">
                     <h3 className="text-xl font-bold">Saved Calculations</h3>
                     <button onClick={() => setShowHistory(false)}><Icons.X className="w-6 h-6"/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                     {savedCalcs.map(s => (
                         <div key={s.id} className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                             <div className="flex justify-between mb-1">
                                 <span className="font-bold">{s.name}</span>
                                 <span className="text-xs opacity-50">{s.date}</span>
                             </div>
                             <div className="flex justify-between items-end">
                                 <span className="text-sm opacity-60">{s.expression}</span>
                                 <span className="text-2xl font-mono font-bold text-blue-500">{s.result}</span>
                             </div>
                             <div className="flex gap-3 mt-3 justify-end">
                                 <button onClick={() => { setDisplay(s.result); setShowHistory(false); }} className="text-xs font-bold text-blue-500">Load</button>
                                 <button onClick={() => setSavedCalcs(p => p.filter(x => x.id !== s.id))} className="text-xs font-bold text-red-500">Delete</button>
                             </div>
                         </div>
                     ))}
                     {savedCalcs.length === 0 && <div className="text-center opacity-40 mt-10">No saved calculations</div>}
                 </div>
             </div>
         )}

         <div className={`flex-1 flex flex-col justify-end items-end p-6 mb-6 rounded-[32px] border relative overflow-hidden ${isLight ? 'bg-gradient-to-br from-gray-50 to-white border-gray-100 shadow-inner' : 'bg-gradient-to-br from-white/5 to-transparent border-white/5 shadow-inner'}`}>
            <div className="absolute top-4 left-4 flex gap-2 z-20">
                <button onClick={() => setShowHistory(true)} className={`p-2 rounded-full ${isLight ? 'bg-gray-200 text-gray-600' : 'bg-white/10 text-white/60'}`}><Icons.List className="w-5 h-5"/></button>
            </div>
            <div className={`text-lg font-medium h-6 mb-1 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
               {equation}
            </div>
            <div className={`text-6xl font-light tracking-tighter break-all ${isLight ? 'text-gray-900' : 'text-white'}`}>
               {display}
            </div>
            
            {showSaveInput ? (
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 animate-enter">
                    <input autoFocus type="text" placeholder="Name this calculation" className={`flex-1 rounded-full px-4 py-2 text-sm ${isLight ? 'bg-white border border-gray-200' : 'glass-input'}`} value={saveName} onChange={e => setSaveName(e.target.value)} />
                    <button onClick={confirmSave} className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold">OK</button>
                </div>
            ) : (
                shouldReset && display !== 'Error' && (
                    <button onClick={() => setShowSaveInput(true)} className="absolute bottom-4 left-4 text-xs bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <Icons.Save className="w-3 h-3"/> Save
                    </button>
                )
            )}
         </div>

         <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-sm mx-auto w-full">
            <Btn label="AC" type="top" onClick={() => handleOp('AC')} />
            <Btn label={<Icons.ArrowLeft className="w-6 h-6"/>} type="top" onClick={() => handleOp('DEL')} />
            <Btn label="%" type="top" onClick={() => handleOp('%')} />
            <Btn label="÷" type="op" onClick={() => handleOp('÷')} />

            <Btn label="7" type="num" onClick={() => handleNum('7')} />
            <Btn label="8" type="num" onClick={() => handleNum('8')} />
            <Btn label="9" type="num" onClick={() => handleNum('9')} />
            <Btn label="×" type="op" onClick={() => handleOp('×')} />

            <Btn label="4" type="num" onClick={() => handleNum('4')} />
            <Btn label="5" type="num" onClick={() => handleNum('5')} />
            <Btn label="6" type="num" onClick={() => handleNum('6')} />
            <Btn label="-" type="op" onClick={() => handleOp('-')} />

            <Btn label="1" type="num" onClick={() => handleNum('1')} />
            <Btn label="2" type="num" onClick={() => handleNum('2')} />
            <Btn label="3" type="num" onClick={() => handleNum('3')} />
            <Btn label="+" type="op" onClick={() => handleOp('+')} />

            <Btn label="0" type="num" span={2} onClick={() => handleNum('0')} />
            <Btn label="." type="num" onClick={() => handleNum('.')} />
            <Btn label="=" type="accent" onClick={() => handleOp('=')} />
         </div>
      </div>
  )
};

// ... (Keep SplitBillComponent and EMICalculator exactly as they are) ...
const SplitBillComponent: React.FC<{
  splitBills: SplitBill[];
  setSplitBills: React.Dispatch<React.SetStateAction<SplitBill[]>>;
  formatCurrency: (val: number) => string;
  isLight: boolean;
}> = ({ splitBills, setSplitBills, formatCurrency, isLight }) => {
  // ... (Same implementation)
  const [mode, setMode] = useState<'LIST'|'CREATE'|'VIEW'>('LIST');
  const [viewId, setViewId] = useState<string | null>(null);
  
  // Create Form State
  const [form, setForm] = useState<Partial<SplitBill>>({ payees: [], items: [], tipAmount: 0, date: getLocalDateString(new Date()) });
  const [newItem, setNewItem] = useState({ name: '', cost: '' });
  const [newPayee, setNewPayee] = useState('');
  
  const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/30';
  
  const handleShare = (bill: SplitBill) => {
      const perPerson = bill.totalAmount / (bill.payees.length || 1);
      const text = `🧾 Bill: ${bill.title}\n📅 Date: ${bill.date}\n💰 Total: ${formatCurrency(bill.totalAmount)}\n👥 People: ${bill.payees.length}\n👉 Per Person: ${formatCurrency(perPerson)}\n\nGenerated by HishabMate`;
      
      if (navigator.share) {
          navigator.share({ title: 'Split Bill', text }).catch((err) => { if (err.name !== 'AbortError') console.error(err); });
      } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
  };

  const handleAddPayee = () => {
      if (!newPayee.trim()) return;
      const num = parseInt(newPayee);
      
      if (!isNaN(num) && num > 0) {
          // Batch add: "5" -> Person 1...Person 5
          const currentCount = form.payees?.length || 0;
          const newNames = Array.from({length: num}, (_, i) => `Person ${currentCount + i + 1}`);
          setForm({...form, payees: [...(form.payees || []), ...newNames]});
      } else {
          // Single add
          setForm({...form, payees: [...(form.payees || []), newPayee.trim()]});
      }
      setNewPayee('');
  };

  const updatePayeeName = (index: number, newName: string) => {
      const updated = [...(form.payees || [])];
      updated[index] = newName;
      setForm({...form, payees: updated});
  };

  if (mode === 'VIEW' && viewId) {
      const bill = splitBills.find(b => b.id === viewId);
      if (!bill) return null;
      const perPerson = bill.totalAmount / (bill.payees.length || 1);

      return (
          <div className="animate-enter space-y-6">
              <button onClick={() => setMode('LIST')} className="text-xs opacity-60 flex items-center gap-1"><Icons.ArrowLeft className="w-3 h-3"/> Back</button>
              
              <div className={`p-6 rounded-[24px] relative overflow-hidden ${isLight ? 'bg-white border border-gray-200 shadow-xl' : 'bg-white text-black'} overflow-x-auto`}>
                  <div className={`absolute -top-3 left-0 right-0 h-6 bg-transparent flex justify-between px-2`}>
                     {[...Array(15)].map((_, i) => <div key={i} className={`w-3 h-3 rounded-full ${isLight ? 'bg-gray-50' : 'bg-[#121212]'}`}></div>)}
                  </div>

                  <div className="text-center mb-6 pt-4">
                      <h2 className="text-2xl font-bold uppercase tracking-wider">{bill.title}</h2>
                      <p className="text-xs opacity-50">{bill.date}</p>
                  </div>

                  <div className="space-y-2 mb-6 border-b border-black/10 pb-6 border-dashed">
                      {bill.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm font-medium">
                              <span className="truncate mr-2">{item.name}</span>
                              <span className="whitespace-nowrap">{formatCurrency(item.cost)}</span>
                          </div>
                      ))}
                      {bill.tipAmount > 0 && (
                          <div className="flex justify-between text-sm font-medium opacity-70">
                              <span>Tip</span>
                              <span>{formatCurrency(bill.tipAmount)}</span>
                          </div>
                      )}
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-lg">TOTAL</span>
                      <span className="font-bold text-3xl">{formatCurrency(bill.totalAmount)}</span>
                  </div>
                  
                  <div className="bg-black/5 p-4 rounded-xl flex justify-between items-center">
                      <div>
                          <p className="text-xs font-bold uppercase opacity-50">Per Person</p>
                          <p className="text-xs font-bold opacity-50">{bill.payees.length} people</p>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(perPerson)}</p>
                  </div>
              </div>
              
              <GlassButton variant="accent" onClick={() => handleShare(bill)} className="w-full !py-4 flex items-center justify-center gap-2">
                 <Icons.ArrowUpRight className="w-5 h-5"/> Share Bill
              </GlassButton>
          </div>
      )
  }
  
  if (mode === 'LIST') {
      return (
        <div className="animate-enter space-y-4">
            <GlassButton onClick={() => { setForm({ payees: [], items: [], tipAmount: 0, date: getLocalDateString(new Date()) }); setMode('CREATE'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white !py-4"><Icons.Plus className="w-5 h-5"/> Create New Split Bill</GlassButton>
            <div className="grid gap-3">
                {splitBills.map(sb => (
                  <div key={sb.id} onClick={() => { setViewId(sb.id); setMode('VIEW'); }} className={`${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'} p-5 rounded-2xl border flex justify-between items-center cursor-pointer active:scale-95 transition-transform`}>
                      <div>
                        <h3 className="font-bold text-lg">{sb.title}</h3>
                        <p className="text-xs opacity-50">{sb.date} • {sb.payees.length} People</p>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-lg text-blue-400">{formatCurrency(sb.totalAmount)}</p>
                         <button onClick={(e) => { e.stopPropagation(); setSplitBills(prev => prev.filter(x => x.id !== sb.id)); }} className="text-red-400 text-[10px] bg-red-500/10 px-2 py-1 rounded mt-1">Delete</button>
                      </div>
                  </div>
                ))}
            </div>
            {splitBills.length === 0 && <div className="text-center opacity-40 mt-10 p-8 border border-dashed border-white/20 rounded-3xl">No saved bills found</div>}
        </div>
      )
  }
  
  const subtotal = (form.items || []).reduce((acc, i) => acc + (Number(i.cost) || 0), 0);
  const total = subtotal + (Number(form.tipAmount) || 0);
  const perPerson = total / ((form.payees?.length || 0) || 1);
  
  return (
      <div className="animate-enter space-y-6 pb-32">
        <button onClick={() => setMode('LIST')} className="text-xs opacity-60 flex items-center gap-1 mb-4"><Icons.ArrowLeft className="w-3 h-3"/> Back</button>
        
        <div className="space-y-4">
            <div>
                 <label className="text-xs opacity-50 ml-1 uppercase font-bold">Event / Title</label>
                 <input className={`${inputClass} w-full p-4 rounded-xl font-bold`} value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Dinner at Mario's" />
            </div>
            <div className="relative z-10">
                 <CustomDatePicker
                    label="Date"
                    value={form.date || ''}
                    onChange={val => setForm({...form, date: val})}
                    isLight={isLight}
                 />
            </div>
        </div>

        <div className={`${isLight ? 'bg-white' : 'bg-white/5'} p-4 rounded-2xl space-y-3`}>
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold opacity-60 uppercase">People involved</h3>
                <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded-md">{form.payees?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {form.payees?.map((p, idx) => (
                    <div key={idx} className="bg-blue-500/20 rounded-full flex items-center pl-3 pr-1 py-1 gap-1 border border-blue-500/30">
                        <input 
                            className="bg-transparent text-xs font-bold text-blue-500 w-16 outline-none" 
                            value={p} 
                            onChange={(e) => updatePayeeName(idx, e.target.value)} 
                        />
                        <button onClick={() => setForm({...form, payees: form.payees?.filter((_, i) => i !== idx)})} className="p-1 text-blue-500 hover:text-red-500"><Icons.X className="w-3 h-3"/></button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input placeholder="Name or Qty (e.g. 5)" className={`${inputClass} flex-1 p-3 rounded-xl text-sm min-w-0`} value={newPayee} onChange={e => setNewPayee(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPayee()} />
                <button onClick={handleAddPayee} className="bg-blue-500 text-white px-4 rounded-xl font-bold shrink-0"><Icons.Plus className="w-5 h-5"/></button>
            </div>
        </div>
        
        <div className={`${isLight ? 'bg-white' : 'bg-white/5'} p-4 rounded-2xl space-y-3`}>
            <h3 className="text-xs font-bold opacity-60 uppercase">Items & Costs</h3>
            <div className="space-y-2">
                {form.items?.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-2 rounded-lg bg-black/5 items-center">
                        <span className="font-medium truncate mr-2">{i.name}</span>
                        <span className="font-bold opacity-70 whitespace-nowrap">{formatCurrency(i.cost)}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input placeholder="Item Name" className={`${inputClass} flex-[2] p-3 rounded-xl text-sm min-w-0`} value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                <FormattedNumberInput placeholder="Cost" className={`${inputClass} flex-1 p-3 rounded-xl text-sm min-w-0`} value={newItem.cost} onChange={v => setNewItem({...newItem, cost: v})} isLight={isLight} />
                <button onClick={() => { if(newItem.name && newItem.cost) { setForm({...form, items: [...(form.items||[]), {name: newItem.name, cost: Number(newItem.cost)}]}); setNewItem({name:'', cost:''}); }}} className="bg-blue-500 text-white px-4 rounded-xl font-bold shrink-0"><Icons.Plus className="w-5 h-5"/></button>
            </div>
        </div>
        
        <div className={`flex items-center justify-between ${isLight ? 'bg-white' : 'bg-white/5'} p-4 rounded-2xl`}>
            <span className="font-bold text-sm">Tip Amount</span>
            <FormattedNumberInput className={`${inputClass} w-24 p-2 rounded-lg text-right font-bold`} value={form.tipAmount || ''} onChange={v => setForm({...form, tipAmount: Number(v)})} placeholder="0" isLight={isLight} />
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl text-white shadow-xl">
            <div className="flex justify-between items-center mb-2 opacity-80 text-sm">
                <span>Total Bill</span>
                <span>{formatCurrency(total)}</span>
            </div>
            <div className="h-px bg-white/20 my-2"></div>
            <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Per Person</span>
                <span className="font-bold text-3xl">{formatCurrency(perPerson)}</span>
            </div>
        </div>
        
        <GlassButton variant="accent" className="w-full !py-4 text-lg" onClick={() => { if(form.title && (form.payees?.length||0) > 0) { setSplitBills(prev => [...prev, { ...form, id: generateId(), totalAmount: total } as SplitBill]); setMode('LIST'); } else alert("Add title and at least one person"); }}>Save Bill</GlassButton>
      </div>
  )
};

const EMICalculator: React.FC<{ 
    loanOffers: LoanOffer[];
    setLoanOffers: React.Dispatch<React.SetStateAction<LoanOffer[]>>;
    formatCurrency: (v: number) => string; 
    isLight: boolean; 
}> = ({ loanOffers, setLoanOffers, formatCurrency, isLight }) => {
    // ... (Keep existing EMI logic)
    const [tab, setTab] = useState<'CALC' | 'COMPARE' | 'OFFERS'>('CALC');
    
    // Calculate State
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState('');
    const [tenure, setTenure] = useState('');
    const [tenureType, setTenureType] = useState('Years');

    // Compare State
    const [cmpA, setCmpA] = useState({ amount: '', rate: '', tenure: '' });
    const [cmpB, setCmpB] = useState({ amount: '', rate: '', tenure: '' });

    // Offers State
    const [offerForm, setOfferForm] = useState<Partial<LoanOffer>>({});
    const [showOfferModal, setShowOfferModal] = useState(false);

    const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/30';

    // Calculation Logic
    const calculate = (p: string, r: string, t: string) => {
        const P = parseFloat(p);
        const R = parseFloat(r);
        const N = tenureType === 'Years' ? parseFloat(t) * 12 : parseFloat(t);
        if(!P || !R || !N) return { emi: 0, total: 0, interest: 0 };
        const emi = calculateEMIValue(P, R, N);
        const total = emi * N;
        return { emi, total, interest: total - P };
    };

    const resA = calculate(amount, rate, tenure);
    
    const saveOffer = () => {
        if(!offerForm.provider || !offerForm.amount) return;
        setLoanOffers(prev => [...prev, {
            id: generateId(),
            provider: offerForm.provider!,
            offerName: offerForm.offerName || 'Loan Offer',
            amount: Number(offerForm.amount),
            interestRate: Number(offerForm.interestRate),
            tenure: Number(offerForm.tenure),
            processingFee: Number(offerForm.processingFee || 0),
            dateAdded: getLocalDateString(new Date())
        }]);
        setShowOfferModal(false);
        setOfferForm({});
    };

    return (
        <div className="animate-enter space-y-6 h-full flex flex-col">
            {/* Tabs */}
            <div className={`flex p-1 rounded-xl ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                {['CALC', 'COMPARE', 'OFFERS'].map(t => (
                    <button 
                        key={t} 
                        onClick={() => setTab(t as any)} 
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t ? (isLight ? 'bg-white shadow text-blue-600' : 'bg-blue-600 text-white shadow-lg') : 'opacity-60'}`}
                    >
                        {t === 'CALC' ? 'Calculate' : t === 'COMPARE' ? 'Compare' : 'Saved Offers'}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {/* CALCULATE TAB */}
                {tab === 'CALC' && (
                    <div className="space-y-6 animate-enter">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs opacity-50 ml-1 uppercase font-bold">Loan Amount</label>
                                <FormattedNumberInput value={amount} onChange={setAmount} className={`${inputClass} w-full p-4 rounded-xl font-bold text-lg`} placeholder="e.g. 500000" isLight={isLight} />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs opacity-50 ml-1 uppercase font-bold">Interest Rate (%)</label>
                                    <input type="number" value={rate} onChange={e => setRate(e.target.value)} className={`${inputClass} w-full p-4 rounded-xl font-bold`} placeholder="e.g. 10" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs opacity-50 ml-1 uppercase font-bold">Duration</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} className={`${inputClass} w-full p-4 rounded-xl font-bold`} placeholder="e.g. 5" />
                                        <div className="flex flex-col gap-1 justify-center">
                                            <button onClick={() => setTenureType('Years')} className={`text-[10px] px-2 py-1 rounded ${tenureType === 'Years' ? 'bg-blue-500 text-white' : 'bg-white/10'}`}>Yr</button>
                                            <button onClick={() => setTenureType('Months')} className={`text-[10px] px-2 py-1 rounded ${tenureType === 'Months' ? 'bg-blue-500 text-white' : 'bg-white/10'}`}>Mo</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {resA.emi > 0 && (
                            <div className={`p-6 rounded-[32px] space-y-6 ${isLight ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100' : 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-white/10'}`}>
                                <div className="text-center">
                                    <p className="text-sm opacity-60 uppercase mb-1 font-bold">Monthly EMI</p>
                                    <p className={`text-5xl font-black tracking-tighter ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{formatCurrency(resA.emi)}</p>
                                </div>
                                
                                {/* Visual Bar */}
                                <div className="flex h-4 rounded-full overflow-hidden w-full">
                                    <div className="bg-emerald-400 h-full" style={{ width: `${(parseFloat(amount)/resA.total)*100}%` }}></div>
                                    <div className="bg-orange-400 h-full flex-1"></div>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider opacity-60">
                                    <span className="text-emerald-500">Principal {Math.round((parseFloat(amount)/resA.total)*100)}%</span>
                                    <span className="text-orange-500">Interest {Math.round((resA.interest/resA.total)*100)}%</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-gray-500/20">
                                    <div>
                                        <p className="text-xs opacity-60 uppercase">Total Interest</p>
                                        <p className="font-bold text-lg text-orange-500">{formatCurrency(resA.interest)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs opacity-60 uppercase">Total Payable</p>
                                        <p className="font-bold text-lg text-emerald-500">{formatCurrency(resA.total)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* COMPARE TAB */}
                {tab === 'COMPARE' && (
                    <div className="animate-enter space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/20 border-blue-500/30'}`}>
                                <h4 className="font-bold text-center mb-2 text-blue-500">Loan A</h4>
                                <FormattedNumberInput placeholder="Amount" value={cmpA.amount} onChange={v => setCmpA({...cmpA, amount: v})} className={`${inputClass} w-full p-2 mb-2 text-xs rounded-lg`} isLight={isLight} />
                                <input placeholder="Rate %" type="number" value={cmpA.rate} onChange={e => setCmpA({...cmpA, rate: e.target.value})} className={`${inputClass} w-full p-2 mb-2 text-xs rounded-lg`} />
                                <input placeholder="Years" type="number" value={cmpA.tenure} onChange={e => setCmpA({...cmpA, tenure: e.target.value})} className={`${inputClass} w-full p-2 text-xs rounded-lg`} />
                            </div>
                            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-purple-50 border-purple-100' : 'bg-purple-900/20 border-purple-500/30'}`}>
                                <h4 className="font-bold text-center mb-2 text-purple-500">Loan B</h4>
                                <FormattedNumberInput placeholder="Amount" value={cmpB.amount} onChange={v => setCmpB({...cmpB, amount: v})} className={`${inputClass} w-full p-2 mb-2 text-xs rounded-lg`} isLight={isLight} />
                                <input placeholder="Rate %" type="number" value={cmpB.rate} onChange={e => setCmpB({...cmpB, rate: e.target.value})} className={`${inputClass} w-full p-2 mb-2 text-xs rounded-lg`} />
                                <input placeholder="Years" type="number" value={cmpB.tenure} onChange={e => setCmpB({...cmpB, tenure: e.target.value})} className={`${inputClass} w-full p-2 text-xs rounded-lg`} />
                            </div>
                        </div>

                        {(() => {
                            const rA = calculate(cmpA.amount, cmpA.rate, cmpA.tenure);
                            const rB = calculate(cmpB.amount, cmpB.rate, cmpB.tenure);
                            if(rA.total > 0 && rB.total > 0) {
                                const diff = Math.abs(rA.total - rB.total);
                                const better = rA.total < rB.total ? 'Loan A' : 'Loan B';
                                return (
                                    <div className={`p-5 rounded-2xl text-center border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                                        <p className="text-sm opacity-60 uppercase font-bold">Total Payment Difference</p>
                                        <p className="text-3xl font-bold text-emerald-500 my-2">{formatCurrency(diff)}</p>
                                        <p className="text-sm">
                                            You save by choosing <span className="font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-500">{better}</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 mt-4 text-xs opacity-70">
                                            <div>A: {formatCurrency(rA.total)}</div>
                                            <div>B: {formatCurrency(rB.total)}</div>
                                        </div>
                                    </div>
                                )
                            }
                            return null;
                        })()}
                    </div>
                )}

                {/* OFFERS TAB */}
                {tab === 'OFFERS' && (
                    <div className="animate-enter space-y-4">
                        <GlassButton onClick={() => setShowOfferModal(true)} className="w-full !py-3 bg-blue-600 text-white"><Icons.Plus className="w-5 h-5"/> Add Loan Offer</GlassButton>
                        {loanOffers.map(offer => {
                            const res = calculateEMIValue(offer.amount, offer.interestRate, offer.tenure);
                            return (
                                <div key={offer.id} className={`p-4 rounded-2xl border relative ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-lg">{offer.provider}</h4>
                                            <p className="text-xs opacity-50">{offer.offerName}</p>
                                        </div>
                                        <button onClick={() => setLoanOffers(prev => prev.filter(o => o.id !== offer.id))} className="text-red-400 p-1"><Icons.Trash className="w-4 h-4"/></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 my-3">
                                        <div>
                                            <p className="text-[10px] opacity-50 uppercase">Amount</p>
                                            <p className="font-bold">{formatCurrency(offer.amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] opacity-50 uppercase">EMI</p>
                                            <p className="font-bold text-blue-500">{formatCurrency(res)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-[10px] font-bold opacity-60">
                                        <span className="bg-black/10 px-2 py-1 rounded">{offer.interestRate}% Interest</span>
                                        <span className="bg-black/10 px-2 py-1 rounded">{offer.tenure} Months</span>
                                    </div>
                                </div>
                            )
                        })}
                        {loanOffers.length === 0 && <p className="text-center opacity-40 text-sm py-10">No saved offers</p>}
                    </div>
                )}
            </div>

            {/* Save Offer Modal */}
            <Modal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} title="Save Loan Offer" isLight={isLight}>
                <div className="space-y-4">
                    <input placeholder="Loan Provider (e.g. City Bank)" className={`${inputClass} w-full p-3 rounded-xl`} value={offerForm.provider || ''} onChange={e => setOfferForm({...offerForm, provider: e.target.value})} />
                    <input placeholder="Offer Name (e.g. Personal Loan)" className={`${inputClass} w-full p-3 rounded-xl`} value={offerForm.offerName || ''} onChange={e => setOfferForm({...offerForm, offerName: e.target.value})} />
                    <FormattedNumberInput placeholder="Amount" value={offerForm.amount || ''} onChange={v => setOfferForm({...offerForm, amount: Number(v)})} className={`${inputClass} w-full p-3 rounded-xl`} isLight={isLight} />
                    <div className="flex gap-2">
                        <input type="number" placeholder="Rate %" className={`${inputClass} w-full p-3 rounded-xl`} value={offerForm.interestRate || ''} onChange={e => setOfferForm({...offerForm, interestRate: Number(e.target.value)})} />
                        <input type="number" placeholder="Months" className={`${inputClass} w-full p-3 rounded-xl`} value={offerForm.tenure || ''} onChange={e => setOfferForm({...offerForm, tenure: Number(e.target.value)})} />
                    </div>
                    <GlassButton variant="accent" onClick={saveOffer} className="w-full">Save Offer</GlassButton>
                </div>
            </Modal>
        </div>
    );
};

// --- Main Tools View Export ---
export const ToolsView: React.FC<{ 
  initialTool: string | null; 
  clearTool: () => void;
  savedCalcs: SavedCalculation[];
  setSavedCalcs: React.Dispatch<React.SetStateAction<SavedCalculation[]>>;
  splitBills: SplitBill[];
  setSplitBills: React.Dispatch<React.SetStateAction<SplitBill[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  tours: Tour[];
  setTours: React.Dispatch<React.SetStateAction<Tour[]>>;
  loans: Loan[];
  debts: Debt[];
  calendarEvents: CalendarEvent[];
  setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  loanOffers: LoanOffer[]; 
  setLoanOffers: React.Dispatch<React.SetStateAction<LoanOffer[]>>; 
  savingsGoals: SavingsGoal[]; 
  setSavingsGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>; 
  healthData: HealthData; // New prop
  setHealthData: React.Dispatch<React.SetStateAction<HealthData>>; // New prop
  openModal: (key: any, item?: any) => void;
  formatCurrency: (amount: number) => string;
  isLight: boolean;
  t: (key: any) => string;
}> = ({ initialTool, clearTool, savedCalcs, setSavedCalcs, splitBills, setSplitBills, notes, setNotes, tours, setTours, loans, debts, calendarEvents, setCalendarEvents, loanOffers, setLoanOffers, savingsGoals, setSavingsGoals, healthData, setHealthData, openModal, formatCurrency, isLight, t }) => {
     const [localTool, setLocalTool] = useState<string | null>(initialTool);
     
     useEffect(() => { 
         if (initialTool) {
             setLocalTool(initialTool);
             // Scroll to top when tool changes
             window.scrollTo(0,0);
         }
     }, [initialTool]);
     
     const handleBack = () => { 
         setLocalTool(null); 
         clearTool(); 
     };

     if (localTool === 'NOTES') return <NotesView notes={notes} openModal={openModal} onBack={handleBack} isLight={isLight} />;
     if (localTool === 'CALENDAR') return <CalendarView events={calendarEvents} setEvents={setCalendarEvents} loans={loans} debts={debts} onBack={handleBack} isLight={isLight} />;
     
     if (localTool) {
        let title = localTool;
        if(localTool === 'CALC') title = t('calculator');
        // BMI is handled by Health now
        if(localTool === 'EMI') title = t('emi');
        if(localTool === 'SPLIT') title = t('splitBill');
        if(localTool === 'TOUR') title = 'Tour Planner';
        if(localTool === 'GOALS') title = 'Savings Goals';

        if (localTool === 'HEALTH') {
            return <HealthView healthData={healthData} setHealthData={setHealthData} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} onBack={handleBack} isLight={isLight} />;
        }

        return (
           <div className="animate-enter h-full flex flex-col">
              <AppHeader title={title} onBack={handleBack} isLight={isLight} />
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {localTool === 'CALC' && <SimpleCalculator savedCalcs={savedCalcs} setSavedCalcs={setSavedCalcs} isLight={isLight} />}
                {localTool === 'EMI' && <EMICalculator loanOffers={loanOffers} setLoanOffers={setLoanOffers} formatCurrency={formatCurrency} isLight={isLight} />}
                {localTool === 'SPLIT' && <SplitBillComponent splitBills={splitBills} setSplitBills={setSplitBills} formatCurrency={formatCurrency} isLight={isLight} />}
                {localTool === 'TOUR' && <TourPlanner tours={tours} setTours={setTours} formatCurrency={formatCurrency} isLight={isLight} />}
                {localTool === 'GOALS' && <SavingsGoalTracker goals={savingsGoals} setGoals={setSavingsGoals} formatCurrency={formatCurrency} isLight={isLight} />}
              </div>
           </div>
        );
     }
     
     return null; 
};
