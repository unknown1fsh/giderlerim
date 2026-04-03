import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useGiderler, useGiderSil } from '../../../lib/hooks';
import { formatPara, ODEME_YONTEMI_ETIKETLERI } from '@giderlerim/shared/utils/formatters';

export default function GiderDetayEkrani() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useGiderler();
  const sil = useGiderSil();

  const gider = data?.icerik?.find((g) => g.id === Number(id));

  const handleSil = () => {
    Alert.alert('Gider Sil', 'Bu gideri silmek istediginize emin misiniz?', [
      { text: 'Iptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await sil.mutateAsync(Number(id));
          router.back();
        },
      },
    ]);
  };

  if (!gider) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
        </View>
        <View style={styles.empty}>
          <Text variant="bodyLarge">Gider bulunamadi</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
        <Text variant="titleLarge" style={{ fontWeight: '700' }}>Gider Detayi</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.amountRow}>
              <Text style={{ fontSize: 20 }}>{gider.kategori.ikon}</Text>
              <Text variant="headlineMedium" style={{ fontWeight: '700', color: theme.colors.primary }}>
                {formatPara(gider.tutar, gider.paraBirimi)}
              </Text>
            </View>

            <Divider style={{ marginVertical: 16 }} />

            <DetailRow label="Kategori" value={gider.kategori.ad} />
            <DetailRow label="Tarih" value={gider.tarih} />
            <DetailRow label="Odeme" value={ODEME_YONTEMI_ETIKETLERI[gider.odemeYontemi] || gider.odemeYontemi} />
            {gider.aciklama && <DetailRow label="Aciklama" value={gider.aciklama} />}
            {gider.notlar && <DetailRow label="Notlar" value={gider.notlar} />}
            <DetailRow label="Giris Turu" value={gider.girisTuru} />
            {gider.anormalMi && (
              <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
                Anormal harcama olarak isaretlendi
              </Text>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={handleSil}
          loading={sil.isPending}
          textColor={theme.colors.error}
          style={styles.deleteButton}
        >
          Gideri Sil
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="bodyMedium" style={{ color: '#6B7280', flex: 1 }}>{label}</Text>
      <Text variant="bodyMedium" style={{ fontWeight: '500', flex: 2, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', paddingVertical: 8 },
  detailRow: { flexDirection: 'row', paddingVertical: 8 },
  deleteButton: { borderColor: '#ef4444', borderRadius: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
