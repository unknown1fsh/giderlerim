import { useState } from 'react';
import { Image, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../lib/stores';
import { appColors, spacing, radius, shadows } from '../../theme';
import type { KullaniciResponse } from '@giderlerim/shared/types/kullanici.types';

export default function KayitEkrani() {
  const theme = useTheme();
  const girisYap = useAuthStore((s) => s.girisYap);
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [sifreGizli, setSifreGizli] = useState(true);

  const handleKayit = async () => {
    if (!ad || !soyad || !email || !sifre) {
      setHata('Tüm alanları doldurun.');
      return;
    }
    if (sifre.length < 8) {
      setHata('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    setHata('');
    setYukleniyor(true);
    try {
      // Backend hazır olana kadar kayıt ekranı yerel demo oturumu açar.
      // Eski akış: services.auth.kayitOl(...) ve services.auth.beniBul().
      const demoKullanici: KullaniciResponse = {
        id: 1,
        ad,
        soyad,
        email,
        plan: 'ULTRA',
        paraBirimi: 'TRY',
        avatarUrl: null,
        adminMi: true,
      };
      girisYap('demo-access-token', 'demo-refresh-token', demoKullanici);
      router.replace('/(tabs)');
    } catch {
      setHata('Demo kayıt başlatılamadı. Lütfen tekrar deneyin.');
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
            Yeni hesabınızı oluşturun.
          </Text>
        </View>

        <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
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
            Kayıt Ol
          </Button>

          <View style={styles.linkRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Zaten hesabınız var mı?{' '}
            </Text>
            <Link href="/(auth)/giris">
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                Giriş Yap
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
    height: '45%',
    backgroundColor: appColors.ink,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 24,
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
