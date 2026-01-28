
import React, { useState, useMemo } from 'react';
import { Icons } from '../Icons';
import { GlassCard, Modal, GlassButton } from './UI';
import { UserProfile, Account, Transaction, Category, CalendarEvent, Loan, Debt } from '../types';
import { getFinancialEvents } from '../utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Dashboard: React.FC<{
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  categories: Category[];
  formatCurrency: (val: number) => string;
  setActiveTab: (tab: string) => void;
  setActiveTool?: (tool: string) => void;
  openModal: (key: any, item?: any) => void;
  t: (key: any) => string;
  calendarEvents: CalendarEvent[];
  loans?: Loan[]; 
  debts?: Debt[];
  onProfileClick: () => void; 
}> = ({ user, accounts, transactions, currentMonth, setCurrentMonth, categories, formatCurrency, setActiveTab, setActiveTool, openModal, t, calendarEvents, loans = [], debts = [], onProfileClick }) => {
    
    // --- Stats Calculation ---
    const getMonthStats = () => {
        const startOfMonth = new Date(`${currentMonth}-01`);
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0); // Last day of selected month

        // 1. Current Global Balance (All accounts NOW)
        const currentGlobalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        // 2. Reverse transactions that happened AFTER the selected month to get Closing Balance of that month
        let changeAfterMonth = 0;
        // Filter transactions strictly after the end of the selected month
        const futureTx = transactions.filter(tx => new Date(tx.date) > endOfMonth);

        futureTx.forEach(tx => {
            if (tx.type === 'INCOME') changeAfterMonth += tx.amount;
            else if (tx.type === 'EXPENSE') changeAfterMonth -= tx.amount;
            else if (tx.type === 'LOAN_PAYMENT') changeAfterMonth -= tx.amount; // Expense-like
            else if (tx.type === 'DEBT_SETTLEMENT') {
                const debt = debts.find(d => d.id === tx.relatedId);
                // If I paid a debt (PAYABLE), balance decreased. Reverse = add back.
                // If I received a debt payment (RECEIVABLE), balance increased. Reverse = subtract.
                if (debt?.type === 'PAYABLE') changeAfterMonth -= tx.amount;
                else changeAfterMonth += tx.amount; 
            }
        });

        const closingBalance = currentGlobalBalance - changeAfterMonth;

        // 3. Calculate Stats DURING selected month
        const monthTx = transactions.filter(tx => tx.date.startsWith(currentMonth));
        let income = 0;
        let expense = 0;

        monthTx.forEach(tx => {
            if (tx.type === 'INCOME') income += tx.amount;
            else if (tx.type === 'EXPENSE' || tx.type === 'LOAN_PAYMENT') expense += tx.amount;
            else if (tx.type === 'DEBT_SETTLEMENT') {
                 const debt = debts.find(d => d.id === tx.relatedId);
                 if(debt?.type === 'PAYABLE') expense += tx.amount;
                 else income += tx.amount;
            }
        });

        // 4. Opening Balance = Closing - (Income - Expense)
        const netSavings = income - expense;
        const openingBalance = closingBalance - netSavings;

        return { openingBalance, closingBalance, income, expense, savings: netSavings };
    };

    const stats = useMemo(() => getMonthStats(), [accounts, transactions, currentMonth, debts]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const monthTx = transactions.filter(t => t.date.startsWith(currentMonth)).sort((a,b) => a.date.localeCompare(b.date));
        const monthName = new Date(`${currentMonth}-01`).toLocaleString('default', { month: 'long', year: 'numeric' });
        const generatedDate = new Date().toLocaleDateString();
        const userName = user.name || 'User';
        
        // Helper to format currency for PDF safely (replacing symbols like ৳ with Tk to prevent encoding issues)
        const safeFormatCurrency = (val: number) => {
             const symbol = user.currency === 'BDT' ? 'Tk' : (user.currency === 'INR' ? 'Rs' : '');
             // If we have a safe text symbol, use it. Otherwise rely on formatCurrency but strip non-ascii if needed.
             if (symbol) return `${symbol} ${val.toLocaleString()}`;
             
             // Fallback for USD, EUR etc which usually render fine, or default to simple number
             const standard = formatCurrency(val);
             // Simple check if it contains common supported symbols
             if (/[$€£]/.test(standard)) return standard;
             return `${val.toLocaleString()} ${user.currency}`;
        };

        // --- Design Constants ---
        const primaryColor = [37, 99, 235]; // Blue 600
        const darkColor = [31, 41, 55]; // Gray 800
        const lightGray = [249, 250, 251]; // Gray 50
        const successColor = [16, 185, 129]; // Emerald 500
        const dangerColor = [239, 68, 68]; // Red 500

        // --- Header Strip ---
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 45, 'F');
        
        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("Monthly Financial Statement", 14, 25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text("Generated via HishabMate", 14, 33);

        // Period & User Info
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(monthName, 196, 22, { align: 'right' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`User: ${userName}`, 196, 29, { align: 'right' });
        doc.text(`Date: ${generatedDate}`, 196, 35, { align: 'right' });

        // --- Summary Overview ---
        let yPos = 60;
        
        // Draw Summary Box Background
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.roundedRect(14, 50, 182, 35, 3, 3, 'F');
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(14, 50, 182, 35, 3, 3, 'S');

        // Helper for summary items
        const drawSummaryItem = (label: string, value: string, x: number, color: number[]) => {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'bold');
            doc.text(label.toUpperCase(), x, 62);
            
            doc.setFontSize(12);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(value, x, 72);
        };

        drawSummaryItem("Opening Balance", safeFormatCurrency(stats.openingBalance), 20, darkColor);
        drawSummaryItem("Total Income", safeFormatCurrency(stats.income), 65, successColor);
        drawSummaryItem("Total Expense", safeFormatCurrency(stats.expense), 110, dangerColor);
        
        // Closing Balance with Highlight
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(150, 55, 40, 25, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text("CLOSING", 170, 62, { align: 'center' });
        doc.setFontSize(11);
        doc.text(safeFormatCurrency(stats.closingBalance), 170, 72, { align: 'center' });

        // Net Savings Indicator
        yPos = 95;
        const savingsText = `Net Savings: ${safeFormatCurrency(stats.savings)}`;
        doc.setFontSize(10);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text(savingsText, 196, 90, { align: 'right' });


        // --- Transactions Table ---
        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Description', 'Category', 'Account', 'Amount']],
            body: monthTx.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                const acc = accounts.find(a => a.id === t.accountId);
                return [
                    t.date,
                    t.note || (t.type === 'LOAN_PAYMENT' ? 'Loan Payment' : t.type === 'DEBT_SETTLEMENT' ? 'Debt Settlement' : 'No description'),
                    cat?.name || '-',
                    acc?.name || 'Unknown',
                    (t.type === 'INCOME' ? '+' : '-') + safeFormatCurrency(t.amount)
                ];
            }),
            theme: 'striped',
            headStyles: { 
                fillColor: primaryColor, 
                textColor: [255, 255, 255], 
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: { 
                textColor: [50, 50, 50],
                fontSize: 9,
                cellPadding: 6
            },
            columnStyles: {
                0: { cellWidth: 25 },
                4: { halign: 'right', fontStyle: 'bold' } // Amount column
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            margin: { left: 14, right: 14 }
        });

        // Dynamic Filename
        const safeUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeMonth = currentMonth.replace('-', '_');
        doc.save(`Statement_${safeUserName}_${safeMonth}.pdf`);
    };

    const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);

    // Upcoming Events Logic
    const upcomingEvents = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const systemEvents = getFinancialEvents(loans, debts);
        const uniqueEvents = new Map<string, CalendarEvent>();
        calendarEvents.forEach(e => uniqueEvents.set(e.id, e));
        systemEvents.forEach(sysEv => { if (!uniqueEvents.has(sysEv.id)) uniqueEvents.set(sysEv.id, sysEv); });
        return Array.from(uniqueEvents.values()).filter(e => e.startDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 5);
    }, [calendarEvents, loans, debts]);
      
    const isLight = user.theme === 'LIGHT';

    // Updated Tool List
    const allTools = [
        { id: 'CALC', icon: Icons.Calculator, color: 'text-orange-500', bg: 'bg-orange-500/20', label: t('calculator') },
        { id: 'NOTES', icon: Icons.StickyNote, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: t('notes') },
        { id: 'CALENDAR', icon: Icons.Calendar, color: 'text-red-500', bg: 'bg-red-500/20', label: t('calendar') },
        { id: 'HEALTH', icon: Icons.Heart, color: 'text-emerald-500', bg: 'bg-emerald-500/20', label: 'Health Hub' },
        { id: 'SPLIT', icon: Icons.Coffee, color: 'text-purple-500', bg: 'bg-purple-500/20', label: t('splitBill') },
        { id: 'EMI', icon: Icons.Percent, color: 'text-blue-500', bg: 'bg-blue-500/20', label: t('emi') },
        { id: 'TOUR', icon: Icons.Map, color: 'text-pink-500', bg: 'bg-pink-500/20', label: 'Tour Planner' },
        { id: 'GOALS', icon: Icons.Target, color: 'text-cyan-500', bg: 'bg-cyan-500/20', label: 'Savings Goals' },
    ];

    const renderIcon = (iconName: string, className: string) => {
       const IconComp = Icons[iconName as keyof typeof Icons] as any;
       return IconComp ? <IconComp className={className} /> : <Icons.LayoutGrid className={className} />;
    };

    const changeMonth = (delta: number) => {
        const d = new Date(`${currentMonth}-01`);
        d.setMonth(d.getMonth() + delta);
        setCurrentMonth(d.toISOString().slice(0, 7));
    };

    return (
       <div className="animate-enter pb-24 space-y-6 relative">
          <div className={`flex justify-between items-center py-4 sticky top-0 z-50 backdrop-blur-md -mx-6 px-6 ${isLight ? 'bg-gray-50/80 border-b border-gray-200' : 'bg-black/80 border-b border-white/5'} transition-colors duration-300`}>
             <div><h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isLight ? 'from-gray-900 to-gray-600' : 'from-white to-gray-400'}`}>{t('welcome')}, {user?.name?.split(' ')[0] || 'User'}</h1></div>
             <button onClick={onProfileClick} className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform cursor-pointer">
                 <Icons.User className="w-5 h-5" />
             </button>
          </div>
          
          {/* Monthly Summary Card - Ultra Compact */}
          <div className={`rounded-[28px] p-5 relative overflow-hidden shadow-2xl ${isLight ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-200' : 'bg-gradient-to-br from-[#1c1c1e] to-black border border-white/10'}`}>
             
             {/* Header with Navigator */}
             <div className="flex justify-between items-center mb-4">
                 <button onClick={() => changeMonth(-1)} className={`p-1.5 rounded-full active:scale-90 transition ${isLight ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}><Icons.ArrowLeft className="w-4 h-4"/></button>
                 <div className="text-center">
                     <p className={`text-[9px] uppercase font-bold tracking-[0.2em] mb-0.5 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Statement</p>
                     <h2 className="text-base font-bold">{new Date(`${currentMonth}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                 </div>
                 <button onClick={() => changeMonth(1)} className={`p-1.5 rounded-full active:scale-90 transition ${isLight ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}><Icons.ChevronRight className="w-4 h-4"/></button>
             </div>

             {/* Main Balance Flow */}
             <div className="flex justify-between items-center mb-5 relative z-10 px-2">
                 <div>
                     <p className={`text-[9px] font-bold uppercase opacity-50 mb-0.5`}>Opening</p>
                     <p className={`text-sm font-bold font-mono tracking-tight ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{formatCurrency(stats.openingBalance)}</p>
                 </div>
                 <div className={`h-px flex-1 mx-3 opacity-30 ${isLight ? 'bg-gray-400' : 'bg-white/40'}`}>
                    <div className="w-full h-full flex items-center justify-center">
                         <div className={`w-1 h-1 rounded-full ${isLight ? 'bg-gray-300' : 'bg-white/30'}`}></div>
                    </div>
                 </div>
                 <div className="text-right">
                     <p className={`text-[9px] font-bold uppercase opacity-50 mb-0.5`}>Closing</p>
                     <p className={`text-sm font-bold font-mono tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>{formatCurrency(stats.closingBalance)}</p>
                 </div>
             </div>

             {/* Combined Stats Grid (Single Row for height reduction) */}
             <div className={`p-3 rounded-xl mb-4 grid grid-cols-3 gap-0 relative ${isLight ? 'bg-gray-100' : 'bg-white/5'} items-center`}>
                 {/* Income */}
                 <div className="flex flex-col items-center border-r border-gray-500/10">
                     <span className="text-[9px] font-bold uppercase opacity-60 text-emerald-500 mb-0.5">Income</span>
                     <span className={`text-xs font-bold font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>{formatCurrency(stats.income)}</span>
                 </div>

                 {/* Expense */}
                 <div className="flex flex-col items-center border-r border-gray-500/10">
                     <span className="text-[9px] font-bold uppercase opacity-60 text-rose-500 mb-0.5">Expense</span>
                     <span className={`text-xs font-bold font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>{formatCurrency(stats.expense)}</span>
                 </div>

                 {/* Savings */}
                 <div className="flex flex-col items-center">
                     <span className={`text-[9px] font-bold uppercase opacity-60 mb-0.5 ${stats.savings >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>Net Savings</span>
                     <span className={`text-xs font-bold font-mono ${stats.savings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {stats.savings > 0 ? '+' : ''}{formatCurrency(stats.savings)}
                     </span>
                 </div>
             </div>

             <GlassButton variant="secondary" onClick={handleDownloadPDF} className={`w-full !py-2.5 !text-[10px] !font-bold !uppercase !tracking-wider !rounded-lg border-none ${isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                 Download Report
             </GlassButton>
          </div>

          <div>
            <h3 className={`font-bold text-lg mb-3 ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('tools')}</h3>
            <div className="grid grid-cols-4 gap-4 relative z-10">
               {allTools.map(tool => (
                  <button key={tool.id} onClick={() => { if(setActiveTool) setActiveTool(tool.id); }} className="flex flex-col items-center gap-2 animate-enter active:scale-95 transition-transform">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/10 border-white/5'} ${tool.color} ${tool.bg}`}>
                        {/* @ts-ignore */}
                        <tool.icon className="w-6 h-6"/>
                     </div>
                     <span className={`text-[10px] font-bold truncate w-full text-center leading-tight ${isLight ? 'text-gray-600' : 'text-white/70'}`}>{tool.label}</span>
                  </button>
               ))}
            </div>
          </div>

          {/* ... Rest of Dashboard (Upcoming events, Recent Activity) ... */}
          <div>
             <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-lg ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('upcomingEvents')}</h3>
                <button onClick={() => { if(setActiveTool) setActiveTool('CALENDAR'); }} className="text-xs text-blue-500 font-bold">{t('calendar')}</button>
             </div>
             <GlassCard isLight={isLight} className="!p-0 overflow-hidden">
                {upcomingEvents.length > 0 ? (
                   <div className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-white/5'}`}>
                      {upcomingEvents.map(e => (
                         <div key={e.id} onClick={() => setPreviewEvent(e)} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-black/5 transition-colors">
                            <div className={`flex flex-col items-center rounded-lg p-2 min-w-[50px] ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                               <span className={`text-xs uppercase font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>{new Date(e.startDate).toLocaleString('default', { month: 'short' })}</span>
                               <span className="text-xl font-bold">{new Date(e.startDate).getDate()}</span>
                            </div>
                            <div className="flex-1">
                               <p className="font-bold">{e.title}</p>
                               <p className={`text-xs capitalize ${isLight ? 'text-gray-400' : 'text-white/50'}`}>{e.type.toLowerCase()}</p>
                            </div>
                            <Icons.ChevronRight className="w-4 h-4 opacity-30"/>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div className={`p-8 text-center text-sm ${isLight ? 'text-gray-400' : 'text-white/30'}`}>{t('noEvents')}</div>
                )}
             </GlassCard>
          </div>

          <div>
             <div className="flex justify-between items-end mb-4">
                <h3 className={`font-bold text-lg ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('recentActivity')}</h3>
                <button onClick={() => setActiveTab('transactions')} className="text-xs text-blue-500 font-bold">See All</button>
             </div>
             <div className="space-y-3">
                {transactions.slice(0, 5).map(tx => {
                   const cat = categories.find(c => c.id === tx.categoryId);
                   const isLoan = tx.type === 'LOAN_PAYMENT';
                   const isDebt = tx.type === 'DEBT_SETTLEMENT';
                   const isIncome = tx.type === 'INCOME'; 
                   
                   return (
                      <GlassCard isLight={isLight} key={tx.id} onClick={() => openModal('transaction', tx)} className="!p-4 flex items-center justify-between cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isLoan ? 'bg-purple-500/20 text-purple-400' : isDebt ? 'bg-orange-500/20 text-orange-400' : (isLight ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-white')}`}>
                               {isLoan ? '🏦' : isDebt ? '🤝' : renderIcon(cat?.icon || 'Banknote', "w-6 h-6")}
                            </div>
                            <div>
                               <p className="font-medium text-sm">
                                  {isLoan ? 'Loan Payment' : isDebt ? 'Debt Settle' : (cat?.name || 'Unknown')}
                               </p>
                               <p className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-white/40'}`}>{tx.date}</p>
                            </div>
                         </div>
                         <span className={`font-bold ${isIncome ? 'text-emerald-500' : (isLight ? 'text-gray-900' : 'text-white')}`}>{isIncome ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                      </GlassCard>
                   )
                })}
                {transactions.length === 0 && <div className={`text-center py-8 text-sm ${isLight ? 'text-gray-400' : 'text-white/30'}`}>No recent transactions</div>}
             </div>
          </div>

          <Modal isOpen={!!previewEvent} onClose={() => setPreviewEvent(null)} title="Event Details" isLight={isLight}>
             <div className="space-y-4">
                 <div className="flex items-center gap-4">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-blue-500 text-white`}>
                         {renderIcon(previewEvent?.icon || 'Calendar', "w-8 h-8")}
                     </div>
                     <div>
                         <h2 className="text-xl font-bold">{previewEvent?.title}</h2>
                         <p className="text-sm opacity-60 uppercase tracking-widest">{previewEvent?.type}</p>
                     </div>
                 </div>
                 
                 <div className={`p-4 rounded-2xl ${isLight ? 'bg-gray-100' : 'bg-white/5'} space-y-2`}>
                     <div className="flex justify-between">
                         <span className="opacity-50 text-sm">Date</span>
                         <span className="font-bold">{previewEvent?.startDate}</span>
                     </div>
                     {previewEvent?.description && (
                         <div className="pt-2 mt-2 border-t border-gray-500/20">
                            <p className="text-sm opacity-80 whitespace-pre-wrap">{previewEvent.description}</p>
                         </div>
                     )}
                 </div>
                 
                 <GlassButton variant="secondary" className="w-full" onClick={() => setPreviewEvent(null)}>Close</GlassButton>
             </div>
          </Modal>
       </div>
    );
};
