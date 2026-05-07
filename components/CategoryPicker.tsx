import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons }       from '@expo/vector-icons';
import * as Haptics       from 'expo-haptics';
import { Category }       from '../types';
import { AppText }        from './ui';
import { useTranslation } from '../hooks/useTranslation';
import { colors, radii, shadows, spacing } from '../constants/theme';

type Props = {
  categories: Category[];
  selected:   string;
  onSelect:   (id: string) => void;
};

export default function CategoryPicker({ categories, selected, onSelect }: Props) {
  const { locale } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing['2'], paddingVertical: 4 }}
    >
      {categories.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onSelect(cat.id);
            }}
            activeOpacity={0.75}
            style={[
              styles.chip,
              isActive
                ? { backgroundColor: cat.color + '20', borderColor: cat.color + '60' }
                : { backgroundColor: colors.surface.raised, borderColor: colors.border.subtle },
              isActive && shadows.xs,
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: isActive ? cat.color + '30' : colors.border.subtle },
              ]}
            >
              <Ionicons
                name={cat.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={isActive ? cat.color : colors.text.tertiary}
              />
            </View>
            <AppText
              variant="caption"
              weight={isActive ? 'semibold' : 'regular'}
              style={{ color: isActive ? cat.color : colors.text.secondary, maxWidth: 72 }}
              numberOfLines={1}
            >
              {locale === 'th-TH' ? cat.label : cat.labelEn}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius:    radii.lg,
    borderWidth:     1.5,
    gap:             spacing['2'],
  },
  iconBox: {
    width:          28,
    height:         28,
    borderRadius:   radii.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
});
