import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useButceEkle, useKategoriler } from '../../../lib/hooks';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { AppCard } from '../../../components/AppChrome';
import { appColors, spacing, radius } from '../../../theme';

export default function ButceEkleEkrani() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { data: kategoriler } = useKategoriler();
  const ekle = useButceEkle();
  const now = new Date();

  const [secilenKategori, setSecilenKategori] = useState<number | null>(null);
  const [limitTutar, setLimitTutar] = useState('');
  const [uyariYuzdesi, setUyariYuzdesi] = useState('80');
  const [hata, setHata] = useState('');

  const handleKaydet = async () => {
    if (!secilenKategori) { setHata('Kategori seçin.'); return; }
    if (!limitTutar || parseFloat(limitTutar) <= 0) { setHata('Geçerli limit girin.'); return; }
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
      setHata(err.response?.data?.message || 'Bütçe eklenemedi.');
    }
  };

  const chipMinWidth = Math.max(90, (width - spacing.xl * 2 - spacing.sm * 3) / 3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="Bütçe Ekle" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppCard style={styles.formCard}>
          <Text variant="labelLarge" style={styles.sectionLabel}>Kategori</Text>
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

          <TextInput
            label="Aylık Limit (TL)"
            value={limitTutar}
            onChangeText={setLimitTutar}
            keyboardType="decimal-pad"
            mode="outlined"
            left={<TextInput.Icon icon="currency-try" />}
            style={styles.input}
            outlineStyle={{ borderRadius: radius.md }}
          />

          <TextInput
            label="Uyarı Yüzdesi (%)"
            value={uyariYuzdesi}
            onChangeText={setUyariYuzdesi}
            keyboardType="number-pad"
            mode="outlined"
            left={<TextInput.Icon icon="percent" />}
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
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  formCard: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionLabel: {
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.xl,
    borderColor: appColors.orange,
  },
  input: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
  },
});
