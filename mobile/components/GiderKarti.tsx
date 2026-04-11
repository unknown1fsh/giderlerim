import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { GiderResponse } from '@giderlerim/shared/types/gider.types';
import { formatPara } from '@giderlerim/shared/utils/formatters';
import { spacing, radius } from '../theme';

interface Props {
  gider: GiderResponse;
  onPress?: () => void;
}

export function GiderKarti({ gider, onPress }: Props) {
  const theme = useTheme();
  const tarih = new Date(gider.tarih);
  const tarihStr = tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.ikon, { backgroundColor: gider.kategori.renk + '18' }]}>
        <Text style={{ fontSize: 22 }}>{gider.kategori.ikon}</Text>
      </View>
      <View style={styles.detay}>
        <Text
          variant="bodyMedium"
          style={{ fontWeight: '600', color: theme.colors.onSurface }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {gider.aciklama || gider.kategori.ad}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
          numberOfLines={1}
        >
          {tarihStr} · {gider.kategori.ad}
        </Text>
      </View>
      <View style={styles.tutarContainer}>
        <Text
          variant="bodyMedium"
          style={{ fontWeight: '700', color: theme.colors.onSurface }}
          numberOfLines={1}
        >
          {formatPara(gider.tutar)}
        </Text>
        {gider.anormalMi && (
          <Text variant="labelSmall" style={{ color: theme.colors.error, marginTop: 2 }}>
            Anormal
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    minHeight: 72,
  },
  ikon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detay: {
    flex: 1,
    marginLeft: spacing.md,
  },
  tutarContainer: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
    flexShrink: 0,
  },
});
