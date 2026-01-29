import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const COLORS = [
  'hsl(174, 72%, 40%)',
  'hsl(160, 60%, 45%)',
  'hsl(350, 75%, 55%)',
  'hsl(45, 93%, 47%)',
  'hsl(262, 80%, 50%)',
  'hsl(210, 100%, 50%)',
];

export default function Analytics() {
  const { state } = useFinance();

  // Income vs Expense (Last 6 months)
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const income = state.transactions
        .filter(
          (t) =>
            t.type === 'income' &&
            isWithinInterval(parseISO(t.date), { start, end })
        )
        .reduce((acc, t) => acc + t.amount, 0);

      const expense = state.transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            isWithinInterval(parseISO(t.date), { start, end })
        )
        .reduce((acc, t) => acc + t.amount, 0);

      data.push({
        month: format(date, 'MMM'),
        income,
        expense,
      });
    }
    return data;
  }, [state.transactions]);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};

    state.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expensesByCategory[t.category] =
          (expensesByCategory[t.category] || 0) + t.amount;
      });

    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [state.transactions]);

  // Top 5 categories for radar chart
  const radarData = useMemo(() => {
    return categoryData.slice(0, 5).map((item) => ({
      category: item.name,
      amount: item.value,
      fullMark: Math.max(...categoryData.map((c) => c.value)),
    }));
  }, [categoryData]);

  // Balance trend
  const balanceTrend = useMemo(() => {
    let balance = 0;
    const data: { date: string; balance: number }[] = [];

    const sortedTransactions = [...state.transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedTransactions.forEach((t) => {
      if (t.type === 'income') {
        balance += t.amount;
      } else if (t.type === 'expense') {
        balance -= t.amount;
      }
      data.push({
        date: format(parseISO(t.date), 'MMM d'),
        balance,
      });
    });

    return data.slice(-30);
  }, [state.transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className={`text-sm ${
                entry.dataKey === 'income'
                  ? 'text-income'
                  : entry.dataKey === 'expense'
                  ? 'text-expense'
                  : 'text-primary'
              }`}
            >
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalIncome = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Visualize your financial data and trends
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card p-6 rounded-2xl">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-income mt-1">
                ₹{totalIncome.toLocaleString()}
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card p-6 rounded-2xl">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-expense mt-1">
                ₹{totalExpense.toLocaleString()}
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card p-6 rounded-2xl">
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {savingsRate.toFixed(1)}%
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Bar Chart */}
          <Card className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Income vs Expense
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Last 6 months comparison</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="hsl(350, 75%, 55%)" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Donut Chart */}
          <Card className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Expense Distribution
            </h3>
            <p className="text-sm text-muted-foreground mb-6">By category</p>
            {categoryData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No expense data available</p>
              </div>
            )}
          </Card>

          {/* Balance Trend Line Chart */}
          <Card className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Balance Trend
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Over time</p>
            {balanceTrend.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="hsl(174, 72%, 40%)"
                      strokeWidth={2}
                      dot={false}
                      name="Balance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No balance data available</p>
              </div>
            )}
          </Card>

          {/* Radar Chart */}
          <Card className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Top 5 Categories
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Spending comparison</p>
            {radarData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <PolarRadiusAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Radar
                      name="Amount"
                      dataKey="amount"
                      stroke="hsl(174, 72%, 40%)"
                      fill="hsl(174, 72%, 40%)"
                      fillOpacity={0.3}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No category data available</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
