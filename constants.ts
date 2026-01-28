
import { Account, Category } from './types';

export const CURRENCIES = {
  BDT: { symbol: '৳', name: 'Taka' },
  USD: { symbol: '$', name: 'Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  INR: { symbol: '₹', name: 'Rupee' },
  GBP: { symbol: '£', name: 'Pound' }
};

export const LANGUAGES = { EN: 'English', BN: 'বাংলা' };

export const TRANSLATIONS = {
    EN: {
        welcome: "Welcome",
        totalBalance: "Total Balance",
        income: "Income",
        expense: "Expense",
        tools: "Tools",
        recentActivity: "Activity",
        settings: "Settings",
        myAccounts: "Accounts",
        loans: "Loans",
        debts: "Debts",
        notes: "Notes",
        calendar: "Calendar",
        calculator: "Calculator",
        splitBill: "Split Bill",
        emi: "EMI Calculator",
        bmi: "BMI Calculator",
        add: "Add",
        back: "Back",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        home: "Home",
        wallet: "Wallet",
        upcomingEvents: "Upcoming Events",
        noEvents: "No events",
        savedCalculations: "Saved Calculations",
        loanComparison: "Loan Comparison",
        compare: "Compare"
    },
    BN: {
        welcome: "স্বাগতম",
        totalBalance: "মোট ব্যালেন্স",
        income: "আয়",
        expense: "ব্যয়",
        tools: "টুলস",
        recentActivity: "লেনদেন",
        settings: "সেটিংস",
        myAccounts: "অ্যাকাউন্ট",
        loans: "ঋণ",
        debts: "দেনা/পাওনা",
        notes: "নোট",
        calendar: "ক্যালেন্ডার",
        calculator: "ক্যালকুলেটর",
        splitBill: "বিল ভাগ",
        emi: "EMI ক্যালকুলেটর",
        bmi: "BMI ক্যালকুলেটর",
        add: "যোগ করুন",
        back: "ফিরে যান",
        save: "সংরক্ষণ",
        delete: "মুছুন",
        edit: "এডিট",
        home: "হোম",
        wallet: "ওয়ালেট",
        upcomingEvents: "আসন্ন ইভেন্ট",
        noEvents: "কোন ইভেন্ট নেই",
        savedCalculations: "সংরক্ষিত হিসাব",
        loanComparison: "ঋণ তুলনা",
        compare: "তুলনা করুন"
    }
};

export const ACCOUNT_GROUPS = {
  'Physical Wallet': [
    'Cash (Wallet)', 'Cash (Home)', 'Cash (Office)', 'Emergency Fund', 
    'Travel Wallet', 'Petty Cash', 'Gift Card', 'Voucher', 'Prepaid Card', 'Metro Card'
  ],
  'Bank': [
    'Savings Account', 'Current Account', 'Salary Account', 'Fixed Deposit (FD)', 
    'DPS / RD', 'FDR', 'Foreign Currency', 'Term Deposit'
  ],
  'Mobile Wallet (MFS)': [
    'bKash', 'Nagad', 'Rocket', 'Upay', 'mCash', 'OK Wallet', 'Tap',
    'PayPal', 'Payoneer', 'Wise', 'Revolut', 'Cash App', 'Venmo', 'Apple Pay', 'Google Pay'
  ],
  'Cards': [
    'Debit Card', 'Credit Card', 'Prepaid Bank Card'
  ],
  'Investments': [
    'Stock / Shares', 'Bonds', 'Mutual Fund', 'SIP', 'Crypto Wallet', 
    'Gold / Digital Gold', 'Real Estate', 'NFT Wallet'
  ],
  'Loans & Liabilities': [
    'Personal Loan', 'Bank Loan', 'Credit Card Due', 'EMI Account', 
    'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'BNPL', 'IOU'
  ],
  'Business': [
    'Business Cash', 'Business Bank', 'POS Wallet', 'Supplier Advance'
  ],
  'Savings & Funds': [
    'Savings Jar', 'Travel Fund', 'Medical Fund', 'Education Fund', 
    'Wedding Fund', 'Vehicle Maintenance', 'Rent Wallet'
  ],
  'Others': [
    'Refund Pending', 'Escrow', 'Rewards Points', 'Cashback', 'Game Wallet'
  ]
};

export const INITIAL_ACCOUNTS: Account[] = [{ id: '1', name: 'Cash', type: 'Cash (Wallet)', balance: 5000 }, { id: '2', name: 'City Bank', type: 'Savings Account', balance: 125000 }];
export const INITIAL_CATEGORIES: Category[] = [
  // Income
  { id: 'inc-1', name: 'Salary', type: 'INCOME', icon: 'Briefcase', color: '#10b981' },
  { id: 'inc-2', name: 'Business Income', type: 'INCOME', icon: 'ChartLine', color: '#3b82f6' },
  { id: 'inc-3', name: 'Freelance / Side', type: 'INCOME', icon: 'Laptop', color: '#6366f1' },
  { id: 'inc-4', name: 'Bonus & Commission', type: 'INCOME', icon: 'Award', color: '#f59e0b' },
  { id: 'inc-5', name: 'Interest Income', type: 'INCOME', icon: 'Percent', color: '#8b5cf6' },
  { id: 'inc-6', name: 'Investment Returns', type: 'INCOME', icon: 'TrendingUp', color: '#ec4899' },
  { id: 'inc-7', name: 'Rent Income', type: 'INCOME', icon: 'Home', color: '#14b8a6' },
  { id: 'inc-8', name: 'Cashback / Rewards', type: 'INCOME', icon: 'RotateCcw', color: '#f97316' },
  { id: 'inc-9', name: 'Gift Received', type: 'INCOME', icon: 'Gift', color: '#ec4899' },
  { id: 'inc-10', name: 'Refund', type: 'INCOME', icon: 'ArrowLeft', color: '#64748b' },
  { id: 'inc-11', name: 'Loan Taken', type: 'INCOME', icon: 'ArrowDownCircle', color: '#06b6d4' },
  { id: 'inc-12', name: 'Other Income', type: 'INCOME', icon: 'MoreHorizontal', color: '#94a3b8' },

  // Expenses - Home & Bills
  { id: 'exp-1', name: 'Rent / Housing', type: 'EXPENSE', icon: 'Home', color: '#ef4444' },
  { id: 'exp-2', name: 'Electricity', type: 'EXPENSE', icon: 'Bolt', color: '#eab308' },
  { id: 'exp-3', name: 'Gas / Water', type: 'EXPENSE', icon: 'Droplet', color: '#06b6d4' },
  { id: 'exp-4', name: 'Internet / Mobile', type: 'EXPENSE', icon: 'Wifi', color: '#3b82f6' },
  { id: 'exp-5', name: 'Groceries', type: 'EXPENSE', icon: 'ShoppingCart', color: '#10b981' },

  // Expenses - Daily Living
  { id: 'exp-6', name: 'Food & Dining', type: 'EXPENSE', icon: 'Utensils', color: '#f97316' },
  { id: 'exp-7', name: 'Transport', type: 'EXPENSE', icon: 'Car', color: '#6366f1' },
  { id: 'exp-8', name: 'Fuel', type: 'EXPENSE', icon: 'Fuel', color: '#f43f5e' },
  { id: 'exp-9', name: 'Shopping', type: 'EXPENSE', icon: 'ShoppingBag', color: '#d946ef' },

  // Expenses - Finance
  { id: 'exp-10', name: 'Loan EMI', type: 'EXPENSE', icon: 'CreditCard', color: '#8b5cf6' },
  { id: 'exp-11', name: 'Credit Card Bill', type: 'EXPENSE', icon: 'CreditCard', color: '#4f46e5' },
  { id: 'exp-12', name: 'Savings / Invest', type: 'EXPENSE', icon: 'PiggyBank', color: '#14b8a6' },
  { id: 'exp-13', name: 'Insurance', type: 'EXPENSE', icon: 'ShieldCheck', color: '#0ea5e9' },

  // Expenses - Health & Personal
  { id: 'exp-14', name: 'Medical', type: 'EXPENSE', icon: 'Stethoscope', color: '#ef4444' },
  { id: 'exp-15', name: 'Personal Care', type: 'EXPENSE', icon: 'Scissors', color: '#ec4899' },
  { id: 'exp-16', name: 'Fitness', type: 'EXPENSE', icon: 'Dumbbell', color: '#84cc16' },

  // Expenses - Lifestyle
  { id: 'exp-17', name: 'Entertainment', type: 'EXPENSE', icon: 'PlayCircle', color: '#a855f7' },
  { id: 'exp-18', name: 'Travel', type: 'EXPENSE', icon: 'Plane', color: '#06b6d4' },
  { id: 'exp-19', name: 'Gifts & Donations', type: 'EXPENSE', icon: 'Gift', color: '#f43f5e' },
  { id: 'exp-20', name: 'Other Expense', type: 'EXPENSE', icon: 'MoreHorizontal', color: '#64748b' },
];
