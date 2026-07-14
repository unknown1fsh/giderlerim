import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { appColors, spacing, radius, shadows } from '../theme';

interface Props {
  baslik: string;
  deger: string;
  renk: string;
}

export function DashboardOzetKart({ baslik, deger, renk }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
      <View style={styles.content}>
        <View style={[styles.indicator, { backgroundColor: renk }]} />
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.md, fontWeight: '700' }}
        >
          {baslik}
        </Text>
        <Text
          variant="titleLarge"
          style={{ fontWeight: '900', color: theme.colors.onSurface, marginTop: spacing.xs }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {deger}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    minHeight: 118,
    ...shadows.card,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  indicator: {
    width: 42,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: appColors.orange,
  },
});
