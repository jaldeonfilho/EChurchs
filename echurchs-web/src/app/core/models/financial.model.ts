export interface FinancialTransaction {
  id: string;
  userId?: string;
  categoryName?: string;
  categoryId: string;
  amount: number;
  transactionDate: string;
  description?: string;
  type: string;
  paymentMethod?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface FinancialSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  totalTithes: number;
  totalOfferings: number;
  totalDonations: number;
}
