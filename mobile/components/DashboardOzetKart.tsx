import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';

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
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {baslik}
        </Text>
        <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
          {deger}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, elevation: 1 },
  content: { gap: 4 },
  indicator: { width: 32, height: 4, borderRadius: 2, marginBottom: 4 },
});
