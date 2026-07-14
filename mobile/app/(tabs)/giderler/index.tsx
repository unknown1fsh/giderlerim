import { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGiderler } from '../../../lib/hooks';
import { GiderKarti } from '../../../components/GiderKarti';
import { GiderFiltre } from '@giderlerim/shared/types/gider.types';
import { AppSurface, EmptyState, HeroHeader } from '../../../components/AppChrome';
import { spacing, radius } from '../../../theme';

export default function GiderlerEkrani() {
  const theme = useTheme();
  const [filtre] = useState<GiderFiltre>({ page: 0, size: 20 });
  const { data, isLoading, refetch } = useGiderler(filtre);

  return (
    <SafeAreaView style={styles.container}>
      <AppSurface>
        <HeroHeader
          title="Giderler"
          subtitle="Tüm harcamalarınızı hızlıca tarayın, detayları tek dokunuşla açın."
          icon="wallet-outline"
          meta="Hareketler"
        />

      <FlatList
        data={data?.icerik || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GiderKarti gider={item} onPress={() => router.push(`/(tabs)/giderler/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="wallet-plus-outline"
              title="Henüz gider eklenmemiş"
              description="+ butonuna dokunarak ilk giderinizi ekleyin."
            />
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => router.push('/(tabs)/giderler/ekle')}
      />
      </AppSurface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 28,
    borderRadius: radius.xxl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
