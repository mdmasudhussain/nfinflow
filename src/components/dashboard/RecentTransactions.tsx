import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useFinance } from '@/context/FinanceContext';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

export function RecentTransactions() {
  const { state } = useFinance();

  const recentTransactions = state.transactions.slice(0, 5);

  const getCategoryIcon = (categoryName: string) => {
    const category = state.categories.find((c) => c.name === categoryName);
    return category?.icon || 'Circle';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = state.categories.find((c) => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  if (recentTransactions.length === 0) {
    return (
      <Card className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <p className="text-sm text-muted-foreground">Your latest activity</p>
          </div>
        </div>
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MoreHorizontal className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No transactions yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start tracking your finances by adding a transaction
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Your latest activity</p>
        </div>
        <Link
          to="/transactions"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {recentTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
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
                <p className="text-sm text-muted-foreground">
                  {transaction.category} • {format(parseISO(transaction.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <p
              className={`font-semibold ${
                transaction.type === 'income' ? 'text-income' : 'text-expense'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}₹
              {transaction.amount.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
