import { create } from 'zustand';
import { Transaction } from '../types';

interface TransactionState {
  transactions: Transaction[];
  selectedMonth: string;
  selectedCategory: string | null;
  setTransactions: (txs: Transaction[]) => void;
  setSelectedMonth: (month: string) => void;
  setSelectedCategory: (cat: string | null) => void;
}

const currentMonth = () => new Date().toISOString().slice(0, 7);

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  selectedMonth: currentMonth(),
  selectedCategory: null,
  setTransactions: (transactions) => set({ transactions }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
