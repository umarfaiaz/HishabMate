
import { CURRENCIES } from "./constants";
import { Loan, Debt, CalendarEvent } from "./types";

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const safeParse = <T,>(key: string, fallback: T): T => {
  try { return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : fallback; } catch (e) { return fallback; }
};

export const formatCurrency = (amount: number, currencyCode: string = 'BDT') => {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES] || CURRENCIES.BDT;
  return `${currency.symbol}${(amount || 0).toLocaleString()}`;
};

export const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Generate system events for a specific timeframe or generic projection
export const getFinancialEvents = (loans: Loan[], debts: Debt[], pivotDate: Date = new Date()): CalendarEvent[] => {
    const systemEvents: CalendarEvent[] = [];
    const FINANCE_COLOR = '#10b981';
    
    // Safety check
    if (!loans) loans = [];
    if (!debts) debts = [];

    // 1. Generate Loan EMI Events
    loans.filter(l => l.status === 'ACTIVE').forEach(loan => {
        if (!loan.startDate) return;
        const start = new Date(loan.startDate);
        const payDay = loan.paymentDay || start.getDate();
        
        // Project for pivot month +/- 1 month (covering prev, curr, next)
        for (let i = -1; i <= 2; i++) {
            const targetMonth = pivotDate.getMonth() + i;
            const targetYear = pivotDate.getFullYear() + (targetMonth > 11 ? Math.floor(targetMonth/12) : (targetMonth < 0 ? Math.floor(targetMonth/12) : 0));
            // Adjust JS month (0-11) logic for negative index
            let normalizedMonth = targetMonth % 12;
            if (normalizedMonth < 0) normalizedMonth += 12;

            // Create date object
            const maxDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
            const actualDay = Math.min(payDay, maxDay);
            
            const due = new Date(targetYear, normalizedMonth, actualDay);
            const dueStr = formatDate(due);
            
            // Only add if after loan start
            if (due >= start) {
                // Ensure Unique ID per loan per date
                const eventId = `sys_loan_${loan.id}_${dueStr}`;
                // Avoid pushing duplicate if loop covers same date twice
                if (!systemEvents.find(e => e.id === eventId)) {
                    systemEvents.push({
                        id: eventId,
                        title: `EMI: ${loan.name}`,
                        description: `Provider: ${loan.provider}`,
                        startDate: dueStr,
                        isAllDay: true,
                        type: 'FINANCE',
                        recurrence: 'NONE', 
                        color: FINANCE_COLOR,
                        icon: 'CreditCard',
                        isSystem: true,
                        relatedId: loan.id
                    });
                }
            }
        }
    });

    // 2. Generate Debt Due Dates (Single events, simpler to dedupe)
    debts.filter(d => d.status === 'PENDING' && d.dueDate).forEach(debt => {
        const eventId = `sys_debt_${debt.id}`;
        // Ensure not already added (though loop runs once per debt)
        if (!systemEvents.find(e => e.id === eventId)) {
            systemEvents.push({
                id: eventId,
                title: `${debt.type === 'PAYABLE' ? 'Pay' : 'Collect'}: ${debt.counterparty}`,
                description: `Amount: ${debt.amount}`,
                startDate: debt.dueDate!,
                isAllDay: true,
                type: 'FINANCE',
                recurrence: 'NONE',
                color: debt.type === 'PAYABLE' ? '#ef4444' : '#10b981',
                icon: 'Wallet',
                isSystem: true,
                relatedId: debt.id
            });
        }
    });

    return systemEvents;
};
