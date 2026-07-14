import { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useButceOzetler } from '../../../lib/hooks';
import { ButceProgressBar } from '../../../components/ButceProgressBar';
import { AY_ADLARI } from '@giderlerim/shared/utils/formatters';
import { AppCard, AppSurface, EmptyState, HeroHeader } from '../../../components/AppChrome';
import { spacing, radius } from '../../../theme';

export default function ButcelerEkrani() {
  const theme = useTheme();
  const now = new Date();
  const [ay] = useState(now.getMonth() + 1);
  const [yil] = useState(now.getFullYear());
  const { data, isLoading, refetch } = useButceOzetler(ay, yil);

  return (
    <SafeAreaView style={styles.container}>
      <AppSurface>
        <HeroHeader
          title="Bütçeler"
          subtitle={`${AY_ADLARI[ay - 1]} ${yil} limitleri ve kullanım durumları.`}
          icon="chart-pie"
          meta="Kontrol"
        />

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.butceId.toString()}
        renderItem={({ item }) => (
          <AppCard>
            <View style={styles.cardContent}>
              <ButceProgressBar butce={item} />
            </View>
          </AppCard>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="chart-pie"
              title="Henüz bütçe tanımlanmamış"
              description="+ butonuna dokunarak ilk aylık limitinizi ekleyin."
            />
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => router.push('/(tabs)/butceler/ekle')}
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
  cardContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
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
