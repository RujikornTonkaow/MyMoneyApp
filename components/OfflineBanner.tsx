import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTranslation }   from '../hooks/useTranslation';
import { AppText }          from './ui';
import { colors, spacing }  from '../constants/theme';

export default function OfflineBanner() {
  const { isOnline }  = useNetworkStatus();
  const { t }         = useTranslation();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#FFD898" />
      <AppText
        variant="caption"
        weight="semibold"
        tone="inverse"
        style={{ marginLeft: spacing['2'], opacity: 0.92 }}
      >
        {t.offline}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    backgroundColor:   colors.semantic.warning,
    paddingVertical:   spacing['2'],
    paddingHorizontal: spacing['4'],
    zIndex:            999,
  },
});
