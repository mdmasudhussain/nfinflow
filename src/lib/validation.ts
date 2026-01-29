import { z } from 'zod';

// Maximum amount limits for financial transactions
const MAX_AMOUNT = 10000000; // 10 million
const MIN_AMOUNT = 0;

// Transaction schema
export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number().min(MIN_AMOUNT).max(MAX_AMOUNT),
  description: z.string().max(500),
  date: z.string(),
  type: z.enum(['income', 'expense', 'other']),
  category: z.string().max(100),
  account: z.string().max(100),
  currency: z.string().max(10),
});

// Category schema
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().max(100),
  icon: z.string().max(50),
  color: z.string().max(20),
  type: z.enum(['income', 'expense', 'both']),
});

// Account schema
export const AccountSchema = z.object({
  id: z.string(),
  name: z.string().max(100),
  type: z.enum(['bank', 'cash', 'credit', 'debit', 'emi']),
  balance: z.number().min(-MAX_AMOUNT).max(MAX_AMOUNT),
  currency: z.string().max(10),
  cardNumberLast4: z.string().max(4).optional(),
  brand: z.string().max(50).optional(),
});

// Bill schema
export const BillSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  amount: z.number().min(MIN_AMOUNT).max(MAX_AMOUNT),
  dueDate: z.string(),
  category: z.string().max(100),
  isPaid: z.boolean(),
  isRecurring: z.boolean(),
  frequency: z.enum(['monthly', 'weekly', 'yearly']),
});

// Complete FinanceState schema
export const FinanceStateSchema = z.object({
  transactions: z.array(TransactionSchema).default([]),
  categories: z.array(CategorySchema).default([]),
  accounts: z.array(AccountSchema).default([]),
  bills: z.array(BillSchema).default([]),
  baseCurrency: z.string().max(10).default('INR'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});

// Validation helper function
export function validateFinanceState(data: unknown): {
  success: boolean;
  data?: z.infer<typeof FinanceStateSchema>;
  error?: string;
} {
  try {
    const validated = FinanceStateSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

// Amount validation constants for use in forms
export const AMOUNT_CONSTRAINTS = {
  min: MIN_AMOUNT,
  max: MAX_AMOUNT,
  step: 0.01,
} as const;

// Validate a single amount value
export function validateAmount(amount: string | number): {
  valid: boolean;
  value: number;
  error?: string;
} {
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numValue)) {
    return { valid: false, value: 0, error: 'Please enter a valid number' };
  }
  
  if (numValue < MIN_AMOUNT) {
    return { valid: false, value: numValue, error: 'Amount cannot be negative' };
  }
  
  if (numValue > MAX_AMOUNT) {
    return { valid: false, value: numValue, error: `Amount cannot exceed ${MAX_AMOUNT.toLocaleString()}` };
  }
  
  return { valid: true, value: numValue };
}

// Validate balance (can be negative for credit accounts)
export function validateBalance(balance: string | number): {
  valid: boolean;
  value: number;
  error?: string;
} {
  const numValue = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  if (isNaN(numValue)) {
    return { valid: false, value: 0, error: 'Please enter a valid number' };
  }
  
  if (numValue < -MAX_AMOUNT || numValue > MAX_AMOUNT) {
    return { valid: false, value: numValue, error: `Balance must be between -${MAX_AMOUNT.toLocaleString()} and ${MAX_AMOUNT.toLocaleString()}` };
  }
  
  return { valid: true, value: numValue };
}
