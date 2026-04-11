import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { services } from '../../lib/apiClient';
import { apiHataMesaji } from '../../lib/apiError';
import { useAuthStore } from '../../lib/stores';
import { spacing, radius } from '../../theme';

export default function KayitEkrani() {
  const theme = useTheme();
  const girisYap = useAuthStore((s) => s.girisYap);
  const kullaniciGuncelle = useAuthStore((s) => s.kullaniciGuncelle);
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [sifreGizli, setSifreGizli] = useState(true);

  const handleKayit = async () => {
    if (!ad || !soyad || !email || !sifre) {
      setHata('Tum alanlari doldurun.');
      return;
    }
    if (sifre.length < 8) {
      setHata('Sifre en az 8 karakter olmalidir.');
      return;
    }
    setHata('');
    setYukleniyor(true);
    try {
      const response = await services.auth.kayitOl({ ad, soyad, email, sifre });
      const { accessToken, refreshToken } = response.data;
      girisYap(accessToken, refreshToken, {} as any);
      try {
        const profilRes = await services.auth.beniBul();
        kullaniciGuncelle(profilRes.data);
      } catch {}
      router.replace('/(tabs)');
    } catch (err: unknown) {
      setHata(apiHataMesaji(err, 'Kayit basarisiz. Lutfen tekrar deneyin.'));
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
            Giderlerim
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Yeni hesap olusturun
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <TextInput
              label="Ad"
              value={ad}
              onChangeText={setAd}
              mode="outlined"
              style={[styles.halfInput, styles.input]}
              outlineStyle={{ borderRadius: radius.md }}
            />
            <TextInput
              label="Soyad"
              value={soyad}
              onChangeText={setSoyad}
              mode="outlined"
              style={[styles.halfInput, styles.input]}
              outlineStyle={{ borderRadius: radius.md }}
            />
          </View>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            mode="outlined"
            left={<TextInput.Icon icon="email-outline" />}
            style={styles.input}
            outlineStyle={{ borderRadius: radius.md }}
          />

          <TextInput
            label="Sifre"
            value={sifre}
            onChangeText={setSifre}
            secureTextEntry={sifreGizli}
            mode="outlined"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={sifreGizli ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setSifreGizli(!sifreGizli)}
              />
            }
            style={styles.input}
            outlineStyle={{ borderRadius: radius.md }}
          />
          <HelperText type="info" padding="normal">
            En az 8 karakter.
          </HelperText>

          {hata ? (
            <HelperText type="error" visible>
              {hata}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleKayit}
            loading={yukleniyor}
            disabled={yukleniyor}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            Kayit Ol
          </Button>

          <View style={styles.linkRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Zaten hesabiniz var mi?{' '}
            </Text>
            <Link href="/(auth)/giris">
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                Giris Yap
              </Text>
            </Link>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: '700',
    fontSize: 32,
  },
  form: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
  },
  buttonContent: {
    height: 52,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
