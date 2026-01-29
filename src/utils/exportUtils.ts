import { Transaction, Category, Account, Bill } from '@/context/FinanceContext';
import { format } from 'date-fns';

interface ExportData {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  bills: Bill[];
  baseCurrency: string;
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * when inserting user-controlled data into HTML strings.
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function exportToCSV(data: ExportData): void {
  const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount', 'Currency'];
  
  const rows = data.transactions.map(t => [
    format(new Date(t.date), 'yyyy-MM-dd'),
    `"${t.description.replace(/"/g, '""')}"`,
    t.category,
    t.account,
    t.type,
    t.type === 'expense' ? -t.amount : t.amount,
    t.currency,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, 'finflow-transactions.csv', 'text/csv');
}

export function exportToExcel(data: ExportData): void {
  // Create a simple TSV that Excel can open
  const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount', 'Currency'];
  
  const rows = data.transactions.map(t => [
    format(new Date(t.date), 'yyyy-MM-dd'),
    t.description,
    t.category,
    t.account,
    t.type,
    t.type === 'expense' ? -t.amount : t.amount,
    t.currency,
  ]);

  const content = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  downloadFile(content, 'finflow-transactions.xls', 'application/vnd.ms-excel');
}

export function generatePDFReport(data: ExportData): void {
  // Generate an HTML report that can be printed to PDF
  const totalIncome = data.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  data.transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>FinFlow Financial Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { padding: 20px; border-radius: 12px; text-align: center; }
    .income { background: #dcfce7; color: #166534; }
    .expense { background: #fee2e2; color: #991b1b; }
    .balance { background: #e0f2fe; color: #0369a1; }
    .summary-card h3 { margin: 0; font-size: 14px; opacity: 0.8; }
    .summary-card p { margin: 10px 0 0; font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
    .credit { color: #16a34a; }
    .debit { color: #dc2626; }
    .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <h1>FinFlow Financial Report</h1>
  <p style="color: #64748b;">Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
  
  <div class="summary">
    <div class="summary-card income">
      <h3>Total Income</h3>
      <p>₹${totalIncome.toLocaleString()}</p>
    </div>
    <div class="summary-card expense">
      <h3>Total Expenses</h3>
      <p>₹${totalExpense.toLocaleString()}</p>
    </div>
    <div class="summary-card balance">
      <h3>Net Balance</h3>
      <p>₹${netBalance.toLocaleString()}</p>
    </div>
  </div>

  <h2>Category Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Amount</th>
        <th>% of Total</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => `
          <tr>
            <td>${escapeHtml(cat)}</td>
            <td class="debit">₹${amount.toLocaleString()}</td>
            <td>${((amount / totalExpense) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
    </tbody>
  </table>

  <h2>Recent Transactions</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${data.transactions.slice(0, 50).map(t => `
        <tr>
          <td>${format(new Date(t.date), 'MMM d, yyyy')}</td>
          <td>${escapeHtml(t.description)}</td>
          <td>${escapeHtml(t.category)}</td>
          <td class="${t.type === 'income' ? 'credit' : 'debit'}">
            ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString()}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Made by Md. Masud Hussain</p>
    <p>FinFlow - Personal Finance Management</p>
  </div>
</body>
</html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}