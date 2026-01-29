import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinance, Transaction } from '@/context/FinanceContext';
import { Calendar, DollarSign, FileText, Tag, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { validateAmount, AMOUNT_CONSTRAINTS } from '@/lib/validation';

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
}: TransactionModalProps) {
  const { state, dispatch } = useFinance();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense' | 'other',
    category: '',
    account: '',
    currency: state.baseCurrency,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        account: transaction.account,
        currency: transaction.currency,
      });
    } else {
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: '',
        account: state.accounts[0]?.name || '',
        currency: state.baseCurrency,
      });
    }
  }, [transaction, open, state.baseCurrency, state.accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate amount with range constraints
    const amountValidation = validateAmount(formData.amount);
    if (!amountValidation.valid) {
      toast.error(amountValidation.error);
      return;
    }

    const transactionData: Transaction = {
      id: transaction?.id || crypto.randomUUID(),
      amount: amountValidation.value,
      description: formData.description.trim(),
      date: formData.date,
      type: formData.type,
      category: formData.category,
      account: formData.account,
      currency: formData.currency,
    };

    if (transaction) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transactionData });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: transactionData });
    }

    onOpenChange(false);
  };

  const filteredCategories = state.categories.filter(
    (c) => c.type === formData.type || c.type === 'both'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Transaction Type */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            {(['income', 'expense', 'other'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  formData.type === type
                    ? type === 'income'
                      ? 'bg-income text-income-foreground'
                      : type === 'expense'
                      ? 'bg-expense text-expense-foreground'
                      : 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Amount
            </Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min={AMOUNT_CONSTRAINTS.min}
                max={AMOUNT_CONSTRAINTS.max}
                step={AMOUNT_CONSTRAINTS.step}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="flex-1 text-lg font-semibold rounded-xl"
                required
              />
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger className="w-24 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Description
            </Label>
            <Input
              id="description"
              placeholder="What was this transaction for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              Account
            </Label>
            <Select
              value={formData.account}
              onValueChange={(value) => setFormData({ ...formData, account: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {state.accounts.map((account) => (
                  <SelectItem key={account.id} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl shadow-glow">
              {transaction ? 'Update' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
