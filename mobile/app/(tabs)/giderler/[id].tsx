import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useGiderler, useGiderSil } from '../../../lib/hooks';
import { formatPara, ODEME_YONTEMI_ETIKETLERI } from '@giderlerim/shared/utils/formatters';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { AppCard, EmptyState } from '../../../components/AppChrome';
import { appColors, spacing, radius } from '../../../theme';

export default function GiderDetayEkrani() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useGiderler();
  const sil = useGiderSil();

  const gider = data?.icerik?.find((g) => g.id === Number(id));

  const handleSil = () => {
    Alert.alert('Gider Sil', 'Bu gideri silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
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
        <ScreenHeader baslik="Gider Detayı" />
        <EmptyState icon="receipt-text-remove-outline" title="Gider bulunamadı" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="Gider Detayı" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppCard>
          <View style={styles.cardContent}>
            <View style={styles.amountRow}>
              <View style={styles.ikonCircle}>
                <Text style={{ fontSize: 28 }}>{gider.kategori.ikon}</Text>
              </View>
              <Text variant="headlineMedium" style={{ fontWeight: '700', color: theme.colors.primary }}>
                {formatPara(gider.tutar, gider.paraBirimi)}
              </Text>
            </View>

            <Divider style={{ marginVertical: spacing.xl }} />

            <DetailRow label="Kategori" value={gider.kategori.ad} theme={theme} />
            <DetailRow label="Tarih" value={gider.tarih} theme={theme} />
            <DetailRow label="Ödeme" value={ODEME_YONTEMI_ETIKETLERI[gider.odemeYontemi] || gider.odemeYontemi} theme={theme} />
            {gider.aciklama && <DetailRow label="Açıklama" value={gider.aciklama} theme={theme} />}
            {gider.notlar && <DetailRow label="Notlar" value={gider.notlar} theme={theme} />}
            <DetailRow label="Giriş Türü" value={gider.girisTuru} theme={theme} />
            {gider.anormalMi && (
              <View style={[styles.anormalBadge, { backgroundColor: theme.colors.error + '15' }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.error, fontWeight: '600' }}>
                  Anormal harcama olarak işaretlendi
                </Text>
              </View>
            )}
          </View>
        </AppCard>

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
    backgroundColor: appColors.ink,
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
});
