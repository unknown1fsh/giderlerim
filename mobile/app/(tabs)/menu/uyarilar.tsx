import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUyarilar, useUyariOkundu, useUyariTumunuOkundu } from '../../../lib/hooks';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

const UYARI_RENKLERI: Record<string, string> = {
  BUTCE_ASIMI: '#ef4444',
  BUTCE_YAKLASIYOR: '#f59e0b',
  ANORMAL_HARCAMA: '#ef4444',
  TASARRUF_FIRSATI: '#22c55e',
  AYLIK_OZET: '#465FFF',
  GIZLI_KACINAK: '#8b5cf6',
};

export default function UyarilarEkrani() {
  const theme = useTheme();
  const { data: uyarilar, isLoading, refetch } = useUyarilar();
  const okundu = useUyariOkundu();
  const tumunuOkundu = useUyariTumunuOkundu();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        baslik="Uyarilar"
        sagBilesen={
          <IconButton
            icon="check-all"
            size={22}
            onPress={() => tumunuOkundu.mutate()}
            iconColor={theme.colors.primary}
          />
        }
      />

      <FlatList
        data={uyarilar || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              {
                backgroundColor: item.okunduMu
                  ? theme.colors.surface
                  : theme.colors.surfaceVariant,
              },
            ]}
            onPress={() => okundu.mutate(item.id)}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.uyariRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: UYARI_RENKLERI[item.tur] || theme.colors.primary },
                  ]}
                />
                <View style={styles.uyariContent}>
                  <Text
                    variant="titleSmall"
                    style={{ fontWeight: '600', color: theme.colors.onSurface }}
                  >
                    {item.baslik}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: spacing.xs,
                      lineHeight: 20,
                    }}
                  >
                    {item.mesaj}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Uyari yok
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  card: {
    borderRadius: radius.md,
    elevation: 1,
  },
  cardContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  uyariRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  uyariContent: {
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 120,
  },
});
