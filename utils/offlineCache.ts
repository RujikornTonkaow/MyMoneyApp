import AsyncStorage from '@react-native-async-storage/async-storage';
import { PendingTransaction, NewTransaction } from '../types';

const PENDING_KEY = '@pending_transactions';

export async function getPendingTransactions(): Promise<PendingTransaction[]> {
  const raw = await AsyncStorage.getItem(PENDING_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addPendingTransaction(
  data: NewTransaction,
  action: 'insert' | 'delete',
  id?: string,
): Promise<void> {
  const pending = await getPendingTransactions();
  const entry: PendingTransaction = {
    id: id ?? String(Date.now()),
    data,
    action,
    timestamp: Date.now(),
  };
  pending.push(entry);
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export async function removePendingTransaction(id: string): Promise<void> {
  const pending = await getPendingTransactions();
  const filtered = pending.filter((p) => p.id !== id);
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
}

export async function clearPendingTransactions(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_KEY);
}
