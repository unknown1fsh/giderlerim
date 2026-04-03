import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { services } from '../../../lib/apiClient';
import { CsvYuklemeResponse } from '@giderlerim/shared/services/csvService';
import { useQueryClient } from '@tanstack/react-query';

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
      <View style={styles.header}>
        <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
        <Text variant="titleLarge" style={{ fontWeight: '700' }}>CSV Yukle</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={gecmis}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              CSV dosyanizi secin. Dosyada tarih, tutar, aciklama ve odeme yontemi sutunlari otomatik olarak tanimlanir.
            </Text>

            <Button
              mode="contained"
              onPress={handleDosyaSec}
              icon="file-upload"
              disabled={yukleniyor}
              loading={yukleniyor && !durum}
              style={styles.selectBtn}
              contentStyle={{ height: 52 }}
            >
              CSV Dosya Sec
            </Button>

            {secilenDosya && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>
                Secilen: {secilenDosya}
              </Text>
            )}

            {yukleniyor && durum?.durum === 'ISLENIYOR' && (
              <View style={styles.durumContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginLeft: 12, color: theme.colors.onSurfaceVariant }}>
                  CSV isleniyor...
                </Text>
              </View>
            )}

            {durum && durum.durum !== 'ISLENIYOR' && (
              <Card style={[styles.sonucCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={{ gap: 8 }}>
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
              <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8, textAlign: 'center' }}>
                {hata}
              </Text>
            ) : null}

            {gecmis.length > 0 && (
              <>
                <Divider style={{ marginTop: 24, marginBottom: 12 }} />
                <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
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
                <Text variant="bodyMedium" numberOfLines={1}>{item.dosyaAdi}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="labelSmall" style={{ color: getDurumRenk(item.durum), fontWeight: '600' }}>
                  {getDurumMetin(item.durum)}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.islenenSatir} / {item.toplamSatir}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          gecmisYukleniyor ? <ActivityIndicator size="small" style={{ marginTop: 16 }} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  content: { padding: 20 },
  selectBtn: { borderRadius: 12 },
  durumContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, justifyContent: 'center' },
  sonucCard: { marginTop: 16, borderRadius: 16 },
  durumRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  gecmisCard: { borderRadius: 12 },
  gecmisContent: { flexDirection: 'row', alignItems: 'center' },
});
