import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { services } from '../../lib/apiClient';
import { useAuthStore } from '../../lib/stores';

export default function GirisEkrani() {
  const theme = useTheme();
  const girisYap = useAuthStore((s) => s.girisYap);
  const kullaniciGuncelle = useAuthStore((s) => s.kullaniciGuncelle);
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [sifreGizli, setSifreGizli] = useState(true);

  const handleGiris = async () => {
    if (!email || !sifre) {
      setHata('Email ve şifre gereklidir.');
      return;
    }
    setHata('');
    setYukleniyor(true);
    try {
      const response = await services.auth.girisYap({ email, sifre });
      const { accessToken, refreshToken } = response.data;
      girisYap(accessToken, refreshToken, {} as any);
      // Fetch user profile after login
      try {
        const profilRes = await services.auth.beniBul();
        kullaniciGuncelle(profilRes.data);
      } catch {}
      router.replace('/(tabs)');
    } catch (err: any) {
      setHata(err.response?.data?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
            Giderlerim
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Hesabınıza giriş yapın
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            mode="outlined"
            left={<TextInput.Icon icon="email-outline" />}
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
          >
            Giriş Yap
          </Button>

          <View style={styles.linkRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Hesabınız yok mu?{' '}
            </Text>
            <Link href="/(auth)/kayit">
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Kayıt Ol
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  title: {
    fontWeight: '700',
    fontSize: 32,
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    height: 52,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});
