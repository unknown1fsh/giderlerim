import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useButceEkle, useKategoriler } from '../../../lib/hooks';

export default function ButceEkleEkrani() {
  const theme = useTheme();
  const { data: kategoriler } = useKategoriler();
  const ekle = useButceEkle();
  const now = new Date();

  const [secilenKategori, setSecilenKategori] = useState<number | null>(null);
  const [limitTutar, setLimitTutar] = useState('');
  const [uyariYuzdesi, setUyariYuzdesi] = useState('80');
  const [hata, setHata] = useState('');

  const handleKaydet = async () => {
    if (!secilenKategori) { setHata('Kategori secin.'); return; }
    if (!limitTutar || parseFloat(limitTutar) <= 0) { setHata('Gecerli limit girin.'); return; }
    setHata('');

    try {
      await ekle.mutateAsync({
        kategoriId: secilenKategori,
        ay: now.getMonth() + 1,
        yil: now.getFullYear(),
        limitTutar: parseFloat(limitTutar),
        uyariYuzdesi: parseInt(uyariYuzdesi) || 80,
      });
      router.back();
    } catch (err: any) {
      setHata(err.response?.data?.message || 'Butce eklenemedi.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
          <Text variant="titleLarge" style={{ fontWeight: '700' }}>Butce Ekle</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
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

          <TextInput
            label="Aylik Limit (TL)"
            value={limitTutar}
            onChangeText={setLimitTutar}
            keyboardType="decimal-pad"
            mode="outlined"
          />

          <TextInput
            label="Uyari Yuzdesi (%)"
            value={uyariYuzdesi}
            onChangeText={setUyariYuzdesi}
            keyboardType="number-pad"
            mode="outlined"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  form: { padding: 20, gap: 16 },
  sectionLabel: { fontWeight: '600' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 20 },
  saveButton: { marginTop: 8, borderRadius: 12 },
});
