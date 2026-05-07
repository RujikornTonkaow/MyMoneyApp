export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  type: TransactionType;
  created_at: string;
  updated_at: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface Category {
  id:      string;
  label:   string;    // Thai label
  labelEn: string;    // English label
  emoji:   string;
  icon:    string;
  color:   string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export interface MonthlySummary {
  totalExpense: number;
  totalIncome: number;
  byCategory: Record<string, number>;
}

export interface PendingTransaction {
  id: string;
  data: NewTransaction;
  action: 'insert' | 'delete';
  timestamp: number;
}
