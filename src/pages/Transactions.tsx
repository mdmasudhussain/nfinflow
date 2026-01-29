import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useFinance, Transaction } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { ImportTextModal } from '@/components/transactions/ImportTextModal';
import { format, parseISO } from 'date-fns';
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

export default function Transactions() {
  const { state, dispatch } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = state.transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = () => {
    if (deletingTransaction) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: deletingTransaction.id });
      setDeletingTransaction(undefined);
    }
  };

  const handleImport = (data: { amount: number | null; description: string; date: string; type: 'income' | 'expense' | 'other'; category: string }) => {
    if (data.amount !== null) {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount: data.amount,
        description: data.description,
        date: data.date,
        type: data.type,
        category: data.category,
        account: state.accounts[0]?.name || 'Cash',
        currency: state.baseCurrency,
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = state.categories.find((c) => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your financial activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="gap-2 rounded-xl"
            >
              <Sparkles className="w-4 h-4" />
              Import Text
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="gap-2 rounded-xl shadow-glow"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass-card p-4 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  onClick={() => setFilterType(type)}
                  className={`rounded-xl ${
                    filterType === type
                      ? type === 'income'
                        ? 'bg-income hover:bg-income/90'
                        : type === 'expense'
                        ? 'bg-expense hover:bg-expense/90'
                        : ''
                      : ''
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <Card className="glass-card rounded-2xl overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first transaction'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${getCategoryColor(transaction.category)}20`,
                      }}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight
                          className="w-5 h-5"
                          style={{ color: getCategoryColor(transaction.category) }}
                        />
                      ) : (
                        <ArrowDownRight
                          className="w-5 h-5"
                          style={{ color: getCategoryColor(transaction.category) }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: `${getCategoryColor(transaction.category)}20`,
                            color: getCategoryColor(transaction.category),
                          }}
                        >
                          {transaction.category}
                        </span>
                        <span>•</span>
                        <span>{format(parseISO(transaction.date), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{transaction.account}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}₹
                      {transaction.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTransaction(transaction)}
                        className="rounded-lg hover:bg-muted"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingTransaction(transaction)}
                        className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <TransactionModal
        open={showAddModal || !!editingTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingTransaction(undefined);
          }
        }}
        transaction={editingTransaction}
      />

      <ImportTextModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImport={handleImport}
      />

      <AlertDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(undefined)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
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
