import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { services } from '../../../lib/apiClient';
import { CsvYuklemeResponse } from '@giderlerim/shared/services/csvService';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

export default function CsvYukleEkrani() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [durum, setDurum] = useState<CsvYuklemeResponse | null>(null);
  const [hata, setHata] = useState('');
  const [secilenDosya, setSecilenDosya] = useState<string | null>(null);
  const [gecmis, setGecmis] = useState<CsvYuklemeResponse[]>([]);
  const [gecmisYukleniyor, setGecmisYukleniyor] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    gecmisGetir();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const gecmisGetir = async () => {
    try {
      const res = await services.csv.gecmis();
      setGecmis(res.data || []);
    } catch {} finally {
      setGecmisYukleniyor(false);
    }
  };

  const handleDosyaSec = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setSecilenDosya(asset.name);
      setDurum(null);
      setHata('');

      setYukleniyor(true);
      const formData = new FormData();
      formData.append('dosya', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'text/csv',
      } as any);

      const uploadRes = await services.csv.dosyaYukle(formData);
      setDurum(uploadRes.data);

      if (uploadRes.data.durum === 'ISLENIYOR') {
        pollingRef.current = setInterval(async () => {
          try {
            const durumRes = await services.csv.durumSorgula(uploadRes.data.id);
            setDurum(durumRes.data);
            if (durumRes.data.durum !== 'ISLENIYOR') {
              if (pollingRef.current) clearInterval(pollingRef.current);
              pollingRef.current = null;
              setYukleniyor(false);
              if (durumRes.data.durum === 'TAMAMLANDI') {
                queryClient.invalidateQueries({ queryKey: ['giderler'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              }
              gecmisGetir();
            }
          } catch {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            setYukleniyor(false);
          }
        }, 2000);
      } else {
        setYukleniyor(false);
        if (uploadRes.data.durum === 'TAMAMLANDI') {
          queryClient.invalidateQueries({ queryKey: ['giderler'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
        gecmisGetir();
      }
    } catch (err: any) {
      setHata(err.response?.data?.message || 'CSV yuklenemedi.');
      setYukleniyor(false);
    }
  };

  const getDurumRenk = (d: string) => {
    switch (d) {
      case 'TAMAMLANDI': return '#22c55e';
      case 'HATA': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const getDurumMetin = (d: string) => {
    switch (d) {
      case 'ISLENIYOR': return 'Isleniyor...';
      case 'TAMAMLANDI': return 'Tamamlandi';
      case 'HATA': return 'Hata';
      default: return d;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="CSV Yukle" />

      <FlatList
        data={gecmis}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22, marginBottom: spacing.lg }}>
              CSV dosyanizi secin. Dosyada tarih, tutar, aciklama ve odeme yontemi sutunlari otomatik olarak tanimlanir.
            </Text>

            <Button
              mode="contained"
              onPress={handleDosyaSec}
              icon="file-upload-outline"
              disabled={yukleniyor}
              loading={yukleniyor && !durum}
              style={styles.selectBtn}
              contentStyle={{ height: 52 }}
              labelStyle={{ fontSize: 16, fontWeight: '600' }}
            >
              CSV Dosya Sec
            </Button>

            {secilenDosya && (
              <View style={[styles.fileBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                  Secilen: {secilenDosya}
                </Text>
              </View>
            )}

            {yukleniyor && durum?.durum === 'ISLENIYOR' && (
              <View style={styles.durumContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginLeft: spacing.md, color: theme.colors.onSurfaceVariant }}>
                  CSV isleniyor...
                </Text>
              </View>
            )}

            {durum && durum.durum !== 'ISLENIYOR' && (
              <Card style={[styles.sonucCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={{ gap: spacing.sm }}>
                  <View style={styles.durumRow}>
                    <Text variant="labelLarge" style={{ fontWeight: '700' }}>Durum:</Text>
                    <Text variant="bodyMedium" style={{ color: getDurumRenk(durum.durum), fontWeight: '600' }}>
                      {getDurumMetin(durum.durum)}
                    </Text>
                  </View>
                  {durum.durum === 'TAMAMLANDI' && (
                    <Text variant="bodyMedium" style={{ color: '#22c55e' }}>
                      {durum.islenenSatir} / {durum.toplamSatir} gider basariyla eklendi!
                    </Text>
                  )}
                  {durum.durum === 'HATA' && (
                    <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                      {durum.hataMesaji || 'CSV islenirken hata olustu.'}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            )}

            {hata ? (
              <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: spacing.sm, textAlign: 'center' }}>
                {hata}
              </Text>
            ) : null}

            {gecmis.length > 0 && (
              <>
                <Divider style={{ marginTop: spacing.xxl, marginBottom: spacing.md }} />
                <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: spacing.md }}>
                  Gecmis Yuklemeler
                </Text>
              </>
            )}
          </>
        }
        renderItem={({ item }) => (
          <Card style={[styles.gecmisCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.gecmisContent}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
                  {item.dosyaAdi}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="labelSmall" style={{ color: getDurumRenk(item.durum), fontWeight: '700' }}>
                  {getDurumMetin(item.durum)}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                  {item.islenenSatir} / {item.toplamSatir}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          gecmisYukleniyor ? <ActivityIndicator size="small" style={{ marginTop: spacing.lg }} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  selectBtn: {
    borderRadius: radius.md,
  },
  fileBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: 'center',
  },
  durumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    justifyContent: 'center',
  },
  sonucCard: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
  },
  durumRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  gecmisCard: {
    borderRadius: radius.md,
    elevation: 1,
  },
  gecmisContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
