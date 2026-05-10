import { useState, useMemo } from 'react';
import {
  View, ScrollView, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useMonthFilterStore } from '../../stores/monthFilterStore';
import { useTransactions }     from '../../hooks/useTransactions';
import { useTranslation }      from '../../hooks/useTranslation';
import TransactionCard          from '../../components/TransactionCard';
import OfflineBanner            from '../../components/OfflineBanner';
import DatePickerModal          from '../../components/DatePickerModal';
import { getCategoryById, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import { AppText, GlassCard }   from '../../components/ui';
import { colors, radii, shadows, spacing } from '../../constants/theme';

export default function HistoryScreen() {
  const insets            = useSafeAreaInsets();
  const { t, locale }     = useTranslation();
  const { selectedMonth, setSelectedMonth } = useMonthFilterStore();
  const { data: transactions = [], isLoading, refetch } = useTransactions(selectedMonth);

  const [catFilter,      setCatFilter]      = useState('all');
  const [typeFilter,     setTypeFilter]     = useState<'all' | 'expense' | 'income'>('all');
  const [monthPickerOpen,setMonthPickerOpen]= useState(false);
  const [catPickerOpen,  setCatPickerOpen]  = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const ALL_CATEGORIES = [
    { id: 'all', label: t.history.allCategories, labelEn: t.history.allCategories, emoji: '', icon: 'grid-outline', color: colors.brand[500] },
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES,
  ];

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (typeFilter !== 'all') list = list.filter((tx) => tx.type === typeFilter);
    if (catFilter  !== 'all') list = list.filter((tx) => tx.category === catFilter);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, catFilter]);

  const totalExpense = filtered.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const totalIncome  = filtered.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);

  const currentMonthLabel = new Date(selectedMonth + '-01').toLocaleDateString(locale, {
    month: 'long', year: 'numeric',
  });
  const catObj   = ALL_CATEGORIES.find((c) => c.id === catFilter);
  const catLabel = catObj ? (locale === 'th-TH' ? catObj.label : catObj.labelEn) : t.history.allCategories;

  function TypeChip({ val, label }: { val: 'all' | 'expense' | 'income'; label: string }) {
    const active = typeFilter === val;
    const chipColor = val === 'expense' ? colors.semantic.danger
                    : val === 'income'  ? colors.semantic.success
                    : colors.brand[500];
    return (
      <TouchableOpacity
        onPress={() => { Haptics.selectionAsync().catch(() => {}); setTypeFilter(val); }}
        activeOpacity={0.75}
        style={[
          styles.typeChip,
          active && { backgroundColor: chipColor + '16', borderColor: chipColor + '55' },
        ]}
      >
        {val !== 'all' && (
          <Ionicons
            name={val === 'expense' ? 'arrow-up' : 'arrow-down'}
            size={11}
            color={active ? chipColor : colors.text.tertiary}
            style={{ marginRight: 4 }}
          />
        )}
        <AppText
          variant="caption"
          weight={active ? 'bold' : 'regular'}
          style={{ color: active ? chipColor : colors.text.tertiary }}
        >
          {label}
        </AppText>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.root}>
      <OfflineBanner />

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing['4'] }]}>
        <View style={[styles.blob, styles.blobA]} />
        <View style={[styles.blob, styles.blobB]} />

        <View style={styles.topBarContent}>
          <View>
            <AppText variant="h2" weight="bold" style={{ marginTop: 2 }}>{t.history.title}</AppText>
          </View>
          {/* Month selector — opens DatePickerModal (same UI as add screen) */}
          <TouchableOpacity
            onPress={() => setMonthPickerOpen(true)}
            activeOpacity={0.75}
            style={styles.monthBtn}
          >
            <Ionicons name="calendar" size={13} color={colors.brand[500]} />
            <AppText
              variant="caption"
              weight="semibold"
              style={{ marginLeft: 5, color: colors.brand[600] }}
              numberOfLines={1}
            >
              {currentMonthLabel}
            </AppText>
            <Ionicons name="chevron-down" size={11} color={colors.brand[400]} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        {/* Summary chips */}
        <View style={styles.summaryRow}>
          <GlassCard tone="tint" radius="lg" shadow="xs" style={styles.summaryChip}>
            <AppText variant="micro" tone="tertiary" style={{ marginBottom: 2 }}>{t.history.expenses}</AppText>
            <AppText variant="caption" weight="bold" style={{ color: colors.semantic.danger }}>
              ฿{totalExpense.toLocaleString(locale)}
            </AppText>
          </GlassCard>
          <GlassCard tone="tint" radius="lg" shadow="xs" style={styles.summaryChip}>
            <AppText variant="micro" tone="tertiary" style={{ marginBottom: 2 }}>{t.history.income}</AppText>
            <AppText variant="caption" weight="bold" style={{ color: colors.semantic.success }}>
              ฿{totalIncome.toLocaleString(locale)}
            </AppText>
          </GlassCard>
          <GlassCard tone="tint" radius="lg" shadow="xs" style={styles.summaryChip}>
            <AppText variant="micro" tone="tertiary" style={{ marginBottom: 2 }}>{t.history.items}</AppText>
            <AppText variant="caption" weight="bold" tone="brand">
              {filtered.length} {t.history.items}
            </AppText>
          </GlassCard>
        </View>
      </View>

      {/* ── Filters ── */}
      <View style={styles.filterBar}>
        <TypeChip val="all"     label={t.history.filterAll} />
        <TypeChip val="expense" label={t.history.filterExpense} />
        <TypeChip val="income"  label={t.history.filterIncome} />
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => setCatPickerOpen(true)}
          activeOpacity={0.75}
          style={styles.catFilterBtn}
        >
          <Ionicons name="filter" size={12} color={colors.brand[500]} />
          <AppText
            variant="caption"
            weight="semibold"
            style={{ marginLeft: 5, color: colors.brand[500] }}
            numberOfLines={1}
          >
            {catLabel}
          </AppText>
          <Ionicons name="chevron-down" size={10} color={colors.brand[400]} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <GlassCard tone="tint" radius="xl" shadow="xs" style={styles.emptyIcon}>
            <Ionicons name="search" size={28} color={colors.brand[400]} />
          </GlassCard>
          <AppText variant="h3" weight="bold" style={{ marginBottom: 6 }}>{t.history.noResult}</AppText>
          <AppText variant="caption" tone="tertiary" align="center">
            {t.history.noResultSub}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <TransactionCard transaction={item} index={index} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 64 + spacing['6'], paddingTop: spacing['2'] }}
          initialNumToRender={15}
        />
      )}

      {/* ── Month Picker (same DatePickerModal as add screen) ── */}
      <DatePickerModal
        visible={monthPickerOpen}
        mode="month"
        value={selectedMonth}
        onSelect={(v) => { setSelectedMonth(v); }}
        onClose={() => setMonthPickerOpen(false)}
        accentColor={colors.brand[500]}
        title={t.history.title}
      />

      {/* Category bottom sheet */}
      {catPickerOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <TouchableOpacity
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface.overlay }]}
            activeOpacity={1}
            onPress={() => setCatPickerOpen(false)}
          />
          <View style={[styles.catSheet, { paddingBottom: insets.bottom + spacing['4'] }]}>
            <View style={styles.sheetHandle} />
            <AppText variant="h3" weight="bold" style={{ paddingHorizontal: spacing['5'], marginBottom: spacing['3'] }}>
              {t.history.category}
            </AppText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ALL_CATEGORIES.map((cat) => {
                const active   = catFilter === cat.id;
                const info     = cat.id !== 'all' ? getCategoryById(cat.id) : null;
                const catName  = locale === 'th-TH' ? cat.label : (cat.labelEn ?? cat.label);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => { setCatFilter(cat.id); Haptics.selectionAsync().catch(() => {}); setCatPickerOpen(false); }}
                    activeOpacity={0.7}
                    style={[styles.catItem, active && { backgroundColor: colors.brand[100] }]}
                  >
                    <View style={[
                      styles.catItemIcon,
                      { backgroundColor: info ? info.color + '1E' : colors.brand[100] },
                    ]}>
                      <Ionicons
                        name={(info?.icon ?? 'grid-outline') as keyof typeof Ionicons.glyphMap}
                        size={16}
                        color={info ? info.color : colors.brand[500]}
                      />
                    </View>
                    <AppText
                      variant="bodyMd"
                      weight={active ? 'semibold' : 'regular'}
                      style={{ color: active ? colors.brand[600] : colors.text.secondary }}
                    >
                      {catName}
                    </AppText>
                    {active && (
                      <Ionicons name="checkmark" size={16} color={colors.brand[500]} style={{ marginLeft: 'auto' as never }} />
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: spacing['4'] }} />
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.base },

  // ── Top bar ──────────────────────────────────────────────────────────────
  topBar: {
    paddingHorizontal: spacing['5'],
    paddingBottom:     spacing['4'],
    backgroundColor:   colors.surface.base,
    overflow:          'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999 },
  blobA: { width: 220, height: 220, top: -80,  right: -60, backgroundColor: colors.brand[200], opacity: 0.32 },
  blobB: { width: 160, height: 160, top:  20,  left: -60,  backgroundColor: colors.brand[100], opacity: 0.35 },

  topBarContent: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    marginBottom:    spacing['4'],
  },
  monthBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    borderRadius:    radii.pill,
    backgroundColor: colors.brand[50],
    borderWidth:     1,
    borderColor:     colors.brand[200],
    maxWidth:        170,
  },

  summaryRow: { flexDirection: 'row', gap: spacing['3'] },
  summaryChip: { flex: 1, padding: spacing['3'] },

  // ── Filter bar ────────────────────────────────────────────────────────────
  filterBar: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
    backgroundColor:   colors.surface.base,
    gap:               spacing['2'],
  },
  typeChip: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing['3'],
    paddingVertical: 7,
    borderRadius:    radii.pill,
    borderWidth:     1,
    borderColor:     colors.border.subtle,
  },
  catFilterBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing['3'],
    paddingVertical: 7,
    borderRadius:    radii.pill,
    borderWidth:     1,
    borderColor:     colors.brand[300],
    backgroundColor: colors.brand[50],
    maxWidth:        130,
  },

  // ── Empty ────────────────────────────────────────────────────────────────
  emptyWrap: {
    flex: 1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: spacing['8'],
  },
  emptyIcon: {
    width: 64, height: 64,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing['4'],
  },

  // ── Category sheet ────────────────────────────────────────────────────────
  catSheet: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: colors.surface.raised,
    borderTopLeftRadius:  radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    paddingTop:      spacing['3'],
    maxHeight:       '75%',
    ...shadows.lg,
  },
  sheetHandle: {
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: colors.border.default,
    alignSelf:       'center',
    marginBottom:    spacing['4'],
  },
  catItem: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
    marginHorizontal: spacing['3'],
    marginBottom:    4,
    borderRadius:    radii.md,
  },
  catItemIcon: {
    width:          34,
    height:         34,
    borderRadius:   radii.sm,
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    spacing['3'],
  },
});
