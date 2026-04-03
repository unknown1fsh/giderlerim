import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ButceOzetResponse } from '@giderlerim/shared/types/butce.types';
import { formatPara } from '@giderlerim/shared/utils/formatters';

interface Props {
  butce: ButceOzetResponse;
}

export function ButceProgressBar({ butce }: Props) {
  const theme = useTheme();
  const yuzde = Math.min(butce.kullanimYuzdesi, 100);
  const renk = butce.limitAsildi
    ? theme.colors.error
    : butce.uyariEsigi
      ? '#f59e0b'
      : theme.colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="bodyMedium" style={{ flex: 1 }}>
          {butce.kategori.ikon} {butce.kategori.ad}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {formatPara(butce.harcananTutar)} / {formatPara(butce.limitTutar)}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.fill, { width: `${yuzde}%`, backgroundColor: renk }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
