import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
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

type EkleModu = 'manuel' | 'fis';

export default function GiderEkleEkrani() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: kategoriler } = useKategoriler();
  const ekle = useGiderEkle();

  const [mod, setMod] = useState<EkleModu>('manuel');

  // Manuel form state
  const [form, setForm] = useState<Partial<GiderOlusturRequest>>({
    tarih: format(new Date(), 'yyyy-MM-dd'),
    odemeYontemi: 'NAKIT',
  });
  const [hata, setHata] = useState('');
  const [secilenKategori, setSecilenKategori] = useState<number | null>(null);

  // Fis (receipt) state
  const [resimUri, setResimUri] = useState<string | null>(null);
  const [fisYukleniyor, setFisYukleniyor] = useState(false);
  const [fisDurum, setFisDurum] = useState<BelgeYuklemeResponse | null>(null);
  const [fisHata, setFisHata] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
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
    if (uri) {
      setResimUri(uri);
      setFisDurum(null);
      setFisHata('');
    }
  };

  const handleGaleri = async () => {
    const uri = await galeridenSec();
    if (uri) {
      setResimUri(uri);
      setFisDurum(null);
      setFisHata('');
    }
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

      // Start polling if processing
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
                // Invalidate gider queries to show new expenses
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
          <Text variant="titleLarge" style={{ fontWeight: '700' }}>Gider Ekle</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Mode Toggle */}
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

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
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
              />

              <TextInput
                label="Aciklama"
                value={form.aciklama || ''}
                onChangeText={(v) => setForm({ ...form, aciklama: v })}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Tarih"
                value={form.tarih || ''}
                onChangeText={(v) => setForm({ ...form, tarih: v })}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />

              <Text variant="labelLarge" style={styles.sectionLabel}>Kategori</Text>
              <View style={styles.chipContainer}>
                {kategoriler?.map((kat) => (
                  <Button
                    key={kat.id}
                    mode={secilenKategori === kat.id ? 'contained' : 'outlined'}
                    onPress={() => setSecilenKategori(kat.id)}
                    compact
                    style={styles.chip}
                    labelStyle={{ fontSize: 12 }}
                  >
                    {kat.ikon} {kat.ad}
                  </Button>
                ))}
              </View>

              <Text variant="labelLarge" style={styles.sectionLabel}>Odeme Yontemi</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              />

              {hata ? <HelperText type="error" visible>{hata}</HelperText> : null}

              <Button
                mode="contained"
                onPress={handleKaydet}
                loading={ekle.isPending}
                disabled={ekle.isPending}
                style={styles.saveButton}
                contentStyle={{ height: 52 }}
              >
                Kaydet
              </Button>
            </>
          ) : (
            <>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                Fis veya fatura fotografini cekin ya da galeriden secin. AI otomatik olarak gider bilgilerini tanimlayip kaydedecek.
              </Text>

              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={handleKamera}
                  style={styles.actionBtn}
                  icon="camera"
                  disabled={fisYukleniyor}
                >
                  Kamera
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleGaleri}
                  style={styles.actionBtn}
                  icon="image"
                  disabled={fisYukleniyor}
                >
                  Galeri
                </Button>
              </View>

              {resimUri && (
                <Card style={[styles.preview, { backgroundColor: theme.colors.surface }]}>
                  <Image source={{ uri: resimUri }} style={styles.image} resizeMode="contain" />
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
                >
                  Yukle ve Tara
                </Button>
              )}

              {fisYukleniyor && fisDurum?.durum === 'ISLENIYOR' && (
                <View style={styles.durumContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={{ marginLeft: 12, color: theme.colors.onSurfaceVariant }}>
                    Fis taranıyor, giderler cikartiliyor...
                  </Text>
                </View>
              )}

              {fisDurum && fisDurum.durum !== 'ISLENIYOR' && (
                <Card style={[styles.sonucCard, { backgroundColor: theme.colors.surface }]}>
                  <Card.Content style={{ gap: 8 }}>
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
                          style={{ marginTop: 8, borderRadius: 12 }}
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
                          onPress={() => {
                            setFisDurum(null);
                            setResimUri(null);
                          }}
                          style={{ marginTop: 8, borderRadius: 12 }}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  modToggle: { paddingHorizontal: 20, paddingBottom: 8 },
  form: { padding: 20, gap: 12 },
  input: { marginBottom: 4 },
  sectionLabel: { marginTop: 8, marginBottom: 4, fontWeight: '600' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 4, borderRadius: 20 },
  saveButton: { marginTop: 16, borderRadius: 12 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, borderRadius: 12 },
  preview: { marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: 280 },
  durumContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, justifyContent: 'center' },
  sonucCard: { marginTop: 16, borderRadius: 16 },
  durumRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
