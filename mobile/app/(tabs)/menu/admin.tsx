import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, RefreshControl } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { services } from '../../../lib/apiClient';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

function StatKart({
  baslik,
  deger,
  ikon,
  renk,
  alt,
}: {
  baslik: string;
  deger: string | number;
  ikon: string;
  renk: string;
  alt?: string;
}) {
  const theme = useTheme();
  return (
    <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.statContent}>
        <View style={[styles.statIconCircle, { backgroundColor: renk + '18' }]}>
          <MaterialCommunityIcons name={ikon as any} size={22} color={renk} />
        </View>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
          {baslik}
        </Text>
        <Text variant="titleLarge" style={{ fontWeight: '700', color: theme.colors.onSurface, marginTop: 2 }}>
          {deger}
        </Text>
        {alt && (
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            {alt}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

export default function AdminDashboard() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.xl * 2 - spacing.md) / 2;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'istatistikler'],
    queryFn: () => services.admin.istatistikleriGetir(),
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader baslik="Admin Paneli" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader baslik="Admin Paneli" />
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text variant="bodyMedium" style={{ color: theme.colors.error, marginTop: spacing.md }}>
            Istatistikler yuklenemedi.
          </Text>
          <Button mode="outlined" onPress={() => refetch()} style={{ marginTop: spacing.lg }}>
            Tekrar Dene
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const yuzde = (val: number) =>
    data.toplamKullanici > 0 ? Math.round((val / data.toplamKullanici) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="Admin Paneli" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hızlı Erişim */}
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            icon="account-group-outline"
            onPress={() => router.push('/(tabs)/menu/admin-kullanicilar')}
            style={[styles.actionBtn, { borderRadius: radius.md }]}
            contentStyle={{ height: 44 }}
            labelStyle={{ fontSize: 13, fontWeight: '600' }}
          >
            Kullanicilar
          </Button>
          <Button
            mode="contained-tonal"
            icon="headset"
            onPress={() => router.push('/(tabs)/menu/admin-destek')}
            style={[styles.actionBtn, { borderRadius: radius.md }]}
            contentStyle={{ height: 44 }}
            labelStyle={{ fontSize: 13, fontWeight: '600' }}
          >
            Destek{data.acikDestekTalebiSayisi > 0 ? ` (${data.acikDestekTalebiSayisi})` : ''}
          </Button>
        </View>

        {/* Kullanıcı İstatistikleri */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Kullanicilar
        </Text>
        <View style={styles.grid}>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="Toplam" deger={data.toplamKullanici} ikon="account-multiple" renk="#6366f1" />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="Aktif" deger={data.aktifKullanici} ikon="account-check" renk="#22c55e" />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="Silinen" deger={data.silinenKullanici} ikon="account-remove" renk="#ef4444" />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="Admin" deger={data.adminKullanici} ikon="shield-account" renk="#a855f7" />
          </View>
        </View>

        {/* Plan Dağılımı */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Plan Dagilimi
        </Text>
        <View style={styles.planRow}>
          <Card style={[styles.planCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.planContent}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Ucretsiz</Text>
              <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onSurface }}>{data.freeKullanici}</Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>%{yuzde(data.freeKullanici)}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.planCard, { backgroundColor: '#eff6ff' }]}>
            <Card.Content style={styles.planContent}>
              <Text variant="labelSmall" style={{ color: '#2563eb' }}>Pro</Text>
              <Text variant="headlineSmall" style={{ fontWeight: '700', color: '#1d4ed8' }}>{data.premiumKullanici}</Text>
              <Text variant="labelSmall" style={{ color: '#3b82f6' }}>%{yuzde(data.premiumKullanici)}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.planCard, { backgroundColor: '#faf5ff' }]}>
            <Card.Content style={styles.planContent}>
              <Text variant="labelSmall" style={{ color: '#7c3aed' }}>Ultra</Text>
              <Text variant="headlineSmall" style={{ fontWeight: '700', color: '#6d28d9' }}>{data.ultraKullanici}</Text>
              <Text variant="labelSmall" style={{ color: '#8b5cf6' }}>%{yuzde(data.ultraKullanici)}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Kullanım İstatistikleri */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Kullanim
        </Text>
        <View style={styles.grid}>
          <View style={{ width: cardWidth }}>
            <StatKart
              baslik="Toplam Gider"
              deger={data.toplamGiderSayisi.toLocaleString('tr-TR')}
              ikon="receipt"
              renk="#0ea5e9"
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart
              baslik="Gider Tutari"
              deger={`${(data.toplamGiderTutari / 1000).toFixed(0)}K`}
              ikon="currency-try"
              renk="#f59e0b"
              alt={`${data.toplamGiderTutari.toLocaleString('tr-TR')} TL`}
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="Butce" deger={data.toplamButceSayisi} ikon="chart-pie" renk="#8b5cf6" />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="AI Oturum" deger={data.toplamAiOturumSayisi} ikon="robot" renk="#06b6d4" />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="AI Mesaj" deger={data.toplamAiMesajSayisi} ikon="message-text" renk="#14b8a6" />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart
              baslik="Destek"
              deger={data.toplamDestekTalebiSayisi}
              ikon="lifebuoy"
              renk="#f97316"
              alt={`${data.acikDestekTalebiSayisi} acik`}
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="CSV Yukleme" deger={data.toplamCsvYuklemeSayisi} ikon="file-delimited" renk="#64748b" />
          </View>
          <View style={{ width: cardWidth }}>
            <StatKart baslik="Belge Yukleme" deger={data.toplamBelgeYuklemeSayisi} ikon="file-image" renk="#ec4899" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    borderRadius: radius.md,
    elevation: 1,
  },
  statContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  planRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  planCard: {
    flex: 1,
    borderRadius: radius.md,
    elevation: 1,
  },
  planContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2,
  },
});
