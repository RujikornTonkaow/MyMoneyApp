import { Transaction } from '../types';

export const DEMO_USER_ID = '00000000-0000-0000-0000-0000000000demo';

function tx(
  id: string,
  month: string,
  day: number,
  partial: Pick<Transaction, 'amount' | 'category' | 'note' | 'type'>,
): Transaction {
  const d = `${month}-${String(day).padStart(2, '0')}`;
  const iso = `${d}T12:00:00.000Z`;
  return {
    id: `demo-${id}`,
    user_id: DEMO_USER_ID,
    date: d,
    created_at: iso,
    updated_at: iso,
    ...partial,
  };
}

export function getDemoTransactionsForMonth(month: string): Transaction[] {
  return [
    tx('1', month, 3, { amount: 120, category: 'food', note: 'ข้าวกะเพรา', type: 'expense' }),
    tx('2', month, 5, { amount: 45, category: 'transport', note: 'BTS', type: 'expense' }),
    tx('3', month, 6, { amount: 3500, category: 'income', note: 'เงินเดือน (ตัวอย่าง)', type: 'income' }),
    tx('4', month, 8, { amount: 890, category: 'shopping', note: 'ของใช้ในบ้าน', type: 'expense' }),
    tx('5', month, 10, { amount: 199, category: 'food', note: 'กาแฟ', type: 'expense' }),
  ];
}

export function getAllDemoTransactions(): Transaction[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const cur = `${y}-${String(m + 1).padStart(2, '0')}`;
  const prev = new Date(y, m - 1, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  return [
    ...getDemoTransactionsForMonth(cur),
    tx('p1', prevKey, 28, { amount: 2500, category: 'bills', note: 'ค่าไฟ (ตัวอย่าง)', type: 'expense' }),
    tx('p2', prevKey, 15, { amount: 500, category: 'entertainment', note: 'หนัง', type: 'expense' }),
  ];
}
