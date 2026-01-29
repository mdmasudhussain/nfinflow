import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useFinance } from '@/context/FinanceContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, parseISO, isAfter } from 'date-fns';

export function SpendingChart() {
  const { state } = useFinance();

  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM d'),
        income: 0,
        expense: 0,
      };
    });

    state.transactions.forEach((t) => {
      const dayIndex = last30Days.findIndex((d) => d.date === t.date);
      if (dayIndex !== -1) {
        if (t.type === 'income') {
          last30Days[dayIndex].income += t.amount;
        } else if (t.type === 'expense') {
          last30Days[dayIndex].expense += t.amount;
        }
      }
    });

    return last30Days;
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
                entry.dataKey === 'income' ? 'text-income' : 'text-expense'
              }`}
            >
              {entry.dataKey === 'income' ? 'Income' : 'Expense'}: ₹
              {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card p-6 rounded-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Spending Trend</h3>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(350, 75%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(350, 75%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval={6}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(160, 60%, 45%)"
              strokeWidth={2}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="hsl(350, 75%, 55%)"
              strokeWidth={2}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
