
import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { GlassButton, FormattedNumberInput, CustomSelect, CustomDatePicker } from './UI';
import { ACCOUNT_GROUPS } from '../constants';
import { ListItem, Loan, Debt } from '../types';

export const NoteForm: React.FC<{ 
  editingItem: any; 
  onSave: (item: any) => void; 
  onDelete: (id: string) => void; 
  isLight?: boolean;
}> = ({ editingItem, onSave, onDelete, isLight }) => {
     
     // Classified Color Palettes
     const PALETTES = {
         'Minimal': [
            { bg: isLight ? '#ffffff' : '#1c1c1e', border: isLight ? '#e5e7eb' : '#333' }, 
            { bg: '#e5e5e5', border: '#d4d4d4' },
            { bg: '#fafafa', border: '#f4f4f5' },
         ],
         'Pastel': [
            { bg: '#fee2e2', border: '#fca5a5' }, // Red
            { bg: '#ffedd5', border: '#fdba74' }, // Orange
            { bg: '#fef9c3', border: '#fde047' }, // Yellow
            { bg: '#dcfce7', border: '#86efac' }, // Green
            { bg: '#dbeafe', border: '#93c5fd' }, // Blue
            { bg: '#e0e7ff', border: '#a5b4fc' }, // Indigo
            { bg: '#fae8ff', border: '#f0abfc' }, // Fuchsia
         ],
         'Vibrant': [
             { bg: '#f87171', border: '#ef4444' },
             { bg: '#fbbf24', border: '#f59e0b' },
             { bg: '#34d399', border: '#10b981' },
             { bg: '#60a5fa', border: '#3b82f6' },
             { bg: '#a78bfa', border: '#8b5cf6' },
         ]
     };

     const [form, setForm] = useState(editingItem || { 
         title: '', 
         type: 'TEXT', 
         content: '', 
         color: isLight ? '#ffffff' : '#1c1c1e' 
     });
     
     const [items, setItems] = useState<ListItem[]>(editingItem?.type === 'LIST' ? JSON.parse(editingItem.content) : []);
     const [newItemText, setNewItemText] = useState('');

     const handleAddItem = () => {
         if (newItemText.trim()) {
             setItems([...items, { text: newItemText, checked: false }]);
             setNewItemText('');
         }
     };

     // Determine text color based on background brightness
     const isDarkColor = (color: string) => {
         if (['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'].includes(color)) return true; // Vibrant colors
         return color === '#1c1c1e';
     };
     
     const dynamicTextColor = isDarkColor(form.color) ? 'text-white' : 'text-gray-900';
     const dynamicPlaceholder = isDarkColor(form.color) ? 'placeholder-white/40' : 'placeholder-gray-400';
     const dynamicBorder = isDarkColor(form.color) ? 'border-white/20' : 'border-black/10';

     return (
        <div className={`flex flex-col h-full -m-6 p-6 transition-colors duration-300`} style={{ backgroundColor: form.color }}>
           {/* Form Content */}
           <div className={`flex-1 overflow-y-auto`}>
               <input 
                  placeholder="Title" 
                  className={`w-full text-2xl font-bold bg-transparent outline-none mb-4 ${dynamicPlaceholder} ${dynamicTextColor}`}
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
               />
               
               {form.type === 'TEXT' ? (
                  <textarea 
                     placeholder="Note" 
                     className={`w-full bg-transparent outline-none resize-none min-h-[150px] leading-relaxed text-lg ${dynamicPlaceholder} ${dynamicTextColor}`}
                     value={form.content} 
                     onChange={e => setForm({...form, content: e.target.value})} 
                  />
               ) : (
                  <div className="space-y-3">
                     {items.map((it, idx) => (
                        <div key={idx} className="flex gap-3 items-center group">
                           <button onClick={() => setItems(prev => prev.map((x,i) => i===idx ? {...x, checked: !x.checked} : x))} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${it.checked ? 'bg-black/40 border-transparent' : dynamicBorder}`}>
                               {it.checked && <Icons.CheckSquare className="w-3 h-3 text-white"/>}
                           </button>
                           <input 
                              value={it.text} 
                              onChange={e => setItems(prev => prev.map((x,i) => i===idx ? {...x, text: e.target.value} : x))} 
                              className={`flex-1 bg-transparent outline-none text-lg ${it.checked ? 'line-through opacity-50' : ''} ${dynamicTextColor}`} 
                           />
                           <button onClick={() => setItems(prev => prev.filter((_,i) => i !== idx))} className={`opacity-0 group-hover:opacity-100 p-2 ${dynamicTextColor} hover:opacity-50`}>
                               <Icons.X className="w-5 h-5"/>
                           </button>
                        </div>
                     ))}
                     <div className="flex gap-3 items-center mt-2 border-t pt-2 border-dashed border-gray-500/20">
                        <Icons.Plus className={`w-5 h-5 opacity-40 ${dynamicTextColor}`}/>
                        <input 
                            placeholder="List item" 
                            className={`flex-1 bg-transparent outline-none text-lg ${dynamicPlaceholder} ${dynamicTextColor}`}
                            value={newItemText} 
                            onChange={e => setNewItemText(e.target.value)}
                            onKeyDown={e => { if(e.key === 'Enter') handleAddItem(); }}
                        />
                     </div>
                  </div>
               )}
           </div>

           {/* Aesthetic Color Picker */}
           <div className="pt-4 mt-2 shrink-0">
               <div className="mb-4 space-y-3">
                   {Object.entries(PALETTES).map(([category, colors]) => (
                       <div key={category} className="flex items-center gap-2">
                           <span className={`text-[10px] font-bold uppercase w-12 opacity-50 ${dynamicTextColor}`}>{category}</span>
                           <div className="flex gap-2 overflow-x-auto no-scrollbar">
                               {colors.map(c => (
                                   <button 
                                     key={c.bg} 
                                     onClick={() => setForm({...form, color: c.bg})} 
                                     className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${form.color === c.bg ? 'scale-110 shadow-md ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-105'}`} 
                                     style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }} 
                                   />
                               ))}
                           </div>
                       </div>
                   ))}
               </div>

               <div className={`flex justify-between items-center border-t pt-4 ${dynamicBorder}`}>
                   <div className="flex gap-2">
                       <button 
                          onClick={() => setForm({...form, type: form.type === 'TEXT' ? 'LIST' : 'TEXT'})} 
                          className={`p-3 rounded-xl text-xs font-bold transition-colors ${isDarkColor(form.color) ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-black/5 text-black hover:bg-black/10'}`}
                       >
                           {form.type === 'TEXT' ? 'Make List' : 'Make Text'}
                       </button>
                       {editingItem && (
                           <button onClick={() => onDelete(editingItem.id)} className={`p-3 rounded-xl text-red-500 hover:bg-red-500/10`}>
                               <Icons.Trash className="w-5 h-5"/>
                           </button>
                       )}
                   </div>
                   <GlassButton variant="accent" onClick={() => onSave({...form, content: form.type === 'LIST' ? JSON.stringify(items) : form.content, date: new Date().toLocaleDateString()})}>
                       {editingItem ? 'Save' : 'Create'}
                   </GlassButton>
               </div>
           </div>
        </div>
     );
};

export const TransactionForm: React.FC<{ 
  editingItem: any; 
  accounts: any[];
  categories: any[];
  loans?: Loan[];
  debts?: Debt[];
  onSave: (item: any) => void;
  onDelete: (id: string) => void;
  closeModal: () => void;
  openAccountModal: () => void;
  formatCurrency: (amount: number) => string;
  isLight?: boolean;
}> = ({ editingItem, accounts, categories, loans = [], debts = [], onSave, onDelete, closeModal, openAccountModal, formatCurrency, isLight }) => {
    const hasAccounts = accounts.length > 0;
    const [form, setForm] = useState(editingItem || { 
      type: 'EXPENSE', 
      amount: '', 
      note: '', 
      categoryId: '', 
      accountId: accounts[0]?.id || '',
      relatedId: '' // For loans or debts
    });
    
    // Derived state for transaction mode
    const [mode, setMode] = useState<'REGULAR' | 'LOAN' | 'DEBT'>('REGULAR');

    useEffect(() => {
        if(editingItem) {
            if(editingItem.type === 'LOAN_PAYMENT') setMode('LOAN');
            else if(editingItem.type === 'DEBT_SETTLEMENT') setMode('DEBT');
            else setMode('REGULAR');
        }
    }, [editingItem]);

    // Auto-fill EMI amount when loan is selected
    useEffect(() => {
        if (mode === 'LOAN' && form.relatedId && !editingItem) {
            const loan = loans.find(l => l.id === form.relatedId);
            if (loan && loan.emi) {
                setForm(prev => ({ ...prev, amount: loan.emi!.toString() }));
            }
        }
    }, [form.relatedId, mode, loans, editingItem]);

    const renderIcon = (iconName: string, className: string) => {
       const IconComp = Icons[iconName as keyof typeof Icons];
       // @ts-ignore
       return IconComp ? <IconComp className={className} /> : <Icons.Grid className={className} />;
    };

    // Build options for Selects
    const categoryOptions = categories.filter(c => c.type === form.type).map(c => ({ 
        label: c.name, 
        value: c.id, 
        icon: renderIcon(c.icon, "w-5 h-5") 
    }));
    const accountOptions = accounts.map(a => ({ label: `${a.name} (${a.type})`, value: a.id }));
    const loanOptions = loans.filter(l => l.status === 'ACTIVE').map(l => ({ label: `${l.name} (Due: ${formatCurrency(l.outstanding)})`, value: l.id }));
    const debtOptions = debts.filter(d => d.status === 'PENDING').map(d => ({ label: `${d.counterparty} (${d.type === 'PAYABLE' ? 'You owe' : 'Owes you'}: ${formatCurrency(d.amount)})`, value: d.id }));

    if (!hasAccounts) return <div className="text-center p-6"><p className="mb-4">Create an account first.</p><GlassButton onClick={()=>{closeModal(); openAccountModal();}}>Add Account</GlassButton></div>;
    
    const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/40';

    return (
      <div className="space-y-4">
        {/* Type Selector Tabs */}
        {!editingItem && (
          <div className={`${isLight ? 'bg-gray-100' : 'bg-white/5'} p-1 rounded-xl flex mb-2 overflow-x-auto no-scrollbar`}>
             {['REGULAR', 'LOAN', 'DEBT'].map(m => (
                <button 
                  key={m} 
                  onClick={() => { setMode(m as any); setForm({...form, type: m === 'REGULAR' ? 'EXPENSE' : (m === 'LOAN' ? 'LOAN_PAYMENT' : 'DEBT_SETTLEMENT'), relatedId: ''}); }} 
                  className={`flex-1 py-2 px-3 whitespace-nowrap rounded-lg text-xs font-bold transition-all ${mode === m ? (isLight ? 'bg-white shadow text-black' : 'bg-white/20 shadow-lg text-white') : (isLight ? 'text-gray-400' : 'text-white/40')}`}
                >
                  {m === 'REGULAR' ? 'Income/Exp' : m === 'LOAN' ? 'Pay Loan' : 'Settle Debt'}
                </button>
             ))}
          </div>
        )}

        {/* Regular Income/Expense Toggle */}
        {mode === 'REGULAR' && (
           <div className={`${isLight ? 'bg-gray-100' : 'bg-white/5'} p-1 rounded-xl flex`}>
              {['EXPENSE', 'INCOME'].map(type => (
                 <button key={type} onClick={() => setForm({...form, type})} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${form.type === type ? (type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400') : (isLight ? 'text-gray-400' : 'text-white/40')}`}>
                    {type}
                 </button>
              ))}
           </div>
        )}

        <FormattedNumberInput 
            placeholder="0.00" 
            className={`w-full bg-transparent text-5xl font-bold text-center py-6 outline-none ${isLight ? 'text-gray-900 border-none' : 'text-white'}`} 
            value={form.amount} 
            onChange={val => setForm({...form, amount: val})} 
            isLight={isLight}
        />
        
        <div className="space-y-3">
          {mode === 'REGULAR' && (
             <CustomSelect 
                options={categoryOptions} 
                value={form.categoryId} 
                onChange={val => setForm({...form, categoryId: val})} 
                placeholder="Select Category"
                className="z-30" 
                isLight={isLight}
             />
          )}

          {mode === 'LOAN' && (
             <CustomSelect 
                options={loanOptions} 
                value={form.relatedId} 
                onChange={val => setForm({...form, relatedId: val})} 
                placeholder="Select Loan to Pay"
                className="z-30"
                isLight={isLight}
             />
          )}

          {mode === 'DEBT' && (
             <CustomSelect 
                options={debtOptions} 
                value={form.relatedId} 
                onChange={val => setForm({...form, relatedId: val})} 
                placeholder="Select Debt to Settle"
                className="z-30"
                isLight={isLight}
             />
          )}

          <div className={`flex items-center rounded-xl border relative z-20 ${isLight ? 'bg-white border-gray-200' : 'bg-[#1c1c1e] border-white/10'}`}>
             <div className={`px-4 ${isLight ? 'text-gray-400' : 'text-white/40'}`}><Icons.Wallet className="w-5 h-5"/></div>
             <div className="flex-1">
                 <CustomSelect 
                    options={accountOptions}
                    value={form.accountId}
                    onChange={val => setForm({...form, accountId: val})}
                    className="border-none"
                    placeholder="Select Account"
                    isLight={isLight}
                 />
             </div>
          </div>

          <input type="text" placeholder="Note (optional)" className={`${inputClass} w-full rounded-xl p-4 outline-none`} value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
          
          <div className="relative z-10">
             <CustomDatePicker
                value={form.date || new Date().toISOString().slice(0,10)}
                onChange={val => setForm({...form, date: val})}
                placeholder="Select Date"
                isLight={isLight}
             />
          </div>
        </div>

        <div className={`flex gap-2 mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
           {editingItem && <GlassButton variant="danger" onClick={() => onDelete(editingItem.id)}><Icons.Trash className="w-5 h-5"/></GlassButton>}
           <GlassButton variant="accent" className="flex-1" onClick={() => { 
              if(!form.amount || Number(form.amount) <= 0) { alert('Please enter a valid amount'); return; }
              if(mode === 'LOAN' && !form.relatedId) { alert('Please select a loan'); return; }
              if(mode === 'DEBT' && !form.relatedId) { alert('Please select a debt'); return; }
              onSave({...form, amount: Number(form.amount), date: form.date || new Date().toISOString().slice(0,10)});
           }}>
              {editingItem ? 'Update Transaction' : 'Save Transaction'}
           </GlassButton>
        </div>
      </div>
    );
};

export const AccountForm: React.FC<{ 
  editingItem: any; 
  onSave: (item: any) => void; 
  onDelete: (id: string) => void;
  isLight?: boolean;
}> = ({ editingItem, onSave, onDelete, isLight }) => {
     const findGroup = (type: string) => {
        for (const [group, types] of Object.entries(ACCOUNT_GROUPS)) {
           if (types.includes(type)) return group;
        }
        return Object.keys(ACCOUNT_GROUPS)[0];
     };

     const [form, setForm] = useState(editingItem || { name: '', balance: '', type: 'Cash (Wallet)', last4Digits: '' });
     const [selectedGroup, setSelectedGroup] = useState(() => findGroup(form.type));
     
     const handleGroupChange = (group: string) => {
        setSelectedGroup(group);
        const firstType = ACCOUNT_GROUPS[group as keyof typeof ACCOUNT_GROUPS][0];
        setForm(prev => ({ ...prev, type: firstType }));
     };

     const groupOptions = Object.keys(ACCOUNT_GROUPS).map(g => ({ label: g, value: g }));
     const typeOptions = ACCOUNT_GROUPS[selectedGroup as keyof typeof ACCOUNT_GROUPS].map(t => ({ label: t, value: t }));
     
     const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/40';

     return (
       <div className="space-y-4">
         <CustomSelect 
            label="Account Group" 
            options={groupOptions} 
            value={selectedGroup} 
            onChange={handleGroupChange} 
            className="z-20"
            isLight={isLight}
         />

         <CustomSelect 
            label="Account Type" 
            options={typeOptions} 
            value={form.type} 
            onChange={val => setForm({...form, type: val})} 
            className="z-10"
            isLight={isLight}
         />

         <div>
            <label className={`text-xs mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Account Name</label>
            <input placeholder="e.g. City Bank Salary" className={`${inputClass} w-full p-4 rounded-xl`} value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
         </div>
         
         <div className="flex gap-2">
            <div className="flex-[2]">
                <label className={`text-xs mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Current Balance</label>
                <FormattedNumberInput 
                   placeholder="0.00" 
                   className={`${inputClass} w-full p-4 rounded-xl font-bold text-lg`} 
                   value={form.balance} 
                   onChange={val=>setForm({...form, balance: val})}
                   isLight={isLight}
                />
            </div>
            <div className="flex-1">
                 <label className={`text-xs mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Last 4 Digits</label>
                 <input 
                    placeholder="1234" 
                    maxLength={4}
                    className={`${inputClass} w-full p-4 rounded-xl font-mono text-center`} 
                    value={form.last4Digits || ''} 
                    onChange={e=> { if(/^\d*$/.test(e.target.value)) setForm({...form, last4Digits:e.target.value}) }}
                 />
            </div>
         </div>

         <div className="flex gap-2 mt-4">
           {editingItem && <GlassButton variant="danger" onClick={()=>onDelete(editingItem.id)}><Icons.Trash className="w-5 h-5"/></GlassButton>}
           <GlassButton variant="accent" className="flex-1" onClick={()=>onSave({...form, balance:Number(form.balance)})}>Save Account</GlassButton>
         </div>
       </div>
     );
};

export const LoanForm: React.FC<{ 
  editingItem: any; 
  onSave: (item: any) => void; 
  onDelete: (id: string) => void;
  isLight?: boolean;
}> = ({ editingItem, onSave, onDelete, isLight }) => {
     const [form, setForm] = useState<Partial<Loan>>(editingItem || { 
        name: '', 
        provider: '',
        principal: '', 
        interestRate: '', 
        tenure: 12, 
        tenureUnit: 'MONTHS', 
        startDate: new Date().toISOString().slice(0, 10),
        status: 'ACTIVE',
        paymentDay: 1,
        reminderEnabled: false,
        reminderDate: ''
     });

     const calculatePaidEMIs = () => {
         if (!form.startDate) return 0;
         const start = new Date(form.startDate);
         const now = new Date();
         const monthDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
         const dayPassed = now.getDate() >= (form.paymentDay || 1);
         const estimated = Math.max(0, monthDiff + (dayPassed ? 0 : -1));
         return estimated;
     };

     const calculateEMI = () => {
        const P = Number(form.principal);
        const R = Number(form.interestRate) / 12 / 100;
        let N = Number(form.tenure);
        if (form.tenureUnit === 'YEARS') N = N * 12;
        if (form.tenureUnit === 'WEEKS') N = N / 4.33; 
        if (form.tenureUnit === 'DAYS') N = N / 30; 
        
        if (P && R && N) {
           const E = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
           return isFinite(E) ? Math.round(E) : 0;
        }
        return 0;
     };

     const emi = calculateEMI();
     const emiPaidCount = calculatePaidEMIs();
     const totalPaid = emiPaidCount * emi;
     
     const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/40';

     return (
        <div className="space-y-4">
           <div>
              <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Loan Provider</label>
              <input placeholder="e.g. City Bank, John Doe" className={`${inputClass} w-full p-4 rounded-xl`} value={form.provider || ''} onChange={e=>setForm({...form, provider:e.target.value})}/>
           </div>
           
           <div>
              <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Loan Name</label>
              <input placeholder="e.g. Home Loan" className={`${inputClass} w-full p-4 rounded-xl`} value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
           </div>
           
           <div className="flex gap-4">
              <div className="flex-1">
                 <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Principal Amount</label>
                 <FormattedNumberInput 
                    className={`${inputClass} w-full p-4 rounded-xl font-bold`} 
                    value={form.principal || ''} 
                    onChange={val=>setForm({...form, principal: val})}
                    isLight={isLight}
                 />
              </div>
              <div className="w-1/3">
                 <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Interest %</label>
                 <input type="number" className={`${inputClass} w-full p-4 rounded-xl`} value={form.interestRate} onChange={e=>setForm({...form, interestRate:e.target.value})}/>
              </div>
           </div>

           <div className="flex gap-2">
              <div className="flex-1">
                 <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Duration</label>
                 <input type="number" className={`${inputClass} w-full p-4 rounded-xl`} value={form.tenure} onChange={e=>setForm({...form, tenure:Number(e.target.value)})}/>
              </div>
              <div className="flex-1">
                 <CustomSelect 
                    label="Unit"
                    value={form.tenureUnit || 'MONTHS'}
                    onChange={val => setForm({...form, tenureUnit: val as any})}
                    options={[
                        {label:'Years', value:'YEARS'},
                        {label:'Months', value:'MONTHS'}, 
                        {label:'Weeks', value:'WEEKS'}, 
                        {label:'Days', value:'DAYS'}
                    ]}
                    isLight={isLight}
                 />
              </div>
           </div>

           <div className="flex gap-2">
              <div className="flex-[2]">
                 <CustomDatePicker 
                    label="Start Date"
                    value={form.startDate || ''}
                    onChange={val => setForm({...form, startDate: val})}
                    isLight={isLight}
                    className="z-20"
                 />
              </div>
              <div className="flex-1">
                 <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Pay Day</label>
                 <input type="number" min="1" max="31" placeholder="Day (1-31)" className={`${inputClass} w-full p-4 rounded-xl`} value={form.paymentDay} onChange={e=>setForm({...form, paymentDay:Number(e.target.value)})}/>
              </div>
           </div>

           {/* Stats Block */}
           {form.startDate && Number(form.principal) > 0 && (
              <div className={`${isLight ? 'bg-gray-100 border border-gray-200' : 'bg-white/5 border-white/5'} p-4 rounded-xl grid grid-cols-2 gap-4 border`}>
                 <div>
                    <p className={`text-[10px] uppercase ${isLight ? 'text-gray-500' : 'text-white/50'}`}>EMIs Paid (Est.)</p>
                    <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{emiPaidCount} <span className="text-xs font-normal opacity-50">months</span></p>
                 </div>
                 <div>
                     <p className={`text-[10px] uppercase ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Amount Paid (Est.)</p>
                     <p className="text-lg font-bold text-emerald-400">{totalPaid.toLocaleString()}</p>
                 </div>
              </div>
           )}

           <div className={`${isLight ? 'bg-gray-100 border border-gray-200' : 'bg-white/5 border border-white/5'} p-4 rounded-xl border`}>
              <div className="flex justify-between items-center mb-2">
                 <label className={`text-xs uppercase tracking-wider font-bold ${isLight ? 'text-gray-600' : 'text-white/70'}`}>Smart Payment Reminder</label>
                 <input type="checkbox" checked={form.reminderEnabled || false} onChange={e => setForm({...form, reminderEnabled: e.target.checked})} className="w-5 h-5 accent-blue-500 rounded" />
              </div>
           </div>

           {Number(form.interestRate) > 0 && (
              <div className={`${isLight ? 'bg-gray-100' : 'bg-white/5'} p-4 rounded-xl text-center`}>
                 <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Estimated Monthly Installment (EMI)</p>
                 <p className="text-xl font-bold text-blue-400">{emi.toLocaleString()}</p>
              </div>
           )}

           <div className={`flex gap-2 mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              {editingItem && <GlassButton variant="danger" onClick={()=>onDelete(editingItem.id)}><Icons.Trash className="w-5 h-5"/></GlassButton>}
              <GlassButton variant="accent" className="flex-1" onClick={() => {
                 if (!form.principal || Number(form.principal) <= 0) { alert('Principal amount must be greater than 0'); return; }
                 onSave({
                    ...form, 
                    principal: Number(form.principal),
                    interestRate: Number(form.interestRate),
                    emi: emi, 
                    outstanding: form.outstanding || Number(form.principal)
                 })
              }}>Save Loan</GlassButton>
           </div>
        </div>
     );
};

export const DebtForm: React.FC<{ 
  editingItem: any; 
  onSave: (item: any) => void; 
  onDelete: (id: string) => void;
  isLight?: boolean;
}> = ({ editingItem, onSave, onDelete, isLight }) => {
     const [form, setForm] = useState(editingItem || { 
        type: 'PAYABLE', 
        name: '', 
        counterparty: '', 
        amount: '',
        startDate: new Date().toISOString().slice(0, 10),
        dueDate: ''
     });

     const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/40';

     return (
        <div className="space-y-4">
           <div className="flex gap-2">
              <button onClick={()=>setForm({...form, type:'PAYABLE'})} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${form.type==='PAYABLE'?'bg-rose-500/20 border-rose-500 text-rose-400': (isLight ? 'border-gray-200 text-gray-400' : 'border-white/10 text-white/40')}`}>You Owe</button>
              <button onClick={()=>setForm({...form, type:'RECEIVABLE'})} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${form.type==='RECEIVABLE'?'bg-emerald-500/20 border-emerald-500 text-emerald-400': (isLight ? 'border-gray-200 text-gray-400' : 'border-white/10 text-white/40')}`}>Owed To You</button>
           </div>
           
           <div>
              <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Person Name</label>
              <input placeholder="Who?" className={`${inputClass} w-full p-4 rounded-xl`} value={form.counterparty} onChange={e=>setForm({...form, counterparty:e.target.value})}/>
           </div>

           <div>
              <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Reason / Note</label>
              <input placeholder="What for?" className={`${inputClass} w-full p-4 rounded-xl`} value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
           </div>

           <div>
              <label className={`text-xs opacity-50 mb-1 ml-1 block uppercase tracking-wider font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Amount</label>
              <FormattedNumberInput 
                 placeholder="0.00" 
                 className={`${inputClass} w-full p-4 rounded-xl font-bold text-lg`} 
                 value={form.amount} 
                 onChange={val=>setForm({...form, amount: val})}
                 isLight={isLight}
              />
           </div>

           <div className="flex gap-2">
              <div className="flex-1">
                 <CustomDatePicker 
                    label="Taken Date"
                    value={form.startDate}
                    onChange={val => setForm({...form, startDate: val})}
                    isLight={isLight}
                    className="z-20"
                 />
              </div>
              <div className="flex-1">
                 <CustomDatePicker 
                    label="Due Date"
                    value={form.dueDate}
                    onChange={val => setForm({...form, dueDate: val})}
                    isLight={isLight}
                    className="z-10"
                 />
              </div>
           </div>

           <div className={`flex gap-2 mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              {editingItem && <GlassButton variant="danger" onClick={()=>onDelete(editingItem.id)}><Icons.Trash className="w-5 h-5"/></GlassButton>}
              <GlassButton variant="accent" className="flex-1" onClick={() => {
                  if (!form.amount || Number(form.amount) <= 0) { alert('Amount must be greater than 0'); return; }
                  onSave({...form, amount:Number(form.amount), status:'PENDING'});
              }}>Save Record</GlassButton>
           </div>
        </div>
     );
};
