import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { spacing, radius } from '../theme';

interface Props {
  baslik: string;
  deger: string;
  renk: string;
}

export function DashboardOzetKart({ baslik, deger, renk }: Props) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={[styles.indicator, { backgroundColor: renk }]} />
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }}
        >
          {baslik}
        </Text>
        <Text
          variant="titleMedium"
          style={{ fontWeight: '700', color: theme.colors.onSurface, marginTop: spacing.xs }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {deger}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    minHeight: 96,
  },
  content: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});
