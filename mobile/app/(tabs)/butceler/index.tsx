import { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, useTheme, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useButceOzetler } from '../../../lib/hooks';
import { ButceProgressBar } from '../../../components/ButceProgressBar';
import { AY_ADLARI } from '@giderlerim/shared/utils/formatters';
import { spacing, radius } from '../../../theme';

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
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          {AY_ADLARI[ay - 1]} {yil}
        </Text>
      </View>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.butceId.toString()}
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <ButceProgressBar butce={item} />
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="chart-pie"
                size={64}
                color={theme.colors.onSurfaceVariant}
                style={{ opacity: 0.4 }}
              />
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.lg }}
              >
                Henuz butce tanimlanmamis
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginTop: spacing.xs,
                  opacity: 0.7,
                }}
              >
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
  card: {
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
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
