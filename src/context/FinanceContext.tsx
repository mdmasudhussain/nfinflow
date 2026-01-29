import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { validateFinanceState } from '@/lib/validation';

// Types
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense' | 'other';
  category: string;
  account: string;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit' | 'debit' | 'emi';
  balance: number;
  currency: string;
  cardNumberLast4?: string; // Only store last 4 digits for security
  brand?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
  frequency: 'monthly' | 'weekly' | 'yearly';
}

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  bills: Bill[];
  baseCurrency: string;
  theme: 'light' | 'dark' | 'system';
}

type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'UPDATE_BILL'; payload: Bill }
  | { type: 'DELETE_BILL'; payload: string }
  | { type: 'SET_BASE_CURRENCY'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'LOAD_STATE'; payload: FinanceState };

const defaultCategories: Category[] = [
  { id: '1', name: 'Salary', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: '2', name: 'Freelance', icon: 'Laptop', color: '#3B82F6', type: 'income' },
  { id: '3', name: 'Food', icon: 'Utensils', color: '#F59E0B', type: 'expense' },
  { id: '4', name: 'Transport', icon: 'Car', color: '#8B5CF6', type: 'expense' },
  { id: '5', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', type: 'expense' },
  { id: '6', name: 'Rent', icon: 'Home', color: '#EF4444', type: 'expense' },
  { id: '7', name: 'Utilities', icon: 'Zap', color: '#6366F1', type: 'expense' },
  { id: '8', name: 'Entertainment', icon: 'Film', color: '#14B8A6', type: 'expense' },
  { id: '9', name: 'Healthcare', icon: 'Heart', color: '#F43F5E', type: 'expense' },
  { id: '10', name: 'Investment', icon: 'TrendingUp', color: '#22C55E', type: 'income' },
];

const defaultAccounts: Account[] = [
  { id: '1', name: 'Cash', type: 'cash', balance: 0, currency: 'INR' },
  { id: '2', name: 'Bank Account', type: 'bank', balance: 0, currency: 'INR' },
];

const initialState: FinanceState = {
  transactions: [],
  categories: defaultCategories,
  accounts: defaultAccounts,
  bills: [],
  baseCurrency: 'INR',
  theme: 'system',
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload),
      };
    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.payload] };
    case 'UPDATE_BILL':
      return {
        ...state,
        bills: state.bills.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case 'DELETE_BILL':
      return {
        ...state,
        bills: state.bills.filter((b) => b.id !== action.payload),
      };
    case 'SET_BASE_CURRENCY':
      return { ...state, baseCurrency: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface FinanceContextType {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpense: () => number;
  getNetWorth: () => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Load from localStorage on mount with validation
  useEffect(() => {
    const saved = localStorage.getItem('finflow-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validation = validateFinanceState(parsed);
        
        if (validation.success && validation.data) {
          // Cast validated data to FinanceState - validation ensures all required fields exist
          const validatedData = validation.data as FinanceState;
          
          // Merge with initial state to ensure all required fields exist
          dispatch({ 
            type: 'LOAD_STATE', 
            payload: { 
              ...initialState, 
              ...validatedData,
              // Ensure default categories exist if empty
              categories: validatedData.categories.length > 0 
                ? validatedData.categories 
                : initialState.categories,
              // Ensure default accounts exist if empty
              accounts: validatedData.accounts.length > 0 
                ? validatedData.accounts 
                : initialState.accounts,
            } 
          });
        } else {
          // Only log in development to prevent information leakage
          if (import.meta.env.DEV) {
            console.warn('Invalid localStorage data, using defaults:', validation.error);
          }
          // Clear corrupted data and use defaults
          localStorage.removeItem('finflow-data');
        }
      } catch {
        // Only log in development to prevent information leakage
        if (import.meta.env.DEV) {
          console.error('Failed to parse saved data, clearing localStorage');
        }
        localStorage.removeItem('finflow-data');
      }
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem('finflow-data', JSON.stringify(state));
  }, [state]);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (state.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(state.theme);
    }
  }, [state.theme]);

  const getTotalBalance = () => {
    return state.transactions.reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0);
  };

  const getMonthlyIncome = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return state.transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.type === 'income' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getMonthlyExpense = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return state.transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.type === 'expense' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getNetWorth = () => {
    return state.accounts.reduce((acc, a) => acc + a.balance, 0) + getTotalBalance();
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        dispatch,
        getTotalBalance,
        getMonthlyIncome,
        getMonthlyExpense,
        getNetWorth,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
