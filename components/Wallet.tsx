
import React from 'react';
import { Icons } from '../Icons';
import { GlassCard, GlassButton, AppHeader } from './UI';
import { Account, Loan, Debt, Transaction, Category } from '../types';

// New Fancy Card Component for Wallet with specific branding colors
const FancyAccountCard: React.FC<{
    account: Account;
    onClick: () => void;
    formatCurrency: (val: number) => string;
}> = ({ account, onClick, formatCurrency }) => {
    // Determine gradient based on exact type or group
    let bgGradient = "from-gray-700 to-gray-900";
    
    const typeLower = account.type.toLowerCase();
    
    if (typeLower.includes("bkash")) bgGradient = "from-pink-500 to-rose-600";
    else if (typeLower.includes("nagad")) bgGradient = "from-orange-500 to-red-600";
    else if (typeLower.includes("rocket")) bgGradient = "from-purple-600 to-indigo-700";
    else if (typeLower.includes("upay")) bgGradient = "from-yellow-400 to-orange-500";
    else if (typeLower.includes("bank")) bgGradient = "from-blue-600 to-indigo-900";
    else if (typeLower.includes("cash")) bgGradient = "from-emerald-600 to-teal-800";
    else if (typeLower.includes("card")) bgGradient = "from-violet-600 to-purple-900";

    const maskedNumber = account.last4Digits ? `**** ${account.last4Digits}` : `**** ${account.id.slice(-4)}`;

    return (
        <div onClick={onClick} className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${bgGradient} text-white shadow-xl transform transition-transform active:scale-95 cursor-pointer h-48 flex flex-col justify-between`}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(255,255,255,0.2), transparent 50%)' }}></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">{account.name}</h3>
                    <p className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">({account.type})</p>
                </div>
                <div className="w-10 h-6 bg-white/20 rounded border border-white/30 relative overflow-hidden flex items-center justify-center">
                    <div className="w-6 h-4 border border-white/40 rounded-sm"></div>
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-3xl font-bold tracking-tight">{formatCurrency(account.balance)}</p>
                <div className="flex justify-between items-end mt-4">
                    <p className="text-xs font-mono opacity-60">**** **** {maskedNumber.slice(-4)}</p>
                    <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20"></div>
                        <div className="w-6 h-6 rounded-full bg-white/40 -ml-3"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AccountDetailView: React.FC<{
  account: Account;
  transactions: Transaction[];
  categories: Category[];
  setViewAccount: (id: string | null) => void;
  openModal: (key: any, item?: any) => void;
  formatCurrency: (val: number) => string;
  isLight?: boolean;
  isFemale?: boolean;
}> = ({ account, transactions, categories, setViewAccount, openModal, formatCurrency, isLight, isFemale }) => {
     const accTx = transactions.filter(t => t.accountId === account.id);
     
     const renderIcon = (iconName: string, className: string) => {
       const IconComp = Icons[iconName as keyof typeof Icons];
       // @ts-ignore
       return IconComp ? <IconComp className={className} /> : <Icons.LayoutGrid className={className} />;
     };
     
     // Determine header color based on type for details view too
     let headerGradient = isFemale ? 'from-pink-600 to-purple-900' : 'from-gray-800 to-black';
     const typeLower = account.type.toLowerCase();
     if (typeLower.includes("bkash")) headerGradient = "from-pink-500 to-rose-600";
     else if (typeLower.includes("nagad")) headerGradient = "from-orange-500 to-red-600";
     
     const maskedNumber = account.last4Digits ? `**** ${account.last4Digits}` : `**** ${account.id.slice(-4)}`;

     return (
        <div className="animate-enter pb-24">
           <AppHeader title={account.name} onBack={() => setViewAccount(null)} isLight={isLight} />
           
           <div className={`p-8 rounded-[32px] mb-8 text-center relative overflow-hidden shadow-2xl bg-gradient-to-br ${headerGradient}`}>
              <div className="relative z-10">
                 <h2 className="text-5xl font-bold mb-2 text-white tracking-tight">{formatCurrency(account.balance)}</h2>
                 <p className="text-white/70 text-sm mb-4 font-bold">{account.name} <span className="opacity-70 font-normal">({account.type})</span></p>
                 <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full backdrop-blur-md border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs text-white/80">Active • {maskedNumber}</span>
                 </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
           </div>

           <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>History</h3>
              <button onClick={() => openModal('account', account)} className={`text-xs font-bold flex items-center gap-1 ${isFemale ? 'text-pink-500' : 'text-blue-500'}`}><Icons.Edit className="w-3 h-3"/> Edit Account</button>
           </div>
           
           <div className="space-y-3">
              {accTx.map(tx => {
                 const cat = categories.find(c => c.id === tx.categoryId);
                 return (
                    <GlassCard isLight={isLight} key={tx.id} onClick={() => openModal('transaction', tx)} className="!p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-white'}`}>
                            {renderIcon(cat?.icon || 'Banknote', "w-5 h-5")}
                          </div>
                          <div><p className="font-medium text-sm">{tx.note || cat?.name}</p><p className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-white/40'}`}>{tx.date}</p></div>
                       </div>
                       <span className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : (isLight ? 'text-gray-900' : 'text-white')}`}>{tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                    </GlassCard>
                 )
              })}
              {accTx.length === 0 && <p className={`text-center py-8 ${isLight ? 'text-gray-400' : 'text-white/30'}`}>No transactions yet</p>}
           </div>
        </div>
     );
};

export const WalletView: React.FC<{
  accounts: Account[];
  loans: Loan[];
  debts: Debt[];
  openModal: (key: any, item?: any) => void;
  setViewAccount: (id: string | null) => void;
  formatCurrency: (val: number) => string;
  isLight?: boolean;
  t: (key: any) => string;
}> = ({ accounts, loans, debts, openModal, setViewAccount, formatCurrency, isLight, t }) => (
     <div className="animate-enter pb-24 space-y-8 relative">
        <div>
           <AppHeader title={t('myAccounts')} action={{icon: <Icons.Plus className="w-5 h-5" />, onClick: () => openModal('account')}} isLight={isLight} />
           
           {/* Fancy Account Cards Grid */}
           <div className="grid gap-4">
              {accounts.map(acc => (
                 <FancyAccountCard 
                    key={acc.id} 
                    account={acc} 
                    onClick={() => setViewAccount(acc.id)} 
                    formatCurrency={formatCurrency} 
                 />
              ))}
           </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-4"><h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t('loans')}</h2><GlassButton isLight={isLight} size="sm" onClick={() => openModal('loan')} className="!px-3 !py-2 !text-xs"><Icons.Plus className="w-4 h-4" /></GlassButton></div>
           <div className="space-y-3">
              {loans.map(loan => (
                 <GlassCard isLight={isLight} key={loan.id} onClick={() => openModal('loan', loan)} className="!p-4 flex justify-between items-center">
                    <div><h3 className="font-bold text-sm">{loan.name}</h3><p className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Outstanding</p></div>
                    <div className="text-right"><p className="font-bold text-rose-400">{formatCurrency(loan.outstanding)}</p><p className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Total: {formatCurrency(loan.principal)}</p></div>
                 </GlassCard>
              ))}
              {loans.length === 0 && <p className={`text-xs ${isLight ? 'text-gray-400' : 'text-white/30'}`}>No active loans</p>}
           </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-4"><h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t('debts')}</h2><GlassButton isLight={isLight} size="sm" onClick={() => openModal('debt')} className="!px-3 !py-2 !text-xs"><Icons.Plus className="w-4 h-4" /></GlassButton></div>
           <div className="space-y-3">
              {debts.map(debt => (
                 <GlassCard isLight={isLight} key={debt.id} onClick={() => openModal('debt', debt)} className="!p-4 flex justify-between items-center">
                    <div><h3 className="font-bold text-sm">{debt.counterparty}</h3><p className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-white/40'}`}>{debt.name}</p></div>
                    <span className={`font-bold ${debt.type === 'RECEIVABLE' ? 'text-emerald-500' : 'text-rose-400'}`}>{debt.type === 'RECEIVABLE' ? '+' : '-'}{formatCurrency(debt.amount)}</span>
                 </GlassCard>
              ))}
              {debts.length === 0 && <p className={`text-xs ${isLight ? 'text-gray-400' : 'text-white/30'}`}>No pending debts</p>}
           </div>
        </div>
     </div>
);
