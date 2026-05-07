import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryById } from '../constants/categories';
import { Transaction }     from '../types';
import { useTranslation }  from '../hooks/useTranslation';
import { AppText, GlassCard } from './ui';
import { colors, radii, spacing } from '../constants/theme';

type Props = {
  transaction: Transaction;
  index?:      number;
  onPress?:    () => void;
};

export default function TransactionCard({ transaction, index = 0, onPress }: Props) {
  const { type, amount, category, note, date } = transaction;
  const { t, locale } = useTranslation();
  const cat            = getCategoryById(category);
  const isExpense      = type === 'expense';
  const catLabel       = locale === 'th-TH' ? cat.label : cat.labelEn;
  const amountStr      = `${isExpense ? '−' : '+'}฿${amount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const dateLabel      = new Date(date + 'T00:00:00').toLocaleDateString(locale, { day: '2-digit', month: 'short' });

  const accentColor = isExpense ? colors.semantic.danger : colors.semantic.success;

  return (
    <View>
      <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
        <GlassCard tone="light" intensity="subtle" radius="xl" shadow="xs" style={styles.card}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

          <View style={[styles.iconBox, { backgroundColor: cat.color + '18' }]}>
            <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={20} color={cat.color} />
          </View>

          <View style={styles.info}>
            <AppText variant="bodyMd" weight="semibold" numberOfLines={1}>{catLabel}</AppText>
            {!!note && (
              <AppText variant="caption" tone="tertiary" numberOfLines={1} style={{ marginTop: 1 }}>
                {note}
              </AppText>
            )}
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={10} color={colors.text.tertiary} />
              <AppText variant="micro" tone="tertiary" style={{ marginLeft: 3 }}>{dateLabel}</AppText>
            </View>
          </View>

          <View style={styles.right}>
            <AppText variant="h3" weight="bold" style={{ color: accentColor }}>
              {amountStr}
            </AppText>
            <View style={[
              styles.typeBadge,
              { backgroundColor: isExpense ? colors.semantic.dangerSoft : colors.semantic.successSoft },
            ]}>
              <AppText variant="micro" weight="semibold" style={{ color: accentColor }}>
                {isExpense ? t.transactionCard.expense : t.transactionCard.income}
              </AppText>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:    'row',
    alignItems:       'center',
    marginHorizontal: spacing['4'],
    marginBottom:     spacing['2'],
    overflow:         'hidden',
  },
  accentBar: { width: 3, alignSelf: 'stretch' },
  iconBox: {
    width: 42, height: 42, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center', margin: spacing['3'],
  },
  info:    { flex: 1, paddingVertical: spacing['3'] },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing['1'] },
  right:   { alignItems: 'flex-end', padding: spacing['3'], gap: spacing['1'] },
  typeBadge: { paddingHorizontal: spacing['2'], paddingVertical: 3, borderRadius: radii.pill },
});
