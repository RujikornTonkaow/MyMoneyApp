import { create } from 'zustand';

interface MonthFilterState {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const currentMonth = () => new Date().toISOString().slice(0, 7);

/** Shared YYYY-MM for dashboard month context and history screen. */
export const useMonthFilterStore = create<MonthFilterState>((set) => ({
  selectedMonth: currentMonth(),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
}));
