import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ButceOzetResponse } from '@giderlerim/shared/types/butce.types';
import { formatPara } from '@giderlerim/shared/utils/formatters';
import { spacing, radius } from '../theme';

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
        <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.onSurface }}>
          {butce.kategori.ikon} {butce.kategori.ad}
        </Text>
        <Text variant="labelSmall" style={{ color: renk, fontWeight: '700' }}>
          %{yuzde.toFixed(0)}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.fill, { width: `${yuzde}%`, backgroundColor: renk }]} />
      </View>
      <Text
        variant="bodySmall"
        style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }}
      >
        {formatPara(butce.harcananTutar)} / {formatPara(butce.limitTutar)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  track: {
    height: 10,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
