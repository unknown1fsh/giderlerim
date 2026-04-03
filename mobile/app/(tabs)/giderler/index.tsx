import { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, useTheme, Chip, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGiderler } from '../../../lib/hooks';
import { GiderKarti } from '../../../components/GiderKarti';
import { GiderFiltre } from '@giderlerim/shared/types/gider.types';

export default function GiderlerEkrani() {
  const theme = useTheme();
  const [filtre, setFiltre] = useState<GiderFiltre>({ page: 0, size: 20 });
  const { data, isLoading, refetch } = useGiderler(filtre);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
          Giderler
        </Text>
      </View>

      <FlatList
        data={data?.icerik || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GiderKarti gider={item} onPress={() => router.push(`/(tabs)/giderler/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                Henuz gider eklenmemis
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                + butonuna tiklayarak ilk giderinizi ekleyin
              </Text>
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => router.push('/(tabs)/giderler/ekle')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  list: { padding: 16 },
  empty: { alignItems: 'center', paddingTop: 100 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 28,
  },
});
