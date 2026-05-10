import {
  View, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Modal,
} from 'react-native';
import { confirmAction } from '../../utils/alert';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuthStore }        from '../../stores/authStore';
import { useMonthFilterStore } from '../../stores/monthFilterStore';
import { useTransactions }     from '../../hooks/useTransactions';
import { useTranslation }      from '../../hooks/useTranslation';
import { supabase }            from '../../services/supabase';
import TransactionCard          from '../../components/TransactionCard';
import OfflineBanner            from '../../components/OfflineBanner';
import { getCategoryById }      from '../../constants/categories';
import { AppText, GlassCard }   from '../../components/ui';
import { colors, radii, shadows, spacing } from '../../constants/theme';

function CategoryCard({
  catId, amount, total, index,
}: { catId: string; amount: number; total: number; index: number }) {
  const { locale } = useTranslation();
  const cat        = getCategoryById(catId);
  const catLabel   = locale === 'th-TH' ? cat.label : cat.labelEn;
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <GlassCard tone="light" radius="lg" shadow="sm" style={styles.catCard}>
      <View style={[styles.catIconBox, { backgroundColor: cat.color + '1E' }]}>
        <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={20} color={cat.color} />
      </View>
      <AppText variant="micro" tone="tertiary" numberOfLines={1}>{catLabel}</AppText>
      <AppText variant="caption" weight="bold" style={{ marginTop: 2 }}>
        ฿{amount.toLocaleString('th-TH')}
      </AppText>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%` as `${number}%`, backgroundColor: cat.color }]} />
      </View>
      <AppText variant="micro" tone="tertiary">{pct}%</AppText>
    </GlassCard>
  );
}

export default function HomeScreen() {
  const insets        = useSafeAreaInsets();
  const router        = useRouter();
  const { t, locale } = useTranslation();
  const user          = useAuthStore((s) => s.user);
  const isDemo        = useAuthStore((s) => s.isDemo);
  const signOut       = useAuthStore((s) => s.signOut);
  const selectedMonth = useMonthFilterStore((s) => s.selectedMonth);
  const { data: transactions = [], isLoading, refetch } = useTransactions(selectedMonth);
  const [menuOpen, setMenuOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    refetch();
    return () => setMenuOpen(false);
  }, [refetch]));

  const handleSignOut = () => {
    setMenuOpen(false);
    confirmAction({
      title:       t.settings.signOutConfirm,
      message:     t.settings.signOutMsg,
      confirmText: t.settings.signOut,
      cancelText:  t.settings.cancel,
      destructive: true,
      onConfirm:   async () => {
        if (!isDemo) await supabase.auth.signOut();
        signOut();
      },
    });
  };

  const totalExpense = transactions.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const totalIncome  = transactions.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const balance      = totalIncome - totalExpense;

  const byCategory = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce<Record<string, number>>((acc, tx) => { acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount; return acc; }, {});

  const topCategories      = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  const displayName = isDemo
    ? 'Demo'
    : (user?.user_metadata?.full_name ?? user?.email ?? 'User');
  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString(locale, {
    month: 'long', year: 'numeric',
  });

  return (
    <View style={styles.root}>
      <OfflineBanner />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 64 + spacing['6'] }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.brand[500]} />
        }
      >
        {/* ── Top bar ── */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing['4'] }]}>
          <View style={[styles.blob, styles.blob1]} />
          <View style={[styles.blob, styles.blob2]} />

          <View style={styles.topBarContent}>
            <View>
              <AppText variant="micro" tone="tertiary" style={{ letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {monthLabel}
              </AppText>
              <AppText variant="h2" weight="bold" numberOfLines={1} style={{ marginTop: 2 }}>
                {t.home.greeting}, {displayName} 👋
              </AppText>
            </View>
            <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.avatarBtn}>
              <Ionicons name="person" size={17} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Balance card */}
          <LinearGradient
            colors={colors.gradient.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={[styles.blobInCard, styles.blobIC1]} />
            <View style={[styles.blobInCard, styles.blobIC2]} />

            <AppText variant="caption" tone="inverse" style={{ opacity: 0.70 }}>
              {t.home.balance}
            </AppText>
            <AppText variant="display" weight="extrabold" tone="inverse" style={{ marginTop: 2, marginBottom: spacing['4'] }}>
              {balance >= 0 ? '' : '−'}฿{Math.abs(balance).toLocaleString('th-TH')}
            </AppText>

            <View style={styles.summaryRow}>
              {[
                { label: t.home.expenses, amount: totalExpense, icon: 'arrow-up',   bg: 'rgba(255,200,180,0.22)', dot: '#FFCAB8' },
                { label: t.home.income,   amount: totalIncome,  icon: 'arrow-down', bg: 'rgba(180,255,200,0.18)', dot: '#B0EEC0' },
              ].map((item) => (
                <View key={item.label} style={[styles.summaryChip, { backgroundColor: item.bg }]}>
                  <View style={[styles.summaryDot, { backgroundColor: item.dot }]}>
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={9} color={colors.text.inverse} />
                  </View>
                  <View>
                    <AppText variant="micro" tone="inverse" style={{ opacity: 0.65 }}>{item.label}</AppText>
                    <AppText variant="caption" weight="bold" tone="inverse">
                      ฿{item.amount.toLocaleString('th-TH')}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Quick add */}
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); router.push('/(tabs)/add'); }}
            activeOpacity={0.80}
            style={styles.quickAddBtn}
          >
            <Ionicons name="add-circle" size={18} color={colors.brand[500]} />
            <AppText variant="caption" weight="semibold" style={{ marginLeft: spacing['2'], color: colors.brand[500] }}>
              {t.home.quickAdd}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* ── Categories ── */}
        {topCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="h3" weight="bold">{t.home.categories}</AppText>
              <View style={styles.sectionBadge}>
                <AppText variant="caption" weight="semibold" style={{ color: colors.brand[500] }}>
                  {topCategories.length} {t.home.categories_unit}
                </AppText>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing['5'], paddingBottom: 4, gap: spacing['3'] }}
            >
              {topCategories.map(([catId, amount], i) => (
                <CategoryCard key={catId} catId={catId} amount={amount} total={totalExpense} index={i} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Recent ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3" weight="bold">{t.home.recent}</AppText>
            {transactions.length > 5 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/history')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.6}
              >
                <AppText variant="caption" weight="semibold" style={{ marginRight: 2, color: colors.brand[500] }}>
                  {t.home.viewAll}
                </AppText>
                <Ionicons name="chevron-forward" size={13} color={colors.brand[500]} />
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyWrap}>
              <GlassCard tone="tint" radius="xl" shadow="xs" style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={34} color={colors.brand[400]} />
              </GlassCard>
              <AppText variant="h3" weight="bold" style={{ marginBottom: 6 }}>{t.home.noData}</AppText>
              <AppText variant="caption" tone="tertiary" align="center" style={{ marginBottom: spacing['5'] }}>
                {t.home.noDataSub}
              </AppText>
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); router.push('/(tabs)/add'); }}
                activeOpacity={0.85}
                style={styles.emptyBtn}
              >
                <LinearGradient colors={colors.gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emptyBtnGrad}>
                  <Ionicons name="add" size={16} color="white" />
                  <AppText variant="bodyMd" weight="semibold" tone="inverse" style={{ marginLeft: 6 }}>
                    {t.home.addFirst}
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            recentTransactions.map((tx, i) => <TransactionCard key={tx.id} transaction={tx} index={i} />)
          )}
        </View>
      </ScrollView>

      {/* ── Avatar dropdown menu ── */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View style={[styles.menuCard, { top: insets.top + 56 }]}>
            {/* White milky background */}
            <View style={[StyleSheet.absoluteFill, styles.menuBg]} />
            <View style={styles.menuBorder} />

            {/* Settings row */}
            <TouchableOpacity
              onPress={() => { setMenuOpen(false); router.push('/(tabs)/settings'); }}
              activeOpacity={0.75}
              style={styles.menuRow}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.brand[100] }]}>
                <Ionicons name="settings-outline" size={16} color={colors.brand[600]} />
              </View>
              <AppText variant="bodyMd" weight="medium">{t.nav.settings}</AppText>
              <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} style={{ marginLeft: 'auto' as never }} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Sign out row */}
            <TouchableOpacity
              onPress={handleSignOut}
              activeOpacity={0.75}
              style={styles.menuRow}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.semantic.dangerSoft }]}>
                <Ionicons name="log-out-outline" size={16} color={colors.semantic.danger} />
              </View>
              <AppText variant="bodyMd" weight="medium" style={{ color: colors.semantic.danger }}>
                {t.settings.signOut}
              </AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.base },
  topBar: {
    paddingHorizontal: spacing['5'],
    paddingBottom:     spacing['5'],
    backgroundColor:   colors.surface.base,
    overflow:          'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999 },
  blob1: { width: 280, height: 280, top: -120, right: -80, backgroundColor: colors.brand[200], opacity: 0.35 },
  blob2: { width: 200, height: 200, top: 0,    left: -80,  backgroundColor: colors.brand[100], opacity: 0.40 },
  topBarContent: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    marginBottom:    spacing['5'],
  },
  avatarBtn: {
    width: 38, height: 38,
    borderRadius:    19,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.60)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  balanceCard: {
    borderRadius:  radii['2xl'],
    padding:       spacing['5'],
    marginBottom:  spacing['3'],
    overflow:      'hidden',
    ...shadows.md,
  },
  blobInCard: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)' },
  blobIC1:    { width: 160, height: 160, top: -60,   right: -40 },
  blobIC2:    { width: 100, height: 100, bottom: -40, left: -20 },
  summaryRow:  { flexDirection: 'row', gap: spacing['3'] },
  summaryChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing['3'], paddingVertical: spacing['2'] + 2,
    borderRadius: radii.lg, gap: spacing['2'],
  },
  summaryDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickAddBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing['3'], borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.20)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  section:       { marginTop: spacing['5'] },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing['5'], marginBottom: spacing['3'],
  },
  sectionBadge: {
    paddingHorizontal: spacing['3'], paddingVertical: 4,
    borderRadius: radii.pill, backgroundColor: colors.brand[100],
  },
  catCard:   { width: 140, padding: spacing['4'] },
  catIconBox:{ width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing['2'] },
  progressBg:{ height: 4, backgroundColor: colors.border.subtle, borderRadius: 3, marginTop: spacing['2'], overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing['12'], paddingHorizontal: spacing['8'] },
  emptyIcon: { width: 70, height: 70, alignItems: 'center', justifyContent: 'center', marginBottom: spacing['4'] },
  emptyBtn:  { borderRadius: radii.xl, overflow: 'hidden', ...shadows.sm },
  emptyBtnGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing['5'], paddingVertical: spacing['3'] },

  // ── Avatar dropdown ─────────────────────────────────────────────────────
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menuCard: {
    position:     'absolute',
    right:        spacing['5'],
    width:        220,
    borderRadius: radii.xl,
    overflow:     'hidden',
    ...shadows.lg,
  },
  menuBg: {
    borderRadius:    radii.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  menuBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.xl,
    borderWidth:  StyleSheet.hairlineWidth,
    borderColor:  colors.border.glass,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: spacing['4'],
    paddingVertical:   spacing['3'] + 2,
    gap:           spacing['3'],
  },
  menuIcon: {
    width:          34,
    height:         34,
    borderRadius:   radii.md,
    alignItems:     'center',
    justifyContent: 'center',
  },
  menuDivider: {
    height:          StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing['4'],
  },
});
