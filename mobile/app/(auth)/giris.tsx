import { useState } from 'react';
import { Image, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../lib/stores';
import { appColors, spacing, radius, shadows } from '../../theme';
import type { KullaniciResponse } from '@giderlerim/shared/types/kullanici.types';

const DEMO_EMAIL = 'demo@giderlerim.app';
const DEMO_SIFRE = 'demo1234';

const demoKullanici: KullaniciResponse = {
  id: 1,
  ad: 'Demo',
  soyad: 'Kullanıcı',
  email: DEMO_EMAIL,
  plan: 'ULTRA',
  paraBirimi: 'TRY',
  avatarUrl: null,
  adminMi: true,
};

export default function GirisEkrani() {
  const theme = useTheme();
  const girisYap = useAuthStore((s) => s.girisYap);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [sifre, setSifre] = useState(DEMO_SIFRE);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [sifreGizli, setSifreGizli] = useState(true);

  const handleGiris = async () => {
    if (!email || !sifre) {
      setHata('Email ve şifre gereklidir.');
      return;
    }
    if (email.trim().toLowerCase() !== DEMO_EMAIL || sifre !== DEMO_SIFRE) {
      setHata(`Demo giriş için ${DEMO_EMAIL} / ${DEMO_SIFRE} kullanın.`);
      return;
    }
    setHata('');
    setYukleniyor(true);
    try {
      // Backend hazır olana kadar mobil demo oturumu yerelde açılıyor.
      // Eski akış: services.auth.girisYap(...) ve services.auth.beniBul().
      girisYap('demo-access-token', 'demo-refresh-token', demoKullanici);
      router.replace('/(tabs)');
    } catch {
      setHata('Demo giriş başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.brandBand} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text variant="headlineLarge" style={styles.title}>
            Giderlerim
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Harcamalarınızı daha net yönetin.
          </Text>
        </View>

        <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
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
            label="Şifre"
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

          {hata ? (
            <HelperText type="error" visible>
              {hata}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleGiris}
            loading={yukleniyor}
            disabled={yukleniyor}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            Giriş Yap
          </Button>

          <View style={styles.linkRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Hesabınız yok mu?{' '}
            </Text>
            <Link href="/(auth)/kayit">
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                Kayıt Ol
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
  brandBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: appColors.ink,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 26,
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: '900',
    fontSize: 32,
    color: '#FFF7ED',
  },
  subtitle: {
    color: '#C8B6A6',
  },
  form: {
    gap: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    ...shadows.card,
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
