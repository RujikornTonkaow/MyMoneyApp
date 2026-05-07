import { supabase } from './supabase';
import {
  getPendingTransactions,
  removePendingTransaction,
} from '../utils/offlineCache';

export async function syncPendingTransactions(userId: string): Promise<void> {
  const pending = await getPendingTransactions();
  if (pending.length === 0) return;

  for (const item of pending) {
    try {
      if (item.action === 'insert') {
        const { error } = await supabase
          .from('transactions')
          .insert({ ...item.data, user_id: userId });
        if (!error) await removePendingTransaction(item.id);
      } else if (item.action === 'delete') {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', item.id)
          .eq('user_id', userId);
        if (!error) await removePendingTransaction(item.id);
      }
    } catch {
      // Keep in pending queue — will retry next time online
    }
  }
}
