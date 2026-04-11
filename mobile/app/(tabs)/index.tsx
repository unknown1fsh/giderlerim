import { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDashboard } from '../../lib/hooks';
import { formatPara, AY_ADLARI } from '@giderlerim/shared/utils/formatters';
import { DashboardOzetKart } from '../../components/DashboardOzetKart';
import { ButceProgressBar } from '../../components/ButceProgressBar';
import { spacing, radius } from '../../theme';

export default function DashboardEkrani() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const now = new Date();
  const [ay] = useState(now.getMonth() + 1);
  const [yil] = useState(now.getFullYear());
  const { data, isLoading, refetch } = useDashboard(ay, yil);

  const cardGap = spacing.md;
  const cardWidth = (width - spacing.xl * 2 - cardGap) / 2;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
          {AY_ADLARI[ay - 1]} {yil}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          Aylik harcama ozeti
        </Text>
      </View>

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
                renk={theme.colors.primary}
              />
              <DashboardOzetKart
                baslik="Nakit"
                deger={formatPara(data.nakitHarcama)}
                renk="#22c55e"
              />
            </View>

            <View style={[styles.cardRow, { gap: cardGap }]}>
              <DashboardOzetKart
                baslik="Kredi Karti"
                deger={formatPara(data.krediKartiHarcama)}
                renk="#f59e0b"
              />
              <DashboardOzetKart
                baslik="Degisim"
                deger={`${data.degisimYuzdesi >= 0 ? '+' : ''}${data.degisimYuzdesi.toFixed(1)}%`}
                renk={data.degisimYuzdesi > 0 ? '#ef4444' : '#22c55e'}
              />
            </View>

            {data.kategoriDagilimi.length > 0 && (
              <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.sectionContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Kategori Dagilimi
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
                </Card.Content>
              </Card>
            )}

            {data.butceDurumlari.length > 0 && (
              <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.sectionContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Butce Durumlari
                  </Text>
                  {data.butceDurumlari.map((butce) => (
                    <ButceProgressBar key={butce.butceId} butce={butce} />
                  ))}
                </Card.Content>
              </Card>
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
                    {data.okunmamisUyariSayisi} uyari
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {!data && !isLoading && (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="chart-line-variant"
              size={64}
              color={theme.colors.onSurfaceVariant}
              style={{ opacity: 0.4 }}
            />
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.lg }}
            >
              Henuz veri yok
            </Text>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginTop: spacing.xs,
                textAlign: 'center',
                opacity: 0.7,
              }}
            >
              Gider ekleyerek baslayin
            </Text>
          </View>
        )}
      </ScrollView>
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
  content: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
  },
  section: {
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
  },
});
