import { useState, useRef } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AMOUNT_CONSTRAINTS } from '@/lib/validation';

// Security constants
const MAX_INPUT_LENGTH = 1000;
const MIN_VALID_YEAR = new Date().getFullYear() - 5;
const MAX_VALID_YEAR = new Date().getFullYear() + 1;
const PARSE_COOLDOWN_MS = 1000; // Rate limiting

interface ParsedTransaction {
  amount: number | null;
  description: string;
  date: string;
  type: 'income' | 'expense' | 'other';
  category: string;
}

interface ImportTextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ParsedTransaction) => void;
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 * and limiting length to prevent abuse.
 */
function sanitizeInput(input: string): string {
  return input
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitizes description output to prevent any script injection
 */
function sanitizeDescription(description: string): string {
  return description
    .replace(/[<>'"&]/g, '') // Remove characters that could be used in HTML/JS injection
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200); // Limit description length
}

/**
 * Validates that a date is within a reasonable range
 */
function isValidDateRange(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    return year >= MIN_VALID_YEAR && year <= MAX_VALID_YEAR && !isNaN(date.getTime());
  } catch {
    return false;
  }
}

export function ImportTextModal({ open, onOpenChange, onImport }: ImportTextModalProps) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const lastParseTime = useRef<number>(0);

  const parseTransactionText = (input: string): ParsedTransaction | null => {
    // Sanitize input first
    const sanitizedInput = sanitizeInput(input);
    
    if (sanitizedInput.length < 3) {
      return null;
    }

    const lowerText = sanitizedInput.toLowerCase();
    
    // Extract amount - look for currency symbols and numbers
    // Using a simpler, safer regex pattern
    const amountRegex = /(?:rs\.?|₹|inr|\$|usd|€|eur)?\s*(\d{1,10}(?:,\d{3})*(?:\.\d{1,2})?)/i;
    const amountMatch = sanitizedInput.match(amountRegex);
    let amount: number | null = null;
    
    if (amountMatch && amountMatch[1]) {
      const cleanAmount = amountMatch[1].replace(/,/g, '');
      const parsedAmount = parseFloat(cleanAmount);
      
      // Validate amount is within reasonable bounds
      if (!isNaN(parsedAmount) && 
          parsedAmount >= AMOUNT_CONSTRAINTS.min && 
          parsedAmount <= AMOUNT_CONSTRAINTS.max) {
        amount = parsedAmount;
      }
    }

    // Determine type based on keywords
    const expenseKeywords = ['spent', 'paid', 'bought', 'purchase', 'debited', 'debit', 'expense', 'payment', 'charge'];
    const incomeKeywords = ['received', 'credited', 'credit', 'salary', 'income', 'earned', 'refund', 'cashback'];
    
    let type: 'income' | 'expense' | 'other' = 'other';
    if (expenseKeywords.some(kw => lowerText.includes(kw))) {
      type = 'expense';
    } else if (incomeKeywords.some(kw => lowerText.includes(kw))) {
      type = 'income';
    }

    // Try to extract date with safer regex
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
    const dateMatch = sanitizedInput.match(dateRegex);
    let date = new Date().toISOString().split('T')[0];
    
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;
      const constructedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      // Validate date is within reasonable range
      if (isValidDateRange(constructedDate)) {
        date = constructedDate;
      }
    }

    // Suggest category based on keywords
    const categoryMap: Record<string, string[]> = {
      'Food': ['food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'cafe', 'coffee', 'snack', 'meal', 'zomato', 'swiggy'],
      'Transport': ['uber', 'ola', 'cab', 'taxi', 'petrol', 'fuel', 'metro', 'bus', 'transport', 'travel'],
      'Shopping': ['amazon', 'flipkart', 'shopping', 'clothes', 'shoes', 'purchase'],
      'Utilities': ['electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'bill', 'recharge'],
      'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'entertainment'],
      'Healthcare': ['doctor', 'hospital', 'medicine', 'pharmacy', 'health'],
      'Rent': ['rent', 'housing'],
      'Salary': ['salary', 'income', 'payment received'],
      'Freelance': ['freelance', 'project payment', 'client payment'],
    };

    let category = type === 'income' ? 'Salary' : 'Food';
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        category = cat;
        break;
      }
    }

    // Clean and sanitize description
    let description = sanitizedInput
      .replace(/(?:rs\.?|₹|inr|\$|usd|€|eur)?\s*\d{1,10}(?:,\d{3})*(?:\.\d{1,2})?/gi, '')
      .replace(/\b(?:debited|credited|from|to|for|on|at)\b/gi, '')
      .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, '');

    description = sanitizeDescription(description);

    if (!description || description.length < 3) {
      description = `${type === 'income' ? 'Income' : 'Expense'} transaction`;
    }

    return { amount, description, date, type, category };
  };

  const handleParse = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    // Rate limiting check
    const now = Date.now();
    if (now - lastParseTime.current < PARSE_COOLDOWN_MS) {
      toast.error('Please wait a moment before parsing again');
      return;
    }
    lastParseTime.current = now;

    // Input length check
    if (trimmedText.length > MAX_INPUT_LENGTH) {
      toast.error(`Input too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`);
      return;
    }
    
    setIsParsing(true);
    // Simulate parsing delay for better UX
    setTimeout(() => {
      const result = parseTransactionText(trimmedText);
      if (result) {
        setParsed(result);
      } else {
        toast.error('Could not parse transaction. Please check your input.');
      }
      setIsParsing(false);
    }, 500);
  };

  const handleImport = () => {
    if (parsed) {
      onImport(parsed);
      setText('');
      setParsed(null);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setText('');
    setParsed(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Import Transaction Text
          </DialogTitle>
          <DialogDescription>
            Paste SMS, email, or notification text and we'll extract the transaction details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Textarea
            placeholder="Example: Spent Rs. 500 on Lunch at Cafe Coffee Day on 25/12/2024"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParsed(null);
            }}
            className="min-h-[120px] rounded-xl"
          />

          {!parsed && (
            <Button
              onClick={handleParse}
              disabled={!text.trim() || isParsing}
              className="w-full rounded-xl gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {isParsing ? 'Parsing...' : 'Parse Transaction'}
            </Button>
          )}

          {parsed && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-foreground">Extracted Details:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-semibold text-foreground">
                      {parsed.amount !== null ? `₹${parsed.amount.toLocaleString()}` : 'Not detected'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className={`font-semibold capitalize ${
                      parsed.type === 'income' ? 'text-income' : 
                      parsed.type === 'expense' ? 'text-expense' : 'text-foreground'
                    }`}>
                      {parsed.type}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-semibold text-foreground">{parsed.date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-semibold text-foreground">{parsed.category}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="font-semibold text-foreground">{parsed.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setParsed(null)}
                  className="flex-1 rounded-xl"
                >
                  Re-parse
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={parsed.amount === null}
                  className="flex-1 rounded-xl shadow-glow"
                >
                  Add Transaction
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}