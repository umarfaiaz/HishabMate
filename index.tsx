
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabaseClient';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './components/Login';
import { VerifyEmail } from './components/VerifyEmail';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { AuthCallback } from './components/AuthCallback';
import { SetPin } from './components/SetPin';
import { PinLock } from './components/PinLock';
import { PinResetInfo } from './components/PinResetInfo';
import { ChangePin } from './components/ChangePin';

// Imports for original app logic
import { Icons } from './Icons';
import { GlassCard, GlassButton, Modal, AppHeader } from './components/UI';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, TRANSLATIONS } from './constants';
import { safeParse, generateId, formatCurrency } from './utils';
import { ToolsView } from './components/Tools';
import { Dashboard } from './components/Dashboard';
import { WalletView, AccountDetailView } from './components/Wallet';
import { SettingsView } from './components/Settings';
import { 
  TransactionForm, AccountForm, LoanForm, DebtForm, NoteForm
} from './components/Forms';
import { 
  Account, Transaction, Loan, Debt, Category, Note, SavedCalculation, 
  SplitBill, UserProfile, AuthState, Tour, CalendarEvent, LoanOffer, 
  SavingsGoal, HealthData 
} from './types';

// --- Connected App Logic ---
const MainAppContent = ({ session, onLogout }: { session: any, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [settingsInitialSubTab, setSettingsInitialSubTab] = useState<'MAIN' | 'CATS' | 'PROFILE' | 'CHANGE_PIN'>('MAIN');
  const [loadingData, setLoadingData] = useState(true);

  // Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [savedCalcs, setSavedCalcs] = useState<SavedCalculation[]>([]);
  const [splitBills, setSplitBills] = useState<SplitBill[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loanOffers, setLoanOffers] = useState<LoanOffer[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [healthData, setHealthData] = useState<HealthData>({ medicines: [], appointments: [], fitnessGoals: [], fitnessRoutines: [], waterIntake: { date: new Date().toISOString().slice(0, 10), count: 0 } });
  const [user, setUser] = useState<UserProfile>({ name: '', email: '', phone: '', dob: '', gender: 'MALE', currency: 'BDT', language: 'EN', theme: 'DARK' });
  
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [modals, setModals] = useState({ transaction: false, account: false, loan: false, debt: false, note: false });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewAccount, setViewAccount] = useState<string | null>(null);
  const activeAccount = viewAccount ? accounts.find(a => a.id === viewAccount) : null;

  // --- Supabase Data Loading ---
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      const userId = session.user.id;

      // 1. Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) setUser(profile);

      // 2. Accounts
      const { data: accs } = await supabase.from('accounts').select('*').eq('user_id', userId);
      if (accs && accs.length > 0) setAccounts(accs.map((a:any) => ({...a, last4Digits: a.last4_digits})));
      else {
         // Initialize Default Accounts for new user
         const defaults = INITIAL_ACCOUNTS.map(a => ({...a, user_id: userId, id: generateId()}));
         await supabase.from('accounts').insert(defaults);
         setAccounts(defaults);
      }

      // 3. Categories
      const { data: cats } = await supabase.from('categories').select('*').eq('user_id', userId);
      if (cats && cats.length > 0) setCategories(cats.map((c:any) => ({...c, isCustom: c.is_custom})));
      else {
         // Initialize Default Categories
         const defaults = INITIAL_CATEGORIES.map(c => ({...c, user_id: userId, is_custom: false, id: generateId()}));
         await supabase.from('categories').insert(defaults);
         setCategories(defaults);
      }

      // 4. Transactions
      const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', userId);
      if (txs) setTransactions(txs.map((t:any) => ({...t, categoryId: t.category_id, accountId: t.account_id, relatedId: t.related_id})));

      // 5. Loans & Debts
      const { data: lns } = await supabase.from('loans').select('*').eq('user_id', userId);
      if (lns) setLoans(lns.map((l:any) => ({...l, startDate: l.start_date, interestRate: l.interest_rate, tenureUnit: l.tenure_unit, paymentDay: l.payment_day, reminderEnabled: l.reminder_enabled})));

      const { data: dbs } = await supabase.from('debts').select('*').eq('user_id', userId);
      if (dbs) setDebts(dbs.map((d:any) => ({...d, startDate: d.start_date, dueDate: d.due_date})));

      // 6. Notes
      const { data: nts } = await supabase.from('notes').select('*').eq('user_id', userId);
      if (nts) setNotes(nts);

      // 7. Events
      const { data: evts } = await supabase.from('calendar_events').select('*').eq('user_id', userId);
      if (evts) setCalendarEvents(evts.map((e:any) => ({...e, startDate: e.start_date, endDate: e.end_date, startTime: e.start_time, isAllDay: e.is_all_day, recurrenceDays: e.recurrence_days, isSystem: e.is_system, relatedId: e.related_id})));

      // 8. Other Tools
      const { data: goals } = await supabase.from('savings_goals').select('*').eq('user_id', userId);
      if (goals) setSavingsGoals(goals.map((g:any) => ({...g, targetAmount: g.target_amount, currentAmount: g.current_amount})));

      const { data: offers } = await supabase.from('loan_offers').select('*').eq('user_id', userId);
      if (offers) setLoanOffers(offers.map((o:any) => ({...o, offerName: o.offer_name, interestRate: o.interest_rate, processingFee: o.processing_fee, dateAdded: o.date_added})));

      const { data: tours } = await supabase.from('tours').select('*').eq('user_id', userId);
      if (tours) setTours(tours.map((t:any) => ({...t, startDate: t.start_date, endDate: t.end_date, packingList: t.packing_list, tripType: t.trip_type})));

      const { data: splits } = await supabase.from('split_bills').select('*').eq('user_id', userId);
      if (splits) setSplitBills(splits.map((s:any) => ({...s, totalAmount: s.total_amount, tipAmount: s.tip_amount})));

      // Health Data Load (Simplified for multiple tables)
      const { data: meds } = await supabase.from('medicines').select('*').eq('user_id', userId);
      const { data: appts } = await supabase.from('doctor_appointments').select('*').eq('user_id', userId);
      const { data: fits } = await supabase.from('fitness_goals').select('*').eq('user_id', userId);
      const { data: routs } = await supabase.from('fitness_routines').select('*').eq('user_id', userId);
      const { data: water } = await supabase.from('water_intake_logs').select('*').eq('user_id', userId).eq('date', new Date().toISOString().slice(0,10)).single();
      
      setHealthData({
          medicines: meds || [],
          appointments: (appts || []).map((a:any) => ({...a, doctorName: a.doctor_name})),
          fitnessGoals: fits || [],
          fitnessRoutines: routs || [],
          waterIntake: { date: new Date().toISOString().slice(0,10), count: water?.count || 0 }
      });

      setLoadingData(false);
    };

    fetchData();
  }, [session]);

  const fmtCurrency = (amount: number) => formatCurrency(amount, user?.currency);
  const t = (key: any) => TRANSLATIONS['EN'][key] || key; 

  const openModal = (key: any, item: any = null) => { setEditingItem(item); setModals(prev => ({...prev, [key]: true})); };
  const closeModal = (key: any) => { setEditingItem(null); setModals(prev => ({...prev, [key]: false})); };

  // --- Database CRUD Wrappers ---
  
  // Generic delete helper
  const deleteItem = async (table: string, id: string, setter: any) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if(!error) setter((prev: any[]) => prev.filter(i => i.id !== id));
      closeModal(Object.keys(modals).find(k => modals[k as keyof typeof modals]) as any);
  };

  const transactionCRUD = {
      save: async (item: any) => {
          // Snake_case conversion for DB
          const dbItem = {
              id: item.id || generateId(),
              user_id: session.user.id,
              account_id: item.accountId,
              category_id: item.categoryId,
              type: item.type,
              amount: item.amount,
              date: item.date,
              note: item.note,
              related_id: item.relatedId
          };
          const { error } = await supabase.from('transactions').upsert(dbItem);
          if(!error) {
              setTransactions(prev => {
                  const exists = prev.find(t => t.id === item.id);
                  if(exists) return prev.map(t => t.id === item.id ? item : t);
                  return [item, ...prev];
              });
          }
          return dbItem;
      },
      remove: (id: string) => deleteItem('transactions', id, setTransactions)
  };

  const accountCRUD = {
      save: async (item: any) => {
          const dbItem = {
              id: item.id || generateId(),
              user_id: session.user.id,
              name: item.name,
              type: item.type,
              balance: item.balance,
              last4_digits: item.last4Digits
          };
          const { error } = await supabase.from('accounts').upsert(dbItem);
          if(!error) {
              setAccounts(prev => {
                  const exists = prev.find(a => a.id === item.id);
                  if(exists) return prev.map(a => a.id === item.id ? item : a);
                  return [...prev, item];
              });
              closeModal('account');
          }
      },
      remove: (id: string) => deleteItem('accounts', id, setAccounts)
  };

  // Loans & Debts use generic approach for now but should map fields
  const loanCRUD = {
      save: async (item: any) => {
          const dbItem = {
              id: item.id || generateId(),
              user_id: session.user.id,
              name: item.name,
              provider: item.provider,
              principal: item.principal,
              outstanding: item.outstanding,
              start_date: item.startDate,
              status: item.status,
              interest_rate: item.interestRate,
              tenure: item.tenure,
              tenure_unit: item.tenureUnit,
              emi: item.emi,
              payment_day: item.paymentDay,
              reminder_enabled: item.reminderEnabled
          };
          const { error } = await supabase.from('loans').upsert(dbItem);
          if(!error) {
              setLoans(prev => {
                  const exists = prev.find(l => l.id === item.id);
                  if(exists) return prev.map(l => l.id === item.id ? item : l);
                  return [item, ...prev];
              });
              closeModal('loan');
          }
      },
      remove: (id: string) => deleteItem('loans', id, setLoans)
  };

  const debtCRUD = {
      save: async (item: any) => {
          const dbItem = {
              id: item.id || generateId(),
              user_id: session.user.id,
              type: item.type,
              name: item.name,
              counterparty: item.counterparty,
              amount: item.amount,
              start_date: item.startDate,
              due_date: item.dueDate,
              status: item.status
          };
          const { error } = await supabase.from('debts').upsert(dbItem);
          if(!error) {
              setDebts(prev => {
                  const exists = prev.find(d => d.id === item.id);
                  if(exists) return prev.map(d => d.id === item.id ? item : d);
                  return [item, ...prev];
              });
              closeModal('debt');
          }
      },
      remove: (id: string) => deleteItem('debts', id, setDebts)
  };

  const noteCRUD = {
      save: async (item: any) => {
          const dbItem = {
              id: item.id || generateId(),
              user_id: session.user.id,
              title: item.title,
              type: item.type,
              content: item.content,
              color: item.color,
              date: item.date
          };
          const { error } = await supabase.from('notes').upsert(dbItem);
          if(!error) {
              setNotes(prev => {
                  const exists = prev.find(n => n.id === item.id);
                  if(exists) return prev.map(n => n.id === item.id ? item : n);
                  return [item, ...prev];
              });
              closeModal('note');
          }
      },
      remove: (id: string) => deleteItem('notes', id, setNotes)
  };

  // Complex Logic: Transaction + Account Balance Update
  const handleTransactionSave = async (tx: any) => {
      const amount = Number(tx.amount);
      const isEdit = !!editingItem;
      
      // 1. Calculate Balance Impact
      let balanceChange = 0;
      let targetAccountId = tx.accountId;

      if (!isEdit) {
          // New Transaction
          if (tx.type === 'INCOME' || tx.type === 'DEBT_SETTLEMENT') balanceChange = amount;
          if (tx.type === 'EXPENSE' || tx.type === 'LOAN_PAYMENT') balanceChange = -amount;

          // Debt logic fine-tuning
          if (tx.type === 'DEBT_SETTLEMENT') {
             const debt = debts.find(d => d.id === tx.relatedId);
             if (debt && debt.type === 'PAYABLE') balanceChange = -amount; // Paying debt reduces balance
          }
      } else {
          // Editing existing: Revert old effect, apply new effect
          const oldTx = transactions.find(t => t.id === editingItem.id);
          if (oldTx) {
             let revertChange = 0;
             if (oldTx.type === 'INCOME') revertChange = -oldTx.amount;
             if (oldTx.type === 'EXPENSE' || oldTx.type === 'LOAN_PAYMENT') revertChange = oldTx.amount;
             // (Simplified debt logic for edit for brevity, assuming type doesn't switch wildly)
             
             let newChange = 0;
             if (tx.type === 'INCOME') newChange = amount;
             if (tx.type === 'EXPENSE' || tx.type === 'LOAN_PAYMENT') newChange = -amount;
             
             balanceChange = revertChange + newChange;
             // Note: If accountId changed, this logic needs to be split into two account updates. 
             // For MVP, assuming account doesn't change on edit or just updating current target.
          }
      }

      // 2. Save Transaction
      const dbTx = {
          ...tx,
          id: tx.id || generateId()
      };
      await transactionCRUD.save(dbTx);

      // 3. Update Account Balance in DB
      if (balanceChange !== 0) {
          const account = accounts.find(a => a.id === targetAccountId);
          if (account) {
              const newBalance = account.balance + balanceChange;
              const { error } = await supabase.from('accounts').update({ balance: newBalance }).eq('id', targetAccountId);
              
              if (!error) {
                  setAccounts(prev => prev.map(a => a.id === targetAccountId ? { ...a, balance: newBalance } : a));
              }
          }
      }

      // 4. Update Loan/Debt Outstanding if applicable
      if (!isEdit) { // Only handle simple reduction for new txs for now
          if (tx.type === 'LOAN_PAYMENT' && tx.relatedId) {
             const loan = loans.find(l => l.id === tx.relatedId);
             if (loan) {
                 const newOutstanding = Math.max(0, loan.outstanding - amount);
                 await supabase.from('loans').update({ outstanding: newOutstanding }).eq('id', loan.id);
                 setLoans(prev => prev.map(l => l.id === loan.id ? { ...l, outstanding: newOutstanding } : l));
             }
          }
          if (tx.type === 'DEBT_SETTLEMENT' && tx.relatedId) {
             const debt = debts.find(d => d.id === tx.relatedId);
             if (debt) {
                 const newAmount = Math.max(0, debt.amount - amount);
                 const newStatus = newAmount === 0 ? 'PAID' : 'PENDING';
                 await supabase.from('debts').update({ amount: newAmount, status: newStatus }).eq('id', debt.id);
                 setDebts(prev => prev.map(d => d.id === debt.id ? { ...d, amount: newAmount, status: newStatus } : d));
             }
          }
      }

      closeModal('transaction');
  };

  // Sync user profile changes
  const handleUpdateUser = async (newProfile: UserProfile) => {
      const { error } = await supabase.from('profiles').update({
          name: newProfile.name,
          email: newProfile.email,
          phone: newProfile.phone,
          gender: newProfile.gender,
          currency: newProfile.currency,
          language: newProfile.language,
          theme: newProfile.theme
      }).eq('id', session.user.id);
      
      if (!error) setUser(newProfile);
  };

  const isLight = user?.theme === 'LIGHT';
  const isFemale = user?.gender === 'FEMALE';
  const mainClass = isLight ? 'bg-gray-50 text-gray-900' : 'text-white';
  const bgStyle = (!isLight && isFemale) ? { background: 'radial-gradient(circle, rgba(236,72,153,0.15), #050505)' } : {};

  if (loadingData) return <div className="h-screen flex items-center justify-center bg-black text-white"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;

  // Handling Change PIN view specially
  if (activeTab === 'settings' && settingsInitialSubTab === 'CHANGE_PIN') {
      return <ChangePin onBack={() => { setSettingsInitialSubTab('MAIN'); setActiveTab('settings'); }} />;
  }

  const ActivityList = () => (
    <div className="animate-enter pb-24 relative h-full">
        <AppHeader title={t('recentActivity')} isLight={isLight} />
        <div className="space-y-4">
            {transactions.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                const renderIcon = (iconName: string, className: string) => {
                    const IconComp = Icons[iconName as keyof typeof Icons] as any;
                    return IconComp ? <IconComp className={className} /> : <Icons.Grid className={className} />;
                };
                return (
                    <GlassCard key={tx.id} isLight={isLight} onClick={() => openModal('transaction', tx)} className="!p-4 flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-white'}`}>
                                {tx.type === 'LOAN_PAYMENT' ? '🏦' : tx.type === 'DEBT_SETTLEMENT' ? '🤝' : renderIcon(cat?.icon || 'Banknote', "w-5 h-5")}
                            </div>
                            <div>
                                <p className="font-bold">{tx.note || cat?.name || (tx.type === 'LOAN_PAYMENT' ? 'Loan Payment' : 'Debt Settlement')}</p>
                                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-white/50'}`}>{tx.date}</p>
                            </div>
                        </div>
                        <span className={tx.type === 'INCOME' ? 'text-emerald-500' : (isLight ? 'text-gray-900' : 'text-white')}>{fmtCurrency(tx.amount)}</span>
                    </GlassCard>
                )
            })}
        </div>
        <button onClick={() => openModal('transaction')} className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center z-50"><Icons.Plus className="w-8 h-8"/></button>
    </div>
  );

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${mainClass}`} style={bgStyle}>
      <main className="flex-1 relative h-full overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-0 pb-32">
          <div className="max-w-4xl mx-auto space-y-8">
            {activeAccount ? <AccountDetailView account={activeAccount} transactions={transactions} categories={categories} setViewAccount={setViewAccount} openModal={openModal} formatCurrency={fmtCurrency} isLight={isLight} isFemale={isFemale} /> : (
              <>
                {activeTab === 'dashboard' && (
                    activeTool ? (
                        <ToolsView 
                            initialTool={activeTool} 
                            clearTool={() => setActiveTool(null)}
                            savedCalcs={savedCalcs} setSavedCalcs={setSavedCalcs}
                            splitBills={splitBills} setSplitBills={setSplitBills}
                            notes={notes} setNotes={setNotes}
                            tours={tours} setTours={setTours}
                            loans={loans} debts={debts}
                            calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents}
                            loanOffers={loanOffers} setLoanOffers={setLoanOffers}
                            savingsGoals={savingsGoals} setSavingsGoals={setSavingsGoals}
                            healthData={healthData} setHealthData={setHealthData}
                            openModal={openModal} formatCurrency={fmtCurrency} isLight={isLight} t={t}
                        />
                    ) : (
                        <Dashboard 
                            user={user} accounts={accounts} transactions={transactions} 
                            currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
                            categories={categories} formatCurrency={fmtCurrency} 
                            setActiveTab={setActiveTab} setActiveTool={setActiveTool} 
                            openModal={openModal} t={t} calendarEvents={calendarEvents}
                            loans={loans} debts={debts} onProfileClick={() => { setSettingsInitialSubTab('PROFILE'); setActiveTab('settings'); }}
                        />
                    )
                )}
                {activeTab === 'wallet' && <WalletView accounts={accounts} loans={loans} debts={debts} openModal={openModal} setViewAccount={setViewAccount} formatCurrency={fmtCurrency} isLight={isLight} t={t} />}
                {(activeTab === 'activity' || activeTab === 'transactions') && <ActivityList />}
                {activeTab === 'settings' && <SettingsView user={user} setUser={handleUpdateUser} categories={categories} setCategories={setCategories} setAuthState={onLogout} generateId={generateId} t={t} initialSubTab={settingsInitialSubTab} />}
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        {!viewAccount && !activeTool && (
          <div className={`fixed bottom-6 left-6 right-6 ${isLight ? 'bg-white/90 border-gray-200' : 'bg-[#1c1c1e]/90 border-white/10'} backdrop-blur-xl border p-1.5 rounded-[24px] flex justify-between shadow-2xl z-40 max-w-md mx-auto`}>
            {['dashboard', 'wallet', 'activity', 'settings'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-[20px] transition-all duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : (isLight ? 'text-gray-400 hover:text-gray-600' : 'text-white/40 hover:text-white')}`}>
                {tab === 'dashboard' && <Icons.Home className="w-5 h-5" />}
                {tab === 'wallet' && <Icons.Wallet className="w-5 h-5" />}
                {tab === 'activity' && <Icons.List className="w-5 h-5" />}
                {tab === 'settings' && <Icons.Settings className="w-5 h-5" />}
                <span className="text-[9px] font-bold mt-0.5 capitalize">{tab === 'dashboard' ? 'Home' : tab === 'activity' ? 'Activity' : tab}</span>
              </button>
            ))}
          </div>
        )}

        {/* Modals */}
        <Modal isOpen={modals.transaction} onClose={() => closeModal('transaction')} title={editingItem ? 'Edit Transaction' : 'New Transaction'} isLight={isLight}>
          <TransactionForm editingItem={editingItem} accounts={accounts} categories={categories} loans={loans} debts={debts} onSave={handleTransactionSave} onDelete={transactionCRUD.remove} closeModal={() => closeModal('transaction')} openAccountModal={() => openModal('account')} formatCurrency={fmtCurrency} isLight={isLight} />
        </Modal>
        <Modal isOpen={modals.account} onClose={() => closeModal('account')} title={editingItem ? 'Edit Account' : 'New Account'} isLight={isLight}>
          <AccountForm editingItem={editingItem} onSave={accountCRUD.save} onDelete={accountCRUD.remove} isLight={isLight} />
        </Modal>
        <Modal isOpen={modals.loan} onClose={() => closeModal('loan')} title={editingItem ? 'Edit Loan' : 'New Loan'} isLight={isLight}>
          <LoanForm editingItem={editingItem} onSave={loanCRUD.save} onDelete={loanCRUD.remove} isLight={isLight} />
        </Modal>
        <Modal isOpen={modals.debt} onClose={() => closeModal('debt')} title={editingItem ? 'Edit Debt Record' : 'New Debt Record'} isLight={isLight}>
          <DebtForm editingItem={editingItem} onSave={debtCRUD.save} onDelete={debtCRUD.remove} isLight={isLight} />
        </Modal>
        <Modal isOpen={modals.note} onClose={() => closeModal('note')} title={editingItem ? 'Edit Note' : 'New Note'} isLight={isLight}>
          <NoteForm editingItem={editingItem} onSave={noteCRUD.save} onDelete={noteCRUD.remove} isLight={isLight} />
        </Modal>
      </main>
    </div>
  );
};

// --- Orchestrator Component ---
const AppOrchestrator = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pinStatus, setPinStatus] = useState<'LOADING' | 'SET' | 'NOT_SET'>('LOADING');
  const [isLocked, setIsLocked] = useState(true);
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    // 1. Check Session safely
    const initSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            setSession(session);
            if (session) await checkPin(session.user.id);
            else setLoading(false);
        } catch (err) {
            console.error("Auth init failed:", err);
            setLoading(false); // Stop loading to allow fallback UI (Login) to render
        }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkPin(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkPin = async (userId: string) => {
    try {
        const { data, error } = await supabase.from('profiles').select('pin_hash').eq('id', userId).single();
        if (error && error.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows"
           console.warn("Error checking PIN:", error.message);
        }
        
        if (data?.pin_hash) {
          setPinStatus('SET');
        } else {
          setPinStatus('NOT_SET');
        }
    } catch (e) {
        console.error("Critical PIN check error:", e);
        setPinStatus('NOT_SET');
    }
    setLoading(false);
  };

  // URL Routing Handling
  if (route.startsWith('/auth/callback')) return <AuthCallback />;
  if (route.startsWith('/reset-password')) return <ResetPassword />;
  if (route.startsWith('/forgot-password')) return <ForgotPassword />;
  if (route.startsWith('/verify-email')) return <VerifyEmail />;
  if (route.startsWith('/pin-reset-info')) return <PinResetInfo />;

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;

  if (!session) return <Login />;

  if (pinStatus === 'NOT_SET') return <SetPin onSuccess={() => { setPinStatus('SET'); setIsLocked(false); }} />;

  if (isLocked) return <PinLock onSuccess={() => setIsLocked(false)} />;

  return <MainAppContent session={session} onLogout={() => supabase.auth.signOut()} />;
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <AppOrchestrator />
    </ErrorBoundary>
  );
}
