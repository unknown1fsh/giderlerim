import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { GiderResponse } from '@giderlerim/shared/types/gider.types';
import { formatPara } from '@giderlerim/shared/utils/formatters';

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
        { backgroundColor: theme.colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.ikon, { backgroundColor: gider.kategori.renk + '20' }]}>
        <Text style={{ fontSize: 20 }}>{gider.kategori.ikon}</Text>
      </View>
      <View style={styles.detay}>
        <Text variant="bodyMedium" style={{ fontWeight: '600' }} numberOfLines={1}>
          {gider.aciklama || gider.kategori.ad}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {tarihStr} · {gider.kategori.ad}
        </Text>
      </View>
      <View style={styles.tutarContainer}>
        <Text variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
          {formatPara(gider.tutar)}
        </Text>
        {gider.anormalMi && (
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>Anormal</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    elevation: 1,
  },
  ikon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detay: { flex: 1, marginLeft: 12, gap: 2 },
  tutarContainer: { alignItems: 'flex-end', gap: 2 },
});
