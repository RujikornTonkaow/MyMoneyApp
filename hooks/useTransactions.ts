import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { addPendingTransaction } from '../utils/offlineCache';
import { useAuthStore } from '../stores/authStore';
import { useNetworkStatus } from './useNetworkStatus';
import { Transaction, NewTransaction } from '../types';
import { getAllDemoTransactions, getDemoTransactionsForMonth } from '../constants/demoTransactions';

export function useTransactions(month: string) {
  const user = useAuthStore((s) => s.user);
  const isDemo = useAuthStore((s) => s.isDemo);
  const enabled = !!user || isDemo;

  return useQuery({
    queryKey: ['transactions', user?.id ?? 'demo', month, isDemo ? 'demo' : 'live'],
    queryFn: async (): Promise<Transaction[]> => {
      if (isDemo) {
        const start = `${month}-01`;
        const end = `${month}-31`;
        return getDemoTransactionsForMonth(month)
          .filter((t) => t.date >= start && t.date <= end)
          .sort((a, b) => (a.date < b.date ? 1 : -1));
      }
      if (!user) return [];
      const start = `${month}-01`;
      const end = `${month}-31`;
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled,
    staleTime: 1000 * 60,
  });
}

export function useAllTransactions() {
  const user = useAuthStore((s) => s.user);
  const isDemo = useAuthStore((s) => s.isDemo);
  const enabled = !!user || isDemo;

  return useQuery({
    queryKey: ['transactions', user?.id ?? 'demo', 'all', isDemo ? 'demo' : 'live'],
    queryFn: async (): Promise<Transaction[]> => {
      if (isDemo) {
        return getAllDemoTransactions().sort((a, b) => (a.date < b.date ? 1 : -1));
      }
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled,
    staleTime: 1000 * 60,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isDemo = useAuthStore((s) => s.isDemo);
  const { isOnline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (tx: NewTransaction) => {
      if (isDemo) {
        throw new Error('DEMO_NO_SAVE');
      }
      if (!user) throw new Error('Not authenticated');
      if (!isOnline) {
        await addPendingTransaction(tx, 'insert');
        return;
      }
      const { error } = await supabase
        .from('transactions')
        .insert({ ...tx, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isDemo = useAuthStore((s) => s.isDemo);
  const { isOnline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        throw new Error('DEMO_NO_DELETE');
      }
      if (!user) throw new Error('Not authenticated');
      if (!isOnline) {
        await addPendingTransaction({} as NewTransaction, 'delete', id);
        return;
      }
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
