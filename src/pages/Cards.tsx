import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard as CreditCardIcon, Trash2 } from 'lucide-react';
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

const cardGradients = [
  'bg-gradient-to-br from-slate-800 to-slate-900',
  'bg-gradient-to-br from-violet-600 to-purple-800',
  'bg-gradient-to-br from-emerald-500 to-teal-700',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-blue-500 to-indigo-700',
];

const cardBrands = ['Visa', 'Mastercard', 'Rupay', 'Amex', 'Other'];

export default function Cards() {
  const { state, dispatch } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingCard, setDeletingCard] = useState<Account | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    type: 'credit' as 'credit' | 'debit' | 'emi',
    brand: 'Visa',
    cardNumberLast4: '',
    currency: 'INR',
  });

  const cards = state.accounts.filter(
    (a) => a.type === 'credit' || a.type === 'debit' || a.type === 'emi'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only store last 4 digits for security - never store full card numbers
    const newCard: Account = {
      id: crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      balance: 0,
      currency: formData.currency,
      brand: formData.brand,
      cardNumberLast4: formData.cardNumberLast4.slice(-4), // Only keep last 4 digits
    };

    dispatch({ type: 'ADD_ACCOUNT', payload: newCard });
    setShowAddModal(false);
    setFormData({
      name: '',
      type: 'credit',
      brand: 'Visa',
      cardNumberLast4: '',
      currency: 'INR',
    });
  };

  const handleDelete = () => {
    if (deletingCard) {
      dispatch({ type: 'DELETE_ACCOUNT', payload: deletingCard.id });
      setDeletingCard(undefined);
    }
  };

  const formatCardNumber = (last4: string) => {
    return `•••• •••• •••• ${last4.padStart(4, '•')}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cards</h1>
            <p className="text-muted-foreground mt-1">
              Manage your credit, debit, and EMI cards
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 rounded-xl shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </Button>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <Card className="glass-card p-12 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <CreditCardIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No cards added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first card to start tracking
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div
                  className={`${
                    cardGradients[index % cardGradients.length]
                  } rounded-2xl p-6 text-white h-48 flex flex-col justify-between shadow-lg transform transition-transform hover:scale-105`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm opacity-80">{card.brand}</p>
                      <p className="font-semibold mt-1">{card.name}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        card.type === 'credit'
                          ? 'bg-white/20'
                          : card.type === 'debit'
                          ? 'bg-white/20'
                          : 'bg-yellow-400/30 text-yellow-100'
                      }`}
                    >
                      {card.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Card Number - Only last 4 digits shown */}
                  <div>
                    <p className="font-mono text-lg tracking-wider">
                      {card.cardNumberLast4
                        ? formatCardNumber(card.cardNumberLast4)
                        : '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-end justify-between">
                    <div className="text-right">
                      <p className="text-xs opacity-70">Balance</p>
                      <p className="font-semibold">
                        ₹{card.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeletingCard(card)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Card</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Card Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Credit Card"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Card Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'credit' | 'debit' | 'emi') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="emi">EMI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData({ ...formData, brand: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cardBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumberLast4">Last 4 Digits of Card Number</Label>
              <Input
                id="cardNumberLast4"
                placeholder="1234"
                value={formData.cardNumberLast4}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cardNumberLast4: e.target.value.replace(/\D/g, '').slice(0, 4),
                  })
                }
                className="rounded-xl"
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground">
                For your security, only the last 4 digits are stored
              </p>
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
                Add Card
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCard}
        onOpenChange={(open) => !open && setDeletingCard(undefined)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be undone.
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
