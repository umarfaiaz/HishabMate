
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Icons } from './Icons';
import { GlassCard, GlassButton, Modal, AppHeader } from './components/UI';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, TRANSLATIONS } from './constants';
import { safeParse, generateId, formatCurrency } from './utils';
import { RegistrationAndPin } from './components/Auth';
import { ToolsView } from './components/Tools';
import { Dashboard } from './components/Dashboard';
import { WalletView, AccountDetailView } from './components/Wallet';
import { SettingsView } from './components/Settings';
import { NotesView } from './components/Notes';
import { CalendarView } from './components/Calendar';
import { 
  TransactionForm, 
  AccountForm, 
  LoanForm, 
  DebtForm, 
  NoteForm
} from './components/Forms';
import { 
  Account, 
  Transaction, 
  Loan, 
  Debt, 
  Category, 
  Note, 
  SavedCalculation, 
  SplitBill, 
  UserProfile,
  AuthState,
  Tour,
  CalendarEvent,
  LoanOffer,
  SavingsGoal,
  HealthData
} from './types';

const MoneyManagerApp = () => {
  const [authState, setAuthState] = useState<AuthState>('REGISTER');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  // State for Settings Sub-navigation when accessed via Dashboard
  const [settingsInitialSubTab, setSettingsInitialSubTab] = useState<'MAIN' | 'CATS' | 'PROFILE' | 'CHANGE_PIN'>('MAIN');

  // Data State
  const [accounts, setAccounts] = useState<Account[]>(() => safeParse('accounts', INITIAL_ACCOUNTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse('transactions', []));
  const [loans, setLoans] = useState<Loan[]>(() => safeParse('loans', []));
  const [debts, setDebts] = useState<Debt[]>(() => safeParse('debts', []));
  const [categories, setCategories] = useState<Category[]>(() => safeParse('categories', INITIAL_CATEGORIES));
  const [notes, setNotes] = useState<Note[]>(() => safeParse('notes', []));
  const [savedCalcs, setSavedCalcs] = useState<SavedCalculation[]>(() => safeParse('saved_calcs', []));
  const [splitBills, setSplitBills] = useState<SplitBill[]>(() => safeParse('split_bills', []));
  const [tours, setTours] = useState<Tour[]>(() => safeParse('tours', []));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => safeParse('calendar_events', []));
  const [loanOffers, setLoanOffers] = useState<LoanOffer[]>(() => safeParse('loan_offers', []));
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => safeParse('savings_goals', []));
  const [healthData, setHealthData] = useState<HealthData>(() => safeParse('health_data', { medicines: [], appointments: [], fitnessGoals: [], fitnessRoutines: [], waterIntake: { date: new Date().toISOString().slice(0, 10), count: 0 } }));

  const [user, setUser] = useState<UserProfile>(() => safeParse('user_profile', { theme: 'DARK' }));
  
  // UI State
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [modals, setModals] = useState({ transaction: false, account: false, loan: false, debt: false, note: false });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewAccount, setViewAccount] = useState<string | null>(null);
  const lastActive = useRef(Date.now());

  // Derived state for the active account view to prevent crashes
  const activeAccount = viewAccount ? accounts.find(a => a.id === viewAccount) : null;

  // Auto Lock Logic
  useEffect(() => {
    const handleActivity = () => { lastActive.current = Date.now(); };
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    
    const interval = setInterval(() => {
      if (authState === 'AUTHENTICATED' && Date.now() - lastActive.current > 10 * 60 * 1000) {
        setAuthState('LOGIN');
      }
    }, 30000);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(interval);
    };
  }, [authState]);

  // Safety Effect: If viewing an account that gets deleted, return to wallet
  useEffect(() => {
    if (viewAccount && !activeAccount) {
        setViewAccount(null);
    }
  }, [viewAccount, activeAccount]);

  const fmtCurrency = (amount: number) => formatCurrency(amount, user?.currency);
  
  // Translation Helper
  const t = (key: keyof typeof TRANSLATIONS['EN']) => {
      const lang = user?.language as keyof typeof TRANSLATIONS || 'EN';
      return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['EN'][key] || key;
  };

  useEffect(() => {
    if (authState === 'AUTHENTICATED') {
      localStorage.setItem('accounts', JSON.stringify(accounts));
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('loans', JSON.stringify(loans));
      localStorage.setItem('debts', JSON.stringify(debts));
      localStorage.setItem('categories', JSON.stringify(categories));
      localStorage.setItem('notes', JSON.stringify(notes));
      localStorage.setItem('saved_calcs', JSON.stringify(savedCalcs));
      localStorage.setItem('split_bills', JSON.stringify(splitBills));
      localStorage.setItem('tours', JSON.stringify(tours));
      localStorage.setItem('calendar_events', JSON.stringify(calendarEvents));
      localStorage.setItem('loan_offers', JSON.stringify(loanOffers));
      localStorage.setItem('savings_goals', JSON.stringify(savingsGoals));
      localStorage.setItem('health_data', JSON.stringify(healthData));
      localStorage.setItem('user_profile', JSON.stringify(user));
    }
  }, [accounts, transactions, loans, debts, categories, notes, savedCalcs, splitBills, tours, calendarEvents, loanOffers, savingsGoals, healthData, user, authState]);

  // Reset Water Intake Daily
  useEffect(() => {
     const today = new Date().toISOString().slice(0, 10);
     if (healthData.waterIntake?.date !== today) {
         setHealthData(prev => ({ ...prev, waterIntake: { date: today, count: 0 } }));
     }
  }, []);

  const openModal = (key: keyof typeof modals, item: any = null) => { setEditingItem(item); setModals(prev => ({...prev, [key]: true})); };
  const closeModal = (key: keyof typeof modals) => { setEditingItem(null); setModals(prev => ({...prev, [key]: false})); };

  // CRUD
  const generateCRUDFunctions = <T extends { id: string }>(state: T[], setState: React.Dispatch<React.SetStateAction<T[]>>, modalKey: keyof typeof modals) => ({
    save: (item: any) => {
      if (editingItem) setState(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...item } : i));
      else setState(prev => [{ ...item, id: generateId() } as T, ...prev]);
      closeModal(modalKey);
    },
    remove: (id: string) => { setState(prev => prev.filter(i => i.id !== id)); closeModal(modalKey); }
  });

  const transactionCRUD = generateCRUDFunctions(transactions, setTransactions, 'transaction');
  const accountCRUD = generateCRUDFunctions(accounts, setAccounts, 'account');
  const loanCRUD = generateCRUDFunctions(loans, setLoans, 'loan');
  const debtCRUD = generateCRUDFunctions(debts, setDebts, 'debt');
  const noteCRUD = generateCRUDFunctions(notes, setNotes, 'note');

  const handleTransactionSave = (tx: any) => {
      transactionCRUD.save(tx);
      const amount = Number(tx.amount);

      if (!editingItem) {
          let balanceChange = 0;
          if (tx.type === 'INCOME' || tx.type === 'DEBT_SETTLEMENT') balanceChange = amount;
          if (tx.type === 'EXPENSE' || tx.type === 'LOAN_PAYMENT') balanceChange = -amount;

          if (tx.type === 'DEBT_SETTLEMENT') {
             const debt = debts.find(d => d.id === tx.relatedId);
             if (debt) {
                if (debt.type === 'PAYABLE') balanceChange = -amount; 
                else balanceChange = amount; 
             }
          }

          setAccounts(prev => prev.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + balanceChange } : a));

          if (tx.type === 'LOAN_PAYMENT' && tx.relatedId) {
             setLoans(prev => prev.map(l => l.id === tx.relatedId ? { ...l, outstanding: Math.max(0, l.outstanding - amount) } : l));
          }

          if (tx.type === 'DEBT_SETTLEMENT' && tx.relatedId) {
             setDebts(prev => prev.map(d => {
                if(d.id === tx.relatedId) {
                   const remaining = Math.max(0, d.amount - amount);
                   return { ...d, amount: remaining, status: remaining === 0 ? 'PAID' : 'PENDING' };
                }
                return d;
             }));
          }

      } else {
          const oldTx = transactions.find(t => t.id === editingItem.id);
          if (oldTx) {
             let revertChange = 0;
             if (oldTx.type === 'INCOME') revertChange = -oldTx.amount;
             if (oldTx.type === 'EXPENSE' || oldTx.type === 'LOAN_PAYMENT') revertChange = oldTx.amount;
             
             let newChange = 0;
             if (tx.type === 'INCOME') newChange = amount;
             if (tx.type === 'EXPENSE' || tx.type === 'LOAN_PAYMENT') newChange = -amount;

             setAccounts(prev => prev.map(a => {
                 if (a.id === tx.accountId) return { ...a, balance: a.balance + revertChange + newChange };
                 return a;
             }));
          }
      }
  };

  const renderIcon = (iconName: string, className: string) => {
    const IconComp = Icons[iconName as keyof typeof Icons] as any;
    return IconComp ? <IconComp className={className} /> : <Icons.Grid className={className} />;
 };

  if (authState !== 'AUTHENTICATED') return <RegistrationAndPin onAuthenticated={(profile) => { setUser(profile); setAuthState('AUTHENTICATED'); }} />;

  const isLight = user?.theme === 'LIGHT';
  const isFemale = user?.gender === 'FEMALE';

  const mainClass = isLight 
    ? (isFemale ? 'bg-pink-50 text-gray-900 selection:bg-pink-500/30' : 'bg-gray-50 text-gray-900 selection:bg-blue-500/30') 
    : (isFemale ? 'text-white selection:bg-pink-500/30' : 'text-white selection:bg-blue-500/30');

  const bgStyle = (!isLight && isFemale) ? {
      background: `radial-gradient(at 0% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
                   radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
                   radial-gradient(at 100% 100%, rgba(244, 114, 182, 0.15) 0px, transparent 50%),
                   radial-gradient(at 0% 100%, rgba(192, 132, 252, 0.15) 0px, transparent 50%),
                   #050505`
  } : {};

  // Simple Activity/Transaction List View
  const ActivityList = () => (
    <div className="animate-enter pb-24 relative h-full">
        <AppHeader title={t('recentActivity')} isLight={isLight} />
        <div className="space-y-4">
            {transactions.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                return (
                    <GlassCard isLight={isLight} key={tx.id} onClick={() => openModal('transaction', tx)} className="!p-4 flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-white'}`}>
                                {tx.type === 'LOAN_PAYMENT' ? '🏦' : tx.type === 'DEBT_SETTLEMENT' ? '🤝' : renderIcon(cat?.icon || 'Banknote', "w-6 h-6")}
                            </div>
                            <div>
                                <p className="font-bold">{tx.note || cat?.name || (tx.type === 'LOAN_PAYMENT' ? 'Loan Payment' : 'Debt Settlement')}</p>
                                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-white/50'}`}>{tx.date}</p>
                            </div>
                        </div>
                        <span className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : (isLight ? 'text-gray-900' : 'text-white')}`}>
                            {tx.type === 'INCOME' ? '+' : '-'}{fmtCurrency(tx.amount)}
                        </span>
                    </GlassCard>
                )
            })}
            {transactions.length === 0 && <p className="text-center opacity-50 py-10">No transactions found</p>}
        </div>
        
        {/* Floating Add Button for Activity List */}
        <button 
            onClick={() => openModal('transaction')} 
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg flex items-center justify-center z-50 hover:scale-105 active:scale-95 transition-transform"
        >
            <Icons.Plus className="w-8 h-8"/>
        </button>
    </div>
  );

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${mainClass}`} style={bgStyle}>
      <main className="flex-1 relative h-full overflow-hidden flex flex-col">
        {/* Fixed gap issue by removing pt-2 and relying on padding in headers or spacing components */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-0 pb-32">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Defensive rendering for account view */}
            {activeAccount ? <AccountDetailView account={activeAccount} transactions={transactions} categories={categories} setViewAccount={setViewAccount} openModal={openModal} formatCurrency={fmtCurrency} isLight={isLight} isFemale={isFemale} /> : (
              <>
                {activeTab === 'dashboard' && (
                    activeTool ? (
                        <ToolsView 
                            initialTool={activeTool} 
                            clearTool={() => setActiveTool(null)}
                            savedCalcs={savedCalcs}
                            setSavedCalcs={setSavedCalcs}
                            splitBills={splitBills}
                            setSplitBills={setSplitBills}
                            notes={notes}
                            setNotes={setNotes}
                            tours={tours}
                            setTours={setTours}
                            loans={loans}
                            debts={debts}
                            calendarEvents={calendarEvents}
                            setCalendarEvents={setCalendarEvents}
                            loanOffers={loanOffers}
                            setLoanOffers={setLoanOffers}
                            savingsGoals={savingsGoals}
                            setSavingsGoals={setSavingsGoals}
                            healthData={healthData}
                            setHealthData={setHealthData}
                            openModal={openModal}
                            formatCurrency={fmtCurrency}
                            isLight={isLight}
                            t={t}
                        />
                    ) : (
                        <Dashboard 
                            user={user} 
                            accounts={accounts} 
                            transactions={transactions} 
                            currentMonth={currentMonth} 
                            setCurrentMonth={setCurrentMonth}
                            categories={categories} 
                            formatCurrency={fmtCurrency} 
                            setActiveTab={setActiveTab} 
                            setActiveTool={setActiveTool} 
                            openModal={openModal} 
                            t={t}
                            calendarEvents={calendarEvents}
                            loans={loans}
                            debts={debts}
                            onProfileClick={() => {
                                setSettingsInitialSubTab('PROFILE');
                                setActiveTab('settings');
                            }}
                        />
                    )
                )}
                {activeTab === 'wallet' && <WalletView accounts={accounts} loans={loans} debts={debts} openModal={openModal} setViewAccount={setViewAccount} formatCurrency={fmtCurrency} isLight={isLight} t={t} />}
                {(activeTab === 'activity' || activeTab === 'transactions') && <ActivityList />}
                {activeTab === 'settings' && <SettingsView user={user} setUser={setUser} categories={categories} setCategories={setCategories} setAuthState={setAuthState} generateId={generateId} t={t} initialSubTab={settingsInitialSubTab} />}
              </>
            )}
          </div>
        </div>

        {/* Compact Bottom Navigation */}
        {!viewAccount && !activeTool && (
          <div className={`fixed bottom-6 left-6 right-6 ${isLight ? 'bg-white/90 border-gray-200' : 'bg-[#1c1c1e]/90 border-white/10'} backdrop-blur-xl border p-1.5 rounded-[24px] flex justify-between shadow-2xl z-40 max-w-md mx-auto`}>
            {['dashboard', 'wallet', 'activity', 'settings'].map(tab => (
              <button 
                key={tab} 
                onClick={() => {
                    setActiveTab(tab);
                    if(tab === 'settings') setSettingsInitialSubTab('MAIN'); // Reset settings state if manually clicked
                }} 
                className={`flex-1 flex flex-col items-center justify-center py-2 rounded-[20px] transition-all duration-300 ${activeTab === tab ? (isFemale ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30') : (isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-white/40 hover:bg-white/5')}`}
              >
                {tab === 'dashboard' && <Icons.Home className="w-5 h-5" />}
                {tab === 'wallet' && <Icons.Wallet className="w-5 h-5" />}
                {tab === 'activity' && <Icons.List className="w-5 h-5" />}
                {tab === 'settings' && <Icons.Settings className="w-5 h-5" />}
                <span className="text-[9px] font-bold mt-0.5 capitalize">{tab === 'dashboard' ? t('home') : tab === 'activity' ? t('recentActivity') : t(tab as any)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Modals */}
        <Modal isOpen={modals.transaction} onClose={() => closeModal('transaction')} title={editingItem ? 'Edit Transaction' : 'New Transaction'} isLight={isLight}>
          <TransactionForm editingItem={editingItem} accounts={accounts} categories={categories} loans={loans} debts={debts} onSave={handleTransactionSave} onDelete={transactionCRUD.remove} closeModal={() => closeModal('transaction')} openAccountModal={() => openModal('account')} formatCurrency={fmtCurrency} />
        </Modal>
        <Modal isOpen={modals.account} onClose={() => closeModal('account')} title={editingItem ? 'Edit Account' : 'New Account'} isLight={isLight}>
          <AccountForm editingItem={editingItem} onSave={accountCRUD.save} onDelete={accountCRUD.remove} />
        </Modal>
        <Modal isOpen={modals.loan} onClose={() => closeModal('loan')} title={editingItem ? 'Edit Loan' : 'New Loan'} isLight={isLight}>
          <LoanForm editingItem={editingItem} onSave={loanCRUD.save} onDelete={loanCRUD.remove} />
        </Modal>
        <Modal isOpen={modals.debt} onClose={() => closeModal('debt')} title={editingItem ? 'Edit Debt Record' : 'New Debt Record'} isLight={isLight}>
          <DebtForm editingItem={editingItem} onSave={debtCRUD.save} onDelete={debtCRUD.remove} />
        </Modal>
        <Modal isOpen={modals.note} onClose={() => closeModal('note')} title={editingItem ? 'Edit Note' : 'New Note'} isLight={isLight}>
          <NoteForm editingItem={editingItem} onSave={noteCRUD.save} onDelete={noteCRUD.remove} isLight={isLight} />
        </Modal>
      </main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <MoneyManagerApp />
    </ErrorBoundary>
  );
}
