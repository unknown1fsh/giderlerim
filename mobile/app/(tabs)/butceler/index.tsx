import { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, useTheme, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useButceOzetler } from '../../../lib/hooks';
import { ButceProgressBar } from '../../../components/ButceProgressBar';
import { AY_ADLARI } from '@giderlerim/shared/utils/formatters';

export default function ButcelerEkrani() {
  const theme = useTheme();
  const now = new Date();
  const [ay] = useState(now.getMonth() + 1);
  const [yil] = useState(now.getFullYear());
  const { data, isLoading, refetch } = useButceOzetler(ay, yil);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
          Butceler
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {AY_ADLARI[ay - 1]} {yil}
        </Text>
      </View>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.butceId.toString()}
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <ButceProgressBar butce={item} />
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                Henuz butce tanimlanmamis
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                + butonuna tiklayarak butce ekleyin
              </Text>
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => router.push('/(tabs)/butceler/ekle')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 2 },
  list: { padding: 16 },
  card: { borderRadius: 16 },
  empty: { alignItems: 'center', paddingTop: 100 },
  fab: { position: 'absolute', right: 20, bottom: 20, borderRadius: 28 },
});
