/**
 * DatePickerModal
 *
 * mode="month"  → select YYYY-MM  (history filter)
 * mode="date"   → select YYYY-MM-DD (add transaction)
 */

import { useState } from 'react';
import {
  View, TouchableOpacity, Modal, Pressable, StyleSheet,
} from 'react-native';
import { Ionicons }   from '@expo/vector-icons';
import * as Haptics   from 'expo-haptics';
import { AppText }    from './ui';
import { useTranslation } from '../hooks/useTranslation';
import { colors, radii, shadows, spacing } from '../constants/theme';

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface Props {
  visible:       boolean;
  mode:          'month' | 'date';
  value:         string | null;
  onSelect:      (value: string) => void;
  onClose:       () => void;
  title?:        string;
  accentColor?:  string;
  clearLabel?:   string;
  onClear?:      () => void;
}

export default function DatePickerModal({
  visible, mode, value, onSelect, onClose,
  title, accentColor = colors.brand[500], clearLabel, onClear,
}: Props) {
  const { t } = useTranslation();
  const dp     = t.datePicker;

  const today  = new Date();
  const parsedYear  = value ? parseInt(value.slice(0, 4)) : today.getFullYear();
  const parsedMonth = value ? parseInt(value.slice(5, 7)) - 1 : today.getMonth();

  const [viewYear,  setViewYear]  = useState(parsedYear);
  const [viewMonth, setViewMonth] = useState(parsedMonth);
  const [step,      setStep]      = useState<'month' | 'day'>('month');

  const handleOpen = () => {
    setViewYear(parsedYear);
    setViewMonth(parsedMonth);
    setStep('month');
  };

  const handleMonthSelect = (monthIdx: number) => {
    Haptics.selectionAsync().catch(() => {});
    if (mode === 'month') {
      const mm = String(monthIdx + 1).padStart(2, '0');
      onSelect(`${viewYear}-${mm}`);
      onClose();
    } else {
      setViewMonth(monthIdx);
      setStep('day');
    }
  };

  const handleDaySelect = (day: number) => {
    Haptics.selectionAsync().catch(() => {});
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onSelect(`${viewYear}-${mm}-${dd}`);
    onClose();
  };

  const changeYear  = (d: number) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setViewYear((y) => y + d); };
  const changeMonth = (d: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    let m = viewMonth + d;
    let y = viewYear;
    if (m < 0)  { m = 11; y -= 1; }
    if (m > 11) { m = 0;  y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  // ── Day Grid ────────────────────────────────────────────────────────────

  const renderDayGrid = () => {
    const total    = daysInMonth(viewYear, viewMonth);
    const firstDay = firstDayOfMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: total }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const selDay    = mode === 'date' && value && parseInt(value.slice(0, 7).replace('-', '')) === viewYear * 100 + viewMonth + 1
      ? parseInt(value.slice(8, 10)) : null;
    const todayDay  = today.getFullYear() === viewYear && today.getMonth() === viewMonth ? today.getDate() : null;

    return (
      <View>
        <View style={sd.dayRow}>
          {dp.days.map((d, i) => (
            <AppText key={i} variant="micro" weight="semibold" align="center"
              style={[sd.dayHeader, i === 0 && { color: colors.semantic.danger }]}
            >
              {d}
            </AppText>
          ))}
        </View>
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <View key={row} style={sd.dayRow}>
            {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
              const isSun   = col === 0;
              const isSel   = day !== null && day === selDay;
              const isToday = day !== null && day === todayDay;
              return (
                <TouchableOpacity
                  key={col}
                  onPress={() => day && handleDaySelect(day)}
                  disabled={!day}
                  style={[sd.dayCell, isSel && { backgroundColor: accentColor }]}
                >
                  {isToday && !isSel && <View style={[sd.todayDot, { backgroundColor: accentColor }]} />}
                  <AppText
                    variant="caption"
                    weight={isSel ? 'bold' : isToday ? 'semibold' : 'regular'}
                    style={{
                      color: isSel ? 'white' : isSun ? colors.semantic.danger : isToday ? accentColor : colors.text.secondary,
                      opacity: !day ? 0 : 1,
                    }}
                  >
                    {String(day ?? 1)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // ── Month Grid ───────────────────────────────────────────────────────────

  const renderMonthGrid = () => {
    const selMonth  = mode === 'month' && value ? parseInt(value.slice(5, 7)) - 1 : -1;
    const isSelYear = mode === 'month' && value ? parseInt(value.slice(0, 4)) === viewYear : false;

    return (
      <View style={sd.monthGrid}>
        {dp.monthsShort.map((name, i) => {
          const isSel     = i === selMonth && isSelYear;
          const isCurrent = today.getMonth() === i && today.getFullYear() === viewYear && !isSel;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleMonthSelect(i)}
              style={[
                sd.monthCell,
                isSel     && { backgroundColor: accentColor, borderColor: accentColor },
                isCurrent && { borderColor: accentColor },
              ]}
            >
              <AppText
                variant="caption"
                weight={isSel ? 'bold' : 'medium'}
                style={{ color: isSel ? 'white' : isCurrent ? accentColor : colors.text.secondary }}
              >
                {name}
              </AppText>
              {isCurrent && !isSel && <View style={[sd.todayDot, { backgroundColor: accentColor, top: 'auto' as never, bottom: 4 }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={handleOpen}>
      <Pressable style={sd.overlay} onPress={onClose} />
      <View style={sd.sheet}>
        <View style={sd.handle} />

        {/* Month view */}
        {step === 'month' && (
          <>
            <View style={sd.navRow}>
              <TouchableOpacity onPress={() => changeYear(-1)} style={sd.navBtn}>
                <Ionicons name="chevron-back" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                {title && (
                  <AppText variant="micro" weight="semibold" tone="tertiary" style={{ letterSpacing: 0.8, marginBottom: 2 }}>
                    {title.toUpperCase()}
                  </AppText>
                )}
                <AppText variant="h2" weight="bold" style={{ color: accentColor }}>
                  {dp.yearFmt(viewYear)}
                </AppText>
              </View>
              <TouchableOpacity onPress={() => changeYear(1)} style={sd.navBtn}>
                <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {clearLabel && onClear && (
              <TouchableOpacity
                onPress={() => { Haptics.selectionAsync().catch(() => {}); onClear(); onClose(); }}
                style={[sd.clearBtn, !value && { borderColor: accentColor, backgroundColor: accentColor + '14' }]}
              >
                <Ionicons name="calendar" size={15} color={!value ? accentColor : colors.text.tertiary} />
                <AppText
                  variant="caption"
                  weight={!value ? 'bold' : 'regular'}
                  style={{ flex: 1, marginLeft: 8, color: !value ? accentColor : colors.text.tertiary }}
                >
                  {clearLabel}
                </AppText>
                {!value && <Ionicons name="checkmark" size={14} color={accentColor} />}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
              style={[sd.todayBtn, { backgroundColor: accentColor + '14' }]}
            >
              <Ionicons name="today-outline" size={13} color={accentColor} />
              <AppText variant="caption" weight="semibold" style={{ marginLeft: 5, color: accentColor }}>
                {dp.goToday}
              </AppText>
            </TouchableOpacity>

            {renderMonthGrid()}
          </>
        )}

        {/* Day view (date mode only) */}
        {step === 'day' && (
          <>
            <View style={sd.navRow}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={sd.navBtn}>
                <Ionicons name="chevron-back" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <AppText variant="h3" weight="bold">
                  {dp.monthsFull[viewMonth]}{'  '}
                  <AppText variant="h3" weight="bold" style={{ color: accentColor }}>
                    {dp.yearFmt(viewYear)}
                  </AppText>
                </AppText>
                <TouchableOpacity onPress={() => setStep('month')}>
                  <AppText variant="micro" weight="semibold" style={{ color: accentColor, marginTop: 2 }}>
                    {dp.changeMonth}
                  </AppText>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => changeMonth(1)} style={sd.navBtn}>
                <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); handleDaySelect(today.getDate()); }}
              style={[sd.todayBtn, { backgroundColor: accentColor + '14' }]}
            >
              <Ionicons name="today-outline" size={13} color={accentColor} />
              <AppText variant="caption" weight="semibold" style={{ marginLeft: 5, color: accentColor }}>
                {dp.goToMonth}
              </AppText>
            </TouchableOpacity>

            {renderDayGrid()}
          </>
        )}

        <View style={{ height: spacing['8'] }} />
      </View>
    </Modal>
  );
}

const sd = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.surface.overlay },
  sheet: {
    backgroundColor:      colors.surface.white,
    borderTopLeftRadius:  radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    paddingHorizontal:    spacing['5'],
    paddingTop:           spacing['3'],
    ...shadows.lg,
  },
  handle: {
    width: 40, height: 4, backgroundColor: colors.border.default,
    borderRadius: 2, alignSelf: 'center', marginBottom: spacing['5'],
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing['3'],
  },
  navBtn: {
    width: 38, height: 38, borderRadius: radii.md, backgroundColor: colors.surface.base,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border.subtle,
  },
  todayBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    paddingVertical: 7, paddingHorizontal: spacing['4'],
    borderRadius: radii.pill, marginBottom: spacing['4'],
  },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing['2'] },
  monthCell: {
    width: '22%', flexGrow: 1, paddingVertical: 14, borderRadius: radii.lg,
    backgroundColor: colors.surface.base, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.border.subtle, position: 'relative',
  },
  dayRow:   { flexDirection: 'row', marginBottom: 2 },
  dayHeader:{ flex: 1, paddingVertical: 6 },
  dayCell: {
    flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: radii.sm, margin: 1, position: 'relative',
  },
  todayDot: { width: 5, height: 5, borderRadius: 3, position: 'absolute', top: 4, alignSelf: 'center' },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', padding: spacing['3'],
    borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border.default, marginBottom: spacing['3'],
  },
});
