import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { GiderResponse } from '@giderlerim/shared/types/gider.types';
import { formatPara } from '@giderlerim/shared/utils/formatters';
import { appColors, spacing, radius, shadows } from '../theme';

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
          borderColor: theme.colors.outline,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View style={styles.ikon}>
        <Text style={{ fontSize: 22 }}>{gider.kategori.ikon}</Text>
      </View>
      <View style={styles.detay}>
        <Text
          variant="bodyMedium"
          style={{ fontWeight: '800', color: theme.colors.onSurface }}
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
          {tarihStr} - {gider.kategori.ad}
        </Text>
      </View>
      <View style={styles.tutarContainer}>
        <Text
          variant="bodyMedium"
          style={{ fontWeight: '900', color: theme.colors.onSurface }}
          numberOfLines={1}
        >
          {formatPara(gider.tutar)}
        </Text>
        {gider.anormalMi ? (
          <Text variant="labelSmall" style={{ color: theme.colors.error, marginTop: 2, fontWeight: '800' }}>
            Anormal
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    minHeight: 78,
    ...shadows.card,
  },
  ikon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.ink,
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
