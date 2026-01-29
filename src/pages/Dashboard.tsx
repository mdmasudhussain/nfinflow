import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { getTotalBalance, getMonthlyIncome, getMonthlyExpense, getNetWorth, state } = useFinance();
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: state.baseCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(getTotalBalance()),
      icon: Wallet,
      trend: getTotalBalance() >= 0 ? 'up' : 'down',
      color: 'primary',
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(getMonthlyIncome()),
      icon: TrendingUp,
      trend: 'up',
      color: 'income',
    },
    {
      title: 'Monthly Expense',
      value: formatCurrency(getMonthlyExpense()),
      icon: TrendingDown,
      trend: 'down',
      color: 'expense',
    },
    {
      title: 'Net Worth',
      value: formatCurrency(getNetWorth()),
      icon: PiggyBank,
      trend: getNetWorth() >= 0 ? 'up' : 'down',
      color: 'primary',
    },
  ];

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your financial overview.
            </p>
          </div>
          <Button
            onClick={() => setShowAddTransaction(true)}
            className="gap-2 rounded-xl shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-xl ${
                      stat.color === 'income'
                        ? 'bg-income/10'
                        : stat.color === 'expense'
                        ? 'bg-expense/10'
                        : 'bg-primary/10'
                    }`}
                  >
                    <stat.icon
                      className={`w-5 h-5 ${
                        stat.color === 'income'
                          ? 'text-income'
                          : stat.color === 'expense'
                          ? 'text-expense'
                          : 'text-primary'
                      }`}
                    />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-income' : 'text-expense'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart />
          <CategoryBreakdown />
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <RecentTransactions />
        </motion.div>
      </motion.div>

      <TransactionModal
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
      />
    </Layout>
  );
}
