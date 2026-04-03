import { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard } from '../../lib/hooks';
import { formatPara, AY_ADLARI } from '@giderlerim/shared/utils/formatters';
import { DashboardOzetKart } from '../../components/DashboardOzetKart';
import { ButceProgressBar } from '../../components/ButceProgressBar';

export default function DashboardEkrani() {
  const theme = useTheme();
  const now = new Date();
  const [ay] = useState(now.getMonth() + 1);
  const [yil] = useState(now.getFullYear());
  const { data, isLoading, refetch } = useDashboard(ay, yil);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
          {AY_ADLARI[ay - 1]} {yil}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {data && (
          <>
            <View style={styles.cardRow}>
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

            <View style={styles.cardRow}>
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
                <Card.Content>
                  <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 12 }}>
                    Kategori Dagilimi
                  </Text>
                  {data.kategoriDagilimi.slice(0, 5).map((kat) => (
                    <View key={kat.kategoriId} style={styles.kategoriRow}>
                      <Text style={{ fontSize: 16 }}>{kat.kategoriIkon}</Text>
                      <Text variant="bodyMedium" style={{ flex: 1, marginLeft: 8 }}>
                        {kat.kategoriAd}
                      </Text>
                      <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                        {formatPara(kat.toplam)}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8, width: 40, textAlign: 'right' }}>
                        %{kat.yuzde.toFixed(0)}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {data.butceDurumlari.length > 0 && (
              <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 12 }}>
                    Butce Durumlari
                  </Text>
                  {data.butceDurumlari.map((butce) => (
                    <ButceProgressBar key={butce.butceId} butce={butce} />
                  ))}
                </Card.Content>
              </Card>
            )}

            <View style={styles.statsRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {data.toplamGiderSayisi} gider
              </Text>
              {data.anormalGiderSayisi > 0 && (
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  {data.anormalGiderSayisi} anormal
                </Text>
              )}
              {data.okunmamisUyariSayisi > 0 && (
                <Text variant="bodySmall" style={{ color: '#f59e0b' }}>
                  {data.okunmamisUyariSayisi} uyari
                </Text>
              )}
            </View>
          </>
        )}

        {!data && !isLoading && (
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              Henuz veri yok
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  content: { padding: 16, gap: 16 },
  cardRow: { flexDirection: 'row', gap: 12 },
  section: { borderRadius: 16, elevation: 1 },
  kategoriRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
});
