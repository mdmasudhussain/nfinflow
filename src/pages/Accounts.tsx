import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, Trash2, Pencil } from 'lucide-react';
import { useFinance, Account } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import { validateBalance, AMOUNT_CONSTRAINTS } from '@/lib/validation';

const accountIcons: Record<string, string> = {
  bank: '🏦',
  cash: '💵',
  credit: '💳',
  debit: '💳',
  emi: '📋',
};

export default function Accounts() {
  const { state, dispatch } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [deletingAccount, setDeletingAccount] = useState<Account | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as Account['type'],
    balance: '',
    currency: 'INR',
  });

  const bankAccounts = state.accounts.filter(
    (a) => a.type === 'bank' || a.type === 'cash'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    // Validate balance with range constraints
    const balanceValidation = validateBalance(formData.balance || '0');
    if (!balanceValidation.valid) {
      toast.error(balanceValidation.error);
      return;
    }

    const accountData: Account = {
      id: editingAccount?.id || crypto.randomUUID(),
      name: formData.name.trim(),
      type: formData.type,
      balance: balanceValidation.value,
      currency: formData.currency,
    };

    if (editingAccount) {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: accountData });
    } else {
      dispatch({ type: 'ADD_ACCOUNT', payload: accountData });
    }

    setShowAddModal(false);
    setEditingAccount(undefined);
    setFormData({
      name: '',
      type: 'bank',
      balance: '',
      currency: 'INR',
    });
  };

  const handleEdit = (account: Account) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
    });
    setEditingAccount(account);
    setShowAddModal(true);
  };

  const handleDelete = () => {
    if (deletingAccount) {
      dispatch({ type: 'DELETE_ACCOUNT', payload: deletingAccount.id });
      setDeletingAccount(undefined);
    }
  };

  const totalBalance = bankAccounts.reduce((acc, a) => acc + a.balance, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your bank and cash accounts
            </p>
          </div>
          <Button
            onClick={() => {
              setFormData({
                name: '',
                type: 'bank',
                balance: '',
                currency: 'INR',
              });
              setEditingAccount(undefined);
              setShowAddModal(true);
            }}
            className="gap-2 rounded-xl shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        {/* Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  ₹{totalBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Accounts List */}
        {bankAccounts.length === 0 ? (
          <Card className="glass-card p-12 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No accounts added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first account to start tracking
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card p-6 rounded-2xl group relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {accountIcons[account.type]}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">
                          {account.name}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {account.type} Account
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{account.balance.toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(account)}
                      className="rounded-lg hover:bg-muted"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingAccount(account)}
                      className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., Savings Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Account['type']) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                placeholder="0.00"
                min={-AMOUNT_CONSTRAINTS.max}
                max={AMOUNT_CONSTRAINTS.max}
                step={AMOUNT_CONSTRAINTS.step}
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

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
                {editingAccount ? 'Update' : 'Add Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingAccount}
        onOpenChange={(open) => !open && setDeletingAccount(undefined)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
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
