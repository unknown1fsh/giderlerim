import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useGiderler, useGiderSil } from '../../../lib/hooks';
import { formatPara, ODEME_YONTEMI_ETIKETLERI } from '@giderlerim/shared/utils/formatters';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

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
        <ScreenHeader baslik="Gider Detayi" />
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Gider bulunamadi
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="Gider Detayi" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.amountRow}>
              <View style={[styles.ikonCircle, { backgroundColor: gider.kategori.renk + '18' }]}>
                <Text style={{ fontSize: 28 }}>{gider.kategori.ikon}</Text>
              </View>
              <Text variant="headlineMedium" style={{ fontWeight: '700', color: theme.colors.primary }}>
                {formatPara(gider.tutar, gider.paraBirimi)}
              </Text>
            </View>

            <Divider style={{ marginVertical: spacing.xl }} />

            <DetailRow label="Kategori" value={gider.kategori.ad} theme={theme} />
            <DetailRow label="Tarih" value={gider.tarih} theme={theme} />
            <DetailRow label="Odeme" value={ODEME_YONTEMI_ETIKETLERI[gider.odemeYontemi] || gider.odemeYontemi} theme={theme} />
            {gider.aciklama && <DetailRow label="Aciklama" value={gider.aciklama} theme={theme} />}
            {gider.notlar && <DetailRow label="Notlar" value={gider.notlar} theme={theme} />}
            <DetailRow label="Giris Turu" value={gider.girisTuru} theme={theme} />
            {gider.anormalMi && (
              <View style={[styles.anormalBadge, { backgroundColor: theme.colors.error + '15' }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.error, fontWeight: '600' }}>
                  Anormal harcama olarak isaretlendi
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={handleSil}
          loading={sil.isPending}
          textColor={theme.colors.error}
          style={styles.deleteButton}
          contentStyle={{ height: 48 }}
          icon="delete-outline"
        >
          Gideri Sil
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
        {label}
      </Text>
      <Text
        variant="bodyMedium"
        style={{ fontWeight: '500', flex: 2, textAlign: 'right', color: theme.colors.onSurface }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
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
    padding: spacing.xl,
  },
  amountRow: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  ikonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    minHeight: 44,
    alignItems: 'center',
  },
  anormalBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  deleteButton: {
    borderColor: '#ef4444',
    borderRadius: radius.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
