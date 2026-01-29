import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

interface BudgetManagerProps {
  budgets: Budget[];
  onAddBudget: (budget: Budget) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetManager({ budgets, onAddBudget, onUpdateBudget, onDeleteBudget }: BudgetManagerProps) {
  const { state } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
  });

  const expenseCategories = state.categories.filter(c => c.type === 'expense' || c.type === 'both');

  const getCategorySpending = (categoryName: string, period: 'monthly' | 'weekly' | 'yearly') => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return state.transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === categoryName && 
        new Date(t.date) >= startDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const budgetStatus = useMemo(() => {
    return budgets.map(budget => {
      const spent = getCategorySpending(budget.category, budget.period);
      const percentage = (spent / budget.limit) * 100;
      return {
        ...budget,
        spent,
        percentage: Math.min(percentage, 100),
        remaining: Math.max(budget.limit - spent, 0),
        isOverBudget: spent > budget.limit,
        isNearLimit: percentage >= 80 && percentage < 100,
      };
    });
  }, [budgets, state.transactions]);

  const handleOpenModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
        period: budget.period,
      });
    } else {
      setEditingBudget(undefined);
      setFormData({
        category: '',
        limit: '',
        period: 'monthly',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const budget: Budget = {
      id: editingBudget?.id || crypto.randomUUID(),
      category: formData.category,
      limit: parseFloat(formData.limit),
      period: formData.period,
    };

    if (editingBudget) {
      onUpdateBudget(budget);
    } else {
      onAddBudget(budget);
    }
    
    setShowModal(false);
    setEditingBudget(undefined);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = state.categories.find(c => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Budget Limits</h2>
        <Button
          onClick={() => handleOpenModal()}
          size="sm"
          className="gap-2 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </Button>
      </div>

      {budgetStatus.length === 0 ? (
        <Card className="glass-card p-8 rounded-2xl text-center">
          <p className="text-muted-foreground">No budgets set yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Set spending limits for your categories
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgetStatus.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(budget.category) }}
                    />
                    <div>
                      <p className="font-medium text-foreground">{budget.category}</p>
                      <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(budget.isOverBudget || budget.isNearLimit) && (
                      <AlertTriangle 
                        className={`w-4 h-4 ${budget.isOverBudget ? 'text-destructive' : 'text-amber-500'}`} 
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(budget)}
                      className="rounded-lg h-8 w-8"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteBudget(budget.id)}
                      className="rounded-lg h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                
                <Progress 
                  value={budget.percentage} 
                  className={`h-2 ${budget.isOverBudget ? '[&>div]:bg-destructive' : budget.isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
                />
                
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className={budget.isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                    ₹{budget.spent.toLocaleString()} spent
                  </span>
                  <span className="text-muted-foreground">
                    ₹{budget.remaining.toLocaleString()} left of ₹{budget.limit.toLocaleString()}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Budget Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingBudget ? 'Edit Budget' : 'Set Budget Limit'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Budget Limit (₹)</Label>
              <Input
                id="limit"
                type="number"
                placeholder="10000"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                className="rounded-xl"
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value: 'monthly' | 'weekly' | 'yearly') =>
                  setFormData({ ...formData, period: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl shadow-glow">
                {editingBudget ? 'Save' : 'Set Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}