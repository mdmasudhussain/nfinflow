import { motion } from 'framer-motion';
import { User, Mail, LogOut, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

export default function Profile() {
  // Sanitize export data to ensure no sensitive information is included
  const handleExportData = () => {
    const rawData = localStorage.getItem('finflow-data');
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        // Sanitize accounts to ensure only safe data is exported
        if (data.accounts) {
          data.accounts = data.accounts.map((account: Record<string, unknown>) => ({
            ...account,
            // Only include last 4 digits, remove any legacy full card numbers
            cardNumberLast4: account.cardNumberLast4 || 
              (typeof account.cardNumber === 'string' ? account.cardNumber.slice(-4) : undefined),
            cardNumber: undefined, // Remove legacy full card numbers
            expiryDate: undefined, // Remove expiry dates from export
          }));
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finflow-backup.json';
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        // Silent fail in production - user sees no data exported
        if (import.meta.env.DEV) {
          console.error('Failed to export data');
        }
      }
    }
  };
  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings
          </p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Guest User</h3>
                <p className="text-muted-foreground">Local Account</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card p-6 rounded-2xl">
            <h3 className="font-semibold text-foreground mb-4">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Storage</p>
                  <p className="text-foreground">Browser Local Storage</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your data is stored locally in your browser. To sync across devices,
                consider connecting to a cloud service.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-6 rounded-2xl">
            <h3 className="font-semibold text-foreground mb-4">Data Management</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your data is stored locally in your browser. For security, card numbers are limited to last 4 digits only.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl"
                onClick={handleExportData}
              >
                Export Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    localStorage.removeItem('finflow-data');
                    window.location.reload();
                  }
                }}
              >
                <LogOut className="w-4 h-4" />
                Clear All Data
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
