import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, Table, FileSpreadsheet, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToCSV, exportToExcel, generatePDFReport } from '@/utils/exportUtils';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export default function Reports() {
  const { state, getTotalBalance } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthlyData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);

    const monthTransactions = state.transactions.filter(t => {
      const date = parseISO(t.date);
      return date >= start && date <= end;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, transactions: monthTransactions };
  }, [state.transactions, selectedMonth]);

  // Balance Sheet Data
  const balanceSheet = useMemo(() => {
    const totalIncome = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const accountBalances = state.accounts.map(a => ({
      name: a.name,
      type: a.type,
      balance: a.balance,
    }));

    return {
      assets: {
        cash: accountBalances.filter(a => a.type === 'cash' || a.type === 'bank'),
        total: getTotalBalance(),
      },
      liabilities: {
        bills: state.bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0),
      },
      equity: totalIncome - totalExpense,
    };
  }, [state, getTotalBalance]);

  // P&L Data
  const profitLoss = useMemo(() => {
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    state.transactions.forEach(t => {
      if (t.type === 'income') {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      } else if (t.type === 'expense') {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      }
    });

    const totalIncome = Object.values(incomeByCategory).reduce((sum, v) => sum + v, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0);

    return {
      income: incomeByCategory,
      expense: expenseByCategory,
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
    };
  }, [state.transactions]);

  const handleExport = (type: 'csv' | 'excel' | 'pdf') => {
    const exportData = {
      transactions: state.transactions,
      categories: state.categories,
      accounts: state.accounts,
      bills: state.bills,
      baseCurrency: state.baseCurrency,
    };

    switch (type) {
      case 'csv':
        exportToCSV(exportData);
        break;
      case 'excel':
        exportToExcel(exportData);
        break;
      case 'pdf':
        generatePDFReport(exportData);
        break;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Financial statements and export options
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2 rounded-xl">
              <Table className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')} className="gap-2 rounded-xl">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button onClick={() => handleExport('pdf')} className="gap-2 rounded-xl shadow-glow">
              <Printer className="w-4 h-4" />
              Print PDF
            </Button>
          </div>
        </div>

        {/* Financial Statements */}
        <Tabs defaultValue="pnl" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 rounded-xl">
            <TabsTrigger value="pnl" className="rounded-lg">P&L Statement</TabsTrigger>
            <TabsTrigger value="balance" className="rounded-lg">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cashflow" className="rounded-lg">Cash Flow</TabsTrigger>
          </TabsList>

          {/* Profit & Loss Statement */}
          <TabsContent value="pnl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Profit & Loss Statement</h3>
                    <p className="text-sm text-muted-foreground">All time summary</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Income Section */}
                  <div>
                    <h4 className="font-medium text-income mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Income
                    </h4>
                    <div className="space-y-2 pl-6">
                      {Object.entries(profitLoss.income).map(([category, amount]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{category}</span>
                          <span className="text-foreground">₹{amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-medium pt-2 border-t border-border">
                        <span>Total Income</span>
                        <span className="text-income">₹{profitLoss.totalIncome.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expense Section */}
                  <div>
                    <h4 className="font-medium text-expense mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Expenses
                    </h4>
                    <div className="space-y-2 pl-6">
                      {Object.entries(profitLoss.expense).map(([category, amount]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{category}</span>
                          <span className="text-foreground">₹{amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-medium pt-2 border-t border-border">
                        <span>Total Expenses</span>
                        <span className="text-expense">₹{profitLoss.totalExpense.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="pt-4 border-t-2 border-border">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Profit/Loss</span>
                      <span className={profitLoss.netProfit >= 0 ? 'text-income' : 'text-expense'}>
                        ₹{profitLoss.netProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Balance Sheet */}
          <TabsContent value="balance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Balance Sheet</h3>
                    <p className="text-sm text-muted-foreground">As of {format(new Date(), 'MMMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Assets */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b border-border pb-2">Assets</h4>
                    <div className="space-y-2">
                      {balanceSheet.assets.cash.map((account) => (
                        <div key={account.name} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{account.name}</span>
                          <span className="text-foreground">₹{account.balance.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaction Balance</span>
                        <span className="text-foreground">₹{balanceSheet.assets.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-border">
                      <span>Total Assets</span>
                      <span className="text-income">₹{balanceSheet.assets.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b border-border pb-2">Liabilities & Equity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Unpaid Bills</span>
                        <span className="text-foreground">₹{balanceSheet.liabilities.bills.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-border">
                      <span>Total Liabilities</span>
                      <span className="text-expense">₹{balanceSheet.liabilities.bills.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2">
                      <span>Retained Earnings</span>
                      <span className={balanceSheet.equity >= 0 ? 'text-income' : 'text-expense'}>
                        ₹{balanceSheet.equity.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Cash Flow */}
          <TabsContent value="cashflow">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Cash Flow Statement</h3>
                    <p className="text-sm text-muted-foreground">{format(selectedMonth, 'MMMM yyyy')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Cash Inflows (Income)</span>
                    <span className="text-income font-medium">+₹{monthlyData.income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Cash Outflows (Expenses)</span>
                    <span className="text-expense font-medium">-₹{monthlyData.expense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 text-lg font-bold">
                    <span>Net Cash Flow</span>
                    <span className={monthlyData.income - monthlyData.expense >= 0 ? 'text-income' : 'text-expense'}>
                      ₹{(monthlyData.income - monthlyData.expense).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}