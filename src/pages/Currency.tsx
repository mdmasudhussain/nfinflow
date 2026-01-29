import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Static exchange rates (relative to INR)
const exchangeRates: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.79,
  AUD: 0.018,
  CAD: 0.016,
  AED: 0.044,
  SGD: 0.016,
  CHF: 0.011,
};

const currencyInfo = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
];

export default function Currency() {
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('1000');

  const convertedAmount = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    return (numAmount * toRate) / fromRate;
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencySymbol = (code: string) => {
    return currencyInfo.find((c) => c.code === code)?.symbol || code;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Currency Rates</h1>
          <p className="text-muted-foreground mt-1">
            Convert and compare global currency rates
          </p>
        </div>

        {/* Converter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Currency Converter
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
              {/* From */}
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyInfo.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-xl text-lg font-semibold"
                  placeholder="Enter amount"
                />
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                className="p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors self-center mb-2"
              >
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </button>

              {/* To */}
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyInfo.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="h-11 px-4 rounded-xl bg-muted flex items-center">
                  <span className="text-lg font-semibold text-foreground">
                    {getCurrencySymbol(toCurrency)} {convertedAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground text-center">
              1 {fromCurrency} = {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}
            </div>
          </Card>
        </motion.div>

        {/* Exchange Rates Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Exchange Rates (Base: INR)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Static rates for demonstration
              </p>
            </div>

            <div className="divide-y divide-border">
              {currencyInfo
                .filter((c) => c.code !== 'INR')
                .map((currency, index) => {
                  const rate = exchangeRates[currency.code];
                  const inrValue = 1 / rate;
                  const isPositive = Math.random() > 0.5; // Demo randomness

                  return (
                    <motion.div
                      key={currency.code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{currency.flag}</span>
                        <div>
                          <p className="font-medium text-foreground">
                            {currency.code}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {currency.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹ {inrValue.toFixed(2)}
                        </p>
                        <div
                          className={`flex items-center justify-end gap-1 text-sm ${
                            isPositive ? 'text-income' : 'text-expense'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{(Math.random() * 2).toFixed(2)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
