import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { services } from '../../lib/apiClient';
import { useAuthStore } from '../../lib/stores';

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
      setHata('Tüm alanları doldurun.');
      return;
    }
    if (sifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalıdır.');
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
    } catch (err: any) {
      setHata(err.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
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
            Yeni hesap oluşturun
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <TextInput
              label="Ad"
              value={ad}
              onChangeText={setAd}
              mode="outlined"
              style={styles.halfInput}
            />
            <TextInput
              label="Soyad"
              value={soyad}
              onChangeText={setSoyad}
              mode="outlined"
              style={styles.halfInput}
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
            onPress={handleKayit}
            loading={yukleniyor}
            disabled={yukleniyor}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Kayıt Ol
          </Button>

          <View style={styles.linkRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Zaten hesabınız var mı?{' '}
            </Text>
            <Link href="/(auth)/giris">
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Giriş Yap
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
