import { useRef, useState } from 'react';
import {
  View, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { notifyAlert } from '../../utils/alert';
import CategoryPicker        from '../../components/CategoryPicker';
import OfflineBanner         from '../../components/OfflineBanner';
import DatePickerModal       from '../../components/DatePickerModal';
import { useAddTransaction } from '../../hooks/useTransactions';
import { useTranslation }    from '../../hooks/useTranslation';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import { TransactionType } from '../../types';
import { AppText, GlassCard } from '../../components/ui';
import { colors, radii, shadows, spacing, typography } from '../../constants/theme';

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function AddScreen() {
  const insets         = useSafeAreaInsets();
  const router         = useRouter();
  const { t, locale }  = useTranslation();
  const addTransaction = useAddTransaction();
  const amountRef      = useRef<TextInput>(null);

  const [type,              setType]              = useState<TransactionType>('expense');
  const [amount,            setAmount]            = useState('');
  const [category,          setCategory]          = useState('food');
  const [note,              setNote]              = useState('');
  const [date,              setDate]              = useState(new Date().toISOString().slice(0, 10));
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const isExpense  = type === 'expense';
  const categories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Pastel gradient colours for expense / income
  const headerGrad  = isExpense ? colors.gradient.expense : colors.gradient.income;
  const accentColor = isExpense ? colors.semantic.danger  : colors.semantic.success;

  const resetForm = () => {
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().slice(0, 10));
    setType('expense');
    setCategory('food');
  };

  const handleSave = async () => {
    const parsed = parseFloat(amount.replace(/,/g, ''));
    if (!parsed || parsed <= 0) { notifyAlert(t.add.errorAmount); return; }
    try {
      await addTransaction.mutateAsync({ amount: parsed, category, note: note.trim(), date, type });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      // Clear inputs so the next visit to this screen starts fresh.
      resetForm();
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof Error && err.message === 'DEMO_NO_SAVE') {
        notifyAlert(t.add.demoMode, t.add.demoSaveNote);
        return;
      }
      notifyAlert(t.common.error, t.add.errorSave);
    }
  };

  const handleTypeChange = (t: TransactionType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setType(t);
    setCategory(t === 'expense' ? 'food' : 'income');
  };

  const formattedAmount = amount
    ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : '';

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <OfflineBanner />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 64 + spacing['6'] }}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={headerGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + spacing['4'] }]}
        >
          {/* Subtle blobs */}
          <View style={[styles.hBlob, { top: -60, right: -40, width: 200, height: 200 }]} />
          <View style={[styles.hBlob, { bottom: -50, left: -30, width: 150, height: 150 }]} />

          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={[styles.typePill, { backgroundColor: 'rgba(255,255,255,0.28)' }]}>
              <Ionicons
                name={isExpense ? 'arrow-up-circle' : 'arrow-down-circle'}
                size={14}
                color="white"
              />
              <AppText variant="caption" weight="bold" tone="inverse" style={{ marginLeft: 5 }}>
                {isExpense ? t.add.expense : t.add.income}
              </AppText>
            </View>
            <AppText variant="h2" weight="bold" tone="inverse" style={{ marginTop: 8 }}>
              {t.add.title}
            </AppText>
          </View>

          {/* Amount display */}
          <View style={styles.amountBlock}>
            <AppText style={styles.currencyLabel}>฿</AppText>
            <Pressable onPress={() => amountRef.current?.focus()}>
              <AppText
                style={[styles.amountDisplay, !amount && { color: 'rgba(255,255,255,0.40)' }]}
              >
                {formattedAmount || '0'}
              </AppText>
            </Pressable>
            <TextInput
              ref={amountRef}
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              style={styles.hiddenInput}
              caretHidden
            />
          </View>

          {/* Type toggle */}
          <View style={styles.typeToggle}>
            {(['expense', 'income'] as TransactionType[]).map((txType) => {
              const active = type === txType;
              return (
                <TouchableOpacity
                  key={txType}
                  onPress={() => handleTypeChange(txType)}
                  activeOpacity={0.85}
                  style={[styles.typeTab, active && styles.typeTabActive]}
                >
                  <Ionicons
                    name={txType === 'expense' ? 'arrow-up-circle' : 'arrow-down-circle'}
                    size={15}
                    color={active ? accentColor : 'rgba(255,255,255,0.70)'}
                  />
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={{ marginLeft: 5, color: active ? accentColor : 'rgba(255,255,255,0.70)' }}
                  >
                    {txType === 'expense' ? t.add.expense : t.add.income}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        {/* ── Form body ── */}
        <View style={styles.body}>

          {/* Category */}
          <View>
            <GlassCard tone="light" radius="xl" shadow="xs" style={styles.formCard}>
              <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
              <View style={styles.cardContent}>
                <View style={styles.fieldLabel}>
                  <Ionicons name="grid-outline" size={13} color={accentColor} />
                  <AppText variant="micro" weight="bold" style={{ marginLeft: 4, color: accentColor, letterSpacing: 0.8 }}>
                    {t.add.category}
                  </AppText>
                </View>
                <CategoryPicker categories={categories} selected={category} onSelect={setCategory} />
              </View>
            </GlassCard>
          </View>

          {/* Note */}
          <View>
            <GlassCard tone="light" radius="xl" shadow="xs" style={styles.formCard}>
              <View style={[styles.cardAccent, { backgroundColor: colors.brand[400] }]} />
              <View style={styles.cardContent}>
                <View style={styles.fieldLabel}>
                  <Ionicons name="create-outline" size={13} color={colors.brand[500]} />
                  <AppText variant="micro" weight="bold" tone="brand" style={{ marginLeft: 4, letterSpacing: 0.8 }}>
                    {t.add.note}
                  </AppText>
                </View>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder={t.add.notePlaceholder}
                  placeholderTextColor={colors.text.tertiary}
                  style={styles.noteInput}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </GlassCard>
          </View>

          {/* Date */}
          <View>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setDatePickerVisible(true); }}
              activeOpacity={0.75}
            >
              <GlassCard tone="light" radius="xl" shadow="xs" style={styles.formCard}>
                <View style={[styles.cardAccent, { backgroundColor: colors.semantic.warning }]} />
                <View style={styles.cardContent}>
                  <View style={styles.fieldLabel}>
                    <Ionicons name="calendar-outline" size={13} color={colors.semantic.warning} />
                  <AppText variant="micro" weight="bold" style={{ marginLeft: 4, color: colors.semantic.warning, letterSpacing: 0.8 }}>
                    {t.add.date}
                  </AppText>
                </View>
                <View style={styles.dateRow}>
                  <AppText variant="bodyMd" weight="semibold">{formatDate(date, locale)}</AppText>
                  <View style={styles.editChip}>
                    <Ionicons name="pencil" size={10} color={colors.brand[500]} />
                    <AppText variant="micro" weight="semibold" style={{ marginLeft: 3, color: colors.brand[500] }}>
                      {t.add.change}
                    </AppText>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Save button */}
          <View>
            <TouchableOpacity
              onPress={handleSave}
              disabled={addTransaction.isPending}
              activeOpacity={0.85}
              style={[styles.saveBtn, { opacity: addTransaction.isPending ? 0.7 : 1 }]}
            >
              <LinearGradient
                colors={headerGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGrad}
              >
                {addTransaction.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <AppText variant="h3" weight="bold" tone="inverse" style={{ marginLeft: spacing['2'] }}>
                      {t.add.save}
                    </AppText>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <DatePickerModal
        visible={datePickerVisible}
        mode="date"
        value={date}
        onSelect={setDate}
        onClose={() => setDatePickerVisible(false)}
        accentColor={accentColor}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.base },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: spacing['5'],
    paddingBottom:     spacing['5'],
    borderBottomLeftRadius:  radii['3xl'],
    borderBottomRightRadius: radii['3xl'],
    overflow: 'hidden',
  },
  hBlob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },

  titleRow: {
    marginBottom: spacing['4'],
  },
  typePill: {
    flexDirection:   'row',
    alignItems:      'center',
    alignSelf:       'flex-start',
    paddingHorizontal: spacing['3'],
    paddingVertical: 5,
    borderRadius:    radii.pill,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     'rgba(255,255,255,0.30)',
  },

  amountBlock: {
    flexDirection: 'row',
    alignItems:    'baseline',
    marginBottom:  spacing['4'],
    gap:           6,
  },
  currencyLabel: {
    color:      'rgba(255,255,255,0.75)',
    fontSize:   26,
    lineHeight: 34,
    fontFamily: typography.family.bold,
  },
  amountDisplay: {
    color:         'white',
    fontSize:      44,         // fixed: was 56, now reasonable
    lineHeight:    52,
    fontFamily:    typography.family.extrabold,
    letterSpacing: -1,
  },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  typeToggle: {
    flexDirection:   'row',
    backgroundColor: 'rgba(0,0,0,0.14)',
    borderRadius:    radii.lg,
    padding:         4,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     'rgba(255,255,255,0.20)',
  },
  typeTab: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 9,
    borderRadius:    radii.md,
  },
  typeTabActive: {
    backgroundColor: 'white',
    ...shadows.xs,
  },

  // ── Form body ──────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: spacing['4'],
    paddingTop:        spacing['4'],
    gap:               spacing['3'],
  },

  formCard: { flexDirection: 'row' },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: spacing['4'], paddingLeft: spacing['3'] },
  fieldLabel: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  spacing['3'],
  },

  noteInput: {
    color:      colors.text.primary,
    fontFamily: typography.family.regular,
    fontSize:   typography.size.base,
    lineHeight: typography.size.base * 1.55,
    minHeight:  40,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'space-between',
  },
  editChip: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing['2'],
    paddingVertical: 4,
    borderRadius:    radii.pill,
    backgroundColor: colors.brand[100],
  },

  saveBtn: {
    borderRadius: radii.xl,
    overflow:     'hidden',
    ...shadows.md,
  },
  saveBtnGrad: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: spacing['4'],
  },
});
