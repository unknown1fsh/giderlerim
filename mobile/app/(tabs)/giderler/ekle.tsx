import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, useTheme, SegmentedButtons, HelperText, ActivityIndicator, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { useGiderEkle, useKategoriler } from '../../../lib/hooks';
import { GiderOlusturRequest, OdemeYontemi } from '@giderlerim/shared/types/gider.types';
import { ODEME_YONTEMI_ETIKETLERI } from '@giderlerim/shared/utils/formatters';
import { fisResmiCek, galeridenSec } from '../../../lib/camera';
import { services } from '../../../lib/apiClient';
import { BelgeYuklemeResponse } from '@giderlerim/shared/services/belgeService';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

type EkleModu = 'manuel' | 'fis';

export default function GiderEkleEkrani() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const { data: kategoriler } = useKategoriler();
  const ekle = useGiderEkle();

  const [mod, setMod] = useState<EkleModu>('manuel');
  const [form, setForm] = useState<Partial<GiderOlusturRequest>>({
    tarih: format(new Date(), 'yyyy-MM-dd'),
    odemeYontemi: 'NAKIT',
  });
  const [hata, setHata] = useState('');
  const [secilenKategori, setSecilenKategori] = useState<number | null>(null);

  const [resimUri, setResimUri] = useState<string | null>(null);
  const [fisYukleniyor, setFisYukleniyor] = useState(false);
  const [fisDurum, setFisDurum] = useState<BelgeYuklemeResponse | null>(null);
  const [fisHata, setFisHata] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleKaydet = async () => {
    if (!secilenKategori) { setHata('Kategori secin.'); return; }
    if (!form.tutar || form.tutar <= 0) { setHata('Gecerli bir tutar girin.'); return; }
    setHata('');

    try {
      await ekle.mutateAsync({
        ...form,
        kategoriId: secilenKategori,
        tutar: form.tutar!,
        tarih: form.tarih!,
      });
      router.back();
    } catch (err: any) {
      setHata(err.response?.data?.message || 'Gider eklenemedi.');
    }
  };

  const handleKamera = async () => {
    const uri = await fisResmiCek();
    if (uri) { setResimUri(uri); setFisDurum(null); setFisHata(''); }
  };

  const handleGaleri = async () => {
    const uri = await galeridenSec();
    if (uri) { setResimUri(uri); setFisDurum(null); setFisHata(''); }
  };

  const handleFisYukle = async () => {
    if (!resimUri) return;
    setFisYukleniyor(true);
    setFisHata('');
    setFisDurum(null);

    try {
      const formData = new FormData();
      formData.append('dosya', {
        uri: resimUri,
        name: 'fis.jpg',
        type: 'image/jpeg',
      } as any);

      const result = await services.belge.dosyaYukle(formData);
      setFisDurum(result.data);

      if (result.data.durum === 'ISLENIYOR') {
        pollingRef.current = setInterval(async () => {
          try {
            const durumRes = await services.belge.durumSorgula(result.data.id);
            setFisDurum(durumRes.data);
            if (durumRes.data.durum !== 'ISLENIYOR') {
              if (pollingRef.current) clearInterval(pollingRef.current);
              pollingRef.current = null;
              setFisYukleniyor(false);
              if (durumRes.data.durum === 'TAMAMLANDI') {
                queryClient.invalidateQueries({ queryKey: ['giderler'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              }
            }
          } catch {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            setFisYukleniyor(false);
          }
        }, 2000);
      } else {
        setFisYukleniyor(false);
        if (result.data.durum === 'TAMAMLANDI') {
          queryClient.invalidateQueries({ queryKey: ['giderler'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      }
    } catch (err: any) {
      setFisHata(err.response?.data?.message || 'Fis yuklenemedi. Lutfen tekrar deneyin.');
      setFisYukleniyor(false);
    }
  };

  const odemeSecenekleri = Object.entries(ODEME_YONTEMI_ETIKETLERI).map(([value, label]) => ({
    value,
    label: label.substring(0, 6),
  }));

  const getDurumRenk = (durum: string) => {
    switch (durum) {
      case 'TAMAMLANDI': return '#22c55e';
      case 'HATA': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const getDurumMetin = (durum: string) => {
    switch (durum) {
      case 'ISLENIYOR': return 'Isleniyor...';
      case 'TAMAMLANDI': return 'Tamamlandi';
      case 'HATA': return 'Hata';
      default: return durum;
    }
  };

  const chipMinWidth = Math.max(90, (width - spacing.xl * 2 - spacing.sm * 3) / 3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="Gider Ekle" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modToggle}>
          <SegmentedButtons
            value={mod}
            onValueChange={(v) => setMod(v as EkleModu)}
            buttons={[
              { value: 'manuel', label: 'Manuel Ekle', icon: 'pencil' },
              { value: 'fis', label: 'Fis ile Ekle', icon: 'camera' },
            ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {mod === 'manuel' ? (
            <>
              <TextInput
                label="Tutar"
                value={form.tutar?.toString() || ''}
                onChangeText={(v) => setForm({ ...form, tutar: parseFloat(v) || 0 })}
                keyboardType="decimal-pad"
                mode="outlined"
                left={<TextInput.Icon icon="currency-try" />}
                style={styles.input}
                outlineStyle={{ borderRadius: radius.md }}
              />

              <TextInput
                label="Aciklama"
                value={form.aciklama || ''}
                onChangeText={(v) => setForm({ ...form, aciklama: v })}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: radius.md }}
              />

              <TextInput
                label="Tarih"
                value={form.tarih || ''}
                onChangeText={(v) => setForm({ ...form, tarih: v })}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                style={styles.input}
                outlineStyle={{ borderRadius: radius.md }}
              />

              <Text variant="labelLarge" style={styles.sectionLabel}>
                Kategori
              </Text>
              <View style={styles.chipContainer}>
                {kategoriler?.map((kat) => (
                  <Button
                    key={kat.id}
                    mode={secilenKategori === kat.id ? 'contained' : 'outlined'}
                    onPress={() => setSecilenKategori(kat.id)}
                    compact
                    style={[styles.chip, { minWidth: chipMinWidth }]}
                    labelStyle={{ fontSize: 12 }}
                  >
                    {kat.ikon} {kat.ad}
                  </Button>
                ))}
              </View>

              <Text variant="labelLarge" style={styles.sectionLabel}>
                Odeme Yontemi
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <SegmentedButtons
                  value={form.odemeYontemi || 'NAKIT'}
                  onValueChange={(v) => setForm({ ...form, odemeYontemi: v as OdemeYontemi })}
                  buttons={odemeSecenekleri}
                  density="small"
                />
              </ScrollView>

              <TextInput
                label="Notlar (istege bagli)"
                value={form.notlar || ''}
                onChangeText={(v) => setForm({ ...form, notlar: v })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                outlineStyle={{ borderRadius: radius.md }}
              />

              {hata ? <HelperText type="error" visible>{hata}</HelperText> : null}

              <Button
                mode="contained"
                onPress={handleKaydet}
                loading={ekle.isPending}
                disabled={ekle.isPending}
                style={styles.saveButton}
                contentStyle={{ height: 52 }}
                labelStyle={{ fontSize: 16, fontWeight: '600' }}
              >
                Kaydet
              </Button>
            </>
          ) : (
            <>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.md }}>
                Fis veya fatura fotografini cekin ya da galeriden secin. AI otomatik olarak gider bilgilerini tanimlayip kaydedecek.
              </Text>

              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={handleKamera}
                  style={styles.actionBtn}
                  icon="camera"
                  disabled={fisYukleniyor}
                  contentStyle={{ height: 48 }}
                >
                  Kamera
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleGaleri}
                  style={styles.actionBtn}
                  icon="image"
                  disabled={fisYukleniyor}
                  contentStyle={{ height: 48 }}
                >
                  Galeri
                </Button>
              </View>

              {resimUri && (
                <Card style={[styles.preview, { backgroundColor: theme.colors.surface }]}>
                  <Image
                    source={{ uri: resimUri }}
                    style={[styles.image, { height: width * 0.65 }]}
                    resizeMode="contain"
                  />
                </Card>
              )}

              {resimUri && !fisDurum && (
                <Button
                  mode="contained"
                  onPress={handleFisYukle}
                  loading={fisYukleniyor}
                  disabled={fisYukleniyor}
                  style={styles.saveButton}
                  contentStyle={{ height: 52 }}
                  icon="upload"
                  labelStyle={{ fontSize: 16, fontWeight: '600' }}
                >
                  Yukle ve Tara
                </Button>
              )}

              {fisYukleniyor && fisDurum?.durum === 'ISLENIYOR' && (
                <View style={styles.durumContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={{ marginLeft: spacing.md, color: theme.colors.onSurfaceVariant }}>
                    Fis taraniyor, giderler cikartiliyor...
                  </Text>
                </View>
              )}

              {fisDurum && fisDurum.durum !== 'ISLENIYOR' && (
                <Card style={[styles.sonucCard, { backgroundColor: theme.colors.surface }]}>
                  <Card.Content style={{ gap: spacing.sm }}>
                    <View style={styles.durumRow}>
                      <Text variant="labelLarge" style={{ fontWeight: '700' }}>Durum:</Text>
                      <Text variant="bodyMedium" style={{ color: getDurumRenk(fisDurum.durum), fontWeight: '600' }}>
                        {getDurumMetin(fisDurum.durum)}
                      </Text>
                    </View>

                    {fisDurum.durum === 'TAMAMLANDI' && (
                      <>
                        <Text variant="bodyMedium" style={{ color: '#22c55e' }}>
                          {fisDurum.islenenSatir} gider otomatik olarak eklendi!
                        </Text>
                        <Button
                          mode="contained"
                          onPress={() => router.back()}
                          style={{ marginTop: spacing.sm, borderRadius: radius.md }}
                        >
                          Giderlere Don
                        </Button>
                      </>
                    )}

                    {fisDurum.durum === 'HATA' && (
                      <>
                        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                          {fisDurum.hataMesaji || 'Fis islenirken hata olustu.'}
                        </Text>
                        <Button
                          mode="outlined"
                          onPress={() => { setFisDurum(null); setResimUri(null); }}
                          style={{ marginTop: spacing.sm, borderRadius: radius.md }}
                        >
                          Tekrar Dene
                        </Button>
                      </>
                    )}
                  </Card.Content>
                </Card>
              )}

              {fisHata ? <HelperText type="error" visible>{fisHata}</HelperText> : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modToggle: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  form: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: 'transparent',
  },
  sectionLabel: {
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.xl,
  },
  saveButton: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
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
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  durumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    justifyContent: 'center',
  },
  sonucCard: {
    borderRadius: radius.lg,
  },
  durumRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
