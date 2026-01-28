
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LOAN_PAYMENT' | 'DEBT_SETTLEMENT';
export type AccountType = 'CASH' | 'BANK' | 'MOBILE_WALLET' | 'CREDIT_CARD' | 'OTHER';
export type AuthState = 'ONBOARDING' | 'GENDER_SELECT' | 'REGISTER' | 'SETUP_PIN' | 'LOGIN' | 'AUTHENTICATED' | 'EMAIL_LOGIN';

export interface Account { 
    id: string; 
    name: string; 
    type: string; 
    balance: number; 
    last4Digits?: string; 
}
export interface Category { id: string; name: string; type: 'INCOME' | 'EXPENSE'; icon: string; color: string; isCustom?: boolean; }
export interface Transaction { id: string; accountId: string; categoryId?: string; type: TransactionType; amount: number; date: string; note: string; relatedId?: string; }
export interface Loan { 
  id: string; 
  name: string; 
  provider: string; 
  principal: number; 
  outstanding: number; 
  startDate: string; 
  status: 'ACTIVE' | 'CLOSED'; 
  interestRate?: number; 
  tenure?: number; 
  tenureUnit?: 'YEARS' | 'MONTHS' | 'WEEKS' | 'DAYS';
  emi?: number;
  paymentDay?: number; 
  reminderEnabled?: boolean;
}
export interface LoanOffer {
  id: string;
  provider: string;
  offerName: string;
  amount: number;
  interestRate: number;
  tenure: number; 
  processingFee: number;
  dateAdded: string;
}
export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}
export interface Debt { 
  id: string; 
  type: 'PAYABLE' | 'RECEIVABLE'; 
  name: string; 
  counterparty: string; 
  amount: number; 
  startDate: string; 
  dueDate?: string; 
  status: 'PENDING' | 'PAID'; 
}

export interface Note { 
  id: string; 
  title: string; 
  type: 'TEXT' | 'LIST'; 
  content: string; 
  color: string; 
  date: string; 
}
export interface ListItem { text: string; checked: boolean; }

export interface SavedCalculation { id: string; name: string; expression: string; result: string; date: string; }

export interface SplitBill { 
  id: string; 
  title: string; 
  date: string;
  totalAmount: number;
  tipAmount: number;
  payees: string[]; 
  items: { name: string; cost: number; }[]; 
}

export interface Tour {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  itinerary: string;
  packingList: ListItem[];
  tripType: 'SOLO' | 'COUPLE' | 'FAMILY' | 'FRIENDS';
}

// --- Health Types ---
export interface Medicine { id: string; name: string; dosage: string; time: string; frequency: 'DAILY' | 'TWICE_DAILY' | 'WEEKLY' | 'AS_NEEDED'; }
export interface DoctorAppointment { id: string; doctorName: string; specialty: string; date: string; time: string; location?: string; notes?: string; }
export interface FitnessGoal { id: string; title: string; target: string; current: string; deadline?: string; }
export interface FitnessRoutine { id: string; title: string; day: number; exercises: string; } // Exercises: newline separated string
export interface HealthData { 
    medicines: Medicine[]; 
    appointments: DoctorAppointment[]; 
    fitnessGoals: FitnessGoal[]; 
    fitnessRoutines: FitnessRoutine[]; 
    waterIntake: { date: string; count: number }; // date in YYYY-MM-DD
}

export type EventType = 'PERSONAL' | 'WORK' | 'FINANCE' | 'HEALTH' | 'EDUCATION' | 'HOLIDAY';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; 
  endDate?: string; 
  startTime?: string; 
  isAllDay: boolean;
  type: EventType;
  recurrence: RecurrenceType;
  recurrenceDays?: number[]; 
  color?: string;
  icon?: string; 
  isSystem?: boolean; 
  relatedId?: string; 
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE';
  currency: string;
  language: string;
  theme: 'DARK' | 'LIGHT';
}
