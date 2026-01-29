import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useFinance } from '@/context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(174, 72%, 40%)',
  'hsl(160, 60%, 45%)',
  'hsl(350, 75%, 55%)',
  'hsl(45, 93%, 47%)',
  'hsl(262, 80%, 50%)',
  'hsl(210, 100%, 50%)',
];

export function CategoryBreakdown() {
  const { state } = useFinance();

  const categoryData = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};

    state.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expensesByCategory[t.category] =
          (expensesByCategory[t.category] || 0) + t.amount;
      });

    const data = Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return data;
  }, [state.transactions]);

  const total = categoryData.reduce((acc, item) => acc + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ₹{data.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (categoryData.length === 0) {
    return (
      <Card className="glass-card p-6 rounded-2xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Top Categories</h3>
          <p className="text-sm text-muted-foreground">Expense breakdown</p>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No expense data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add transactions to see your spending breakdown
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 rounded-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Top Categories</h3>
        <p className="text-sm text-muted-foreground">Expense breakdown</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
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
        <div className="flex-1 space-y-3">
          {categoryData.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    ₹{item.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
