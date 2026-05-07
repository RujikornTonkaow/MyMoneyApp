import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'food',          label: 'อาหาร',       labelEn: 'Food',          emoji: '🍜', icon: 'restaurant',          color: '#F97316' },
  { id: 'transport',     label: 'เดินทาง',     labelEn: 'Transport',     emoji: '🚗', icon: 'car',                 color: '#3B82F6' },
  { id: 'shopping',      label: 'ช้อปปิ้ง',   labelEn: 'Shopping',      emoji: '🛍️', icon: 'bag-handle',          color: '#A855F7' },
  { id: 'entertainment', label: 'บันเทิง',     labelEn: 'Entertainment', emoji: '🎬', icon: 'game-controller',     color: '#EC4899' },
  { id: 'health',        label: 'สุขภาพ',      labelEn: 'Health',        emoji: '💊', icon: 'medkit',              color: '#10B981' },
  { id: 'education',     label: 'การศึกษา',    labelEn: 'Education',     emoji: '📚', icon: 'book',                color: '#06B6D4' },
  { id: 'bills',         label: 'ค่าใช้จ่าย', labelEn: 'Bills',         emoji: '💡', icon: 'flash',               color: '#EAB308' },
  { id: 'income',        label: 'รายรับ',      labelEn: 'Income',        emoji: '💰', icon: 'cash',                color: '#22C55E' },
  { id: 'other',         label: 'อื่นๆ',       labelEn: 'Other',         emoji: '📦', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

export const getCategoryById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'income');
export const INCOME_CATEGORIES  = CATEGORIES.filter((c) => c.id === 'income');
