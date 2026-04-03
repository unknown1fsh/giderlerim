import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUyarilar, useUyariOkundu, useUyariTumunuOkundu } from '../../../lib/hooks';

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
      <View style={styles.header}>
        <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
        <Text variant="titleLarge" style={{ fontWeight: '700' }}>Uyarilar</Text>
        <Button onPress={() => tumunuOkundu.mutate()} textColor={theme.colors.primary} compact>
          Tumu
        </Button>
      </View>

      <FlatList
        data={uyarilar || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            style={[styles.card, { backgroundColor: item.okunduMu ? theme.colors.surface : theme.colors.surfaceVariant }]}
            onPress={() => okundu.mutate(item.id)}
          >
            <Card.Content>
              <View style={styles.uyariRow}>
                <View style={[styles.dot, { backgroundColor: UYARI_RENKLERI[item.tur] || theme.colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ fontWeight: '600' }}>{item.baslik}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    {item.mesaj}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>Uyari yok</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  list: { padding: 16 },
  card: { borderRadius: 12 },
  uyariRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 100 },
});
