import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, FlatList, useWindowDimensions } from 'react-native';
import { Text, Button, Card, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fisResmiCek, galeridenSec } from '../../../lib/camera';
import { services } from '../../../lib/apiClient';
import { BelgeYuklemeResponse } from '@giderlerim/shared/services/belgeService';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

export default function BelgeYukleEkrani() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const [resimUri, setResimUri] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [durum, setDurum] = useState<BelgeYuklemeResponse | null>(null);
  const [hata, setHata] = useState('');
  const [gecmis, setGecmis] = useState<BelgeYuklemeResponse[]>([]);
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
      const res = await services.belge.gecmis();
      setGecmis(res.data || []);
    } catch {} finally {
      setGecmisYukleniyor(false);
    }
  };

  const handleKamera = async () => {
    const uri = await fisResmiCek();
    if (uri) { setResimUri(uri); setDurum(null); setHata(''); }
  };

  const handleGaleri = async () => {
    const uri = await galeridenSec();
    if (uri) { setResimUri(uri); setDurum(null); setHata(''); }
  };

  const handleYukle = async () => {
    if (!resimUri) return;
    setYukleniyor(true);
    setHata('');
    setDurum(null);

    try {
      const formData = new FormData();
      formData.append('dosya', {
        uri: resimUri,
        name: 'fis.jpg',
        type: 'image/jpeg',
      } as any);

      const result = await services.belge.dosyaYukle(formData);
      setDurum(result.data);

      if (result.data.durum === 'ISLENIYOR') {
        pollingRef.current = setInterval(async () => {
          try {
            const durumRes = await services.belge.durumSorgula(result.data.id);
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
        if (result.data.durum === 'TAMAMLANDI') {
          queryClient.invalidateQueries({ queryKey: ['giderler'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
        gecmisGetir();
      }
    } catch (err: any) {
      setHata(err.response?.data?.message || 'Yukleme basarisiz. Lutfen tekrar deneyin.');
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
      <ScreenHeader baslik="Belge Yukle" />

      <FlatList
        data={gecmis}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22, marginBottom: spacing.lg }}>
              Fis, fatura veya belge fotografi cekin. AI otomatik olarak giderleri tanimlayip kaydeder.
            </Text>

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={handleKamera}
                style={styles.actionBtn}
                icon="camera"
                disabled={yukleniyor}
                contentStyle={{ height: 48 }}
              >
                Kamera
              </Button>
              <Button
                mode="outlined"
                onPress={handleGaleri}
                style={styles.actionBtn}
                icon="image"
                disabled={yukleniyor}
                contentStyle={{ height: 48 }}
              >
                Galeri
              </Button>
            </View>

            {resimUri && (
              <Card style={[styles.preview, { backgroundColor: theme.colors.surface }]}>
                <Image
                  source={{ uri: resimUri }}
                  style={[styles.image, { height: width * 0.7 }]}
                  resizeMode="contain"
                />
              </Card>
            )}

            {resimUri && !durum && (
              <Button
                mode="contained"
                onPress={handleYukle}
                loading={yukleniyor}
                disabled={yukleniyor}
                style={styles.uploadBtn}
                contentStyle={{ height: 52 }}
                icon="upload"
                labelStyle={{ fontSize: 16, fontWeight: '600' }}
              >
                Yukle ve Tara
              </Button>
            )}

            {yukleniyor && durum?.durum === 'ISLENIYOR' && (
              <View style={styles.durumContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginLeft: spacing.md, color: theme.colors.onSurfaceVariant }}>
                  Belge taraniyor...
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
                      {durum.islenenSatir} gider otomatik olarak eklendi!
                    </Text>
                  )}
                  {durum.durum === 'HATA' && (
                    <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                      {durum.hataMesaji || 'Belge islenirken hata olustu.'}
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
                {item.islenenSatir > 0 && (
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    {item.islenenSatir} gider
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          gecmisYukleniyor ? (
            <ActivityIndicator size="small" style={{ marginTop: spacing.lg }} />
          ) : null
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radius.md,
  },
  preview: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  uploadBtn: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
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
