import { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useGiderler } from '../../../lib/hooks';
import { GiderKarti } from '../../../components/GiderKarti';
import { GiderFiltre } from '@giderlerim/shared/types/gider.types';
import { spacing, radius } from '../../../theme';

export default function GiderlerEkrani() {
  const theme = useTheme();
  const [filtre] = useState<GiderFiltre>({ page: 0, size: 20 });
  const { data, isLoading, refetch } = useGiderler(filtre);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
          Giderler
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          Tum harcamalariniz
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
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="wallet-plus-outline"
                size={64}
                color={theme.colors.onSurfaceVariant}
                style={{ opacity: 0.4 }}
              />
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.lg }}
              >
                Henuz gider eklenmemis
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginTop: spacing.xs,
                  opacity: 0.7,
                }}
              >
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 120,
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
