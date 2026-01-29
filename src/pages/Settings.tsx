import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Globe, Palette } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const currencies = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

const themeOptions = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export default function Settings() {
  const { state, dispatch } = useFinance();

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your FinFlow experience
          </p>
        </div>

        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const isSelected = state.theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      dispatch({
                        type: 'SET_THEME',
                        payload: option.value as 'light' | 'dark' | 'system',
                      })
                    }
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <option.icon
                      className={cn(
                        'w-6 h-6',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Currency Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Currency</h3>
                <p className="text-sm text-muted-foreground">
                  Set your default currency
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Base Currency</Label>
              <Select
                value={state.baseCurrency}
                onValueChange={(value) =>
                  dispatch({ type: 'SET_BASE_CURRENCY', payload: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{currency.symbol}</span>
                        <span>
                          {currency.code} - {currency.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6 rounded-2xl">
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Developer</span>
                <span className="text-foreground">Md. Masud Hussain</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Storage</span>
                <span className="text-foreground">Local (Browser)</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
