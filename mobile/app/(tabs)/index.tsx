import { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDashboard } from '../../lib/hooks';
import { formatPara, AY_ADLARI } from '@giderlerim/shared/utils/formatters';
import { DashboardOzetKart } from '../../components/DashboardOzetKart';
import { ButceProgressBar } from '../../components/ButceProgressBar';
import { AppCard, AppSurface, EmptyState, HeroHeader } from '../../components/AppChrome';
import { appColors, spacing, radius } from '../../theme';

export default function DashboardEkrani() {
  const theme = useTheme();
  const now = new Date();
  const [ay] = useState(now.getMonth() + 1);
  const [yil] = useState(now.getFullYear());
  const { data, isLoading, refetch } = useDashboard(ay, yil);

  const cardGap = spacing.md;
  return (
    <SafeAreaView style={styles.container}>
      <AppSurface>
        <HeroHeader
          title={`${AY_ADLARI[ay - 1]} ${yil}`}
          subtitle="Aylık harcama özetiniz, bütçe sağlığı ve hızlı finans sinyalleri."
          icon="view-dashboard-outline"
          meta="Giderlerim"
        />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {data && (
          <>
            <View style={[styles.cardRow, { gap: cardGap }]}>
              <DashboardOzetKart
                baslik="Toplam Harcama"
                deger={formatPara(data.toplamHarcama)}
                renk={appColors.orange}
              />
              <DashboardOzetKart
                baslik="Nakit"
                deger={formatPara(data.nakitHarcama)}
                renk={appColors.success}
              />
            </View>

            <View style={[styles.cardRow, { gap: cardGap }]}>
              <DashboardOzetKart
                baslik="Kredi Karti"
                deger={formatPara(data.krediKartiHarcama)}
                renk={appColors.amber}
              />
              <DashboardOzetKart
                baslik="Değişim"
                deger={`${data.degisimYuzdesi >= 0 ? '+' : ''}${data.degisimYuzdesi.toFixed(1)}%`}
                renk={data.degisimYuzdesi > 0 ? appColors.danger : appColors.success}
              />
            </View>

            {data.kategoriDagilimi.length > 0 && (
              <AppCard>
                <View style={styles.sectionContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Kategori Dağılımı
                  </Text>
                  {data.kategoriDagilimi.slice(0, 5).map((kat) => (
                    <View key={kat.kategoriId} style={styles.kategoriRow}>
                      <Text style={{ fontSize: 18 }}>{kat.kategoriIkon}</Text>
                      <Text
                        variant="bodyMedium"
                        style={{ flex: 1, marginLeft: spacing.md, color: theme.colors.onSurface }}
                        numberOfLines={1}
                      >
                        {kat.kategoriAd}
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={{ fontWeight: '700', color: theme.colors.onSurface }}
                      >
                        {formatPara(kat.toplam)}
                      </Text>
                      <Text
                        variant="labelSmall"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          marginLeft: spacing.sm,
                          width: 40,
                          textAlign: 'right',
                        }}
                      >
                        %{kat.yuzde.toFixed(0)}
                      </Text>
                    </View>
                  ))}
                </View>
              </AppCard>
            )}

            {data.butceDurumlari.length > 0 && (
              <AppCard>
                <View style={styles.sectionContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Bütçe Durumları
                  </Text>
                  {data.butceDurumlari.map((butce) => (
                    <ButceProgressBar key={butce.butceId} butce={butce} />
                  ))}
                </View>
              </AppCard>
            )}

            <View style={styles.statsRow}>
              <View style={[styles.statChip, { backgroundColor: theme.colors.surfaceVariant }]}>
                <MaterialCommunityIcons name="receipt" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                  {data.toplamGiderSayisi} gider
                </Text>
              </View>
              {data.anormalGiderSayisi > 0 && (
                <View style={[styles.statChip, { backgroundColor: theme.colors.error + '15' }]}>
                  <MaterialCommunityIcons name="alert-outline" size={14} color={theme.colors.error} />
                  <Text variant="labelSmall" style={{ color: theme.colors.error, marginLeft: 4 }}>
                    {data.anormalGiderSayisi} anormal
                  </Text>
                </View>
              )}
              {data.okunmamisUyariSayisi > 0 && (
                <View style={[styles.statChip, { backgroundColor: '#f59e0b18' }]}>
                  <MaterialCommunityIcons name="bell-outline" size={14} color="#f59e0b" />
                  <Text variant="labelSmall" style={{ color: '#f59e0b', marginLeft: 4 }}>
                    {data.okunmamisUyariSayisi} uyarı
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {!data && !isLoading && (
          <EmptyState
            icon="chart-line-variant"
            title="Henüz veri yok"
            description="Gider ekleyerek aylık görünümünüzü oluşturmaya başlayın."
          />
        )}
      </ScrollView>
      </AppSurface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
    paddingBottom: 116,
  },
  cardRow: {
    flexDirection: 'row',
  },
  sectionContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  kategoriRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
  },
});
