import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt, Check, Clock, Trash2 } from 'lucide-react';
import { useFinance, Bill } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Layout } from '@/components/layout/Layout';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { differenceInDays, parseISO, format, isPast } from 'date-fns';

export default function Bills() {
  const { state, dispatch } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingBill, setDeletingBill] = useState<Bill | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: '',
    isRecurring: true,
    frequency: 'monthly' as 'monthly' | 'weekly' | 'yearly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bill: Bill = {
      id: crypto.randomUUID(),
      name: formData.name,
      amount: parseFloat(formData.amount) || 0,
      dueDate: formData.dueDate,
      category: formData.category,
      isPaid: false,
      isRecurring: formData.isRecurring,
      frequency: formData.frequency,
    };

    dispatch({ type: 'ADD_BILL', payload: bill });
    setShowAddModal(false);
    setFormData({
      name: '',
      amount: '',
      dueDate: '',
      category: '',
      isRecurring: true,
      frequency: 'monthly',
    });
  };

  const togglePaid = (bill: Bill) => {
    dispatch({
      type: 'UPDATE_BILL',
      payload: { ...bill, isPaid: !bill.isPaid },
    });
  };

  const handleDelete = () => {
    if (deletingBill) {
      dispatch({ type: 'DELETE_BILL', payload: deletingBill.id });
      setDeletingBill(undefined);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date());
    return days;
  };

  const upcomingBills = state.bills.filter((b) => !b.isPaid);
  const paidBills = state.bills.filter((b) => b.isPaid);
  const totalUpcoming = upcomingBills.reduce((acc, b) => acc + b.amount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bills</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your recurring bills
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 rounded-xl shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Add Bill
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-expense/10">
                  <Clock className="w-6 h-6 text-expense" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Bills</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{totalUpcoming.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {upcomingBills.length} pending
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-income/10">
                  <Check className="w-6 h-6 text-income" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid This Month</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{paidBills.reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {paidBills.length} paid
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bills List */}
        {state.bills.length === 0 ? (
          <Card className="glass-card p-12 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No bills added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first bill to start tracking
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Bills */}
            {upcomingBills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Upcoming Bills
                </h3>
                <div className="space-y-3">
                  {upcomingBills.map((bill, index) => {
                    const daysUntil = getDaysUntilDue(bill.dueDate);
                    const isOverdue = daysUntil < 0;

                    return (
                      <motion.div
                        key={bill.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="glass-card p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => togglePaid(bill)}
                                className="w-6 h-6 rounded-full border-2 border-muted-foreground hover:border-income transition-colors flex items-center justify-center"
                              >
                                {bill.isPaid && (
                                  <Check className="w-4 h-4 text-income" />
                                )}
                              </button>
                              <div>
                                <p className="font-medium text-foreground">
                                  {bill.name}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{bill.category}</span>
                                  <span>•</span>
                                  <span>
                                    {format(parseISO(bill.dueDate), 'MMM d, yyyy')}
                                  </span>
                                  {bill.isRecurring && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize">
                                        {bill.frequency}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  ₹{bill.amount.toLocaleString()}
                                </p>
                                <p
                                  className={`text-sm ${
                                    isOverdue
                                      ? 'text-expense'
                                      : daysUntil <= 3
                                      ? 'text-yellow-500'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {isOverdue
                                    ? `${Math.abs(daysUntil)} days overdue`
                                    : daysUntil === 0
                                    ? 'Due today'
                                    : `${daysUntil} days left`}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingBill(bill)}
                                className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paid Bills */}
            {paidBills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Paid Bills
                </h3>
                <div className="space-y-3">
                  {paidBills.map((bill, index) => (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-card p-4 rounded-xl opacity-60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => togglePaid(bill)}
                              className="w-6 h-6 rounded-full bg-income flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-income-foreground" />
                            </button>
                            <div>
                              <p className="font-medium text-foreground line-through">
                                {bill.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {bill.category}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">
                            ₹{bill.amount.toLocaleString()}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Bill Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Bill</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name</Label>
              <Input
                id="name"
                placeholder="e.g., Electricity Bill"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {state.categories
                    .filter((c) => c.type === 'expense' || c.type === 'both')
                    .map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Recurring Bill</Label>
                <p className="text-sm text-muted-foreground">
                  Repeat this bill automatically
                </p>
              </div>
              <Switch
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRecurring: checked })
                }
              />
            </div>

            {formData.isRecurring && (
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: 'monthly' | 'weekly' | 'yearly') =>
                    setFormData({ ...formData, frequency: value })
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
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl shadow-glow">
                Add Bill
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingBill}
        onOpenChange={(open) => !open && setDeletingBill(undefined)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
